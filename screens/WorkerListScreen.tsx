import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';

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
}

const WorkerListScreen = () => {
  const route = useRoute<RouteProps>();
  const { profession } = route.params;

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const fetchWorkers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('workers_profile')
      .select('*')
      .eq('profession', profession)
      .eq('is_verified', true)
      .eq('status', 'Ready to Take Orders')
      .eq('is_ordered', false);

    if (error) {
      console.error(error.message);
    } else {
      setWorkers(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWorkers();
  }, [profession]);

  const openWhatsApp = (phone: string) => {
    const url = `https://wa.me/${phone}`;
    Linking.openURL(url);
  };

  const openModal = (workerId: string) => {
    setSelectedWorkerId(workerId);
    setNote('');
    setModalVisible(true);
  };

  const handleSubmitOrder = async () => {
    if (!selectedWorkerId) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert('خطأ', 'يجب تسجيل الدخول أولاً');
      return;
    }

    // 1. إرسال الطلب
    const { error: orderError } = await supabase.from('orders').insert([
      {
        client_id: user.id,
        worker_id: selectedWorkerId,
        status: 'pending',
        notes: note,
      },
    ]);

    if (orderError) {
      Alert.alert('خطأ', 'تعذر إرسال الطلب');
      console.error(orderError.message);
      return;
    }

    // 2. تحديث حالة الشغيل
    const { error: updateError } = await supabase
      .from('workers_profile')
      .update({ status: 'Not Available', is_ordered: true })
      .eq('id', selectedWorkerId);

    if (updateError) {
      Alert.alert('تم الطلب ✅', 'لكن لم يتم تحديث حالة الشغيل');
    } else {
      Alert.alert('تم الطلب ✅', 'تم إرسال الطلب بنجاح');
    }

    setModalVisible(false);
    fetchWorkers();
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>الشغيلين ({profession})</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#1abc9c" style={{ marginTop: 30 }} />
        ) : workers.length === 0 ? (
          <Text style={styles.noWorkers}>لا يوجد شغيلين حالياً</Text>
        ) : (
          workers.map((worker) => (
            <View key={worker.id} style={styles.card}>
              <Ionicons name="person-circle-outline" size={70} color="#1abc9c" />
              <Text style={styles.name}>{worker.username}</Text>
              <Text style={styles.desc}>{worker.worker_description}</Text>
              <Text style={styles.location}>📍 {worker.location}</Text>

              <TouchableOpacity
                style={styles.mapButton}
                onPress={() =>
                  Linking.openURL(`https://www.google.com/maps?q=${worker.location}`)
                }
              >
                <Ionicons name="location-outline" size={18} color="#1abc9c" />
                <Text style={styles.mapButtonText}>عرض الموقع</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.whatsappButton}
                onPress={() => openWhatsApp(worker.number)}
              >
                <FontAwesome name="whatsapp" size={20} color="#fff" />
                <Text style={styles.buttonText}>تواصل عبر واتساب</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.orderButton}
                onPress={() => openModal(worker.id)}
              >
                <MaterialIcons name="add-shopping-cart" size={20} color="#fff" />
                <Text style={styles.buttonText}>طلب الخدمة</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* ✅ نافذة إدخال الملاحظة */}
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
  wrapper: {
    flex: 1,
    backgroundColor: '#f1f2f6',
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1abc9c',
    textAlign: 'center',
    marginBottom: 24,
  },
  noWorkers: {
    textAlign: 'center',
    fontSize: 16,
    color: '#aaa',
    marginTop: 40,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  desc: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginVertical: 8,
    lineHeight: 20,
  },
  location: {
    fontSize: 13,
    color: '#777',
    marginBottom: 10,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f8f5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 14,
  },
  mapButtonText: {
    color: '#1abc9c',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
  },
  orderButton: {
    backgroundColor: '#1abc9c',
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 15,
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
