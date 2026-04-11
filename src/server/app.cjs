const cors = require('cors')
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const Post = require('./db.cjs').Post
const User = require('./db.cjs').User
const PostLike = require('./db.cjs').PostLike
const PostRating = require('./db.cjs').PostRating
const Notification = require('./db.cjs').Notification
const PostComment = require('./db.cjs').PostComment
const mime = require('mime-types')
const app = express()

const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

const RefreshSession = require('./db.cjs').RefreshSession
app.set('port', process.env.PORT || 3001)
app.use(cookieParser())

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 5MB, можно поменять
})

app.use(express.json()) // только application/json
app.use(express.urlencoded({ extended: true })) // только application/x-www-form-urlencoded

const corsOptions = {
  origin: process.env.CLIENT_ORIGIN,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}
app.use(cors(corsOptions))
app.options(/.*/, cors(corsOptions))

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, username: user.username },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_TTL || '10m' },
  )
}

function signRefreshToken(userId, jti) {
  return jwt.sign({ sub: userId, jti }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_TTL || '30d',
  })
}
function setRefreshCookie(res, refreshToken) {
  const isProd = process.env.NODE_ENV === 'production'
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/auth', // было '/auth/refresh'
    maxAge: 30 * 24 * 60 * 60 * 1000,
  })
}

function clearRefreshCookie(res) {
  const isProd = process.env.NODE_ENV === 'production'
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/auth', // было '/auth/refresh'
  })
}

function authRequired(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'No access token' })

  try {
    const token = header.slice('Bearer '.length)
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    req.user = { id: payload.sub, email: payload.email, username: payload.username }
    next()
  } catch {
    return res.status(401).json({ message: 'Access token expired or invalid' })
  }
}

