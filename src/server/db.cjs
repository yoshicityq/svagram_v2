// import sqlite3 from 'sqlite3';
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const sqlite3 = require('sqlite3').verbose()
const dbName = 'swagram.db'
const db = new sqlite3.Database(dbName)

// Генерация кода
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString() // 6 цифр
}

// Хэширование кода
function hashCode(code) {
  return crypto.createHash('sha256').update(code).digest('hex')
}

async function hashPassword(password) {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON')

  const sql_users = `
  CREATE TABLE IF NOT EXISTS users
    (id integer primary key,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE, 
    password TEXT NOT NULL,
    profile_img BLOB,
    img_mimetype CHAR(16),
    city TEXT NOT NULL,
    description TEXT,
    favorite_brands TEXT,
    title_id INTEGER NULL,
    is_private INTEGER NOT NULL DEFAULT 0,
    liked_posts_visibility TEXT NOT NULL DEFAULT 'public',
    rated_posts_visibility TEXT NOT NULL DEFAULT 'public')
`
  const sql_posts = `
    CREATE TABLE IF NOT EXISTS posts 
      (id integer primary key,
      user TEXT NOT NULL,
      description TEXT,
      img BLOB NOT NULL,
      img_mimetype CHAR(16) NOT NULL,
      likes integer,
      people_liked TEXT,
      brand_accessory TEXT,
      brand_hat TEXT NOT NULL,
      brand_outwear TEXT NOT NULL,
      brand_top TEXT NOT NULL, 
      brand_bottom TEXT NOT NULL,
      brand_shoes TEXT NOT NULL,
      brand_bag TEXT NOT NULL,
      brand_glasses TEXT NOT NULL,

      FOREIGN KEY (user) REFERENCES users(username))
  `
  const sql_refresh = `
  CREATE TABLE IF NOT EXISTS refresh_sessions (
    jti TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    revoked INTEGER NOT NULL DEFAULT 0,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  )
`
  const sql_post_ratings = `CREATE TABLE IF NOT EXISTS post_ratings (
  post_id   INTEGER NOT NULL,
  user_id   INTEGER NOT NULL,
  rating    INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (post_id, user_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);`
  const sql_post_likes = `
  CREATE TABLE IF NOT EXISTS post_likes (
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    PRIMARY KEY (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`
  const sql_notifications = `
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY,
  recipient_user_id INTEGER NOT NULL,
  actor_user_id INTEGER NULL,
  type TEXT NOT NULL,
  source_type TEXT NOT NULL,
  entity_type TEXT NULL,
  entity_id INTEGER NULL,
  title TEXT NULL,
  text TEXT NULL,
  content TEXT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  read_at INTEGER NULL,
  delete_after_read_at INTEGER NULL,
  metadata TEXT NULL,

  FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL,

  UNIQUE(recipient_user_id, actor_user_id, type, entity_type, entity_id)
)
`
  const sql_post_comments = `
  CREATE TABLE IF NOT EXISTS post_comments (
    id INTEGER PRIMARY KEY,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    parent_comment_id INTEGER NULL,

    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES post_comments(id) ON DELETE CASCADE
  )
`
  const sql_titles = `
CREATE TABLE IF NOT EXISTS titles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_name TEXT NOT NULL,
  description TEXT NULL
);`
  const sql_user_titles = `
CREATE TABLE IF NOT EXISTS user_titles (
  user_id INTEGER NOT NULL,
  title_id INTEGER NOT NULL,
  earned_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, title_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (title_id) REFERENCES titles(id) ON DELETE CASCADE
);`
  const sql_verification_codes = `
  CREATE TABLE IF NOT EXISTS verification_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  type TEXT NOT NULL, 
  code_hash TEXT NOT NULL,
  new_email TEXT,
  expires_at INTEGER NOT NULL,
  attempts_count INTEGER DEFAULT 0,
  used INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);`
  db.run(sql_refresh)
  db.run(sql_users)
  db.run(sql_posts)
  db.run(sql_post_likes)
  db.run(sql_post_ratings)
  db.run(sql_notifications)
  db.run(sql_post_comments)
  db.run(sql_titles)
  db.run(sql_user_titles)
  db.run(sql_verification_codes)
  db.run(`
  CREATE INDEX IF NOT EXISTS idx_post_comments_post_created
  ON post_comments(post_id, created_at DESC)
`)
  db.run(`
  CREATE INDEX IF NOT EXISTS idx_post_comments_user
  ON post_comments(user_id)
`)
  db.run(`
  CREATE INDEX IF NOT EXISTS idx_post_comments_parent
  ON post_comments(parent_comment_id)
`)
})

