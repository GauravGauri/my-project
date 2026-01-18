import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
// Firebase Auth Import
import auth from '@react-native-firebase/auth';

const App = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [section, setSection] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged((user) => {
      if (user) {
        // User logged in hai, seedha feed par le jayein
        setStep(3);
      }
    });
    return subscriber;
  }, []);

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Saari details bhariye!");
      return;
    }

    if (!email.endsWith('.ac.in') && !email.endsWith('.edu')) {
      Alert.alert("Invalid Email", "Sirf official college email (.ac.in) allowed hai!");
      return;
    }

    setLoading(true);
    try {
      // Firebase Create User
      await auth().createUserWithEmailAndPassword(email, password);

      // Verification Email bhejein
      await auth().currentUser?.sendEmailVerification();

      Alert.alert("Success", "Verification link aapke email par bhej diya gaya hai.");
      setStep(2);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        // Agar account pehle se hai toh login try karein
        try {
          await auth().signInWithEmailAndPassword(email, password);
          setStep(3);
        } catch (loginError) {
          Alert.alert("Login Error", "Galat password ya account issue.");
        }
      } else {
        Alert.alert("Firebase Error", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await auth().signOut();
    setStep(1);
  };

  // --- Step 1: Sign Up Screen ---
  if (step === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.formCard}>
          <Text style={styles.title}>CampusSphere</Text>
          <Text style={styles.subtitle}>College network join karein</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>College Email ID</Text>
          <TextInput
            style={styles.input}
            placeholder="example@college.ac.in"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Min 6 characters"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={[styles.btn, { marginTop: 30 }]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Verify Email & Join</Text>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- Step 2: Profile Setup ---
  if (step === 2) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.formCard}>
          <Text style={styles.title}>Professional Profile</Text>
          <Text style={styles.subtitle}>Apna Department aur Section chunein</Text>

          <View style={styles.chipContainer}>
            {['B.Tech CS', 'Mechanical', 'B.Com', 'Medical'].map((dept) => (
              <TouchableOpacity
                key={dept}
                style={[styles.chip, section === dept && styles.chipActive]}
                onPress={() => setSection(dept)}
              >
                <Text style={section === dept ? styles.chipTextActive : styles.chipText}>{dept}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[styles.btn, { marginTop: 40 }]} onPress={() => setStep(3)}>
            <Text style={styles.btnText}>Enter Campus</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- Step 3: Main Feed ---
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hi, {name || 'Student'} 👋</Text>
          <Text style={styles.sectionText}>{section || 'Campus Resident'} | Verified</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.profileCircle}>
          <Text style={{ fontWeight: 'bold' }}>{name ? name[0] : 'U'}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView>
        <View style={styles.postCard}>
          <Text style={styles.postType}>Section Discussion</Text>
          <Text style={styles.postContent}>Welcome to the official {section} group! Yahan aap anonymous confessions bhi kar sakte hain.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles same as your previous code
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  formCard: { padding: 30, marginTop: 30 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#6200ee' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 5, marginTop: 15 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#ddd' },
  btn: { backgroundColor: '#6200ee', padding: 18, borderRadius: 10, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  header: { padding: 20, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 4 },
  welcomeText: { fontSize: 18, fontWeight: 'bold' },
  sectionText: { fontSize: 12, color: '#666' },
  profileCircle: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center' },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  chip: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, borderWidth: 1, borderColor: '#6200ee' },
  chipActive: { backgroundColor: '#6200ee' },
  chipText: { color: '#6200ee' },
  chipTextActive: { color: '#fff', fontWeight: 'bold' },
  postCard: { backgroundColor: '#fff', margin: 15, padding: 20, borderRadius: 15, elevation: 3 },
  postType: { color: '#6200ee', fontSize: 12, fontWeight: 'bold' },
  postContent: { fontSize: 16, marginTop: 8, lineHeight: 22 }
});

export default App;