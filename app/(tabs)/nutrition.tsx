import { View, Text, StyleSheet } from 'react-native';

export default function NutritionScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nutrition</Text>
      <Text style={styles.subtitle}>Track your meals with AI analysis</Text>
      <Text style={styles.note}>Coming soon</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 16,
  },
  note: {
    fontSize: 14,
    color: '#666',
  },
});
