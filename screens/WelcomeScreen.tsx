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
      colors={['#dff9fb', '#1abc9c']}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <Ionicons name="hand-left-outline" size={90} color="#fff" style={{ marginBottom: 10 }} />
        <Text style={styles.title}>مرحبًا بك 👋</Text>
        <Text style={styles.subtitle}>كيف تود استخدام التطبيق؟</Text>

        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.button, styles.workerButton]}
            onPress={() => navigation.navigate('WorkerRegisterScreen')}
          >
            <Ionicons name="hammer-outline" size={22} color="#fff" />
            <Text style={styles.buttonText}>أنا شغيل</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.clientButton]}
            onPress={() => navigation.navigate('ClientLoginScreen')}
          >
            <Ionicons name="search-outline" size={22} color="#fff" />
            <Text style={styles.buttonText}>أبحث عن شغيل</Text>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ecf0f1',
    marginBottom: 28,
  },
  card: {
    backgroundColor: '#fff',
    width: width * 0.9,
    borderRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 18,
    justifyContent: 'center',
  },
  workerButton: {
    backgroundColor: '#1abc9c',
  },
  clientButton: {
    backgroundColor: '#16a085',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;
