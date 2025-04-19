import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { supabase } from '../lib/supabase';

type WorkerDetailsRouteProp = RouteProp<RootStackParamList, 'WorkerListScreen'>;

interface Worker {
  id: string;
  username: string;
  profession: string;
  is_verified: boolean;
  location: string;
  number: string;
  status: string;
  is_ordered: boolean;
  worker_description: string;
}

const WorkerDetailsScreen = () => {
  const route = useRoute<WorkerDetailsRouteProp>();
  const { profession } = route.params;

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

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
      console.error('حدث خطأ:', error.message);
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

  const openOrderModal = (workerId: string) => {
    setSelectedWorkerId(workerId);
    setNotes('');
    setModalVisible(true);
  };

  const confirmOrder = async () => {
    if (!notes.trim()) {
      Alert.alert('تنبيه', 'يرجى كتابة وصف للخدمة المطلوبة');
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !selectedWorkerId) {
      Alert.alert('خطأ', 'حدثت مشكلة في إرسال الطلب');
      return;
    }

    const { error: orderError } = await supabase.from('orders').insert([{
      client_id: user.id,
      worker_id: selectedWorkerId,
      status: 'pending',
      notes: notes,
    }]);

    if (orderError) {
      Alert.alert('خطأ', 'فشل إرسال الطلب');
      console.error(orderError.message);
      return;
    }

    const { error: updateError } = await supabase
      .from('workers_profile')
      .update({
        is_ordered: true,
        status: 'Not Available',
      })
      .eq('id', selectedWorkerId);

    if (updateError) {
      Alert.alert('تم الطلب ✅', 'لكن لم يتم تحديث حالة الشغيل');
      return;
    }

    Alert.alert('✅', 'تم إرسال طلبك بنجاح');
    setModalVisible(false);
    fetchWorkers();
  };

  if (loading) {
    return (
      <ActivityIndicator
        style={{ marginTop: 40 }}
        size="large"
        color="#1abc9c"
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      {workers.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>
          لا يوجد شغيلين حالياً.
        </Text>
      ) : (
        workers.map((worker, index) => (
          <View key={worker.id} style={styles.workerCard}>
            <View style={styles.imageContainer}>
              <Ionicons name="person-circle-outline" size={90} color="#1abc9c" />
            </View>

            <View style={styles.infoContainer}>
              <Text style={styles.name}>{worker.username}</Text>
              <Text style={styles.specialty}>{worker.profession}</Text>
              <Text style={styles.description}>الموقع: {worker.location}</Text>
              <Text style={styles.description}>{worker.worker_description}</Text>

              <TouchableOpacity
                style={styles.whatsappButton}
                onPress={() => openWhatsApp(worker.number)}
              >
                <FontAwesome name="whatsapp" size={20} color="#fff" />
                <Text style={styles.buttonText}>تواصل عبر واتساب</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.orderButton}
                onPress={() => openOrderModal(worker.id)}
              >
                <MaterialIcons name="add-shopping-cart" size={20} color="#fff" />
                <Text style={styles.buttonText}>طلب الخدمة</Text>
              </TouchableOpacity>
            </View>

            {index !== workers.length - 1 && <View style={styles.separator} />}
          </View>
        ))
      )}

      {/* ✅ الواجهة المنبثقة */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>وصف الخدمة المطلوبة</Text>
            <TextInput
              style={styles.textInput}
              placeholder="اكتب بالتفصيل ماذا تحتاج من الشغيل"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity style={styles.confirmButton} onPress={confirmOrder}>
              <Text style={styles.confirmText}>تأكيد الطلب</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  workerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  infoContainer: {
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1abc9c',
    marginBottom: 6,
  },
  specialty: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  whatsappButton: {
    flexDirection: 'row-reverse',
    backgroundColor: '#25D366',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  orderButton: {
    flexDirection: 'row-reverse',
    backgroundColor: '#1abc9c',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 8,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1abc9c',
    marginBottom: 16,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 14,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 16,
    fontSize: 15,
    backgroundColor: '#fafafa',
  },
  confirmButton: {
    backgroundColor: '#1abc9c',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelText: {
    color: '#e74c3c',
    fontSize: 14,
    textAlign: 'center',
  },
});