class RefreshSession {
  static create(data, cb) {
    const sql =
      'INSERT INTO refresh_sessions (jti, user_id, revoked, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
    db.run(sql, data.jti, data.user_id, data.revoked ?? 0, data.expires_at, data.created_at, cb)
  }

  static find(jti, cb) {
    db.get('SELECT * FROM refresh_sessions WHERE jti = ?', jti, cb)
  }

  static revoke(jti, cb) {
    db.run('UPDATE refresh_sessions SET revoked = 1 WHERE jti = ?', jti, cb)
  }

  static revokeAllForUser(userId, cb) {
    db.run('UPDATE refresh_sessions SET revoked = 1 WHERE user_id = ?', userId, cb)
  }
}

class User {
  static all(cb) {
    db.all('SELECT * FROM users', cb)
  }

  //Поиск пользователя по имени
  static findByUsername(username, cb) {
    db.get('SELECT * FROM users WHERE username = ?', username, cb)
  }

  //Поиск пользователя по email
  static findByEmail(email, cb) {
    db.get('SELECT * FROM users WHERE email = ?', email, cb)
  }

  //Поиск пользователя по id
  static findById(id, cb) {
    db.get('SELECT * FROM users WHERE id = ?', id, cb)
  }

  //Создание нового пользователя
  static create(data, cb) {
    const sql =
      'INSERT INTO users(username, password, city, email, favorite_brands) VALUES(?, ?, ?, ?, ?)'

    db.run(
      sql,
      data.username,
      data.passwordHash,
      data.city,
      data.email,
      data.favorite_brands ?? null,
      function (err) {
        if (err) return cb(err)

        cb(null, {
          id: this.lastID,
          username: data.username,
          email: data.email,
          city: data.city,
          favorite_brands: data.favorite_brands ?? null,
        })
      },
    )
  }
  static updateProfileById(userId, patch, cb) {
    const allowed = [
      'username',
      'city',
      'description',
      'favorite_brands',
      'profile_img',
      'img_mimetype',
      'is_private',
      'liked_posts_visibility',
      'rated_posts_visibility',
    ]

    const entries = Object.entries(patch).filter(([k, v]) => allowed.includes(k) && v !== undefined)

    if (entries.length === 0) return cb(null, { updated: 0 })

    const setSql = entries.map(([k]) => `${k} = ?`).join(', ')
    const values = entries.map(([, v]) => v)

    const sql = `UPDATE users SET ${setSql} WHERE id = ?`
    db.run(sql, ...values, userId, function (err) {
      if (err) return cb(err)
      cb(null, { updated: this.changes })
    })
  }
  static getAvatarByUsername(username, cb) {
    const sql = `SELECT profile_img, img_mimetype FROM users WHERE username = ?`
    db.get(sql, username, cb)
  }
  // static findPublicByUsername(username, cb) {
  //   const sql = `
  //   SELECT id, username, city, description, favorite_brands, img_mimetype
  //   FROM users
  //   WHERE username = ?
  // `
  //   db.get(sql, username, cb)
  // }
  static findProfileByUsername(username, cb) {
    const sql = `
    SELECT
      u.id,
      u.username,
      u.city,
      u.description,
      u.favorite_brands,
      u.img_mimetype,
      COALESCE(u.is_private, 0) AS is_private,
      COALESCE(u.liked_posts_visibility, 'public') AS liked_posts_visibility,
      COALESCE(u.rated_posts_visibility, 'public') AS rated_posts_visibility,
      u.title_id,
      t.title_name  AS current_title
    FROM users u
    LEFT JOIN titles t ON t.id = u.title_id
    WHERE u.username = ?
  `
    db.get(sql, username, cb)
  }
  static findPrivacyById(id, cb) {
    const sql = `
    SELECT
      id,
      COALESCE(is_private, 0) AS is_private,
      COALESCE(liked_posts_visibility, 'public') AS liked_posts_visibility,
      COALESCE(rated_posts_visibility, 'public') AS rated_posts_visibility
    FROM users
    WHERE id = ?
  `
    db.get(sql, id, cb)
  }
  static clearAvatarById(userId, cb) {
    const sql = 'UPDATE users SET profile_img = NULL, img_mimetype = NULL WHERE id = ?'
    db.run(sql, userId, function (err) {
      if (err) return cb(err)
      cb(null, { updated: this.changes })
    })
  }
  static searchUsernames(prefix, { limit = 10 } = {}, cb) {
    const like = `${prefix}%`
    const sql = `
    SELECT username
    FROM users
    WHERE username LIKE ?
    ORDER BY username ASC
    LIMIT ?
  `
    db.all(sql, like, limit, (err, rows) => {
      if (err) return cb(err)
      cb(
        null,
        rows.map((r) => r.username),
      )
    })
  }
}

