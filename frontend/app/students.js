import { Picker } from '@react-native-picker/picker';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
const router = useRouter();


import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// import { BatchService, StudentService } from '../src/services/api';

export default function StudentsScreen() {
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

 
  const dummyBatches = [
    { _id: "b1", name: "Batch A" },
    { _id: "b2", name: "Batch B" },
  ];

  const dummyStudents = [
    {
      _id: "s1",
      name: "Rohit Sharma",
      rollNumber: "21",
      batch: { _id: "b1", name: "Batch A" },
      contactNumber: "9876543210",
    },
    {
      _id: "s2",
      name: "Neha Verma",
      rollNumber: "14",
      batch: { _id: "b2", name: "Batch B" },
      contactNumber: "9823123499",
    },
  ];

  useEffect(() => {
    setBatches(dummyBatches);
    setForm(prev => ({
      ...prev,
      batch: prev.batch || "b1",
    }));
  }, []);

  const loadStudents = (batchId = '') => {
    setLoading(true);
    setTimeout(() => {
      if (batchId) {
        setStudents(dummyStudents.filter(s => s.batch._id === batchId));
      } else {
        setStudents(dummyStudents);
      }
      setLoading(false);
    }, 400);
  };

  useEffect(() => {
    loadStudents(selectedBatchFilter);
  }, [selectedBatchFilter]);

  const handleSubmit = () => {
    if (!form.name.trim() || !form.rollNumber.trim() || !form.batch) return;
    setSaving(true);

    setTimeout(() => {
      if (form._id) {
        const student = dummyStudents.find((s) => s._id === form._id);
        if (student) {
          student.name = form.name;
          student.rollNumber = form.rollNumber;
          student.batch = dummyBatches.find(b => b._id === form.batch);
          student.contactNumber = form.contactNumber;
        }
      } else {
        dummyStudents.push({
          _id: "s" + (dummyStudents.length + 1),
          name: form.name,
          rollNumber: form.rollNumber,
          batch: dummyBatches.find(b => b._id === form.batch),
          contactNumber: form.contactNumber,
        });
      }

      setForm({ name: "", rollNumber: "", batch: form.batch, contactNumber: "", _id: null });
      loadStudents(selectedBatchFilter);
      setSaving(false);
    }, 500);
  };

  const handleEdit = (student) => {
    setForm({
      name: student.name,
      rollNumber: student.rollNumber,
      batch: student.batch._id,
      contactNumber: student.contactNumber,
      _id: student._id,
    });
  };

  const handleDelete = (id) => {
    const index = dummyStudents.findIndex((s) => s._id === id);
    if (index !== -1) dummyStudents.splice(index, 1);
    loadStudents(selectedBatchFilter);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.header}>Add / Edit Student</Text>
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Full name"
          placeholderTextColor="#94a3b8"
          value={form.name}
          onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Roll number"
          placeholderTextColor="#94a3b8"
          value={form.rollNumber}
          onChangeText={(text) => setForm((prev) => ({ ...prev, rollNumber: text }))}
        />
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={form.batch}
            onValueChange={(value) => setForm((prev) => ({ ...prev, batch: value }))}
            style={styles.picker}
            dropdownIconColor="#38bdf8"
          >
            {batches.map((batch) => (
              <Picker.Item key={batch._id} label={batch.name} value={batch._id} color="#f0fdf4" />
            ))}
          </Picker>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Contact number"
          placeholderTextColor="#94a3b8"
          value={form.contactNumber}
          onChangeText={(text) => setForm((prev) => ({ ...prev, contactNumber: text }))}
        />
        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={saving}>
          <Text style={styles.buttonText}>{saving ? 'Saving…' : form._id ? 'Update Student' : 'Save Student'}</Text>
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
            <Picker.Item label="All batches" value="" color="#f0fdf4" />
            {batches.map((batch) => (
              <Picker.Item key={batch._id} label={batch.name} value={batch._id} color="#f0fdf4" />
            ))}
          </Picker>
        </View>
      </View>

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
              {typeof student.batch === 'object' && student.batch ? (
                <Text style={styles.studentMeta}>{student.batch.name}</Text>
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
  style={{ backgroundColor: "#38bdf8", padding: 10, borderRadius: 12, marginVertical: 10 }}
  onPress={() => router.push("/(tabs)/studentqr")}
>
  <Text style={{ color: "white", fontWeight: "600", textAlign: "center" }}>
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
  header: {
    color: '#161717ff',
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 12,
  },
  card: {
    backgroundColor: '#0b4029ff',
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  input: {
    backgroundColor: '#ecf1efff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#0c0c0cff',
    marginBottom: 10,
  },
  pickerWrapper: {
    backgroundColor: '#d0d4d3ff',
    borderRadius: 12,
    marginBottom: 10,
    borderColor:"black",
  },
  picker: {
    color: '#0b0b0bff',
  },
  button: {
    backgroundColor: '#22c55e',
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
    marginVertical: 12,
  },
  studentCard: {
    backgroundColor: '#0b3e28',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  studentName: {
    color: '#0f0f0fff',
    fontSize: 16,
    fontWeight: '600',
  },
  studentMeta: {
    color: '#a7f3d0',
    marginTop: 4,
  },
  studentContact: {
    color: '#a7f3d0',
    marginTop: 6,
    fontSize: 13,
  },
  empty: {
    color: '#a7f3d0',
    textAlign: 'center',
    marginTop: 20,
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  actionText: {
    color: '#f8fafc',
    fontWeight: '600',
  },
});