//Регистрация пользователя
app.post('/auth/register', async (req, res, next) => {
  try {
    const { username, email, password, city } = req.body ?? {}

    if (!username || !email || !password || !city) {
      return res.status(400).json({ message: 'username, email, password, city are required' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    User.create(
      {
        username,
        email,
        city,
        passwordHash,
      },
      (err, user) => {
        if (err) {
          // sqlite unique constraint
          if (String(err.message || '').includes('UNIQUE')) {
            return res.status(409).json({ message: 'User already exists' })
          }
          return next(err)
        }

        return res.status(201).json({ ok: true, user })
      },
    )
  } catch (e) {
    return next(e)
  }
})

app.post('/auth/login', (req, res) => {
  const { username, password } = req.body ?? {}
  if (!username || !password)
    return res.status(400).json({ message: 'username and password required' })

  // Подстройте под ваш User API: главное — получить пользователя по username
  User.findByUsername(username, async (err, user) => {
    if (err) return res.status(500).json({ message: 'db error' })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' })

    const accessToken = signAccessToken(user)

    const jti = crypto.randomUUID()
    const refreshToken = signRefreshToken(user.id, jti)

    const now = Date.now()
    const expiresAt = now + 30 * 24 * 60 * 60 * 1000

    RefreshSession.create(
      { jti, user_id: user.id, revoked: 0, expires_at: expiresAt, created_at: now },
      (e2) => {
        if (e2) return res.status(500).json({ message: 'db error' })

        setRefreshCookie(res, refreshToken)
        return res.json({
          accessToken,
          user: { id: user.id, email: user.email, username: user.username },
        })
      },
    )
  })
})
app.post('/auth/refresh', (req, res) => {
  const token = req.cookies?.refreshToken
  if (!token) return res.status(401).json({ message: 'Missing refresh token' })

  let payload
  try {
    payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
  } catch {
    return res.status(401).json({ message: 'Invalid/expired refresh token' })
  }

  const userId = payload.sub
  const oldJti = payload.jti

  RefreshSession.find(oldJti, (err, session) => {
    if (err) return res.status(500).json({ message: 'db error' })
    if (!session || session.revoked) return res.status(401).json({ message: 'Refresh revoked' })
    if (session.user_id !== userId) return res.status(401).json({ message: 'Refresh mismatch' })
    if (session.expires_at < Date.now()) return res.status(401).json({ message: 'Refresh expired' })

    // revoke old
    RefreshSession.revoke(oldJti, (e2) => {
      if (e2) return res.status(500).json({ message: 'db error' })

      // issue new tokens
      const newJti = crypto.randomUUID()
      const newRefresh = signRefreshToken(userId, newJti)

      const now = Date.now()
      const expiresAt = now + 30 * 24 * 60 * 60 * 1000

      RefreshSession.create(
        { jti: newJti, user_id: userId, revoked: 0, expires_at: expiresAt, created_at: now },
        (e3) => {
          if (e3) return res.status(500).json({ message: 'db error' })

          // access needs user data; если нет email/username — можно хранить минимум в access (sub)
          User.findById(userId, (e4, user) => {
            if (e4) return res.status(500).json({ message: 'db error' })
            if (!user) return res.status(401).json({ message: 'User not found' })

            const accessToken = signAccessToken(user)
            setRefreshCookie(res, newRefresh)
            return res.json({ accessToken })
          })
        },
      )
    })
  })
})
app.post('/auth/logout', (req, res) => {
  const token = req.cookies?.refreshToken

  // На всякий случай всегда чистим cookie
  clearRefreshCookie(res)

  if (!token) return res.json({ ok: true })

  try {
    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
    // Можно либо отозвать только текущую сессию:
    // RefreshSession.revoke(payload.jti, () => res.json({ ok: true }))

    // Либо отозвать ВСЕ сессии пользователя (обычно удобно):
    RefreshSession.revokeAllForUser(payload.sub, (err) => {
      if (err) return res.status(500).json({ message: 'db error' })
      return res.json({ ok: true })
    })
  } catch {
    // refresh мог быть уже истёкший/битый — всё равно считаем logout успешным
    return res.json({ ok: true })
  }
})

app.get('/me', authRequired, (req, res) => {
  res.json({ user: req.user })
})
app.get('/users/search/:prefix', authRequired, (req, res, next) => {
  const prefix = String(req.params.prefix ?? '').trim()

  // лимит можно оставить фиксированным, раз вы не хотите query
  const limit = 10

  if (!prefix) return res.json({ usernames: [] })

  User.searchUsernames(prefix, { limit }, (err, usernames) => {
    if (err) return next(err)
    res.json({ usernames })
  })
})
app.get('/users/:username', authRequired, (req, res, next) => {
  const username = req.params.username

  User.findProfileByUsername(username, (err, user) => {
    if (err) return next(err)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const isOwner = req.user.id === user.id

    const canViewPosts = isOwner || !user.is_private
    const canViewLikedPosts = isOwner || user.liked_posts_visibility === 'public'
    const canViewRatedPosts = isOwner || user.rated_posts_visibility === 'public'

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        city: user.city,
        description: user.description ?? '',
        favorite_brands: user.favorite_brands ?? null,
        hasAvatar: !!user.img_mimetype,
        avatarUrl: user.img_mimetype ? `/users/${user.username}/avatar` : null,
      },
      permissions: {
        isOwner,
        canViewPosts,
        canViewLikedPosts,
        canViewRatedPosts,
      },
      privacy: isOwner
        ? {
            isPrivate: Boolean(user.is_private),
            likedPostsVisibility: user.liked_posts_visibility,
            ratedPostsVisibility: user.rated_posts_visibility,
          }
        : null,
    })
  })
})