class Post {
  static all(cb) {
    db.all('SELECT * FROM posts', cb)
  }

  static find(id, cb) {
    db.get('SELECT * FROM posts WHERE id = ?', id, cb)
  }

  static create(data, cb) {
    const sql =
      'INSERT INTO posts(user, description, img, img_mimetype, likes, people_liked, brand_accessory, brand_hat, brand_outwear, brand_top, brand_bottom, brand_shoes, brand_bag, brand_glasses) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?)'

    db.run(
      sql,
      data.user,
      data.description,
      data.img,
      data.img_mimetype,
      data.likes,
      data.people_liked,
      data.brand_accessory,
      data.brand_hat,
      data.brand_outwear,
      data.brand_top,
      data.brand_bottom,
      data.brand_shoes,
      data.brand_bag,
      data.brand_glasses,
      function (err) {
        if (err) return cb(err)
        cb(null, { id: this.lastID })
      },
    )
  }

  static list({ userId, limit = 20, offset = 0 } = {}, cb) {
    const sql = `
    SELECT
      p.id, p.user, p.description, 
      p.brand_accessory, p.brand_hat, p.brand_outwear, p.brand_top, p.brand_bottom, p.brand_shoes, p.brand_bag, p.brand_glasses,
      p.img_mimetype,
      COALESCE(lc.likes, 0) AS likes,
      COALESCE(cc.commentsCount, 0) AS commentsCount,
      CASE WHEN pl.user_id IS NULL THEN 0 ELSE 1 END AS likedByMe
    FROM posts p
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS likes
      FROM post_likes
      GROUP BY post_id
    ) lc ON lc.post_id = p.id
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS commentsCount
      FROM post_comments
      GROUP BY post_id
    ) cc ON cc.post_id = p.id
    LEFT JOIN post_likes pl
      ON pl.post_id = p.id AND pl.user_id = ?
    ORDER BY p.id DESC
    LIMIT ? OFFSET ?
  `
    db.all(sql, userId, limit, offset, cb)
  }

