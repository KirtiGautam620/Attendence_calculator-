import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function InsightsScreen() {
  const router = useRouter();

  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});

  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [month, setMonth] = useState(String(new Date().getMonth() + 1));
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [threshold, setThreshold] = useState('75');

  const [studentReport, setStudentReport] = useState(null);
  const [batchSummary, setBatchSummary] = useState(null);
  const [defaulters, setDefaulters] = useState([]);

  const [loadingStudent, setLoadingStudent] = useState(false);
  const [loadingBatch, setLoadingBatch] = useState(false);
  const [loadingDefaulters, setLoadingDefaulters] = useState(false);

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
    if (ss.length) setSelectedStudent(ss[0]._id);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedStudent || !attendance) return;
    generateStudentReport();
  }, [selectedStudent, attendance]);

  useEffect(() => {
    if (!selectedBatch || !attendance) return;
    generateBatchSummary();
  }, [selectedBatch, date, attendance]);

  useEffect(() => {
    if (!attendance) return;
    generateDefaulters();
  }, [month, year, threshold, attendance]);

  const generateStudentReport = () => {
    setLoadingStudent(true);

    const history = [];
    let presents = 0;
    let absents = 0;
    let lates = 0;

    Object.keys(attendance).forEach((batchId) => {
      Object.keys(attendance[batchId]).forEach((day) => {
        attendance[batchId][day].forEach((entry) => {
          if (entry._id === selectedStudent) {
            history.push({ date: day, status: entry.status });
            if (entry.status === 'PRESENT') presents++;
            if (entry.status === 'ABSENT') absents++;
            if (entry.status === 'LATE') lates++;
          }
        });
      });
    });

    const total = presents + absents + lates;
    const percentage = total ? Math.round((presents / total) * 100) : 0;

    const sortedHistory = history
      .map((h) => ({ _id: Math.random().toString(), ...h }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    setStudentReport({
      stats: { percentage, presents, absents, lates },
      history: sortedHistory,
    });

    setLoadingStudent(false);
  };

  const generateBatchSummary = () => {
    setLoadingBatch(true);

    if (!attendance[selectedBatch] || !attendance[selectedBatch][date]) {
      setBatchSummary(null);
      setLoadingBatch(false);
      return;
    }

    const list = attendance[selectedBatch][date];
    const summary = { PRESENT: 0, ABSENT: 0, LATE: 0 };

    list.forEach((e) => {
      summary[e.status] = (summary[e.status] || 0) + 1;
    });

    setBatchSummary(summary);
    setLoadingBatch(false);
  };

  const generateDefaulters = () => {
    setLoadingDefaulters(true);

    const m = month.padStart(2, '0');
    const y = year;

    const result = [];

    students.forEach((stu) => {
      let presents = 0,
        total = 0;

      Object.keys(attendance).forEach((batchId) => {
        Object.keys(attendance[batchId]).forEach((day) => {
          if (!day.startsWith(`${y}-${m}`)) return;

          attendance[batchId][day].forEach((entry) => {
            if (entry._id === stu._id) {
              total++;
              if (entry.status === 'PRESENT') presents++;
            }
          });
        });
      });

      if (total) {
        const percent = Math.round((presents / total) * 100);
        if (percent < Number(threshold)) {
          result.push({ student: stu, percentage: percent });
        }
      }
    });

    setDefaulters(result);
    setLoadingDefaulters(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Per Student Overview</Text>

      <View style={styles.card}>
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={selectedStudent} onValueChange={setSelectedStudent} style={styles.picker}>
            {students.map((s) => (
              <Picker.Item key={s._id} label={s.name} value={s._id} color="#0f172a" />
            ))}
          </Picker>
        </View>

        {loadingStudent ? (
          <ActivityIndicator color="#101010ff" />
        ) : studentReport ? (
          <View>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{studentReport.stats.percentage}%</Text>
                <Text style={styles.statLabel}>Attendance %</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{studentReport.stats.presents}</Text>
                <Text style={styles.statLabel}>Presents</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{studentReport.stats.absents}</Text>
                <Text style={styles.statLabel}>Absents</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{studentReport.stats.lates}</Text>
                <Text style={styles.statLabel}>Late</Text>
              </View>
            </View>

            <Text style={styles.historyTitle}>Recent Sessions</Text>

            {studentReport.history.slice(0, 6).map((e) => (
              <View key={e._id} style={styles.historyRow}>
                <Text style={styles.historyDate}>
                  {new Date(e.date).toLocaleDateString(undefined, {
                    day: '2-digit',
                    month: 'short',
                  })}
                </Text>
                <Text style={styles.historyStatus(e.status)}>{e.status}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.empty}>No attendance history.</Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Batch Snapshot</Text>
      <View style={styles.card}>
        <View style={styles.filterRow}>
          <View style={[styles.pickerWrapper, { flex: 1 }]}>
            <Picker selectedValue={selectedBatch} onValueChange={setSelectedBatch} style={styles.picker}>
              {batches.map((b) => (
                <Picker.Item key={b._id} label={b.name} value={b._id} color="#0f172a" />
              ))}
            </Picker>
          </View>

          <TextInput style={styles.input} value={date} onChangeText={setDate} />
        </View>

        {loadingBatch ? (
          <ActivityIndicator color="#0b0b0bff" />
        ) : batchSummary ? (
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { borderColor: '#22c55e' }]}>
              <Text style={[styles.statValue, { color: '#22c55e' }]}>{batchSummary.PRESENT}</Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={[styles.statCard, { borderColor: '#ef4444' }]}>
              <Text style={[styles.statValue, { color: '#ef4444' }]}>{batchSummary.ABSENT}</Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
            <View style={[styles.statCard, { borderColor: '#fbbf24' }]}>
              <Text style={[styles.statValue, { color: '#fbbf24' }]}>{batchSummary.LATE}</Text>
              <Text style={styles.statLabel}>Late</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.empty}>No records.</Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Defaulter Radar</Text>

      <View style={styles.card}>
        <View style={styles.filterRow}>
          <TextInput style={styles.input} value={month} onChangeText={setMonth} keyboardType="numeric" />
          <TextInput style={styles.input} value={year} onChangeText={setYear} keyboardType="numeric" />
          <TextInput style={styles.input} value={threshold} onChangeText={setThreshold} keyboardType="numeric" />
        </View>

        {loadingDefaulters ? (
          <ActivityIndicator color="#020303ff" />
        ) : defaulters.length ? (
          defaulters.map((e) => (
            <View key={e.student._id} style={styles.defaulterRow}>
              <View>
                <Text style={styles.defaulterName}>{e.student.name}</Text>
                <Text style={styles.defaulterMeta}>#{e.student.rollNumber}</Text>
              </View>
              <Text style={styles.defaulterPercent}>{e.percentage}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.empty}>All students above threshold.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f6f8ff', padding: 16 },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#0c3b2eff',
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backButtonText: { color: '#e2f7eb', fontSize: 14, fontWeight: '600' },
  sectionTitle: { color: '#1950d1ff', fontSize: 18, fontWeight: '600', marginVertical: 12 },
  card: {
    backgroundColor: '#246d3dff',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e3b31ff',
  },
  pickerWrapper: { backgroundColor: '#eef5f2ff', borderRadius: 16, marginBottom: 12 },
  picker: { color: '#060606ff' },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    flexBasis: '31%',
    borderWidth: 1.3,
    borderBottomWidth: 3,
    borderRadius: 16,
    padding: 5,
    alignItems: 'center',
  },
  statValue: { color: '#f0f3f5ff', fontSize: 18, fontWeight: '700' },
  statLabel: { color: '#cbd5f5', fontSize: 12 },
  historyTitle: { color: '#cbd5f5', fontWeight: '600', marginTop: 16, marginBottom: 8 },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  historyDate: { color: '#f8fafc' },
  historyStatus: (s) => ({
    color: s === 'PRESENT' ? '#22c55e' : s === 'ABSENT' ? '#ef4444' : '#fbbf24',
    fontWeight: '600',
  }),
  filterRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  input: {
    flex: 1,
    backgroundColor: '#f0f2f6ff',
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 9,
    color: '#0f1010ff',
  },
  empty: { color: '#94a3b8', textAlign: 'center', marginVertical: 16 },
  defaulterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#373a3dff',
  },
  defaulterName: { color: '#f8fafc', fontSize: 16, fontWeight: '600' },
  defaulterMeta: { color: '#94a3b8' },
  defaulterPercent: { color: '#ef4444', fontWeight: '700', fontSize: 16 },
});
