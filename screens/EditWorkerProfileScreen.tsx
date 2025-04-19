import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import { supabase } from '../lib/supabase';

const screen = Dimensions.get('window');

const EditWorkerProfileScreen = () => {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    username: '',
    number: '',
    worker_description: '',
  });
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from('workers_profile')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        Alert.alert('خطأ في التحميل', error.message);
      } else {
        setForm({
          username: data.username || '',
          number: data.number || '',
          worker_description: data.worker_description || '',
        });
        if (data.latitude && data.longitude) {
          setLocation({ latitude: data.latitude, longitude: data.longitude });
        }
      }
    }
    setLoading(false);
  };

  const handleUpdate = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert('خطأ', 'تعذر الحصول على المستخدم');
      return;
    }

    if (!location) {
      Alert.alert('خطأ', 'يجب تحديد الموقع من الخريطة');
      return;
    }

    const { error } = await supabase
      .from('workers_profile')
      .update({
        ...form,
        latitude: location.latitude,
        longitude: location.longitude,
      })
      .eq('id', user.id);

    if (error) {
      Alert.alert('خطأ في التحديث', error.message);
    } else {
      Alert.alert('تم التحديث بنجاح ✅');
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLocation({ latitude, longitude });
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1abc9c" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>تعديل الملف الشخصي</Text>

      <View style={styles.card}>
        <Text style={styles.label}>اسم المستخدم</Text>
        <TextInput
          style={styles.input}
          placeholder="الاسم"
          value={form.username}
          onChangeText={(text) => handleChange('username', text)}
        />

        <Text style={styles.label}>رقم التواصل</Text>
        <TextInput
          style={styles.input}
          placeholder="رقم التواصل"
          value={form.number}
          onChangeText={(text) => handleChange('number', text)}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>نبذة عنك</Text>
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
          placeholder="اكتب نبذة قصيرة عنك"
          value={form.worker_description}
          onChangeText={(text) => handleChange('worker_description', text)}
          multiline
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>حدد موقعك على الخريطة</Text>
        <MapView
          style={styles.map}
          onPress={handleMapPress}
          initialRegion={{
            latitude: location?.latitude || 24.7136,
            longitude: location?.longitude || 46.6753,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          {location && <Marker coordinate={location} />}
        </MapView>

        {location && (
          <Text style={styles.coordinates}>
            الإحداثيات: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
          </Text>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>💾 حفظ التعديلات</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1abc9c',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 6,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 14,
    backgroundColor: '#fafafa',
  },
  map: {
    width: '100%',
    height: screen.height * 0.3,
    borderRadius: 12,
    marginTop: 8,
  },
  coordinates: {
    textAlign: 'center',
    marginTop: 10,
    color: '#555',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#1abc9c',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EditWorkerProfileScreen;