  static listByUsername(username, { userId, limit = 20, offset = 0 } = {}, cb) {
    const sql = `
    SELECT
      p.id, p.user, p.description,
      p.brand_accessory, p.brand_hat, p.brand_outwear, p.brand_top, p.brand_bottom, p.brand_shoes, p.brand_bag, p.brand_glasses,
      p.img_mimetype,
      COALESCE(lc.likes, 0) AS likes,
      COALESCE(cc.commentsCount, 0) AS commentsCount,
      CASE WHEN pl.user_id IS NULL THEN 0 ELSE 1 END AS likedByMe
    FROM posts p
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS likes
      FROM post_likes
      GROUP BY post_id
    ) lc ON lc.post_id = p.id
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS commentsCount
      FROM post_comments
      GROUP BY post_id
    ) cc ON cc.post_id = p.id
    LEFT JOIN post_likes pl
      ON pl.post_id = p.id AND pl.user_id = ?
    WHERE p.user = ?
    ORDER BY p.id DESC
    LIMIT ? OFFSET ?
  `
    db.all(sql, userId, username, limit, offset, cb)
  }
  static listLikedByUsername(username, { viewerUserId = null, limit = 20, offset = 0 } = {}, cb) {
    const sql = `
    SELECT
      p.id,
      p.user,
      p.description,
      p.brand_accessory,
      p.brand_hat,
      p.brand_outwear,
      p.brand_top,
      p.brand_bottom,
      p.brand_shoes,
      p.brand_bag,
      p.brand_glasses,
      p.img_mimetype,
      COALESCE(lc.likes, 0) AS likes,
      CASE WHEN vpl.user_id IS NULL THEN 0 ELSE 1 END AS likedByMe
    FROM post_likes target_like
    JOIN users u
      ON u.id = target_like.user_id
    JOIN posts p
      ON p.id = target_like.post_id
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS likes
      FROM post_likes
      GROUP BY post_id
    ) lc
      ON lc.post_id = p.id
    LEFT JOIN post_likes vpl
      ON vpl.post_id = p.id AND vpl.user_id = ?
    WHERE u.username = ?
    ORDER BY target_like.created_at DESC, p.id DESC
    LIMIT ? OFFSET ?
  `

    db.all(sql, viewerUserId, username, limit, offset, cb)
  }
  static listRatedByUsername(username, { viewerUserId = null, limit = 20, offset = 0 } = {}, cb) {
    const sql = `
    SELECT
      p.id,
      p.user,
      p.description,
      p.brand_accessory,
      p.brand_hat,
      p.brand_outwear,
      p.brand_top,
      p.brand_bottom,
      p.brand_shoes,
      p.brand_bag,
      p.brand_glasses,
      p.img_mimetype,
      COALESCE(lc.likes, 0) AS likes,
      CASE WHEN vpl.user_id IS NULL THEN 0 ELSE 1 END AS likedByMe,
      target_rating.rating AS userRating,
      COALESCE(rm.avgRating, 0) AS avgRating,
      COALESCE(rm.ratingsCount, 0) AS ratingsCount
    FROM post_ratings target_rating
    JOIN users u
      ON u.id = target_rating.user_id
    JOIN posts p
      ON p.id = target_rating.post_id
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS likes
      FROM post_likes
      GROUP BY post_id
    ) lc
      ON lc.post_id = p.id
    LEFT JOIN post_likes vpl
      ON vpl.post_id = p.id AND vpl.user_id = ?
    LEFT JOIN (
      SELECT
        post_id,
        ROUND(AVG(rating), 2) AS avgRating,
        COUNT(*) AS ratingsCount
      FROM post_ratings
      GROUP BY post_id
    ) rm
      ON rm.post_id = p.id
    WHERE u.username = ?
    ORDER BY target_rating.updated_at DESC, p.id DESC
    LIMIT ? OFFSET ?
  `

    db.all(sql, viewerUserId, username, limit, offset, cb)
  }
  static findMetaById(id, userId, cb) {
    const sql = `
    SELECT
      p.id, p.user, p.description,
      p.brand_accessory, p.brand_hat, p.brand_outwear, p.brand_top, p.brand_bottom, p.brand_shoes, p.brand_bag, p.brand_glasses,
      p.img_mimetype,
      COALESCE(lc.likes, 0) AS likes,
      COALESCE(cc.commentsCount, 0) AS commentsCount,
      CASE WHEN pl.user_id IS NULL THEN 0 ELSE 1 END AS likedByMe
    FROM posts p
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS likes
      FROM post_likes
      GROUP BY post_id
    ) lc ON lc.post_id = p.id
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS commentsCount
      FROM post_comments
      GROUP BY post_id
    ) cc ON cc.post_id = p.id
    LEFT JOIN post_likes pl
      ON pl.post_id = p.id AND pl.user_id = ?
    WHERE p.id = ?
  `
    db.get(sql, userId, id, cb)
  }

