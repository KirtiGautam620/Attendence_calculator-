import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import {ActivityIndicator,ScrollView,StyleSheet,Text,TextInput,View,} from 'react-native';

// import { BatchService, ReportsService, StudentService } from '../../src/services/api';

export default function InsightsScreen() {
//   const [batches, setBatches] = useState([]);
//   const [students, setStudents] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [threshold, setThreshold] = useState('75');

  const [studentReport, setStudentReport] = useState(null);
  const [batchSummary, setBatchSummary] = useState(null);
  const [defaulters, setDefaulters] = useState([]);

  const [loadingStudent, setLoadingStudent] = useState(false);
  const [loadingBatch, setLoadingBatch] = useState(false);
  const [loadingDefaulters, setLoadingDefaulters] = useState(false);

  const batches = [
  { _id: 'b1', name: 'Batch A' },
  { _id: 'b2', name: 'Batch B' },
];

const students = [
  { _id: 's1', name: 'Alice', rollNumber: '01' },
  { _id: 's2', name: 'Bob', rollNumber: '02' },
];

const hardcodedStudentReport = {
  stats: { percentage: 85, presents: 17, absents: 3, lates: 0 },
  history: [
    { _id: 'h1', date: '2025-11-28', status: 'PRESENT' },
    { _id: 'h2', date: '2025-11-27', status: 'ABSENT' },
    { _id: 'h3', date: '2025-11-26', status: 'PRESENT' },
  ],
};

const hardcodedBatchSummary = {
  PRESENT: 18,
  ABSENT: 2,
  LATE: 1,
};

const hardcodedDefaulters = [
  { student: { _id: 's2', name: 'Bob', rollNumber: '02' }, percentage: 65 },
];


//   useEffect(() => {
//     const bootstrap = async () => {
//       const [batchData, studentData] = await Promise.all([
//         BatchService.list(),
//         StudentService.list(),
//       ]);
//       setBatches(batchData);
//       setStudents(studentData);
//       setSelectedBatch((prev) => prev || (batchData[0]?._id ?? ''));
//       setSelectedStudent((prev) => prev || (studentData[0]?._id ?? ''));
//     };
//     bootstrap();
//   }, []);

//   useEffect(() => {
//     if (!selectedStudent) return;
//     setLoadingStudent(true);
//     ReportsService.student(selectedStudent)
//       .then(setStudentReport)
//       .finally(() => setLoadingStudent(false));
//   }, [selectedStudent]);

//   useEffect(() => {
//     if (!selectedBatch || !date) return;
//     setLoadingBatch(true);
//     ReportsService.batchSummary({ batch: selectedBatch, date })
//       .then(setBatchSummary)
//       .finally(() => setLoadingBatch(false));
//   }, [selectedBatch, date]);

//   useEffect(() => {
//     if (!selectedBatch) return;
//     setLoadingDefaulters(true);
//     ReportsService.defaulters({
//       batch: selectedBatch,
//       month: Number(month),
//       year: Number(year),
//       threshold: Number(threshold),
//     })
//       .then(setDefaulters)
//       .finally(() => setLoadingDefaulters(false));
//   }, [selectedBatch, month, year, threshold]);

    useEffect(() => {
  setSelectedBatch(batches[0]._id);
  setSelectedStudent(students[0]._id);
  setStudentReport(hardcodedStudentReport);
  setBatchSummary(hardcodedBatchSummary);
  setDefaulters(hardcodedDefaulters);
}, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.sectionTitle}>Per Student Overview</Text>
      <View style={styles.card}>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedStudent}
            onValueChange={setSelectedStudent}
            style={styles.picker}
            dropdownIconColor="#080909ff"
          >
            {students.map((student) => (
              <Picker.Item key={student._id} label={student.name} value={student._id} color="#0f172a" />
            ))}
          </Picker>
        </View>
        {loadingStudent ? (
          <ActivityIndicator color="#101010ff" />
        ) : studentReport ? (
          <View>
            <View style={styles.statsRow}>
              {[
                { label: 'Attendance %', value: `${studentReport.stats.percentage}%` },
                { label: 'Presents', value: studentReport.stats.presents },
                { label: 'Absents', value: studentReport.stats.absents },
                { label: 'Late', value: studentReport.stats.lates },
              ].map((item) => (
                <View key={item.label} style={styles.statCard}>
                  <Text style={styles.statValue}>{item.value}</Text>
                  <Text style={styles.statLabel}>{item.label}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.historyTitle}>Recent Sessions</Text>
            {studentReport.history.slice(0, 6).map((entry) => (
              <View key={entry._id} style={styles.historyRow}>
                <Text style={styles.historyDate}>
                  {new Date(entry.date).toLocaleDateString(undefined, {
                    day: '2-digit',
                    month: 'short',
                  })}
                </Text>
                <Text style={styles.historyStatus(entry.status)}>{entry.status}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.empty}>No attendance history yet.</Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Batch Snapshot</Text>
      <View style={styles.card}>
        <View style={styles.filterRow}>
          <View style={[styles.pickerWrapper, { flex: 1 }]}>
            <Picker
              selectedValue={selectedBatch}
              onValueChange={setSelectedBatch}
              style={styles.picker}
              dropdownIconColor="#080808ff"
            >
              {batches.map((batch) => (
                <Picker.Item key={batch._id} label={batch.name} value={batch._id} color="#0f172a" />
              ))}
            </Picker>
          </View>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94a3b8"
          />
        </View>
        {loadingBatch ? (
          <ActivityIndicator color="#0b0b0bff" />
        ) : batchSummary ? (
          <View style={styles.statsRow}>
            {[
              { label: 'Present', value: batchSummary.PRESENT, color: '#22c55e' },
              { label: 'Absent', value: batchSummary.ABSENT, color: '#ef4444' },
              { label: 'Late', value: batchSummary.LATE, color: '#fbbf24' },
            ].map((item) => (
              <View key={item.label} style={[styles.statCard, { borderColor: item.color }]}>
                <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
                <Text style={styles.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.empty}>No records found for this date.</Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Defaulter Radar</Text>
      <View style={styles.card}>
        <View style={styles.filterRow}>
          <TextInput
            style={styles.input}
            value={month}
            onChangeText={setMonth}
            placeholder="MM"
            keyboardType="numeric"
            placeholderTextColor="#94a3b8"
          />
          <TextInput
            style={styles.input}
            value={year}
            onChangeText={setYear}
            placeholder="YYYY"
            keyboardType="numeric"
            placeholderTextColor="#94a3b8"
          />
          <TextInput
            style={styles.input}
            value={threshold}
            onChangeText={setThreshold}
            placeholder="%"
            keyboardType="numeric"
            placeholderTextColor="#94a3b8"
          />
        </View>
        {loadingDefaulters ? (
          <ActivityIndicator color="#020303ff" />
        ) : defaulters.length ? (
          defaulters.map((entry) => (
            <View key={entry.student._id} style={styles.defaulterRow}>
              <View>
                <Text style={styles.defaulterName}>{entry.student.name}</Text>
                <Text style={styles.defaulterMeta}>#{entry.student.rollNumber}</Text>
              </View>
              <Text style={styles.defaulterPercent}>{entry.percentage}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>All students are above the threshold. 🎉</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f8ff',
    padding: 16,
  },
  sectionTitle: {
    color: '#1950d1ff',
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 12,
  },
  card: {
    backgroundColor: '#246d3dff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e3b31ff',
  },
  pickerWrapper: {
    backgroundColor: '#eef5f2ff',
    borderRadius: 16,
    marginBottom: 12,
  },
  picker: {
    color: '#060606ff',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flexBasis: '31%',
    borderWidth: 1.3,
    borderBottomWidth:3,
    borderColor: '#012c18ff',
    borderRadius: 16,
    padding: 5,
    alignItems: 'center',
  },
  statValue: {
    color: '#f0f3f5ff',
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    color: '#cbd5f5',
    fontSize: 12,
  },
  historyTitle: {
    color: '#cbd5f5',
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  historyDate: {
    color: '#f8fafc',
  },
  historyStatus: (status) => ({
    color: status === 'PRESENT' ? '#22c55e' : status === 'ABSENT' ? '#ef4444' : '#fbbf24',
    fontWeight: '600',
  }),
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f2f6ff',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 9,
    color: '#0f1010ff',
  },
  empty: {
    color: '#94a3b8',
    textAlign: 'center',
    marginVertical: 16,
  },
  defaulterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#373a3dff',
  },
  defaulterName: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  defaulterMeta: {
    color: '#94a3b8',
  },
  defaulterPercent: {
    color: '#ef4444',
    fontWeight: '700',
    fontSize: 16,
  },
});