app.get('/users/check-username/:username', (req, res, next) => {
  const username = String(req.params.username ?? '').trim()

  if (!username) {
    return res.status(400).json({ message: 'Username is required' })
  }

  User.findByUsername(username, (err, user) => {
    if (err) return next(err)

    return res.json({
      isAvailable: !user,
    })
  })
})
app.get('/users/check-email/:email', (req, res, next) => {
  const email = String(req.params.email ?? '')
    .trim()
    .toLowerCase()

  if (!email) {
    return res.status(400).json({ message: 'Email is required' })
  }

  User.findByEmail(email, (err, user) => {
    if (err) return next(err)

    return res.json({
      isAvailable: !user,
    })
  })
})
app.get('/posts/:id/comments', authRequired, (req, res, next) => {
  const postId = Number(req.params.id)
  const limit = Math.min(parseInt(req.query.limit ?? '20', 10) || 20, 100)
  const offset = parseInt(req.query.offset ?? '0', 10) || 0

  if (!Number.isInteger(postId)) {
    return res.status(400).json({ message: 'Invalid id' })
  }

  Post.find(postId, (e0, post) => {
    if (e0) return next(e0)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    PostComment.listByPostId(postId, { limit, offset }, (err, rows) => {
      if (err) return next(err)

      const comments = rows.map((c) => ({
        id: c.id,
        postId: c.post_id,
        userId: c.user_id,
        username: c.username,
        text: c.text,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        parentCommentId: c.parent_comment_id,
        avatarUrl: c.img_mimetype ? `/users/${c.username}/avatar` : null,
        hasAvatar: !!c.img_mimetype,
        isMine: c.user_id === req.user.id,
      }))

      res.json({ comments, limit, offset })
    })
  })
})
app.post('/posts/:id/comments', authRequired, (req, res, next) => {
  const postId = Number(req.params.id)
  const text = String(req.body?.text ?? '').trim()
  const parentCommentIdRaw = req.body?.parentCommentId
  const parent_comment_id =
    parentCommentIdRaw == null || parentCommentIdRaw === '' ? null : Number(parentCommentIdRaw)

  if (!Number.isInteger(postId)) {
    return res.status(400).json({ message: 'Invalid id' })
  }

  if (!text) {
    return res.status(400).json({ message: 'text is required' })
  }

  if (text.length > 1000) {
    return res.status(400).json({ message: 'text is too long' })
  }

  if (parent_comment_id !== null && !Number.isInteger(parent_comment_id)) {
    return res.status(400).json({ message: 'Invalid parentCommentId' })
  }

  Post.find(postId, (e0, post) => {
    if (e0) return next(e0)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    const createComment = () => {
      const now = Date.now()

      PostComment.create(
        {
          post_id: postId,
          user_id: req.user.id,
          text,
          now,
          parent_comment_id,
        },
        (err, created) => {
          if (err) return next(err)

          PostComment.findById(created.id, (e2, comment) => {
            if (e2) return next(e2)

            User.findById(req.user.id, (e3, user) => {
              if (e3) return next(e3)

              Post.findOwnerByPostId(postId, (ownerErr, owner) => {
                if (ownerErr) return next(ownerErr)

                const finishResponse = () =>
                  res.status(201).json({
                    ok: true,
                    comment: {
                      id: comment.id,
                      postId: comment.post_id,
                      userId: comment.user_id,
                      username: user.username,
                      text: comment.text,
                      createdAt: comment.created_at,
                      updatedAt: comment.updated_at,
                      parentCommentId: comment.parent_comment_id,
                      avatarUrl: user.img_mimetype ? `/users/${user.username}/avatar` : null,
                      hasAvatar: !!user.img_mimetype,
                      isMine: true,
                    },
                  })

                if (!owner || owner.id === req.user.id) {
                  return finishResponse()
                }

                Notification.create(
                  {
                    recipient_user_id: owner.id,
                    actor_user_id: req.user.id,
                    type: 'comment',
                    source_type: 'user',
                    entity_type: 'post',
                    entity_id: comment.post_id,
                    title: 'notification.comment_title',
                    text: `notification.comment_text`,
                    created_at: now,
                    content: text,
                    metadata: JSON.stringify({
                      postId,
                      commentId: comment.id,
                      parentCommentId: comment.parent_comment_id,
                    }),
                  },
                  (nErr) => {
                    if (nErr) return next(nErr)
                    return finishResponse()
                  },
                )
              })
            })
          })
        },
      )
    }

    if (parent_comment_id === null) {
      return createComment()
    }

    PostComment.findById(parent_comment_id, (e1, parentComment) => {
      if (e1) return next(e1)
      if (!parentComment || parentComment.post_id !== postId) {
        return res.status(400).json({ message: 'Parent comment not found for this post' })
      }

      return createComment()
    })
  })
})

