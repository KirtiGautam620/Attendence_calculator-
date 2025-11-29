import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function BatchesScreen() {
  const router = useRouter();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', schedule: '' });

  const loadBatches = async () => {
    setLoading(true);
    const stored = await AsyncStorage.getItem('batches');
    setBatches(stored ? JSON.parse(stored) : []);
    setLoading(false);
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const saveBatches = async (newBatches) => {
    await AsyncStorage.setItem('batches', JSON.stringify(newBatches));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);

    const newBatch = {
      _id: Date.now().toString(),
      name: form.name,
      description: form.description,
      schedule: { time: form.schedule },
      students: [],
    };

    const updatedBatches = [...batches, newBatch];
    setBatches(updatedBatches);
    await saveBatches(updatedBatches);

    setForm({ name: '', description: '', schedule: '' });
    setSubmitting(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Create a Batch</Text>
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Batch name"
          placeholderTextColor="#94a3b8"
          value={form.name}
          onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Description"
          placeholderTextColor="#94a3b8"
          value={form.description}
          onChangeText={(text) => setForm((prev) => ({ ...prev, description: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Schedule (e.g. Mon-Fri 5-7 PM)"
          placeholderTextColor="#94a3b8"
          value={form.schedule}
          onChangeText={(text) => setForm((prev) => ({ ...prev, schedule: text }))}
        />
        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={submitting}>
          <Text style={styles.buttonText}>{submitting ? 'Saving…' : 'Add Batch'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.header}>Active Batches</Text>
      {loading ? (
        <ActivityIndicator color="#000000ff" />
      ) : batches.length ? (
        batches.map((batch) => (
          <View key={batch._id} style={styles.batchCard}>
            <Text style={styles.batchTitle}>{batch.name}</Text>
            {batch.description ? <Text style={styles.batchDesc}>{batch.description}</Text> : null}
            <Text style={styles.batchMeta}>
              Schedule: <Text style={styles.batchMetaTime}>{batch.schedule?.time || 'Not specified'}</Text>
            </Text>
          </View>
        ))
      ) : (
        <Text style={styles.empty}>No batches yet. Add your first one above.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f2f3f6ff', 
    padding: 16 },
  backButton: { 
    paddingVertical: 6,
     paddingHorizontal: 12, 
     backgroundColor: '#0c3b2eff', 
     borderRadius: 10, alignSelf: 'flex-start', 
     marginBottom: 10 },
  backButtonText: { 
    color: '#e2f7eb', 
    fontSize: 14, 
    fontWeight: '600' },
  header: { 
    color: '#070707ff', 
    fontSize: 18, 
    fontWeight: '600',
    marginVertical: 12 },
  card: { 
    backgroundColor: '#0c8735ff', 
    borderRadius: 20, 
    padding: 16, 
    gap: 12 },
  input: { 
    backgroundColor: '#f6f8faff',
     borderRadius: 12, 
     paddingHorizontal: 14, 
     paddingVertical: 12, 
     color: '#121313ff' },
  button: { 
    backgroundColor: '#08583bff', 
    borderRadius: 14, 
    paddingVertical: 12, 
    alignItems: 'center' },
  buttonText: { 
    color: '#f6f2f2ff', 
    fontWeight: '600', 
    fontSize: 15 },
  batchCard: { 
    backgroundColor: '#186739ff', 
    borderRadius: 18, 
    padding: 16, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: '#1e293b' },
  batchTitle: { color: '#f7f9faff', fontSize: 17, fontWeight: '600' },
  batchDesc: { color: '#cbd5f5', marginVertical: 4 },
  batchMeta: { color: '#94a3b8', fontSize: 13 },
  batchMetaTime: { color: '#0c0c0cff' },
  empty: { color: '#94a3b8', textAlign: 'center', marginTop: 24 },
});
