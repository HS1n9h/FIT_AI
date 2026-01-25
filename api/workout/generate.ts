import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY!;

export const config = {
  runtime: 'edge',
};

interface WorkoutRequest {
  userId: string;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  availableMinutes: number;
  equipment?: string[];
  focusAreas?: string[];
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const body: WorkoutRequest = await req.json();

    // Validate auth token
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Fetch exercises from Supabase
    const { data: exercises, error: exercisesError } = await supabase
      .from('exercises')
      .select('*')
      .in('difficulty', getCompatibleDifficulties(body.fitnessLevel))
      .limit(50);

    if (exercisesError) throw exercisesError;

    // Generate workout with OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: generateWorkoutPrompt(body, exercises || []),
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error('OpenAI API error');
    }

    const openaiData = await openaiResponse.json();
    const workoutPlan = JSON.parse(openaiData.choices[0].message.content);

    // Save to Supabase
    const { data: savedPlan, error: saveError } = await supabase
      .from('workout_plans')
      .insert({
        user_id: user.id,
        name: workoutPlan.name,
        exercises: workoutPlan.exercises,
        duration_minutes: workoutPlan.estimated_duration,
        difficulty: body.fitnessLevel,
        workout_type: 'strength',
      })
      .select()
      .single();

    if (saveError) throw saveError;

    return new Response(JSON.stringify(savedPlan), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Workout generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate workout', details: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

function getCompatibleDifficulties(level: string): string[] {
  if (level === 'beginner') return ['beginner'];
  if (level === 'intermediate') return ['beginner', 'intermediate'];
  return ['intermediate', 'advanced'];
}

function generateWorkoutPrompt(request: WorkoutRequest, exercises: any[]): string {
  const equipment = request.equipment?.length ? request.equipment.join(', ') : 'bodyweight only';
  
  return `You are an expert personal trainer. Create a ${request.availableMinutes}-minute workout for a ${request.fitnessLevel} user.

Goals: ${request.goals.join(', ')}
Equipment: ${equipment}
${request.focusAreas ? `Focus areas: ${request.focusAreas.join(', ')}` : ''}

Available exercises (JSON array):
${JSON.stringify(exercises.slice(0, 30))}

Requirements:
1. Include warm-up (3-5 min) and cool-down (3-5 min)
2. Vary exercises across muscle groups
3. Progressive difficulty within workout
4. Include REST periods (30-90 seconds between sets)
5. Total duration must be ~${request.availableMinutes} minutes
6. Target reps should be suggestions, not strict limits (users can do more!)

Return ONLY valid JSON (no markdown, no code blocks):
{
  "name": "Descriptive workout name",
  "exercises": [
    {
      "exercise_id": "uuid from available exercises",
      "name": "exercise name",
      "sets": number,
      "target_reps": number,
      "rest_seconds": number,
      "notes": "form tips or modifications"
    }
  ],
  "estimated_duration": number,
  "estimated_calories": number
}`;
}
