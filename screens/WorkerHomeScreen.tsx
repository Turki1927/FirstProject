import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import * as Location from 'expo-location';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

const WorkerHomeScreen = () => {
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    requestAndSaveLocation();
    fetchWorkerData();
    fetchPendingOrders();
  }, []);

  const requestAndSaveLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('تنبيه 📍', 'يرجى السماح بالموقع ليسهل وصول العملاء إليك.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from('workers_profile')
          .update({ latitude, longitude })
          .eq('id', user.id);
      }
    } catch (err) {
      console.log('❌ Location error:', err);
    }
  };

  const fetchWorkerData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from('workers_profile')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!error) setWorker(data);
    }

    setLoading(false);
  };

  const fetchPendingOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('worker_id', user.id)
        .eq('status', 'pending');

      if (!error && typeof count === 'number') {
        setPendingOrdersCount(count);
      }
    }
  };

  const updateStatus = async (newStatus: string) => {
    let updates: any = { status: newStatus };
    if (newStatus === 'Ready to Take Orders') {
      updates.is_ordered = false;
    }

    const { error } = await supabase
      .from('workers_profile')
      .update(updates)
      .eq('id', worker.id);

    if (!error) {
      Alert.alert('✅', 'تم تحديث الحالة');
      fetchWorkerData();
    }
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#1abc9c" />;
  }

  if (!worker) {
    return <Text style={styles.error}>لا يمكن تحميل بيانات الشغيل</Text>;
  }

  return (
    <View style={styles.container}>
      <Ionicons name="person-circle" size={80} color="#1abc9c" style={{ marginBottom: 20 }} />
      <Text style={styles.title}>مرحبًا، {worker.username}</Text>
      <Text style={styles.subText}>🛠️ التخصص: {worker.profession}</Text>
      <Text style={styles.statusText}>📍 الحالة الحالية: {worker.status}</Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#2ecc71' }]}
        onPress={() => updateStatus('Ready to Take Orders')}
      >
        <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>متاح الآن</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#e74c3c' }]}
        onPress={() => updateStatus('Not Available')}
      >
        <Ionicons name="close-circle-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>غير متاح الآن</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#3498db' }]}
        onPress={() => navigation.navigate('EditWorkerProfileScreen')}
      >
        <MaterialIcons name="edit" size={20} color="#fff" />
        <Text style={styles.buttonText}>تعديل الملف الشخصي</Text>
      </TouchableOpacity>

      <View style={styles.ordersBox}>
        <Text style={styles.ordersTitle}>📬 الطلبات الواردة</Text>
        {pendingOrdersCount > 0 ? (
          <Text style={styles.ordersCount}>
            عندك {pendingOrdersCount} طلب{pendingOrdersCount > 1 ? 'ات' : ''} جديدة
          </Text>
        ) : (
          <Text style={styles.ordersCount}>لا توجد طلبات جديدة حالياً</Text>
        )}
        <TouchableOpacity
          style={styles.viewOrdersButton}
          onPress={() => navigation.navigate('WorkerOrdersScreen')}
        >
          <Text style={styles.viewOrdersText}>عرض الطلبات</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f9fa',
    paddingHorizontal: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1abc9c',
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  error: {
    marginTop: 50,
    textAlign: 'center',
    color: 'red',
    fontSize: 16,
  },
  ordersBox: {
    marginTop: 30,
    width: '100%',
    backgroundColor: '#e8f9f3',
    padding: 20,
    borderRadius: 20,
    borderColor: '#b2f0df',
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  ordersTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1abc9c',
    marginBottom: 10,
  },
  ordersCount: {
    fontSize: 15,
    color: '#555',
    marginBottom: 14,
    textAlign: 'center',
  },
  viewOrdersButton: {
    backgroundColor: '#1abc9c',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 2,
  },
  viewOrdersText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
export default WorkerHomeScreen;
