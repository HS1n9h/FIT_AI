import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';

const LEVELS = [
  {
    id: 'beginner',
    title: 'Beginner',
    description: 'New to working out or getting back into it',
    emoji: '🌱',
  },
  {
    id: 'intermediate',
    title: 'Intermediate',
    description: 'Work out regularly, comfortable with most exercises',
    emoji: '🏃',
  },
  {
    id: 'advanced',
    title: 'Advanced',
    description: 'Experienced athlete, ready for challenging workouts',
    emoji: '🏆',
  },
];

export default function FitnessLevelScreen() {
  const router = useRouter();
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const [selected, setSelected] = useState<string>('beginner');

  const handleContinue = async () => {
    try {
      await updateProfile({ fitness_level: selected as any });
      router.push('/(onboarding)/goals');
    } catch (error) {
      console.error('Error updating fitness level:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>What's your fitness level?</Text>
        <Text style={styles.subtitle}>This helps us create the perfect workout for you</Text>

        <View style={styles.options}>
          {LEVELS.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[styles.option, selected === level.id && styles.optionSelected]}
              onPress={() => setSelected(level.id)}
            >
              <Text style={styles.optionEmoji}>{level.emoji}</Text>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{level.title}</Text>
                <Text style={styles.optionDescription}>{level.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
    justifyContent: 'space-between',
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
    marginBottom: 32,
  },
  options: {
    gap: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  optionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#0a2540',
  },
  optionEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#999',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