  // static update(data, cb) {
  //   const sql = 'UPDATE posts SET likes = ?, people_liked = ? WHERE id = ?'
  //   db.run(sql, data.likes, data.people_liked, data.id, cb)
  // }

  // static delete(id, cb) {
  //   if (!id) return cb(new Error('Please provide an id'))
  //   db.run('DELETE FROM posts WHERE id = ?', id, cb)
  // }

  static findOwnerByPostId(postId, cb) {
    const sql = `
    SELECT
      u.id,
      u.username
    FROM posts p
    JOIN users u
      ON u.username = p.user
    WHERE p.id = ?
  `
    db.get(sql, postId, cb)
  }
}
class PostComment {
  static create({ post_id, user_id, text, now, parent_comment_id = null }, cb) {
    const sql = `
      INSERT INTO post_comments (
        post_id,
        user_id,
        text,
        created_at,
        updated_at,
        parent_comment_id
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `
    db.run(sql, post_id, user_id, text, now, now, parent_comment_id, function (err) {
      if (err) return cb(err)
      cb(null, { id: this.lastID })
    })
  }

  static listByPostId(postId, { limit = 20, offset = 0 } = {}, cb) {
    const sql = `
      SELECT
        c.id,
        c.post_id,
        c.user_id,
        c.text,
        c.created_at,
        c.updated_at,
        c.parent_comment_id,
        u.username,
        u.img_mimetype
      FROM post_comments c
      JOIN users u
        ON u.id = c.user_id
      WHERE c.post_id = ?
      ORDER BY c.created_at DESC, c.id DESC
      LIMIT ? OFFSET ?
    `
    db.all(sql, postId, limit, offset, cb)
  }

  static findById(id, cb) {
    const sql = `
      SELECT *
      FROM post_comments
      WHERE id = ?
    `
    db.get(sql, id, cb)
  }

  static countByPostId(postId, cb) {
    const sql = `
      SELECT COUNT(*) AS commentsCount
      FROM post_comments
      WHERE post_id = ?
    `
    db.get(sql, postId, cb)
  }

  static updateText({ id, user_id, text, now }, cb) {
    const sql = `
      UPDATE post_comments
      SET text = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `
    db.run(sql, text, now, id, user_id, function (err) {
      if (err) return cb(err)
      cb(null, { updated: this.changes })
    })
  }

