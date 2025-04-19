import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types'; // تأكد أن المسار صحيح

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OrderConfirmationScreen'>;

const OrderConfirmationScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <Ionicons name="checkmark-circle" size={100} color="#1abc9c" />
      <Text style={styles.title}>تم إرسال الطلب بنجاح!</Text>
      <Text style={styles.subtitle}>سيتم التواصل معك من قبل الشغيل قريبًا.</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ClientHomeScreen')}
      >
        <Text style={styles.buttonText}>الرجوع للرئيسية</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1abc9c',
    marginVertical: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1abc9c',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OrderConfirmationScreen;
