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
import { RootStackParamList } from '../types';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import Modal from 'react-native-modal'; // ✅

type ClientLoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ClientLoginScreen'
>;

const ClientLoginScreen = () => {
  const navigation = useNavigation<ClientLoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setModalMessage(error.message);
      setModalVisible(true);
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'ClientHomeScreen', params: { clientId: data.user.id } }],
      });
    }
  };

  return (
    <View style={styles.container}>
      <Ionicons name="log-in-outline" size={60} color="#1abc9c" style={styles.icon} />
      <Text style={styles.title}>تسجيل دخول العميل</Text>

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

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>دخول</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('ClientRegisterScreen')}>
        <Text style={styles.link}>ما عندك حساب؟ سجّل الآن</Text>
      </TouchableOpacity>

      {/* ✅ مودال الخطأ */}
      <Modal isVisible={modalVisible} animationIn="bounceIn" animationOut="fadeOutDown">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>حدث خطأ</Text>
          <Text style={styles.modalMessage}>{modalMessage}</Text>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => setModalVisible(false)}
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
    marginBottom: 16,
    padding: 14,
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

export default ClientLoginScreen;
