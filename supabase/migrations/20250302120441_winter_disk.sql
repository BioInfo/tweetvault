/*
  # Add user settings table
  
  1. New Tables
    - `user_settings`
      - `user_id` (uuid, primary key, references auth.users)
      - `theme` (text, default 'system')
      - `default_view` (text, default 'dashboard')
      - `compact_mode` (boolean, default false)
      - `auto_summarize` (boolean, default true)
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `user_settings` table
    - Add policies for authenticated users to manage their own settings
*/

CREATE TABLE IF NOT EXISTS user_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme text NOT NULL DEFAULT 'system',
  default_view text NOT NULL DEFAULT 'dashboard',
  compact_mode boolean NOT NULL DEFAULT false,
  auto_summarize boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);