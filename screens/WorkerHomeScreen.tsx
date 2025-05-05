import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import Modal from 'react-native-modal';

const { width } = Dimensions.get('window');

const WorkerHomeScreen = () => {
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    requestAndSaveLocation();
    registerForPushNotificationsAsync();
    fetchWorkerData();
    fetchPendingOrders();

    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const message = notification.request?.content?.body;
      if (message) {
        setNotificationMessage(message);
        setNotificationVisible(true);
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(subscription);
    };
  }, []);

  const requestAndSaveLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('workers_profile').update({ latitude, longitude }).eq('id', user.id);
      }
    } catch (err) {
      console.log('❌ Location error:', err);
    }
  };

  const registerForPushNotificationsAsync = async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('workers_profile').update({ expo_push_token: token }).eq('id', user.id);
      }
    } catch (error) {
      console.log('❌ Push Token Error:', error);
    }
  };

  const fetchWorkerData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('workers_profile').select('*').eq('id', user.id).single();
      setWorker(data);
    }
    setLoading(false);
  };

  const fetchPendingOrders = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('worker_id', user.id)
        .eq('status', 'pending');
      if (typeof count === 'number') setPendingOrdersCount(count);
    }
  };

  const handleLogout = async () => {
    setLogoutModalVisible(false);
    await supabase.auth.signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  const updateStatus = async (newStatus: string) => {
    let updates: any = { status: newStatus };
    if (newStatus === 'Ready to Take Orders') updates.is_ordered = false;
    const { error } = await supabase.from('workers_profile').update(updates).eq('id', worker.id);
    if (!error) fetchWorkerData();
  };

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#1abc9c" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person-circle" size={70} color="#fff" />
        <TouchableOpacity style={styles.logoutIcon} onPress={() => setLogoutModalVisible(true)}>
          <Ionicons name="log-out-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.welcome}>مرحبًا، {worker.username}</Text>
      <Text style={styles.profession}>🛠️ {worker.profession}</Text>
      <Text style={styles.status}>📍 الحالة: {worker.status}</Text>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.statusButton, { backgroundColor: '#27ae60' }]} onPress={() => updateStatus('Ready to Take Orders')}>
          <Text style={styles.statusButtonText}>متاح الآن</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.statusButton, { backgroundColor: '#c0392b' }]} onPress={() => updateStatus('Not Available')}>
          <Text style={styles.statusButtonText}>غير متاح</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.editProfileButton} onPress={() => navigation.navigate('EditWorkerProfileScreen')}>
        <MaterialIcons name="edit" size={18} color="#1abc9c" />
        <Text style={styles.editProfileText}>تعديل الملف الشخصي</Text>
      </TouchableOpacity>

      <View style={styles.ordersSection}>
        <Text style={styles.ordersTitle}>📬 الطلبات الواردة</Text>
        <Text style={styles.ordersCount}>
          {pendingOrdersCount > 0 ? `يوجد ${pendingOrdersCount} طلب جديد` : 'لا توجد طلبات حالياً'}
        </Text>
        <TouchableOpacity style={styles.ordersButton} onPress={() => navigation.navigate('WorkerOrdersScreen')}>
          <Text style={styles.ordersButtonText}>عرض الطلبات</Text>
        </TouchableOpacity>
      </View>

      <Modal isVisible={logoutModalVisible} animationIn="fadeIn" animationOut="fadeOut">
        <View style={styles.modalView}>
          <Text style={styles.modalText}>هل أنت متأكد أنك تريد تسجيل الخروج؟</Text>
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setLogoutModalVisible(false)}>
              <Text style={{ color: '#333' }}>إلغاء</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleLogout}>
              <Text style={{ color: '#fff' }}>تسجيل الخروج</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ✅ تنبيه التنبيه الجديد */}
      <Modal
        isVisible={notificationVisible}
        animationIn="bounceInDown"
        animationOut="fadeOutUp"
        backdropOpacity={0.3}
        onBackdropPress={() => setNotificationVisible(false)}
      >
        <View style={styles.notificationModal}>
          <Ionicons name="notifications" size={40} color="#1abc9c" />
          <Text style={styles.notificationTitle}>طلب جديد!</Text>
          <Text style={styles.notificationText}>{notificationMessage}</Text>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => {
              setNotificationVisible(false);
              navigation.navigate('WorkerOrdersScreen');
            }}
          >
            <Text style={styles.notificationButtonText}>عرض الطلب</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 29,
  },
  header: {
    backgroundColor: '#1abc9c',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    position: 'relative',
  },
  logoutIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  welcome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 10,
  },
  profession: {
    textAlign: 'center',
    color: '#555',
  },
  status: {
    textAlign: 'center',
    marginVertical: 8,
    color: '#888',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  statusButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
  },
  statusButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  editProfileText: {
    color: '#1abc9c',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  ordersSection: {
    backgroundColor: '#ecf9f6',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  ordersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1abc9c',
    marginBottom: 10,
  },
  ordersCount: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  ordersButton: {
    backgroundColor: '#1abc9c',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  ordersButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalView: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  cancelBtn: {
    backgroundColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  confirmBtn: {
    backgroundColor: '#e74c3c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  notificationModal: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1abc9c',
    marginTop: 10,
  },
  notificationText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginVertical: 12,
  },
  notificationButton: {
    backgroundColor: '#1abc9c',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 24,
  },
  notificationButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default WorkerHomeScreen;