-- SQLite



-- CREATE TABLE IF NOT EXISTS users (
--     user_id integer PRIMARY KEY AUTOINCREMENT,
--     email text NOT NULL UNIQUE,
--     username text NOT NULL UNIQUE,
--     password text NOT NULL,
--     created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
-- );

-- ALTER TABLE users ADD COLUMN profileCode INTEGER;



CREATE TABLE IF NOT EXISTS imgs (
    img_id integer PRIMARY KEY AUTOINCREMENT,
    username text NOT NULL,
    img_data BLOB NOT NULL,
    profileCode INTEGER,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    likes INTEGER NOT NULL DEFAULT 0
);

-- ALTER TABLE users 
-- ADD COLUMN avatar_id integer;




-- INSERT INTO users (username, email, password, created_at) VALUES ('admin', 'admin@example.com', 'admin@example.com', CURRENT_DATE);


-- SELECT * FROM users;




CREATE TABLE IF NOT EXISTS likes (
    like_id INTEGER PRIMARY KEY AUTOINCREMENT,
    img_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    user_id INTEGER NOT NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (img_id) REFERENCES imgs(img_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);



CREATE TRIGGER IF NOT EXISTS update_likes_count_after_insert
AFTER INSERT ON likes
FOR EACH ROW
BEGIN
    UPDATE imgs
    SET likes = likes + 1
    WHERE img_id = NEW.img_id;
END;




-- CREATE TRIGGER IF NOT EXISTS update_likes_count_after_delete
-- AFTER DELETE ON likes
-- FOR EACH ROW
-- BEGIN
--     UPDATE imgs
--     SET likes = likes - 1
--     WHERE img_id = OLD.img_id;
-- END;

CREATE TRIGGER IF NOT EXISTS dislike_update
AFTER DELETE ON likes
FOR EACH ROW
BEGIN
    UPDATE imgs
    SET likes = likes - 1
    WHERE img_id = OLD.img_id;
END;



DROP TRIGGER IF EXISTS update_likes_count_after_delete;
-- Check if the trigger exists after deletion attempt
SELECT * FROM sqlite_master WHERE type = 'trigger' AND name = 'update_likes_count_after_delete';
