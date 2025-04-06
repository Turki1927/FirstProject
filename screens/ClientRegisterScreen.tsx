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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import { RootStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ClientRegisterScreen'>;

const ClientRegisterScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('تنبيه', 'يرجى تعبئة جميع الحقول');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      Alert.alert('خطأ', error.message);
    } else {
      const user = data.user;
      if (user) {
        const { error: insertError } = await supabase.from('users').insert([
          {
            id: user.id,
            username,
            email,
            role: 'client',
          },
        ]);

        if (insertError) {
          Alert.alert('خطأ في الحفظ', insertError.message);
        } else {
          Alert.alert('✅', 'تم إنشاء الحساب بنجاح، يرجى تسجيل الدخول');
          navigation.navigate('ClientLoginScreen');
        }
      }
    }
  };

  return (
    <View style={styles.container}>
      <Ionicons name="person-add-outline" size={60} color="#1abc9c" style={styles.icon} />
      <Text style={styles.title}>تسجيل عميل جديد</Text>

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

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>تسجيل</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ClientLoginScreen')}>
        <Text style={styles.link}>عندك حساب؟ سجّل الدخول</Text>
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

export default ClientRegisterScreen;
