-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create watch_progress table
CREATE TABLE IF NOT EXISTS watch_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  item_id TEXT NOT NULL,
  progress INTEGER NOT NULL CHECK (progress >= 0 AND progress <= 100),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, item_id)
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  item_id TEXT NOT NULL,
  title TEXT NOT NULL,
  poster TEXT,
  type TEXT NOT NULL CHECK (type IN ('movie', 'tv', 'anime', 'sports')),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
  UNIQUE(user_id, item_id)
);

-- Create watch_history table
CREATE TABLE IF NOT EXISTS watch_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  item_id TEXT NOT NULL,
  title TEXT NOT NULL,
  poster TEXT,
  type TEXT NOT NULL CHECK (type IN ('movie', 'tv', 'anime', 'sports')),
  timestamp BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM NOW()) * 1000
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_watch_progress_user_id ON watch_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_progress_item_id ON watch_progress(item_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_item_id ON favorites(item_id);
CREATE INDEX IF NOT EXISTS idx_favorites_type ON favorites(type);
CREATE INDEX IF NOT EXISTS idx_watch_history_user_id ON watch_history(user_id);
CREATE INDEX IF NOT EXISTS idx_watch_history_timestamp ON watch_history(timestamp DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_watch_progress_updated_at BEFORE UPDATE ON watch_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Watch progress policies
CREATE POLICY "Users can view own watch progress"
  ON watch_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watch progress"
  ON watch_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watch progress"
  ON watch_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own watch progress"
  ON watch_progress FOR DELETE
  USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Watch history policies
CREATE POLICY "Users can view own watch history"
  ON watch_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watch history"
  ON watch_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watch history"
  ON watch_history FOR DELETE
  USING (auth.uid() = user_id);
