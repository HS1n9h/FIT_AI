-- FitAI Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  fitness_level TEXT CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')) DEFAULT 'beginner',
  goals TEXT[] DEFAULT '{}',
  available_minutes INTEGER DEFAULT 30,
  preferred_equipment TEXT[] DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  subscription_expires_at TIMESTAMPTZ,
  apple_health_enabled BOOLEAN DEFAULT false,
  last_health_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workout plans with variation support
CREATE TABLE workout_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  exercises JSONB NOT NULL DEFAULT '[]',
  duration_minutes INTEGER,
  difficulty TEXT,
  workout_type TEXT CHECK (workout_type IN ('strength', 'cardio', 'mixed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_archived BOOLEAN DEFAULT false
);

-- Workout sessions with flexible rep logging
CREATE TABLE workout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES workout_plans(id),
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  status TEXT CHECK (status IN ('in_progress', 'completed', 'abandoned')) DEFAULT 'in_progress',
  exercises_completed JSONB DEFAULT '[]',
  total_calories_burned INTEGER,
  avg_form_score FLOAT,
  user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
  notes TEXT,
  synced_to_health BOOLEAN DEFAULT false
);

-- Exercise library
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  muscle_groups TEXT[] NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  equipment TEXT[] DEFAULT '{}',
  instructions TEXT NOT NULL,
  gif_url TEXT,
  video_url TEXT,
  variations JSONB DEFAULT '[]',
  pose_reference JSONB,
  is_cardio BOOLEAN DEFAULT false,
  calories_per_minute FLOAT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nutrition logs
CREATE TABLE nutrition_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  date DATE DEFAULT CURRENT_DATE,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  description TEXT NOT NULL,
  calories INTEGER,
  protein_grams FLOAT,
  ai_analyzed BOOLEAN DEFAULT false,
  synced_to_health BOOLEAN DEFAULT false
);

-- User streaks
CREATE TABLE user_streaks (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_workout_date DATE,
  total_workouts INTEGER DEFAULT 0,
  total_exercises INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Workout plans policies
CREATE POLICY "Users can view own workout plans" 
  ON workout_plans FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout plans" 
  ON workout_plans FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout plans" 
  ON workout_plans FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout plans" 
  ON workout_plans FOR DELETE 
  USING (auth.uid() = user_id);

-- Workout sessions policies
CREATE POLICY "Users can view own workout sessions" 
  ON workout_sessions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout sessions" 
  ON workout_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout sessions" 
  ON workout_sessions FOR UPDATE 
  USING (auth.uid() = user_id);

-- Nutrition logs policies
CREATE POLICY "Users can view own nutrition logs" 
  ON nutrition_logs FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own nutrition logs" 
  ON nutrition_logs FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own nutrition logs" 
  ON nutrition_logs FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own nutrition logs" 
  ON nutrition_logs FOR DELETE 
  USING (auth.uid() = user_id);

-- User streaks policies
CREATE POLICY "Users can view own streak" 
  ON user_streaks FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak" 
  ON user_streaks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own streak" 
  ON user_streaks FOR UPDATE 
  USING (auth.uid() = user_id);

-- Exercises table (public read-only)
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view exercises" 
  ON exercises FOR SELECT 
  TO authenticated 
  USING (true);

-- Function to update user streak
CREATE OR REPLACE FUNCTION update_user_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_last_workout_date DATE;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_total_workouts INTEGER;
BEGIN
  -- Get current streak data
  SELECT last_workout_date, current_streak, longest_streak, total_workouts
  INTO v_last_workout_date, v_current_streak, v_longest_streak, v_total_workouts
  FROM user_streaks
  WHERE user_id = p_user_id;

  -- If no streak record exists, create one
  IF v_last_workout_date IS NULL THEN
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_workout_date, total_workouts, total_exercises)
    VALUES (p_user_id, 1, 1, CURRENT_DATE, 1, 0);
    RETURN;
  END IF;

  -- Check if workout is on consecutive day
  IF v_last_workout_date = CURRENT_DATE THEN
    -- Same day, just increment total workouts
    UPDATE user_streaks
    SET total_workouts = total_workouts + 1,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSIF v_last_workout_date = CURRENT_DATE - INTERVAL '1 day' THEN
    -- Consecutive day, increment streak
    v_current_streak := v_current_streak + 1;
    v_longest_streak := GREATEST(v_longest_streak, v_current_streak);
    
    UPDATE user_streaks
    SET current_streak = v_current_streak,
        longest_streak = v_longest_streak,
        last_workout_date = CURRENT_DATE,
        total_workouts = total_workouts + 1,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSE
    -- Streak broken, reset to 1
    UPDATE user_streaks
    SET current_streak = 1,
        last_workout_date = CURRENT_DATE,
        total_workouts = total_workouts + 1,
        updated_at = NOW()
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed some basic exercises
INSERT INTO exercises (name, muscle_groups, difficulty, equipment, instructions, is_cardio, calories_per_minute) VALUES
('Push-ups', ARRAY['chest', 'triceps', 'shoulders'], 'beginner', ARRAY['none'], 'Place hands shoulder-width apart, lower body until chest nearly touches floor, push back up.', false, 7),
('Squats', ARRAY['legs', 'glutes'], 'beginner', ARRAY['none'], 'Stand with feet shoulder-width apart, lower body as if sitting back into a chair, return to standing.', false, 8),
('Plank', ARRAY['core', 'shoulders'], 'beginner', ARRAY['none'], 'Hold body in straight line from head to heels, elbows under shoulders, hold position.', false, 5),
('Lunges', ARRAY['legs', 'glutes'], 'beginner', ARRAY['none'], 'Step forward with one leg, lower hips until both knees are bent at 90 degrees, return to start.', false, 7),
('Jumping Jacks', ARRAY['full body'], 'beginner', ARRAY['none'], 'Jump while spreading legs and raising arms overhead, return to starting position.', true, 10),
('Burpees', ARRAY['full body'], 'intermediate', ARRAY['none'], 'From standing, drop to squat, kick feet back to plank, do push-up, jump feet forward, jump up.', true, 12),
('Mountain Climbers', ARRAY['core', 'shoulders'], 'intermediate', ARRAY['none'], 'Start in plank position, alternate bringing knees toward chest in running motion.', true, 10),
('Dumbbell Bicep Curls', ARRAY['biceps'], 'beginner', ARRAY['dumbbells'], 'Hold dumbbells at sides, curl weights up to shoulders, lower slowly.', false, 5),
('Dumbbell Shoulder Press', ARRAY['shoulders', 'triceps'], 'beginner', ARRAY['dumbbells'], 'Hold dumbbells at shoulder height, press overhead until arms are straight, lower slowly.', false, 6),
('Dumbbell Rows', ARRAY['back', 'biceps'], 'intermediate', ARRAY['dumbbells'], 'Bend forward at hips, pull dumbbells to sides keeping elbows close to body.', false, 6);

-- Create indexes for performance
CREATE INDEX idx_workout_plans_user_id ON workout_plans(user_id);
CREATE INDEX idx_workout_sessions_user_id ON workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_status ON workout_sessions(status);
CREATE INDEX idx_nutrition_logs_user_id ON nutrition_logs(user_id);
CREATE INDEX idx_nutrition_logs_date ON nutrition_logs(date);
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX idx_exercises_muscle_groups ON exercises USING GIN(muscle_groups);

-- All done!
SELECT 'Database schema created successfully!' as message;
