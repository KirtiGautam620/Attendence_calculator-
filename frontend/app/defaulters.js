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

export default function DefaultersScreen() {
  const router = useRouter();

  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedBatch, setSelectedBatch] = useState('');
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [threshold, setThreshold] = useState('75');
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState([]);

  const loadData = async () => {
    const b = await AsyncStorage.getItem('batches');
    const s = await AsyncStorage.getItem('students');
    const a = await AsyncStorage.getItem('attendance');
    const bb = b ? JSON.parse(b) : [];
    const ss = s ? JSON.parse(s) : [];
    const aa = a ? JSON.parse(a) : {};
    setBatches(bb);
    setStudents(ss);
    setAttendance(aa);
    if (bb.length) setSelectedBatch(bb[0]._id);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedBatch || !attendance || !students.length) return;
    setLoading(true);
    const m = month.padStart(2, '0');
    const y = year;
    const batchAttendance = attendance[selectedBatch] || {};
    const defaultersList = [];

    students.forEach((stu) => {
      let presents = 0;
      let total = 0;
      Object.keys(batchAttendance).forEach((day) => {
        if (!day.startsWith(`${y}-${m}`)) return;
        batchAttendance[day].forEach((entry) => {
          if (entry._id === stu._id) {
            total++;
            if (entry.status === 'PRESENT') presents++;
          }
        });
      });
      if (total) {
        const percent = Math.round((presents / total) * 100);
        if (percent < Number(threshold)) {
          defaultersList.push({ student: stu, percentage: percent });
        }
      }
    });

    setEntries(defaultersList);
    setLoading(false);
  }, [selectedBatch, month, year, threshold, attendance, students]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Defaulter Filters</Text>
      <View style={styles.card}>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedBatch}
            onValueChange={setSelectedBatch}
            style={styles.picker}
            dropdownIconColor="#0b0b0bff"
          >
            {batches.map((batch) => (
              <Picker.Item key={batch._id} label={batch.name} value={batch._id} color="#101010ff" />
            ))}
          </Picker>
        </View>
        <Text style={styles.inputLabel}>Batch</Text>
        <View style={styles.filters}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={month}
              onChangeText={setMonth}
              keyboardType="numeric"
              placeholder="MM"
              placeholderTextColor="#94a3b8"
            />
            <Text style={styles.inputLabel}>Month</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={year}
              onChangeText={setYear}
              keyboardType="numeric"
              placeholder="YYYY"
              placeholderTextColor="#94a3b8"
            />
            <Text style={styles.inputLabel}>Year</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={threshold}
              onChangeText={setThreshold}
              keyboardType="numeric"
              placeholder="%"
              placeholderTextColor="#94a3b8"
            />
            <Text style={styles.inputLabel}>Threshold</Text>
          </View>
        </View>
      </View>

      <Text style={styles.header}>Students below {threshold}%</Text>
      {loading ? (
        <ActivityIndicator color="#161617ff" />
      ) : entries.length ? (
        entries.map((entry) => (
          <View key={entry.student._id} style={styles.entryCard}>
            <View>
              <Text style={styles.entryName}>{entry.student.name}</Text>
              <Text style={styles.entryMeta}>#{entry.student.rollNumber}</Text>
            </View>
            <Text style={styles.entryPercent}>{entry.percentage}%</Text>
          </View>
        ))
      ) : (
        <Text style={styles.empty}>Great news! No defaulters for this filter.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fbff',
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
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 12,
  },
  card: {
    backgroundColor: '#42ab65ff',
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },
  pickerWrapper: {
    backgroundColor: '#f9fafcff',
    borderRadius: 16,
  },
  picker: {
    color: '#101010ff',
  },
  filters: {
    flexDirection: 'row',
    gap: 10,
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    backgroundColor: '#f8fafcff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#0b0b0bff',
  },
  inputLabel: {
    color: '#060606ff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
    textAlign: 'center',
  },
  entryCard: {
    backgroundColor: '#42ab65ff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#05480dff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryName: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  entryMeta: {
    color: '#fdfeffff',
    marginTop: 2,
  },
  entryPercent: {
    color: '#ef4444',
    fontSize: 18,
    fontWeight: '700',
  },
  empty: {
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 20,
  },
});