app.patch('/comments/:id', authRequired, (req, res, next) => {
  const commentId = Number(req.params.id)
  const text = String(req.body?.text ?? '').trim()

  if (!Number.isInteger(commentId)) {
    return res.status(400).json({ message: 'Invalid id' })
  }

  if (!text) {
    return res.status(400).json({ message: 'text is required' })
  }

  if (text.length > 1000) {
    return res.status(400).json({ message: 'text is too long' })
  }

  PostComment.updateText(
    {
      id: commentId,
      user_id: req.user.id,
      text,
      now: Date.now(),
    },
    (err, result) => {
      if (err) return next(err)
      if (!result.updated) {
        return res.status(404).json({ message: 'Comment not found or access denied' })
      }

      PostComment.findById(commentId, (e2, comment) => {
        if (e2) return next(e2)
        if (!comment) {
          return res.status(404).json({ message: 'Comment not found' })
        }

        return res.json({
          ok: true,
          comment: {
            id: comment.id,
            postId: comment.post_id,
            userId: comment.user_id,
            text: comment.text,
            createdAt: comment.created_at,
            updatedAt: comment.updated_at,
            parentCommentId: comment.parent_comment_id,
          },
        })
      })
    },
  )
})
app.delete('/comments/:id', authRequired, (req, res, next) => {
  const commentId = Number(req.params.id)

  if (!Number.isInteger(commentId)) {
    return res.status(400).json({ message: 'Invalid id' })
  }

  PostComment.deleteById({ id: commentId, user_id: req.user.id }, (err, result) => {
    if (err) return next(err)
    if (!result.deleted) {
      return res.status(404).json({ message: 'Comment not found or access denied' })
    }

    return res.json({ ok: true })
  })
})
app.get('/posts/:id/comments/count', authRequired, (req, res, next) => {
  const postId = Number(req.params.id)

  if (!Number.isInteger(postId)) {
    return res.status(400).json({ message: 'Invalid id' })
  }

  Post.find(postId, (e0, post) => {
    if (e0) return next(e0)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    PostComment.countByPostId(postId, (err, row) => {
      if (err) return next(err)
      return res.json({
        commentsCount: Number(row?.commentsCount ?? 0),
      })
    })
  })
})
app.get('/posts', authRequired, (req, res, next) => {
  const limit = Math.min(parseInt(req.query.limit ?? '20', 10) || 20, 50)
  const offset = parseInt(req.query.offset ?? '0', 10) || 0

  Post.list({ userId: req.user.id, limit, offset }, (err, rows) => {
    if (err) return next(err)

    const posts = rows.map((p) => ({
      ...p,
      likes: Number(p.likes ?? 0),
      commentsCount: Number(p.commentsCount ?? 0),
      likedByMe: Boolean(p.likedByMe),
      imageUrl: `/posts/${p.id}/image`,
    }))

    res.json({ posts, limit, offset })
  })
})
app.get('/me/privacy', authRequired, (req, res, next) => {
  User.findPrivacyById(req.user.id, (err, user) => {
    if (err) return next(err)
    if (!user) return res.status(404).json({ message: 'User not found' })

    return res.json({
      privacy: {
        isPrivate: Boolean(user.is_private),
        likedPostsVisibility: user.liked_posts_visibility,
        ratedPostsVisibility: user.rated_posts_visibility,
      },
    })
  })
})
app.get('/users/:username/posts', authRequired, (req, res, next) => {
  const username = req.params.username
  const limit = Math.min(parseInt(req.query.limit ?? '20', 10) || 20, 50)
  const offset = parseInt(req.query.offset ?? '0', 10) || 0

  User.findProfileByUsername(username, (err, user) => {
    if (err) return next(err)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const isOwner = req.user.id === user.id
    const canViewPosts = isOwner || !user.is_private

    if (!canViewPosts) {
      return res.status(403).json({ message: 'This profile is private' })
    }

    Post.listByUsername(username, { userId: req.user.id, limit, offset }, (err2, rows) => {
      if (err2) return next(err2)

      const posts = rows.map((p) => ({
        ...p,
        likes: Number(p.likes ?? 0),
        commentsCount: Number(p.commentsCount ?? 0),
        likedByMe: Boolean(p.likedByMe),
        imageUrl: `/posts/${p.id}/image`,
      }))

      res.json({ posts, username, limit, offset })
    })
  })
})
app.get('/users/:username/liked-posts', authRequired, (req, res, next) => {
  const username = req.params.username
  const limit = Math.min(parseInt(req.query.limit ?? '20', 10) || 20, 50)
  const offset = parseInt(req.query.offset ?? '0', 10) || 0

  User.findProfileByUsername(username, (err, user) => {
    if (err) return next(err)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const isOwner = req.user.id === user.id
    const canViewLikedPosts = isOwner || user.liked_posts_visibility === 'public'

    if (!canViewLikedPosts) {
      return res.status(403).json({ message: 'Liked posts are private' })
    }

    Post.listLikedByUsername(
      username,
      { viewerUserId: req.user.id, limit, offset },
      (err2, rows) => {
        if (err2) return next(err2)

        const posts = rows.map((p) => ({
          ...p,
          likes: Number(p.likes ?? 0),
          commentsCount: Number(p.commentsCount ?? 0),
          likedByMe: Boolean(p.likedByMe),
          imageUrl: `/posts/${p.id}/image`,
        }))

        return res.json({
          posts,
          username,
          limit,
          offset,
        })
      },
    )
  })
})
app.get('/users/:username/rated-posts', authRequired, (req, res, next) => {
  const username = req.params.username
  const limit = Math.min(parseInt(req.query.limit ?? '20', 10) || 20, 50)
  const offset = parseInt(req.query.offset ?? '0', 10) || 0

  User.findProfileByUsername(username, (err, user) => {
    if (err) return next(err)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const isOwner = req.user.id === user.id
    const canViewRatedPosts = isOwner || user.rated_posts_visibility === 'public'

    if (!canViewRatedPosts) {
      return res.status(403).json({ message: 'Rated posts are private' })
    }

    Post.listRatedByUsername(
      username,
      { viewerUserId: req.user.id, limit, offset },
      (err2, rows) => {
        if (err2) return next(err2)

        const posts = rows.map((p) => ({
          ...p,
          likes: Number(p.likes ?? 0),
          commentsCount: Number(p.commentsCount ?? 0),
          likedByMe: Boolean(p.likedByMe),
          imageUrl: `/posts/${p.id}/image`,
        }))

        return res.json({
          posts,
          username,
          limit,
          offset,
        })
      },
    )
  })
})
app.get('/posts/:id/image', (req, res, next) => {
  const id = req.params.id

  Post.find(id, (err, post) => {
    if (err) return next(err)
    if (!post || !post.img) return res.sendStatus(404)

    res.setHeader('Content-Type', post.img_mimetype || 'application/octet-stream')
    res.setHeader('Cache-Control', 'public, max-age=3600')
    return res.end(post.img)
  })
})
app.get('/users/:username/avatar', authRequired, (req, res, next) => {
  const username = req.params.username

  User.getAvatarByUsername(username, (err, row) => {
    if (err) return next(err)
    if (!row || !row.profile_img) return res.sendStatus(404)

    res.setHeader('Content-Type', row.img_mimetype || 'application/octet-stream')
    res.setHeader('Cache-Control', 'private, max-age=3600')
    return res.end(row.profile_img)
  })
})
app.get('/posts/:id', authRequired, (req, res, next) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) return res.status(400).json({ message: 'Invalid id' })

  Post.findMetaById(id, req.user.id, (err, post) => {
    if (err) return next(err)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    return res.json({
      post: {
        ...post,
        likes: Number(post.likes ?? 0),
        commentsCount: Number(post.commentsCount ?? 0),
        likedByMe: Boolean(post.likedByMe),
        imageUrl: `/posts/${post.id}/image`,
      },
    })
  })
})
app.get('/posts/:id/likes', authRequired, (req, res, next) => {
  const postId = Number(req.params.id)
  if (!Number.isInteger(postId)) return res.status(400).json({ message: 'Invalid id' })

  PostLike.getMeta(postId, req.user.id, (err, row) => {
    if (err) return next(err)

    // row.likedByMe может прийти как 0/1
    res.json({
      likes: Number(row?.likes ?? 0),
      likedByMe: Boolean(row?.likedByMe),
    })
  })
})
app.post('/posts/create', authRequired, upload.single('image'), (req, res, next) => {
  try {
    // 1) файл
    if (!req.file) {
      return res.status(400).json({ message: 'image is required' })
    }

    // 2) поля формы
    const description = req.body.caption ?? req.body.description ?? ''
    const city = req.body.city ?? null

    // (если вы будете передавать бренды — берём из body, иначе ставим дефолты)
    const brand_accessory = req.body.brand_accessory ?? ''
    const brand_hat = req.body.brand_hat ?? ''
    const brand_outwear = req.body.brand_outwear ?? ''
    const brand_top = req.body.brand_top ?? ''
    const brand_bottom = req.body.brand_bottom ?? ''
    const brand_shoes = req.body.brand_shoes ?? ''
    const brand_bag = req.body.brand_bag ?? ''
    const brand_glasses = req.body.brand_glasses ?? ''

    // 3) автор берётся из JWT (вы так и делали в /me)
    const username = req.user.username

    Post.create(
      {
        user: username,
        description,
        img: req.file.buffer, // BLOB
        img_mimetype: req.file.mimetype,
        brand_accessory,
        brand_hat,
        brand_outwear,
        brand_top,
        brand_bottom,
        brand_shoes,
        brand_bag,
        brand_glasses,
      },
      (err, created) => {
        if (err) return next(err)
        return res.status(201).json({ ok: true, id: created.id })
      },
    )
  } catch (e) {
    return next(e)
  }
})
app.post('/posts/:id/like', authRequired, (req, res, next) => {
  const postId = Number(req.params.id)
  if (!Number.isInteger(postId)) {
    return res.status(400).json({ message: 'Invalid id' })
  }

  Post.findOwnerByPostId(postId, (ownerErr, owner) => {
    if (ownerErr) return next(ownerErr)
    if (!owner) return res.status(404).json({ message: 'Post not found' })

    const now = Date.now()

    PostLike.toggle({ post_id: postId, user_id: req.user.id, now }, (err, result) => {
      if (err) return next(err)

      // не уведомляем самого себя
      if (owner.id === req.user.id) {
        return res.json({ ok: true, liked: result.liked, likes: result.likes })
      }

      if (result.liked) {
        Notification.create(
          {
            recipient_user_id: owner.id,
            actor_user_id: req.user.id,
            type: 'like',
            source_type: 'user',
            entity_type: 'post',
            entity_id: postId,
            title: 'notification.like_title',
            text: `notification.like_text`,
            created_at: now,
            metadata: JSON.stringify({ postId }),
          },
          (nErr) => {
            if (nErr) return next(nErr)
            return res.json({ ok: true, liked: result.liked, likes: result.likes })
          },
        )
      } else {
        Notification.deleteByKey(
          {
            recipient_user_id: owner.id,
            actor_user_id: req.user.id,
            type: 'like',
            entity_type: 'post',
            entity_id: postId,
          },
          (nErr) => {
            if (nErr) return next(nErr)
            return res.json({ ok: true, liked: result.liked, likes: result.likes })
          },
        )
      }
    })
  })
})
app.get('/posts/:id/rating', authRequired, (req, res, next) => {
  const postId = Number(req.params.id)
  if (!Number.isInteger(postId)) return res.status(400).json({ message: 'Invalid id' })

  // опционально: проверим что пост существует
  Post.find(postId, (e0, post) => {
    if (e0) return next(e0)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    PostRating.getMeta({ post_id: postId, user_id: req.user.id }, (err, row) => {
      if (err) return next(err)
      return res.json({
        avgRating: Number(row?.avgRating ?? 0),
        ratingsCount: Number(row?.ratingsCount ?? 0),
        myRating: row?.myRating == null ? null : Number(row.myRating),
      })
    })
  })
})

