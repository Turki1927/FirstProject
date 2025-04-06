import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../lib/supabase';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const WorkerRegisterScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profession, setProfession] = useState('Plumber');

  const handleRegister = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      Alert.alert('خطأ', error.message);
      return;
    }

    const user = data?.user;
    if (user?.id) {
      await supabase.from('users').insert([
        {
          id: user.id,
          email,
          username,
          role: 'worker',
        },
      ]);

      const { error: insertError } = await supabase.from('workers_profile').insert([
        {
          id: user.id,
          username,
          email,
          profession,
          is_verified: false,
          is_ordered: false,
          status: 'Not Ready',
        },
      ]);

      if (insertError) {
        Alert.alert('خطأ في حفظ بيانات الشغيل', insertError.message);
      } else {
        Alert.alert('✅ تم إنشاء الحساب', 'يرجى تفعيل بريدك الإلكتروني');
        navigation.navigate('WorkerLoginScreen');
      }
    } else {
      Alert.alert('خطأ', 'لم يتم الحصول على بيانات المستخدم.');
    }
  };

  return (
    <View style={styles.container}>
      <Ionicons name="person-add-outline" size={60} color="#1abc9c" style={styles.icon} />
      <Text style={styles.title}>تسجيل الشغيل</Text>

      <TextInput
        placeholder="الاسم"
        value={username}
        onChangeText={setUsername}
        style={styles.input}
      />
      <TextInput
        placeholder="البريد الإلكتروني"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
      />
      <TextInput
        placeholder="كلمة المرور"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      <Text style={styles.label}>التخصص</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={profession}
          onValueChange={(itemValue) => setProfession(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="سباك" value="Plumber" />
          <Picker.Item label="كهربائي" value="Electrician" />
          <Picker.Item label="ميكانيكي" value="Mechanical" />
          <Picker.Item label="نجار" value="Carpenter" />
          <Picker.Item label="أخرى" value="Other" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>تسجيل</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('WorkerLoginScreen')}>
        <Text style={styles.link}>عندك حساب؟ سجل دخول</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    backgroundColor: '#f7f9fa',
  },
  icon: {
    alignSelf: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1abc9c',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8,
    marginLeft: 4,
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  button: {
    backgroundColor: '#1abc9c',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    textAlign: 'center',
    color: '#16a085',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default WorkerRegisterScreen;
