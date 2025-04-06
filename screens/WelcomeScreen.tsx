import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

const { width } = Dimensions.get('window');

const WelcomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <LinearGradient
      colors={['#a8edea', '#1abc9c']}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <Ionicons name="happy-outline" size={80} color="#fff" />
        <Text style={styles.title}>أهلًا وسهلًا بك 👋</Text>
        <Text style={styles.subtitle}>اختر نوع الاستخدام</Text>

        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#1abc9c' }]}
            onPress={() => navigation.navigate('WorkerRegisterScreen')}
          >
            <Text style={styles.buttonText}>شغيل</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#16a085' }]}
            onPress={() => navigation.navigate('ClientLoginScreen')}
          >
            <Text style={styles.buttonText}>تبحث عن شغيل</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#f0f0f0',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    width: width * 0.9,
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;
