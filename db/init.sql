-- UUID拡張
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- カテゴリテーブル
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    eating_out_cost INTEGER NOT NULL
);

-- ユーザーテーブル
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider TEXT,
    provider_id TEXT,
    name TEXT,
    fcm_token TEXT,
    notify_enabled BOOLEAN DEFAULT true,
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider, provider_id)
);

-- レシピテーブル
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title TEXT,
    thumbnail_url TEXT,
    platform TEXT,
    category_id TEXT REFERENCES categories(id),
    estimated_cost INTEGER,
    eating_out_cost INTEGER,
    status TEXT DEFAULT 'SAVED' CHECK (status IN ('SAVED', 'COOKED', 'DELETED')),
    suggested_at DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- イベントテーブル（行動ログ）
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_status ON recipes(status);
CREATE INDEX idx_events_user_id ON events(user_id);

-- カテゴリ初期データ
INSERT INTO categories (id, name, icon, eating_out_cost) VALUES
    ('ramen', 'ラーメン', '🍜', 900),
    ('pasta', 'パスタ', '🍝', 1000),
    ('curry', 'カレー', '🍛', 850),
    ('donburi', '丼もの', '🍚', 750),
    ('stir_fry', '炒めもの', '🥘', 700),
    ('nabe', '鍋', '🍲', 1200),
    ('salad', 'サラダ', '🥗', 600),
    ('other', 'その他', '🍽️', 800);

-- テスト用ユーザー（開発用）
INSERT INTO users (id, name) VALUES
    ('00000000-0000-0000-0000-000000000001', 'テストユーザー');

-- テスト用レシピ（開発用）
INSERT INTO recipes (user_id, url, title, thumbnail_url, platform, category_id, estimated_cost, eating_out_cost, status) VALUES
    ('00000000-0000-0000-0000-000000000001', 'https://youtube.com/watch?v=xxx1', '醤油ラーメン', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop', 'YouTube', 'ramen', 300, 900, 'SAVED'),
    ('00000000-0000-0000-0000-000000000001', 'https://youtube.com/watch?v=xxx2', 'ペペロンチーノ', 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&h=300&fit=crop', 'YouTube', 'pasta', 250, 1000, 'SAVED'),
    ('00000000-0000-0000-0000-000000000001', 'https://youtube.com/watch?v=xxx3', 'バターチキンカレー', 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop', 'YouTube', 'curry', 400, 850, 'COOKED');

-- updated_at自動更新用関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガー設定
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at
    BEFORE UPDATE ON recipes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
