import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { Ionicons, FontAwesome } from '@expo/vector-icons';

const ClientOrdersScreen = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        status,
        price,
        notes,
        worker_id,
        workers_profile:worker_id (
          username,
          profession
        )
      `)
      .eq('client_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      Alert.alert('خطأ', 'تعذر تحميل الطلبات');
    } else {
      setOrders(data || []);
    }

    setLoading(false);
  };

  const handleCancelOrder = async (orderId: string, workerId: string) => {
    const { error: cancelError } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId);

    if (cancelError) {
      Alert.alert('خطأ', 'فشل في إلغاء الطلب');
      return;
    }

    const { error: updateWorkerError } = await supabase
      .from('workers_profile')
      .update({
        status: 'Ready to Take Orders',
        is_ordered: false,
      })
      .eq('id', workerId);

    if (updateWorkerError) {
      Alert.alert('تم الإلغاء', 'لكن لم يتم تحديث حالة الشغيل');
    }

    Alert.alert('✅', 'تم إلغاء الطلب بنجاح');
    fetchOrders();
  };

  const openRepeatModal = (workerId: string) => {
    setSelectedWorkerId(workerId);
    setNoteText('');
    setModalVisible(true);
  };

  const handleRepeatOrder = async () => {
    if (!noteText.trim() || !selectedWorkerId) {
      Alert.alert('❌', 'يرجى كتابة وصف للخدمة المطلوبة');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('خطأ', 'يجب تسجيل الدخول أولاً');
      return;
    }

    const { error } = await supabase.from('orders').insert([{
      client_id: user.id,
      worker_id: selectedWorkerId,
      status: 'pending',
      notes: noteText,
    }]);

    if (error) {
      Alert.alert('خطأ', 'حدثت مشكلة أثناء إرسال الطلب');
    } else {
      Alert.alert('✅ تم الطلب مرة أخرى بنجاح');
      fetchOrders();
      setModalVisible(false);
    }
  };

  const renderStatus = (status: string) => {
    let color = '#777';
    let label = '';
    switch (status) {
      case 'pending':
        color = '#f39c12'; label = 'قيد الانتظار ⏳'; break;
      case 'accepted':
        color = '#2ecc71'; label = 'مقبول ✅'; break;
      case 'rejected':
        color = '#e74c3c'; label = 'مرفوض ❌'; break;
      case 'cancelled':
        color = '#999'; label = 'ملغي 🚫'; break;
      default:
        label = status;
    }

    return <Text style={[styles.statusText, { color }]}>{label}</Text>;
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>طلباتي</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#1abc9c" />
      ) : orders.length === 0 ? (
        <Text style={styles.noOrders}>لا توجد طلبات حالياً</Text>
      ) : (
        orders.map((order) => (
          <View key={order.id} style={styles.card}>
            <Ionicons name="person" size={24} color="#1abc9c" />
            <Text style={styles.name}>
              الشغيل: {order.workers_profile?.username ?? 'غير معروف'}
            </Text>
            <Text style={styles.profession}>
              التخصص: {order.workers_profile?.profession ?? '—'}
            </Text>

            {order.notes && (
              <Text style={styles.notes}>
                <FontAwesome name="sticky-note" size={14} /> ملاحظتك: {order.notes}
              </Text>
            )}

            {renderStatus(order.status)}

            {order.status === 'accepted' && order.price && (
              <Text style={styles.price}>
                💰 السعر المحدد: <Text style={{ fontWeight: 'bold' }}>{order.price} ريال</Text>
              </Text>
            )}

            {order.status === 'pending' ? (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancelOrder(order.id, order.worker_id)}
              >
                <Text style={styles.cancelText}>إلغاء الطلب</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: '#1abc9c', marginTop: 10 }]}
                onPress={() => openRepeatModal(order.worker_id)}
              >
                <Text style={styles.cancelText}>طلب مرة أخرى</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}

      {/* ✅ نافذة الملاحظات */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>وصف الخدمة المطلوبة</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="اكتب ملاحظتك هنا..."
              value={noteText}
              onChangeText={setNoteText}
              multiline
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleRepeatOrder}>
              <Text style={styles.modalButtonText}>تأكيد</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancelText}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1abc9c',
    marginBottom: 20,
    textAlign: 'center',
  },
  noOrders: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 30,
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    elevation: 2,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginVertical: 4,
  },
  profession: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  notes: {
    fontSize: 13,
    color: '#555',
    marginBottom: 8,
  },
  price: {
    fontSize: 14,
    color: '#2ecc71',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  cancelText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1abc9c',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    height: 100,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  modalButton: {
    backgroundColor: '#1abc9c',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalCancelText: {
    color: '#e74c3c',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default ClientOrdersScreen;
