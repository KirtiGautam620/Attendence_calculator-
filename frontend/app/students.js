import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function StudentsScreen() {
  const router = useRouter();
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('');
  const [form, setForm] = useState({
    name: '',
    rollNumber: '',
    batch: '',
    contactNumber: '',
    _id: null,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadBatches = async () => {
    const stored = await AsyncStorage.getItem('batches');
    const parsed = stored ? JSON.parse(stored) : [];
    setBatches(parsed);
    setSelectedBatchFilter(parsed[0]?._id || '');
  };

  const loadStudents = async (batchId = '') => {
    setLoading(true);
    const stored = await AsyncStorage.getItem('students');
    const parsed = stored ? JSON.parse(stored) : [];
    if (batchId) {
      setStudents(parsed.filter((s) => s.batch === batchId));
    } else {
      setStudents(parsed);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadBatches();
    loadStudents();
  }, []);

  useEffect(() => {
    loadStudents(selectedBatchFilter);
    setForm((prev) => ({ ...prev, batch: selectedBatchFilter }));
  }, [selectedBatchFilter]);

  const saveStudents = async (newStudents) => {
    await AsyncStorage.setItem('students', JSON.stringify(newStudents));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.rollNumber.trim() || !form.batch) return;
    setSaving(true);

    const stored = await AsyncStorage.getItem('students');
    const currentStudents = stored ? JSON.parse(stored) : [];

    if (form._id) {
      const index = currentStudents.findIndex((s) => s._id === form._id);
      if (index !== -1) currentStudents[index] = { ...form };
    } else {
      currentStudents.push({
        _id: Date.now().toString(),
        name: form.name,
        rollNumber: form.rollNumber,
        batch: form.batch,
        contactNumber: form.contactNumber,
      });
    }

    await saveStudents(currentStudents);

    setForm({
      name: '',
      rollNumber: '',
      batch: selectedBatchFilter,
      contactNumber: '',
      _id: null,
    });

    loadStudents(selectedBatchFilter);
    setSaving(false);
  };

  const handleEdit = (student) => {
    setForm({ ...student });
  };

  const handleDelete = async (id) => {
    const stored = await AsyncStorage.getItem('students');
    const currentStudents = stored ? JSON.parse(stored) : [];
    const filtered = currentStudents.filter((s) => s._id !== id);
    await saveStudents(filtered);
    loadStudents(selectedBatchFilter);
  };

  const handleClearAll = async () => {
    await AsyncStorage.removeItem('students');
    setStudents([]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Add / Edit Student</Text>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Full name"
          placeholderTextColor="#687689ff"
          value={form.name}
          onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Roll number"
          placeholderTextColor="#687689ff"
          value={form.rollNumber}
          onChangeText={(text) => setForm((prev) => ({ ...prev, rollNumber: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Contact number"
          placeholderTextColor="#687689ff"
          value={form.contactNumber}
          onChangeText={(text) => setForm((prev) => ({ ...prev, contactNumber: text }))}
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={saving}>
          <Text style={styles.buttonText}>
            {saving ? 'Saving…' : form._id ? 'Update Student' : 'Save Student'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.header}>Students</Text>

        <View style={[styles.pickerWrapper, { width: 180 }]}>
          <Picker
            selectedValue={selectedBatchFilter}
            onValueChange={setSelectedBatchFilter}
            style={styles.picker}
            dropdownIconColor="#38bdf8"
          >
            <Picker.Item label="All batches" value="" color="#121312ff" />
            {batches.map((batch) => (
              <Picker.Item
                key={batch._id}
                label={batch.name}
                value={batch._id}
                color="#050505ff"
              />
            ))}
          </Picker>
        </View>
      </View>

      <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
        <Text style={styles.clearButtonText}>Clear All Students</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator color="#22c55e" />
      ) : students.length ? (
        students.map((student) => (
          <View key={student._id} style={styles.studentCard}>
            <View>
              <Text style={styles.studentName}>
                {student.name}{' '}
                <Text style={{ color: '#d1fae5', fontSize: 13 }}>#{student.rollNumber}</Text>
              </Text>

              {student.batch ? (
                <Text style={styles.studentMeta}>
                  {batches.find((b) => b._id === student.batch)?.name}
                </Text>
              ) : null}

              {student.contactNumber ? (
                <Text style={styles.studentContact}>☎ {student.contactNumber}</Text>
              ) : null}
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#fbbf24' }]}
                onPress={() => handleEdit(student)}
              >
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#ef4444' }]}
                onPress={() => handleDelete(student._id)}
              >
                <Text style={styles.actionText}>Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: '#38bdf8',
                  paddingVertical: 10,
                  paddingHorizontal: 10,
                  borderRadius: 12,
                  marginVertical: 10,
                }}
                onPress={() => router.push('/(tabs)/studentqr')}
              >
                <Text style={{ color: 'white', fontWeight: '600', textAlign: 'center' }}>
                  QR
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.empty}>No students found for this filter.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fcfaff',
    padding: 16,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#42ab65ff',
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backButtonText: {
    color: '#e2f7eb',
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    color: '#161717ff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#42ab65ff',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 10,
  },
  input: {
    backgroundColor: '#ecf1efff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: '#0c0c0cff',
    marginBottom: 10,
  },
  pickerWrapper: {
    backgroundColor: '#d0d4d3ff',
    borderRadius: 12,
    marginBottom: 10,
    borderColor: 'black',
    borderWidth: 1,
  },
  picker: {
    color: '#0b0b0bff',
  },
  button: {
    backgroundColor: '#42ab65ff',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#064e2f',
    fontWeight: '600',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  clearButton: {
    backgroundColor: '#7f1d1d',
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 14,
  },
  clearButtonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  studentCard: {
    backgroundColor: '#0b3e28',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  studentName: {
    color: '#ede8e8ff',
    fontSize: 16,
    fontWeight: '600',
  },
  studentMeta: {
    color: '#a7f3d0',
    marginTop: 4,
  },
  studentContact: {
    color: '#a7f3d0',
    fontSize: 13,
    marginTop: 6,
  },
  empty: {
    color: '#000000ff',
    textAlign: 'center',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: '#f8fafc',
    fontWeight: '600',
  },
});