app.post('/posts/:id/rating', authRequired, (req, res, next) => {
  const postId = Number(req.params.id)
  const rating = Number(req.body?.rating)

  if (!Number.isInteger(postId)) return res.status(400).json({ message: 'Invalid id' })
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'rating must be integer 1..5' })
  }

  Post.find(postId, (e0, post) => {
    if (e0) return next(e0)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    const now = Date.now()

    PostRating.upsert({ post_id: postId, user_id: req.user.id, rating, now }, (err) => {
      if (err) return next(err)

      Post.findOwnerByPostId(postId, (ownerErr, owner) => {
        if (ownerErr) return next(ownerErr)

        const finishResponse = () => {
          PostRating.getMeta({ post_id: postId, user_id: req.user.id }, (e2, row) => {
            if (e2) return next(e2)
            return res.json({
              ok: true,
              avgRating: Number(row?.avgRating ?? 0),
              ratingsCount: Number(row?.ratingsCount ?? 0),
              myRating: row?.myRating == null ? null : Number(row.myRating),
            })
          })
        }

        if (!owner || owner.id === req.user.id) {
          return finishResponse()
        }

        Notification.create(
          {
            recipient_user_id: owner.id,
            actor_user_id: req.user.id,
            type: 'rate',
            source_type: 'user',
            entity_type: 'post',
            entity_id: postId,
            title: 'notification.rate_title',
            text: `notification.rate_text`,
            created_at: now,
            metadata: JSON.stringify({ postId, rating }),
          },
          (nErr) => {
            if (nErr) return next(nErr)
            return finishResponse()
          },
        )
      })
    })
  })
})

