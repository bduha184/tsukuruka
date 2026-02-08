CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    eating_out_cost INTEGER NOT NULL
);

INSERT INTO categories (id, name, icon, eating_out_cost) VALUES
    ('ramen', 'ラーメン', '🍜', 900),
    ('pasta', 'パスタ', '🍝', 1000),
    ('curry', 'カレー', '🍛', 850),
    ('donburi', '丼もの', '🍚', 750),
    ('stir_fry', '炒めもの', '🥘', 700),
    ('nabe', '鍋', '🍲', 1200),
    ('salad', 'サラダ', '🥗', 600),
    ('other', 'その他', '🍽️', 800);