  static deleteById({ id, user_id }, cb) {
    const sql = `
      DELETE FROM post_comments
      WHERE id = ? AND user_id = ?
    `
    db.run(sql, id, user_id, function (err) {
      if (err) return cb(err)
      cb(null, { deleted: this.changes })
    })
  }
}
class PostLike {
  static toggle({ post_id, user_id, now }, cb) {
    // Важно: транзакция, чтобы не было гонок
    db.serialize(() => {
      db.run('BEGIN IMMEDIATE TRANSACTION')

      db.get(
        'SELECT 1 AS exists_flag FROM post_likes WHERE post_id = ? AND user_id = ?',
        post_id,
        user_id,
        (err, row) => {
          if (err) return db.run('ROLLBACK', () => cb(err))

          const alreadyLiked = !!row

          const finish = (liked) => {
            db.get(
              'SELECT COUNT(*) AS likes FROM post_likes WHERE post_id = ?',
              post_id,
              (err2, row2) => {
                if (err2) return db.run('ROLLBACK', () => cb(err2))
                db.run('COMMIT', (err3) => {
                  if (err3) return cb(err3)
                  cb(null, { liked, likes: row2.likes })
                })
              },
            )
          }

          if (alreadyLiked) {
            db.run(
              'DELETE FROM post_likes WHERE post_id = ? AND user_id = ?',
              post_id,
              user_id,
              (errDel) => {
                if (errDel) return db.run('ROLLBACK', () => cb(errDel))
                finish(false)
              },
            )
          } else {
            db.run(
              'INSERT INTO post_likes (post_id, user_id, created_at) VALUES (?, ?, ?)',
              post_id,
              user_id,
              now,
              (errIns) => {
                if (errIns) return db.run('ROLLBACK', () => cb(errIns))
                finish(true)
              },
            )
          }
        },
      )
    })
  }
  static getMeta(postId, userId, cb) {
    const sql = `
      SELECT
        (SELECT COUNT(*) FROM post_likes WHERE post_id = ?) AS likes,
        EXISTS(
          SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?
        ) AS likedByMe
    `
    db.get(sql, postId, postId, userId, cb)
  }
}
class PostRating {
  // upsert (поставить/обновить оценку)
  static upsert({ post_id, user_id, rating, now }, cb) {
    const sql = `
      INSERT INTO post_ratings (post_id, user_id, rating, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(post_id, user_id)
      DO UPDATE SET rating = excluded.rating, updated_at = excluded.updated_at
    `
    db.run(sql, post_id, user_id, rating, now, now, function (err) {
      if (err) return cb(err)
      cb(null, { updated: this.changes })
    })
  }

  // мета: средняя, кол-во, моя оценка
  static getMeta({ post_id, user_id }, cb) {
    const sql = `
      SELECT
        COALESCE(ROUND(AVG(r.rating), 2), 0) AS avgRating,
        COUNT(*) AS ratingsCount,
        (
          SELECT rating
          FROM post_ratings
          WHERE post_id = ? AND user_id = ?
        ) AS myRating
      FROM post_ratings r
      WHERE r.post_id = ?
    `
    db.get(sql, post_id, user_id, post_id, cb)
  }
}

class Notification {
  static create(data, cb) {
    const sql = `
    INSERT OR IGNORE INTO notifications (
      recipient_user_id,
      actor_user_id,
      type,
      source_type,
      entity_type,
      entity_id,
      title,
      text,
      content,
      is_read,
      created_at,
      read_at,
      delete_after_read_at,
      metadata
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `

    db.run(
      sql,
      data.recipient_user_id,
      data.actor_user_id ?? null,
      data.type,
      data.source_type,
      data.entity_type ?? null,
      data.entity_id ?? null,
      data.title ?? null,
      data.text ?? null,
      data.content ?? null,
      data.is_read ?? 0,
      data.created_at,
      data.read_at ?? null,
      data.delete_after_read_at ?? null,
      data.metadata ?? null,
      function (err) {
        if (err) return cb(err)
        cb(null, { id: this.lastID, created: this.changes > 0 })
      },
    )
  }
  static listByRecipient(userId, { limit = 20, offset = 0 } = {}, cb) {
    const sql = `
      SELECT
        n.id,
        n.type,
        n.source_type,
        n.entity_type,
        n.entity_id,
        n.text,
        n.title,
        n.content,
        n.is_read,
        n.created_at,
        n.read_at,
        n.metadata,
        n.delete_after_read_at,
        u.id AS actor_id,
        u.username AS actor_username,
        u.img_mimetype AS actor_img_mimetype
      FROM notifications n
      LEFT JOIN users u
        ON u.id = n.actor_user_id
      WHERE n.recipient_user_id = ?
      ORDER BY n.created_at DESC
      LIMIT ? OFFSET ?
    `
    db.all(sql, userId, limit, offset, cb)
  }

