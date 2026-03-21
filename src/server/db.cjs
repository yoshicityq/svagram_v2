// import sqlite3 from 'sqlite3';
const sqlite3 = require('sqlite3').verbose()
const dbName = 'later.sqlite'
const db = new sqlite3.Database(dbName)

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
    favorite_brands TEXT)
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
      brand_accessory TEXT NOT NULL,
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
  db.run(sql_refresh)
  db.run(sql_users)
  db.run(sql_posts)
  db.run(sql_post_likes)
  db.run(sql_post_ratings)
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
  static findPublicByUsername(username, cb) {
    const sql = `
    SELECT id, username, city, description, favorite_brands, img_mimetype
    FROM users
    WHERE username = ?
  `
    db.get(sql, username, cb)
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
      CASE WHEN pl.user_id IS NULL THEN 0 ELSE 1 END AS likedByMe
    FROM posts p
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS likes
      FROM post_likes
      GROUP BY post_id
    ) lc ON lc.post_id = p.id
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
      CASE WHEN pl.user_id IS NULL THEN 0 ELSE 1 END AS likedByMe
    FROM posts p
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS likes
      FROM post_likes
      GROUP BY post_id
    ) lc ON lc.post_id = p.id
    LEFT JOIN post_likes pl
      ON pl.post_id = p.id AND pl.user_id = ?
    WHERE p.user = ?
    ORDER BY p.id DESC
    LIMIT ? OFFSET ?
  `
    db.all(sql, userId, username, limit, offset, cb)
  }

  static findMetaById(id, userId, cb) {
    const sql = `
    SELECT
      p.id, p.user, p.description,
      p.brand_accessory, p.brand_hat, p.brand_outwear, p.brand_top, p.brand_bottom, p.brand_shoes, p.brand_bag, p.brand_glasses,
      p.img_mimetype,
      COALESCE(lc.likes, 0) AS likes,
      CASE WHEN pl.user_id IS NULL THEN 0 ELSE 1 END AS likedByMe
    FROM posts p
    LEFT JOIN (
      SELECT post_id, COUNT(*) AS likes
      FROM post_likes
      GROUP BY post_id
    ) lc ON lc.post_id = p.id
    LEFT JOIN post_likes pl
      ON pl.post_id = p.id AND pl.user_id = ?
    WHERE p.id = ?
  `
    db.get(sql, userId, id, cb)
  }

  static update(data, cb) {
    const sql = 'UPDATE posts SET likes = ?, people_liked = ? WHERE id = ?'
    db.run(sql, data.likes, data.people_liked, data.id, cb)
  }

  static delete(id, cb) {
    if (!id) return cb(new Error('Please provide an id'))
    db.run('DELETE FROM posts WHERE id = ?', id, cb)
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

module.exports = db
module.exports.User = User
module.exports.Post = Post
module.exports.PostLike = PostLike
module.exports.PostRating = PostRating
module.exports.RefreshSession = RefreshSession
