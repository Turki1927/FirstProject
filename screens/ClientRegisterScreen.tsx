import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import { RootStackParamList } from '../types';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal'; // ✅

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ClientRegisterScreen'>;

const ClientRegisterScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [navigateAfterModal, setNavigateAfterModal] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setModalTitle('تنبيه');
      setModalMessage('يرجى تعبئة جميع الحقول');
      setModalVisible(true);
      return;
    }

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setModalTitle('خطأ');
      setModalMessage(error.message);
      setModalVisible(true);
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
          setModalTitle('خطأ في الحفظ');
          setModalMessage(insertError.message);
          setModalVisible(true);
        } else {
          setModalTitle('✅ تم إنشاء الحساب');
          setModalMessage('يرجى تفعيل بريدك الإلكتروني ثم تسجيل الدخول');
          setNavigateAfterModal(true);
          setModalVisible(true);
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

      {/* ✅ المودال الجميل */}
      <Modal isVisible={modalVisible} animationIn="zoomIn" animationOut="zoomOut">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{modalTitle}</Text>
          <Text style={styles.modalMessage}>{modalMessage}</Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              setModalVisible(false);
              if (navigateAfterModal) {
                navigation.navigate('ClientLoginScreen');
              }
            }}
          >
            <Text style={styles.modalButtonText}>تم</Text>
          </TouchableOpacity>
        </View>
      </Modal>
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
  modalContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#1abc9c',
    paddingVertical: 10,
    paddingHorizontal: 26,
    borderRadius: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ClientRegisterScreen;
