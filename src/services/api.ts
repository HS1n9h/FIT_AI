import { supabase } from './supabase';
import type { GenerateWorkoutRequest, GenerateWorkoutResponse } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

async function getAuthHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No active session');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session.access_token}`,
  };
}

export const workoutAPI = {
  async generateWorkout(request: GenerateWorkoutRequest): Promise<GenerateWorkoutResponse> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/workout/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate workout');
    }

    return response.json();
  },

  async adaptWorkout(planId: string, feedback: string): Promise<any> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/workout/adapt`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ planId, feedback }),
    });

    if (!response.ok) {
      throw new Error('Failed to adapt workout');
    }

    return response.json();
  },
};

export const nutritionAPI = {
  async analyzeMeal(description: string): Promise<any> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/nutrition/analyze`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ description }),
    });

    if (!response.ok) {
      throw new Error('Failed to analyze meal');
    }

    return response.json();
  },
};

export const coachAPI = {
  async getMotivation(): Promise<{ message: string }> {
    const headers = await getAuthHeaders();

    const response = await fetch(`${API_URL}/coach/motivate`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error('Failed to get motivation');
    }

    return response.json();
  },
};
