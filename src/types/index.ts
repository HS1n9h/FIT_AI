// Database types
export interface Profile {
  id: string;
  display_name: string | null;
  fitness_level: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  available_minutes: number;
  preferred_equipment: string[];
  subscription_tier: 'free' | 'premium';
  subscription_expires_at: string | null;
  apple_health_enabled: boolean;
  last_health_sync: string | null;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscle_groups: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[];
  instructions: string;
  gif_url: string | null;
  video_url: string | null;
  variations: ExerciseVariation[];
  pose_reference: PoseReference | null;
  is_cardio: boolean;
  calories_per_minute: number | null;
  created_at: string;
}

export interface ExerciseVariation {
  name: string;
  description: string;
  difficulty_modifier: number;
}

export interface PoseReference {
  keypoints: string[];
  angles: {
    [key: string]: {
      min: number;
      ideal: number;
      max: number;
    };
  };
}

export interface WorkoutPlan {
  id: string;
  user_id: string;
  name: string;
  exercises: WorkoutExercise[];
  duration_minutes: number;
  difficulty: string;
  workout_type: 'strength' | 'cardio' | 'mixed';
  created_at: string;
  is_archived: boolean;
}

export interface WorkoutExercise {
  exercise_id: string;
  sets: number;
  target_reps: number;
  rest_seconds: number;
  variation?: string;
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  plan_id: string;
  started_at: string;
  completed_at: string | null;
  status: 'in_progress' | 'completed' | 'abandoned';
  exercises_completed: ExerciseCompletion[];
  total_calories_burned: number | null;
  avg_form_score: number | null;
  user_rating: number | null;
  notes: string | null;
  synced_to_health: boolean;
}

export interface ExerciseCompletion {
  exercise_id: string;
  sets_completed: SetCompletion[];
}

export interface SetCompletion {
  reps: number;
  weight_lbs: number | null;
  form_score: number | null;
  duration_seconds: number | null;
  notes: string | null;
}

export interface NutritionLog {
  id: string;
  user_id: string;
  logged_at: string;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  calories: number | null;
  protein_grams: number | null;
  ai_analyzed: boolean;
  synced_to_health: boolean;
}

export interface UserStreak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_workout_date: string | null;
  total_workouts: number;
  total_exercises: number;
  updated_at: string;
}

// API types
export interface GenerateWorkoutRequest {
  userId: string;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  availableMinutes: number;
  equipment: string[];
  focusAreas?: string[];
}

export interface GenerateWorkoutResponse {
  planId: string;
  name: string;
  exercises: {
    exercise_id: string;
    name: string;
    sets: number;
    target_reps: number;
    rest_seconds: number;
    notes?: string;
  }[];
  estimated_duration: number;
  estimated_calories: number;
}

// Pose detection types
export interface Keypoint {
  x: number;
  y: number;
  confidence: number;
}

export interface PoseData {
  keypoints: {
    [key: string]: Keypoint;
  };
  timestamp: number;
}

export interface FormFeedback {
  score: number;
  issues: FormIssue[];
  angles: {
    [key: string]: number;
  };
}

export interface FormIssue {
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
}
