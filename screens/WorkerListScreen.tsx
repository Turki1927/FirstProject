import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  FlatList,
  Image,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useRoute, RouteProp } from '@react-navigation/native';
import CustomModal from 'react-native-modal';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  WorkerListScreen: { profession: string };
};

type RouteProps = RouteProp<RootStackParamList, 'WorkerListScreen'>;

interface Worker {
  id: string;
  username: string;
  number: string;
  location: string;
  worker_description: string;
  latitude: number;
  longitude: number;
}

const WorkerListScreen = () => {
  const route = useRoute<RouteProps>();
  const { profession } = route.params;

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [note, setNote] = useState('');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [clientLocation, setClientLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const fetchWorkers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('workers_profile')
      .select('*')
      .eq('profession', profession)
      .eq('is_verified', true)
      .eq('status', 'Ready to Take Orders')
      .eq('is_ordered', false);

    if (!error) setWorkers(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkers();
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('تنبيه', 'يرجى السماح باستخدام الموقع لعرض العمال القريبين منك');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setClientLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  const openWhatsApp = (phone: string) => {
    Linking.openURL(`https://wa.me/${phone}`);
  };

  const openModal = () => {
    setNote('');
    setModalVisible(true);
  };

  const handleSubmitOrder = async () => {
    if (!selectedWorker) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('خطأ', 'يجب تسجيل الدخول أولاً');
      return;
    }
    const { error: orderError } = await supabase.from('orders').insert([
      {
        client_id: user.id,
        worker_id: selectedWorker.id,
        status: 'pending',
        notes: note,
      },
    ]);
    if (orderError) {
      Alert.alert('خطأ', 'تعذر إرسال الطلب');
      return;
    }
    const { error: updateError } = await supabase
      .from('workers_profile')
      .update({ status: 'Not Available', is_ordered: true })
      .eq('id', selectedWorker.id);
    if (updateError) {
      Alert.alert('تم الطلب ✅', 'لكن لم يتم تحديث حالة الشغيل');
    } else {
      Alert.alert('تم الطلب ✅', 'تم إرسال الطلب بنجاح');
    }
    setModalVisible(false);
    setSelectedWorker(null);
    fetchWorkers();
  };

  if (!clientLocation) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1abc9c" />
        <Text style={{ marginTop: 10 }}>جاري تحديد موقعك...</Text>
      </View>
    );
  }

  const WorkerCard = ({ worker }: { worker: Worker }) => (
    <View style={styles.card}>
      <Ionicons name="person-circle" size={60} color="#1abc9c" />
      <Text style={styles.name}>{worker.username}</Text>
      <Text style={styles.desc}>{worker.worker_description}</Text>
      <Text style={styles.location}>📍 {worker.location}</Text>
      <TouchableOpacity style={styles.mapButton} onPress={() => Linking.openURL(`https://www.google.com/maps?q=${worker.latitude},${worker.longitude}`)}>
        <Ionicons name="location-outline" size={18} color="#1abc9c" />
        <Text style={styles.mapButtonText}>عرض الموقع</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.whatsappButton} onPress={() => openWhatsApp(worker.number)}>
        <FontAwesome name="whatsapp" size={20} color="#fff" />
        <Text style={styles.buttonText}>تواصل عبر واتساب</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.orderButton} onPress={() => { setSelectedWorker(worker); openModal(); }}>
        <MaterialIcons name="add-shopping-cart" size={20} color="#fff" />
        <Text style={styles.buttonText}>طلب الخدمة</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.switchBar}>
        <TouchableOpacity style={[styles.switchButton, viewMode === 'map' && styles.activeSwitch]} onPress={() => setViewMode('map')}>
          <Text style={[styles.switchText, viewMode === 'map' && styles.activeSwitchText]}>🗺️ خريطة</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.switchButton, viewMode === 'list' && styles.activeSwitch]} onPress={() => setViewMode('list')}>
          <Text style={[styles.switchText, viewMode === 'list' && styles.activeSwitchText]}>👥 قائمة</Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'map' ? (
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: clientLocation.latitude,
            longitude: clientLocation.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          {workers.map((worker) => (
            <Marker
              key={worker.id}
              coordinate={{ latitude: worker.latitude, longitude: worker.longitude }}
              onPress={() => setSelectedWorker(worker)}
            >
              <Ionicons name="person-circle" size={40} color="#1abc9c" />
            </Marker>
          ))}
        </MapView>
      ) : (
        <FlatList
          data={workers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => <WorkerCard worker={item} />}
        />
      )}

      {viewMode === 'map' && selectedWorker && (
        <CustomModal
          isVisible={selectedWorker !== null}
          onBackdropPress={() => setSelectedWorker(null)}
          swipeDirection="down"
          onSwipeComplete={() => setSelectedWorker(null)}
          style={{ justifyContent: 'flex-end', margin: 0 }}
        >
          <WorkerCard worker={selectedWorker} />
        </CustomModal>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>ماذا تحتاج؟ ✍️</Text>
            <TextInput
              style={styles.input}
              placeholder="اكتب وصف الخدمة المطلوبة"
              value={note}
              onChangeText={setNote}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>إلغاء</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleSubmitOrder}>
                <Text style={styles.modalButtonText}>إرسال</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  switchBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#f1f1f1',
  },
  switchButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 6,
  },
  activeSwitch: {
    backgroundColor: '#1abc9c',
  },
  switchText: {
    color: '#555',
    fontWeight: '600',
  },
  activeSwitchText: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  desc: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  location: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f8f5',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 24,
    marginTop: 12,
  },
  mapButtonText: {
    color: '#1abc9c',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  orderButton: {
    backgroundColor: '#1abc9c',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1abc9c',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 18,
    backgroundColor: '#fafafa',
    fontSize: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalCancel: {
    backgroundColor: '#ccc',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  modalConfirm: {
    backgroundColor: '#1abc9c',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default WorkerListScreen;
