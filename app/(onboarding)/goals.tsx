import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';

const GOALS = [
  { id: 'weight_loss', title: 'Lose Weight', emoji: '🎯' },
  { id: 'muscle_gain', title: 'Build Muscle', emoji: '💪' },
  { id: 'get_fit', title: 'Get Fit', emoji: '🏃' },
  { id: 'flexibility', title: 'Improve Flexibility', emoji: '🧘' },
  { id: 'endurance', title: 'Build Endurance', emoji: '🚴' },
  { id: 'strength', title: 'Increase Strength', emoji: '🏋️' },
];

const TIME_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
];

export default function GoalsScreen() {
  const router = useRouter();
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [availableTime, setAvailableTime] = useState(30);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]
    );
  };

  const handleFinish = async () => {
    try {
      await updateProfile({
        goals: selectedGoals,
        available_minutes: availableTime,
      });
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error updating goals:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What are your goals?</Text>
        <Text style={styles.subtitle}>Select all that apply</Text>

        <View style={styles.goalsGrid}>
          {GOALS.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[styles.goalCard, selectedGoals.includes(goal.id) && styles.goalCardSelected]}
              onPress={() => toggleGoal(goal.id)}
            >
              <Text style={styles.goalEmoji}>{goal.emoji}</Text>
              <Text style={styles.goalTitle}>{goal.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.title, { marginTop: 32 }]}>How much time do you have?</Text>
        <Text style={styles.subtitle}>For workouts per session</Text>

        <View style={styles.timeOptions}>
          {TIME_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[styles.timeOption, availableTime === option.value && styles.timeOptionSelected]}
              onPress={() => setAvailableTime(option.value)}
            >
              <Text
                style={[
                  styles.timeOptionText,
                  availableTime === option.value && styles.timeOptionTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.button, selectedGoals.length === 0 && styles.buttonDisabled]}
        onPress={handleFinish}
        disabled={selectedGoals.length === 0}
      >
        <Text style={styles.buttonText}>Start Training</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  content: {
    flex: 1,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 24,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalCard: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  goalCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#0a2540',
  },
  goalEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  timeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeOption: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  timeOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#0a2540',
  },
  timeOptionText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
  },
  timeOptionTextSelected: {
    color: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