  static getUnreadCount(userId, cb) {
    const sql = `
      SELECT COUNT(*) AS unreadCount
      FROM notifications
      WHERE recipient_user_id = ? AND is_read = 0
    `
    db.get(sql, userId, cb)
  }

  static markAsRead(id, recipientUserId, cb) {
    const now = Date.now()
    const deleteAfterReadAt = now + 3 * 24 * 60 * 60 * 1000

    const sql = `
    UPDATE notifications
    SET
      is_read = 1,
      read_at = CASE WHEN read_at IS NULL THEN ? ELSE read_at END,
      delete_after_read_at = CASE WHEN delete_after_read_at IS NULL THEN ? ELSE delete_after_read_at END
    WHERE id = ? AND recipient_user_id = ?
  `

    db.run(sql, [now, deleteAfterReadAt, id, recipientUserId], function (err) {
      if (err) return cb(err)
      cb(null, { updated: this.changes > 0 })
    })
  }
  static markAllAsRead(recipientUserId, cb) {
    const now = Date.now()
    const deleteAfterReadAt = now + 3 * 24 * 60 * 60 * 1000

    const sql = `
    UPDATE notifications
    SET
      is_read = 1,
      read_at = CASE WHEN read_at IS NULL THEN ? ELSE read_at END,
      delete_after_read_at = CASE WHEN delete_after_read_at IS NULL THEN ? ELSE delete_after_read_at END
    WHERE recipient_user_id = ? AND is_read = 0
  `

    db.run(sql, [now, deleteAfterReadAt, recipientUserId], function (err) {
      if (err) return cb(err)
      cb(null, { updated: this.changes })
    })
  }
  static cleanupExpiredReadNotifications(now, cb) {
    const sql = `
    DELETE FROM notifications
    WHERE is_read = 1
      AND delete_after_read_at IS NOT NULL
      AND delete_after_read_at <= ?
  `

    db.run(sql, [now], function (err) {
      if (err) return cb(err)
      cb(null, { deleted: this.changes })
    })
  }

