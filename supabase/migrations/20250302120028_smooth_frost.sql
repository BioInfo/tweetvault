/*
  # Initial Schema Setup for TweetVault

  1. New Tables
    - `tweets`
      - `id` (uuid, primary key)
      - `text` (text)
      - `author_id` (text)
      - `author_name` (text)
      - `author_username` (text)
      - `created_at` (timestamptz)
      - `ai_summary` (text)
      - `metrics` (jsonb)
      - `user_id` (uuid, foreign key to auth.users)

    - `collections`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `user_id` (uuid, foreign key to auth.users)

    - `collection_tweets`
      - `collection_id` (uuid, foreign key to collections)
      - `tweet_id` (uuid, foreign key to tweets)
      - `added_at` (timestamptz)

    - `tweet_topics`
      - `tweet_id` (uuid, foreign key to tweets)
      - `topic` (text)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create tweets table
CREATE TABLE IF NOT EXISTS tweets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  author_id text NOT NULL,
  author_name text NOT NULL,
  author_username text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  ai_summary text,
  metrics jsonb,
  user_id uuid NOT NULL,
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid NOT NULL,
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create collection_tweets junction table
CREATE TABLE IF NOT EXISTS collection_tweets (
  collection_id uuid REFERENCES collections(id) ON DELETE CASCADE,
  tweet_id uuid REFERENCES tweets(id) ON DELETE CASCADE,
  added_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (collection_id, tweet_id)
);

-- Create tweet_topics table
CREATE TABLE IF NOT EXISTS tweet_topics (
  tweet_id uuid REFERENCES tweets(id) ON DELETE CASCADE,
  topic text NOT NULL,
  PRIMARY KEY (tweet_id, topic)
);

-- Enable Row Level Security
ALTER TABLE tweets ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_tweets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tweet_topics ENABLE ROW LEVEL SECURITY;

-- Create policies for tweets
CREATE POLICY "Users can view their own tweets"
  ON tweets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tweets"
  ON tweets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tweets"
  ON tweets FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tweets"
  ON tweets FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for collections
CREATE POLICY "Users can view their own collections"
  ON collections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collections"
  ON collections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
  ON collections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
  ON collections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for collection_tweets
CREATE POLICY "Users can view their collection tweets"
  ON collection_tweets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE id = collection_tweets.collection_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their collection tweets"
  ON collection_tweets FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collections
      WHERE id = collection_tweets.collection_id
      AND user_id = auth.uid()
    )
  );

-- Create policies for tweet_topics
CREATE POLICY "Users can view tweet topics"
  ON tweet_topics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tweets
      WHERE id = tweet_topics.tweet_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage tweet topics"
  ON tweet_topics FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tweets
      WHERE id = tweet_topics.tweet_id
      AND user_id = auth.uid()
    )
  );