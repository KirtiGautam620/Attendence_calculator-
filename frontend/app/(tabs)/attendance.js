import { Picker } from '@react-native-picker/picker';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STATUS_OPTIONS = [
  { key: 'PRESENT', label: 'Present', color: '#22c55e' },
  { key: 'ABSENT', label: 'Absent', color: '#ef4444' },
  { key: 'LATE', label: 'Late', color: '#fbbf24' },
];

export default function AttendanceScreen() {
  const router = useRouter();
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadBatches = async () => {
    setLoading(true);
    const stored = await AsyncStorage.getItem('batches');
    const parsed = stored ? JSON.parse(stored) : [];
    setBatches(parsed);
    if (parsed.length) setSelectedBatch(parsed[0]._id);
    setLoading(false);
  };

  useEffect(() => {
    loadBatches();
  }, []);

  useEffect(() => {
    if (!selectedBatch) return;
    const batch = batches.find((b) => b._id === selectedBatch);
    if (batch?.students) {
      setRows(batch.students.map((s) => ({ student: s, status: 'PRESENT', remarks: '' })));
    } else {
      setRows([]);
    }
  }, [selectedBatch, batches]);

  const updateRow = (studentId, status) => {
    setRows((current) =>
      current.map((row) => (row.student._id === studentId ? { ...row, status } : row))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const updatedBatches = batches.map((b) =>
      b._id === selectedBatch ? { ...b, students: rows.map((r) => r.student) } : b
    );
    await AsyncStorage.setItem('batches', JSON.stringify(updatedBatches));
    setSaving(false);
    alert('Attendance saved!');
  };

  const summary = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc[row.status] = (acc[row.status] || 0) + 1;
        return acc;
      },
      { PRESENT: 0, ABSENT: 0, LATE: 0 }
    );
  }, [rows]);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.filters}>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedBatch}
            onValueChange={setSelectedBatch}
            style={styles.picker}
          >
            {batches.map((batch) => (
              <Picker.Item key={batch._id} label={batch.name} value={batch._id} />
            ))}
          </Picker>
        </View>

        <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />
      </View>

      <View style={styles.summaryRow}>
        {STATUS_OPTIONS.map((option) => (
          <View key={option.key} style={[styles.summaryCard, { borderColor: option.color }]}>
            <Text style={styles.summaryValue}>{summary[option.key]}</Text>
            <Text style={[styles.summaryLabel, { color: option.color }]}>{option.label}</Text>
          </View>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color="#37b77bff" />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.student._id}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadBatches} />}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={<Text style={styles.emptyState}>No students found for this batch.</Text>}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View>
                <Text style={styles.name}>{item.student.name}</Text>
                <Text style={styles.meta}>Roll #{item.student.rollNumber || '-'}</Text>
              </View>
              <View style={styles.statusGroup}>
                {STATUS_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.statusButton,
                      item.status === option.key && { backgroundColor: `${option.color}40`, borderColor: option.color },
                    ]}
                    onPress={() => updateRow(item.student._id, option.key)}
                  >
                    <Text style={[styles.statusLabel, item.status === option.key && { color: option.color }]}>
                      {option.label[0]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? 'Saving…' : 'Save Attendance'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f9f7ff',
     padding: 16, 
     gap: 12 
    },
  backButton: { 
    paddingVertical: 8, 
    paddingHorizontal: 16,
    backgroundColor: '#166534', 
    borderRadius: 12, 
    alignSelf: 'flex-start' 
  },
  backButtonText: { 
    color: '#d1fae5', 
    fontWeight: '600', 
    fontSize: 16 
  },
  filters: { 
    flexDirection: 'row', 
    gap: 12, 
    marginTop: 4 
  },
  pickerWrapper: { 
    flex: 1, 
    backgroundColor: '#126835ff', 
    borderRadius: 14 
  },
  picker: {
     color: '#fafef9ff' 
    },
  input: {
     width: 150, 
     backgroundColor: '#0f6330ff', 
     borderRadius: 14, 
     paddingHorizontal: 14, 
     color: '#eef0eaff' 
    },
  summaryRow: { 
    flexDirection: 'row', 
    gap: 12 },
  summaryCard: {
     flex: 1, 
     borderWidth: 1, 
     borderRadius: 18, 
     padding: 12, 
     alignItems: 'center', 
     backgroundColor: '#166534' 
    },
  summaryValue: { 
    color: '#f1f3ecff', 
    fontSize: 22, 
    fontWeight: '700' },
  summaryLabel: { 
    fontSize: 12, 
    fontWeight: '600' 
  },
  row: { 
    backgroundColor: '#14532d', 
    borderRadius: 18, 
    padding: 16, 
    marginBottom: 12, 
    flexDirection: 'row',
     alignItems: 'center', 
     justifyContent: 'space-between', 
     borderWidth: 1, 
     borderColor: '#239d51ff' },
  name: { 
    color: '#d9f99d', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  meta: { 
    color: '#d9f9deff', 
    marginTop: 2 },
  statusGroup: { 
    flexDirection: 'row', 
    gap: 6 
  },
  statusButton: { 
    borderRadius: 999, 
    borderWidth: 1, 
    borderColor: '#e3f6eaff', 
    paddingVertical: 6, 
    paddingHorizontal: 12 },
  statusLabel: { 
    color: '#ddf6e0ff', 
    fontWeight: '600' },
  emptyState: { 
    color: '#c7d2ca', 
    textAlign: 'center', 
    marginTop: 60 },
  saveButton: { 
    backgroundColor: '#22c55e', 
    borderRadius: 18, 
    padding: 16, 
    alignItems: 'center', 
    position: 'absolute', 
    bottom: 32, left: 16, right: 16 },
  saveButtonText: { color: '#14532d', fontWeight: '700', fontSize: 16 },
});
