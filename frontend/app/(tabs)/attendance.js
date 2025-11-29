import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
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
  const [students, setStudents] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
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

  const loadStudents = async () => {
    const stored = await AsyncStorage.getItem('students');
    const parsed = stored ? JSON.parse(stored) : [];
    setStudents(parsed);
  };

  const loadAttendanceForDate = async (batchId, selectedDate) => {
    const stored = await AsyncStorage.getItem('attendance');
    const data = stored ? JSON.parse(stored) : {};
    const saved = data?.[batchId]?.[selectedDate] || [];
    const filtered = students.filter(s => s.batch === batchId);

    const mapped = filtered.map(student => {
      const found = saved.find(a => a._id === student._id);
      return {
        student,
        status: found ? found.status : '',
      };
    });

    setRows(mapped);
  };

  useEffect(() => {
    loadBatches();
    loadStudents();
  }, []);

  useEffect(() => {
    if (selectedBatch && students.length) {
      loadAttendanceForDate(selectedBatch, date);
    }
  }, [selectedBatch, students, date]);

  const updateRow = (studentId, status) => {
    setRows(current =>
      current.map(row =>
        row.student._id === studentId ? { ...row, status } : row
      )
    );
  };

  const handleDateChange = (event, selectedDateValue) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDateValue) {
      const formatted = selectedDateValue.toISOString().split('T')[0];
      setDate(formatted);
      setTimeout(() => {
        loadAttendanceForDate(selectedBatch, formatted);
      }, 50);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    const stored = await AsyncStorage.getItem('attendance');
    const parsed = stored ? JSON.parse(stored) : {};

    parsed[selectedBatch] = parsed[selectedBatch] || {};
    parsed[selectedBatch][date] = rows.map(r => ({
      _id: r.student._id,
      name: r.student.name,
      rollNumber: r.student.rollNumber,
      status: r.status || '',
    }));

    await AsyncStorage.setItem('attendance', JSON.stringify(parsed));
    setSaving(false);
    alert('Attendance saved');
  };

  const clearAttendance = async () => {
    await AsyncStorage.removeItem('attendance');
    alert('Attendance records cleared');
    loadAttendanceForDate(selectedBatch, date);
  };

  const summary = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        if (row.status) acc[row.status] = acc[row.status] + 1;
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
          <Picker selectedValue={selectedBatch} onValueChange={setSelectedBatch} style={styles.picker}>
            {batches.map(batch => (
              <Picker.Item key={batch._id} label={batch.name} value={batch._id} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.datePickerButtonText}>{date}</Text>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={new Date(date)}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}

      <View style={styles.summaryRow}>
        {STATUS_OPTIONS.map(option => (
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
          keyExtractor={item => item.student._id}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={<Text style={styles.emptyState}>No students found.</Text>}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View>
                <Text style={styles.name}>{item.student.name}</Text>
                <Text style={styles.meta}>Roll #{item.student.rollNumber || '-'}</Text>
              </View>
              <View style={styles.statusGroup}>
                {STATUS_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.statusButton,
                      item.status === option.key && {
                        backgroundColor: `${option.color}40`,
                        borderColor: option.color,
                      },
                    ]}
                    onPress={() => updateRow(item.student._id, option.key)}
                  >
                    <Text
                      style={[
                        styles.statusLabel,
                        item.status === option.key && { color: option.color },
                      ]}
                    >
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

      <TouchableOpacity style={styles.clearButton} onPress={clearAttendance}>
        <Text style={styles.clearButtonText}>Clear Attendance Records</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#f5f9f7',
    padding: 16 
  },

  backButton: { 
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#166534',
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12 
  },

  backButtonText: { 
    color: '#d1fae5',
    fontWeight: '600',
    fontSize: 16 
  },

  filters: { 
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12 
  },

  pickerWrapper: { 
    flex: 1,
    backgroundColor: '#126835',
    borderRadius: 14 
  },

  picker: { 
    color: '#fafef9' 
  },

  datePickerButton: { 
    width: 150,
    backgroundColor: '#0f6330',
    borderRadius: 14,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center' 
  },

  datePickerButtonText: { 
    color: '#eef0ea',
    fontSize: 16,
    fontWeight: '600' 
  },

  summaryRow: { 
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12 
  },

  summaryCard: { 
    flex: 1,
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#166534' 
  },

  summaryValue: { 
    color: '#f1f3ec',
    fontSize: 22,
    fontWeight: '700' 
  },

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
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#239d51' 
  },

  name: { 
    color: '#d9f99d',
    fontSize: 16,
    fontWeight: '600' 
  },

  meta: { 
    color: '#d9f9de',
    marginTop: 2 
  },

  statusGroup: { 
    flexDirection: 'row',
    gap: 6 
  },

  statusButton: { 
    borderRadius: 999,
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderColor: '#e3f6ea' 
  },

  statusLabel: { 
    color: '#ddf6e0',
    fontWeight: '600' 
  },

  emptyState: { 
    color: '#c7d2ca',
    textAlign: 'center',
    marginTop: 60 
  },

  saveButton: { 
    backgroundColor: '#22c55e',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16 
  },

  saveButtonText: { 
    color: '#14532d',
    fontWeight: '700',
    fontSize: 16 
  },

  clearButton: { 
    backgroundColor: '#dc2626',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16 
  },

  clearButtonText: { 
    color: 'white',
    fontWeight: '700',
    fontSize: 15 
  }
});
