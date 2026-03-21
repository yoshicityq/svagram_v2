const cors = require('cors')
require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const Post = require('./db.cjs').Post
const User = require('./db.cjs').User
const PostLike = require('./db.cjs').PostLike
const PostRating = require('./db.cjs').PostRating
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

  User.findPublicByUsername(username, (err, user) => {
    if (err) return next(err)
    if (!user) return res.status(404).json({ message: 'User not found' })

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
      imageUrl: `/posts/${p.id}/image`, // фронт будет брать картинку отсюда
    }))

    res.json({ posts, limit, offset })
  })
})
app.get('/users/:username/posts', authRequired, (req, res, next) => {
  const username = req.params.username

  const limit = Math.min(parseInt(req.query.limit ?? '20', 10) || 20, 50)
  const offset = parseInt(req.query.offset ?? '0', 10) || 0

  Post.listByUsername(username, { userId: req.user.id, limit, offset }, (err, rows) => {
    if (err) return next(err)

    const posts = rows.map((p) => ({
      ...p,
      imageUrl: `/posts/${p.id}/image`,
    }))

    res.json({ posts, username, limit, offset })
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
  if (!Number.isInteger(postId)) return res.status(400).json({ message: 'Invalid id' })

  PostLike.toggle({ post_id: postId, user_id: req.user.id, now: Date.now() }, (err, result) => {
    if (err) return next(err)
    res.json({ ok: true, liked: result.liked, likes: result.likes })
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

  // проверим что пост существует
  Post.find(postId, (e0, post) => {
    if (e0) return next(e0)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    const now = Date.now()

    PostRating.upsert({ post_id: postId, user_id: req.user.id, rating, now }, (err) => {
      if (err) return next(err)

      PostRating.getMeta({ post_id: postId, user_id: req.user.id }, (e2, row) => {
        if (e2) return next(e2)
        return res.json({
          ok: true,
          avgRating: Number(row?.avgRating ?? 0),
          ratingsCount: Number(row?.ratingsCount ?? 0),
          myRating: row?.myRating == null ? null : Number(row.myRating),
        })
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

app.delete('/me/avatar', authRequired, (req, res, next) => {
  User.clearAvatarById(req.user.id, (err, result) => {
    if (err) return next(err)
    res.json({ ok: true, updated: result.updated })
  })
})

app.use((err, req, res, next) => {
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File too large' })
  }
  next(err)
})

app.listen(app.get('port'), () => {
  console.log(`Web app available at port ${app.get('port')}`)
})
