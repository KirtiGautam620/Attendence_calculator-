import { useEffect, useState } from 'react';
import {ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
// import { BatchService } from '../src/services/api';
export default function BatchesScreen() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    schedule: '',
  });

  const loadBatches = async () => {
    setLoading(true);
    setTimeout(() => {
      setBatches([
        {
          _id: '1',
          name: 'Batch C',
          description: 'Turing Batch',
          schedule: { time: 'Mon–Fri 7–9 AM' },
        },
        {
          _id: '2',
          name: 'Batch B',
          description: 'Hopper Batch',
          schedule: { time: 'Mon–Sat 6–8 PM' },
        },
      ]);
      setLoading(false);
    }, 700);
  };

  // const loadBatches = async () => {
  //   setLoading(true);
  //   try {
  //     const data = await BatchService.list();
  //     setBatches(data);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    loadBatches();
  }, []);

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSubmitting(true);

    setTimeout(() => {
      const newBatch = {
        _id: Date.now().toString(),
        name: form.name,
        description: form.description,
        schedule: { time: form.schedule },
      };

      setBatches((prev) => [...prev, newBatch]);
      setForm({ name: '', description: '', schedule: '' });
      setSubmitting(false);
    }, 700);
  };

  // const handleSubmit = async () => {
  //   if (!form.name.trim()) return;
  //   setSubmitting(true);
  //   try {
  //     await BatchService.create({
  //       name: form.name.trim(),
  //       description: form.description.trim(),
  //       schedule: { time: form.schedule.trim() },
  //     });
  //     setForm({ name: '', description: '', schedule: '' });
  //     await loadBatches();
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
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
              Schedule:{' '}
              <Text style={{ color: '#0c0c0cff' }}>{batch.schedule?.time || 'Not specified'}</Text>
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
    padding: 16,
  },
  header: {
    color: '#070707ff',
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 12,
  },
  card: {
    backgroundColor: '#0c8735ff',
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  input: {
    backgroundColor: '#f6f8faff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#121313ff',
  },
  button: {
    backgroundColor: '#08583bff',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#f6f2f2ff',
    fontWeight: '600',
    fontSize: 15,
  },
  batchCard: {
    backgroundColor: '#186739ff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  batchTitle: {
    color: '#f7f9faff',
    fontSize: 17,
    fontWeight: '600',
  },
  batchDesc: {
    color: '#cbd5f5',
    marginVertical: 4,
  },
  batchMeta: {
    color: '#94a3b8',
    fontSize: 13,
  },
  empty: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 24,
  },
});