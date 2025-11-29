import { Picker } from '@react-native-picker/picker';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {ActivityIndicator,FlatList,RefreshControl,StyleSheet,Text,TextInput,TouchableOpacity,View,
} from 'react-native';

// import { AttendanceService, BatchService, StudentService } from '../../src/services/api';

const STATUS_OPTIONS = [
  { key: 'PRESENT', label: 'Present', color: '#22c55e' },
  { key: 'ABSENT', label: 'Absent', color: '#ef4444' },
  { key: 'LATE', label: 'Late', color: '#fbbf24' },
];
const HARDCODED_BATCHES = [
  { _id: 'b1', name: 'Batch A' },
  { _id: 'b2', name: 'Batch B' },
];

const HARDCODED_ROWS = [
  { student: { _id: 's1', name: 'Alice', rollNumber: '01' }, status: 'PRESENT', remarks: '' },
  { student: { _id: 's2', name: 'Bob', rollNumber: '02' }, status: 'ABSENT', remarks: '' },
];

export default function AttendanceScreen() {
  const [batches, setBatches] = useState(HARDCODED_BATCHES);
  const [selectedBatch, setSelectedBatch] = useState(HARDCODED_BATCHES[0]._id);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [rows, setRows] = useState(HARDCODED_ROWS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch batches from backend (uncomment when backend is ready)
  /*
  useEffect(() => {
    const loadBatches = async () => {
      const data = await BatchService.list();
      setBatches(data);
      if (data.length > 0) setSelectedBatch(data[0]._id);
    };
    loadBatches();
  }, []);
  */

  // Fetch attendance for batch & date (uncomment when backend is ready)
  /*
  const fetchAttendance = useCallback(async (opts = { silent: false }) => {
    if (!selectedBatch) return;
    if (opts.silent) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await AttendanceService.byBatchAndDate({ batch: selectedBatch, date });
      setRows(data);
    } finally {
      if (opts.silent) setRefreshing(false);
      else setLoading(false);
    }
  }, [selectedBatch, date]);

  useEffect(() => {
    if (!selectedBatch) return;
    fetchAttendance();
  }, [fetchAttendance, selectedBatch, date]);
  */

  const summary = useMemo(() => {
    return rows.reduce(
      (acc,row) => {
        acc[row.status] = (acc[row.status]||0)+1;
        return acc;
      },
      { PRESENT: 0, ABSENT: 0, LATE: 0 }
    );
  }, [rows]);

  const updateRow = (studentId, status) => {
    setRows((current) =>
      current.map((row) =>
        row.student._id === studentId ? { ...row, status } : row
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);

    // Uncomment for backend save
    /*
    if (!selectedBatch || rows.length === 0) return;
    try {
      await AttendanceService.bulkSave({
        batch: selectedBatch,
        date,
        records: rows.map((row) => ({
          student: row.student._id,
          status: row.status,
          remarks: row.remarks,
        })),
      });
      alert('Attendance saved successfully!');
    } catch (err) {
      alert('Error saving attendance');
    } finally {
      setSaving(false);
    }
    */

    
    setTimeout(() => {
      setSaving(false);
      alert('Attendance saved (hardcoded simulation)!');
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedBatch}
            onValueChange={(value) => setSelectedBatch(value)}
            dropdownIconColor="#f2f6e9ff"
            style={styles.picker}
          >
            {batches.map((batch) => (
              <Picker.Item key={batch._id} label={batch.name} value={batch._id} color="#080808ff" />
            ))}
          </Picker>
        </View>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#0b0c0bff"
        />
      </View>

      <View style={styles.summaryRow}>
        {STATUS_OPTIONS.map((option) => (
          <View key={option.key} style={[styles.summaryCard, { borderColor: option.color }]}>
            <Text style={styles.summaryValue}>{summary[option.key] ?? 0}</Text>
            <Text style={[styles.summaryLabel, { color: option.color }]}>{option.label}</Text>
          </View>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color="#37b77bff" />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item)=>item.student._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => {}} tintColor="#f6fdfaff" />
          }
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <Text style={styles.emptyState}>
              No students found for this batch. Add students to see attendance.
            </Text>
          }
          renderItem={({item}) => (
            <View style={styles.row}>
              <View>
                <Text style={styles.name}>{item.student.name}</Text>
                <Text style={styles.meta}>Roll #{item.student.rollNumber}</Text>
              </View>
              <View style={styles.statusGroup}>
                {STATUS_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.statusButton,
                      item.status === option.key && { backgroundColor: `${option.color}40`, borderColor: option.color },
                    ]}
                    onPress={()=>updateRow(item.student._id,option.key)}
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
        <Text style={styles.saveButtonText}>{saving ? 'Saving…':'Save Attendance'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f9f7ff', 
    padding: 16, 
    gap: 12 },
  filters: { 
    flexDirection: 'row', 
    gap: 12 },
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
    color: '#eef0eaff' },
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
    alignItems: 'center', 
    justifyContent: 'space-between', 
    borderWidth: 1, 
    borderColor: '#239d51ff' },
  name: { 
    color: '#d9f99d', 
    fontSize: 16, 
    fontWeight: '600' },
  meta: { 
    color: '#d9f9deff', 
    marginTop: 2 },
  statusGroup: { 
    flexDirection: 'row',
    gap: 6 },
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
    bottom: 32,
    left: 16,
    right: 16,
  },
  saveButtonText: { 
    color: '#14532d', 
    fontWeight: '700', 
    fontSize: 16, 
    marginBottom:20,
  },
});
