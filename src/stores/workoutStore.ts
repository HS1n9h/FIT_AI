import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';
import { supabase } from '../services/supabase';
import type { WorkoutPlan, WorkoutSession, Exercise } from '../types';

const storage = new MMKV();

interface WorkoutState {
  currentWorkout: WorkoutSession | null;
  currentPlan: WorkoutPlan | null;
  currentExerciseIndex: number;
  currentSet: number;
  isResting: boolean;
  restTimeRemaining: number;
  
  // Actions
  startWorkout: (plan: WorkoutPlan) => void;
  completeSet: (exerciseId: string, reps: number, weight?: number, formScore?: number) => void;
  nextExercise: () => void;
  startRest: (seconds: number) => void;
  endRest: () => void;
  completeWorkout: (rating?: number, notes?: string) => Promise<void>;
  abandonWorkout: () => void;
  loadRecentWorkouts: () => Promise<WorkoutSession[]>;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  currentWorkout: null,
  currentPlan: null,
  currentExerciseIndex: 0,
  currentSet: 1,
  isResting: false,
  restTimeRemaining: 0,

  startWorkout: (plan: WorkoutPlan) => {
    const workout: WorkoutSession = {
      id: `temp_${Date.now()}`,
      user_id: '', // Will be set when saving
      plan_id: plan.id,
      started_at: new Date().toISOString(),
      completed_at: null,
      status: 'in_progress',
      exercises_completed: [],
      total_calories_burned: null,
      avg_form_score: null,
      user_rating: null,
      notes: null,
      synced_to_health: false,
    };

    set({
      currentWorkout: workout,
      currentPlan: plan,
      currentExerciseIndex: 0,
      currentSet: 1,
      isResting: false,
    });

    // Cache workout locally
    storage.set('current_workout', JSON.stringify(workout));
    storage.set('current_plan', JSON.stringify(plan));
  },

  completeSet: (exerciseId: string, reps: number, weight?: number, formScore?: number) => {
    const { currentWorkout, currentPlan, currentExerciseIndex, currentSet } = get();
    if (!currentWorkout || !currentPlan) return;

    const setData = {
      reps,
      weight_lbs: weight || null,
      form_score: formScore || null,
      duration_seconds: null,
      notes: null,
    };

    const updatedWorkout = { ...currentWorkout };
    const exerciseCompletion = updatedWorkout.exercises_completed.find(
      (e) => e.exercise_id === exerciseId
    );

    if (exerciseCompletion) {
      exerciseCompletion.sets_completed.push(setData);
    } else {
      updatedWorkout.exercises_completed.push({
        exercise_id: exerciseId,
        sets_completed: [setData],
      });
    }

    const currentExercise = currentPlan.exercises[currentExerciseIndex];
    const isLastSet = currentSet >= currentExercise.sets;

    set({
      currentWorkout: updatedWorkout,
      currentSet: isLastSet ? 1 : currentSet + 1,
    });

    // Auto-start rest timer if not last set
    if (!isLastSet) {
      get().startRest(currentExercise.rest_seconds);
    }

    storage.set('current_workout', JSON.stringify(updatedWorkout));
  },

  nextExercise: () => {
    const { currentExerciseIndex, currentPlan } = get();
    if (!currentPlan) return;

    const nextIndex = currentExerciseIndex + 1;
    if (nextIndex < currentPlan.exercises.length) {
      set({ currentExerciseIndex: nextIndex, currentSet: 1 });
    }
  },

  startRest: (seconds: number) => {
    set({ isResting: true, restTimeRemaining: seconds });
  },

  endRest: () => {
    set({ isResting: false, restTimeRemaining: 0 });
  },

  completeWorkout: async (rating?: number, notes?: string) => {
    const { currentWorkout } = get();
    if (!currentWorkout) return;

    try {
      const updatedWorkout: WorkoutSession = {
        ...currentWorkout,
        completed_at: new Date().toISOString(),
        status: 'completed',
        user_rating: rating || null,
        notes: notes || null,
      };

      // Calculate average form score
      let totalFormScore = 0;
      let formScoreCount = 0;
      updatedWorkout.exercises_completed.forEach((exercise) => {
        exercise.sets_completed.forEach((set) => {
          if (set.form_score !== null) {
            totalFormScore += set.form_score;
            formScoreCount++;
          }
        });
      });
      updatedWorkout.avg_form_score = formScoreCount > 0 ? totalFormScore / formScoreCount : null;

      // Save to Supabase
      const { data, error } = await supabase
        .from('workout_sessions')
        .insert(updatedWorkout)
        .select()
        .single();

      if (error) throw error;

      // Update streak
      await supabase.rpc('update_user_streak', { p_user_id: updatedWorkout.user_id });

      set({
        currentWorkout: null,
        currentPlan: null,
        currentExerciseIndex: 0,
        currentSet: 1,
      });

      storage.delete('current_workout');
      storage.delete('current_plan');
    } catch (error) {
      console.error('Complete workout error:', error);
      throw error;
    }
  },

  abandonWorkout: () => {
    set({
      currentWorkout: null,
      currentPlan: null,
      currentExerciseIndex: 0,
      currentSet: 1,
      isResting: false,
    });
    storage.delete('current_workout');
    storage.delete('current_plan');
  },

  loadRecentWorkouts: async () => {
    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Load recent workouts error:', error);
      return [];
    }
  },
}));