app.patch('/me', authRequired, upload.single('profile_img'), (req, res, next) => {
  try {
    // текстовые поля из multipart приходят в req.body строками
    const { username, city, description, favorite_brands, img_mimetype } = req.body ?? {}

    // запретим ручное изменение img_mimetype
    if (img_mimetype !== undefined) {
      return res.status(400).json({ message: 'img_mimetype cannot be updated' })
    }

    const patch = {}

    if (username !== undefined && username !== '') patch.username = username
    if (city !== undefined && city !== '') patch.city = city
    if (description !== undefined) patch.description = description // описание может быть пустым
    if (favorite_brands !== undefined) patch.favorite_brands = favorite_brands
    // файл аватара
    if (req.file) {
      patch.profile_img = req.file.buffer
      patch.img_mimetype = req.file.mimetype
    }

    User.updateProfileById(req.user.id, patch, (err, result) => {
      if (err) {
        if (String(err.message || '').includes('UNIQUE')) {
          return res.status(409).json({ message: 'username or email already exists' })
        }
        return next(err)
      }

      User.findById(req.user.id, (e2, user) => {
        if (e2) return next(e2)
        if (!user) return res.status(404).json({ message: 'User not found' })

        return res.json({
          ok: true,
          updated: result.updated,
          user: {
            id: user.id,
            username: user.username,
            city: user.city,
            description: user.description ?? '',
            favorite_brands: user.favorite_brands ?? null,
            hasAvatar: !!user.img_mimetype,
            avatarUrl: user.img_mimetype ? `/users/${user.username}/avatar` : null,
          },
        })
      })
    })
  } catch (e) {
    return next(e)
  }
})
app.patch('/me/privacy', authRequired, (req, res, next) => {
  try {
    const { isPrivate, likedPostsVisibility, ratedPostsVisibility } = req.body ?? {}

    const allowedVisibility = ['public', 'private']
    const patch = {}

    if (isPrivate !== undefined) {
      if (typeof isPrivate !== 'boolean') {
        return res.status(400).json({ message: 'isPrivate must be boolean' })
      }
      patch.is_private = isPrivate ? 1 : 0
    }

    if (likedPostsVisibility !== undefined) {
      if (!allowedVisibility.includes(likedPostsVisibility)) {
        return res.status(400).json({ message: 'Invalid likedPostsVisibility' })
      }
      patch.liked_posts_visibility = likedPostsVisibility
    }

    if (ratedPostsVisibility !== undefined) {
      if (!allowedVisibility.includes(ratedPostsVisibility)) {
        return res.status(400).json({ message: 'Invalid ratedPostsVisibility' })
      }
      patch.rated_posts_visibility = ratedPostsVisibility
    }

    User.updateProfileById(req.user.id, patch, (err, result) => {
      if (err) return next(err)

      User.findById(req.user.id, (e2, user) => {
        if (e2) return next(e2)
        if (!user) return res.status(404).json({ message: 'User not found' })

        return res.json({
          ok: true,
          updated: result.updated,
          privacy: {
            isPrivate: Boolean(user.is_private),
            likedPostsVisibility: user.liked_posts_visibility,
            ratedPostsVisibility: user.rated_posts_visibility,
          },
        })
      })
    })
  } catch (e) {
    return next(e)
  }
})
app.get('/notifications', authRequired, (req, res, next) => {
  const limit = Math.min(Number(req.query.limit) || 20, 100)
  const offset = Number(req.query.offset) || 0

  Notification.listByRecipient(req.user.id, { limit, offset }, (err, rows) => {
    if (err) return next(err)

    const items = rows.map((n) => ({
      id: n.id,
      type: n.type,
      sourceType: n.source_type,
      entityType: n.entity_type,
      entityId: n.entity_id,
      title: n.title,
      text: n.text,
      isRead: Boolean(n.is_read),
      createdAt: n.created_at,
      content: n.content,
      readAt: n.read_at,
      delete_at: n.delete_after_read_at,
      metadata: n.metadata ? JSON.parse(n.metadata) : null,
      actor: n.actor_id
        ? {
            id: n.actor_id,
            username: n.actor_username,
            avatarUrl: n.actor_username ? `/users/${n.actor_username}/avatar` : null,
          }
        : null,
    }))

    res.json({ items })
  })
})
app.get('/notifications/unread-count', authRequired, (req, res, next) => {
  Notification.getUnreadCount(req.user.id, (err, row) => {
    if (err) return next(err)
    res.json({ unreadCount: Number(row?.unreadCount ?? 0) })
  })
})
app.patch('/notifications/:id/read', authRequired, (req, res, next) => {
  const notificationId = Number(req.params.id)
  if (!Number.isInteger(notificationId)) {
    return res.status(400).json({ message: 'Invalid notification id' })
  }

  Notification.markAsRead(notificationId, req.user.id, (err, result) => {
    if (err) return next(err)
    res.json({ ok: true, updated: result.updated })
  })
})
app.patch('/notifications/read-all', authRequired, (req, res, next) => {
  Notification.markAllAsRead(req.user.id, (err, result) => {
    if (err) return next(err)
    res.json({ ok: true, updated: result.updated })
  })
})
app.delete('/me/avatar', authRequired, (req, res, next) => {
  User.clearAvatarById(req.user.id, (err, result) => {
    if (err) return next(err)
    res.json({ ok: true, updated: result.updated })
  })
})
function cleanupExpiredNotifications() {
  Notification.cleanupExpiredReadNotifications(Date.now(), (err, result) => {
    if (err) {
      console.error('Failed to cleanup expired notifications:', err.message)
      return
    }

    if (result?.deleted) {
      console.log(`Expired notifications deleted: ${result.deleted}`)
    }
  })
}

// запуск периодической очистки
cleanupExpiredNotifications()
setInterval(cleanupExpiredNotifications, 60 * 60 * 1000)

app.use((err, req, res, next) => {
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File too large' })
  }
  next(err)
})

app.listen(app.get('port'), () => {
  console.log(`Web app available at port ${app.get('port')}`)
})