  static deleteByKey({ recipient_user_id, actor_user_id, type, entity_type, entity_id }, cb) {
    const sql = `
      DELETE FROM notifications
      WHERE recipient_user_id = ?
        AND actor_user_id = ?
        AND type = ?
        AND entity_type = ?
        AND entity_id = ?
    `
    db.run(sql, recipient_user_id, actor_user_id, type, entity_type, entity_id, function (err) {
      if (err) return cb(err)
      cb(null, { deleted: this.changes })
    })
  }
}
class Title {
  static all(cb) {
    db.all('SELECT * FROM titles ORDER BY id', cb)
  }
  static findById(id, cb) {
    db.get('SELECT * FROM titles WHERE id = ?', id, cb)
  }
  static create({ title_name, description }, cb) {
    db.run(
      'INSERT INTO titles (title_name, description) VALUES (?, ?)',
      title_name,
      description ?? null,
      function (err) {
        err ? cb(err) : cb(null, { id: this.lastID })
      },
    )
  }
  // Выдать титул пользователю (за достижение)
  static grant(user_id, title_id, cb) {
    db.run(
      'INSERT OR IGNORE INTO user_titles (user_id, title_id, earned_at) VALUES (?, ?, ?)',
      user_id,
      title_id,
      Date.now(),
      function (err) {
        err ? cb(err) : cb(null, { granted: this.changes > 0 })
      },
    )
  }
  // Список заработанных пользователем
  static listEarned(user_id, cb) {
    db.all(
      `
      SELECT t.id, t.title_name, t.description, ut.earned_at
      FROM user_titles ut
      JOIN titles t ON t.id = ut.title_id
      WHERE ut.user_id = ?
      ORDER BY ut.earned_at DESC
    `,
      user_id,
      cb,
    )
  }
  // Установить выбранный титул (только если заработан, или null чтобы снять)
  static setSelected(user_id, title_id, cb) {
    if (title_id === null) {
      return db.run('UPDATE users SET title_id = NULL WHERE id = ?', user_id, function (err) {
        err ? cb(err) : cb(null, { updated: this.changes })
      })
    }
    db.get(
      'SELECT 1 FROM user_titles WHERE user_id = ? AND title_id = ?',
      user_id,
      title_id,
      (err, row) => {
        if (err) return cb(err)
        if (!row) return cb(new Error('Title not earned'))
        db.run('UPDATE users SET title_id = ? WHERE id = ?', title_id, user_id, function (e) {
          e ? cb(e) : cb(null, { updated: this.changes })
        })
      },
    )
  }
}
class EmailVerification {
  // Сохранить код в базу
  static async createVerificationCode(userId, type, newEmail = null) {
    const code = generateCode()
    const codeHash = hashCode(code)
    const expiresAt = Date.now() + 10 * 60 * 1000 // 10 минут
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO verification_codes (user_id, type, code_hash, new_email, expires_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, type, codeHash, newEmail, expiresAt, Date.now()],
        function (err) {
          if (err) {
            return reject(err)
          }
          resolve(code) // Вернем сам код, чтобы отправить его пользователю
        },
      )
    })
  }

  // Отправить код на email
  static async sendVerificationCode(email, code, type) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Code for ${email}: ${code}`)
      return
    }
    const nodemailer = require('nodemailer')
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
    const subject = type === 'change_password' ? 'Смена пароля' : 'Смена почты'
    const text = `Ваш код подтверждения: ${code}. Он действителен 10 минут.`

    return new Promise((resolve, reject) => {
      transporter.sendMail(
        {
          from: process.env.SMTP_FROM,
          to: email,
          subject,
          text,
        },
        (error, info) => {
          if (error) {
            return reject(error)
          }
          resolve(info)
        },
      )
    })
  }

  // Проверка кода
  static async verifyCode(userId, code, type) {
    const codeHash = hashCode(code)

    return new Promise((resolve, reject) => {
      db.get(
        `SELECT * FROM verification_codes WHERE user_id = ? AND type = ? AND code_hash = ? AND used = 0`,
        [userId, type, codeHash],
        (err, row) => {
          if (err) {
            return reject(err)
          }

          if (!row) {
            return reject(new Error('Invalid or expired code'))
          }

          // Проверка срока действия
          if (row.expires_at < Date.now()) {
            return reject(new Error('Code has expired'))
          }

          // Увеличиваем счётчик попыток
          db.run(`UPDATE verification_codes SET attempts_count = attempts_count + 1 WHERE id = ?`, [
            row.id,
          ])

          resolve(row)
        },
      )
    })
  }

  // Смена пароля
  static async changePassword(userId, newPassword) {
    const hashedPassword = await hashPassword(newPassword)

    return new Promise((resolve, reject) => {
      db.run(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, userId], (err) => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  }

  // Смена почты
  static async changeEmail(userId, newEmail) {
    return new Promise((resolve, reject) => {
      db.run(`UPDATE users SET email = ? WHERE id = ?`, [newEmail, userId], (err) => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  }

  // Помечаем код как использованный
  static async markCodeAsUsed(userId, type) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE verification_codes SET used = 1 WHERE user_id = ? AND type = ?`,
        [userId, type],
        (err) => {
          if (err) {
            return reject(err)
          }
          resolve()
        },
      )
    })
  }
}

module.exports = db
module.exports.User = User
module.exports.Post = Post
module.exports.PostLike = PostLike
module.exports.PostRating = PostRating
module.exports.Notification = Notification
module.exports.PostComment = PostComment
module.exports.Title = Title
module.exports.EmailVerification = EmailVerification
module.exports.RefreshSession = RefreshSession
