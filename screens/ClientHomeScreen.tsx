import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ClientHomeScreen'>;

const { width } = Dimensions.get('window');

const ClientHomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const goToProfession = (profession: string) => {
    navigation.navigate('WorkerListScreen', { profession });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>👋 أهلًا بك</Text>
      <Text style={styles.subTitle}>اختر نوع الشغيل اللي تحتاجه</Text>

      <ScrollView contentContainerStyle={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => goToProfession('Electrician')}>
          <Ionicons name="flash" size={36} color="#1abc9c" />
          <Text style={styles.cardText}>كهربائي</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => goToProfession('Plumber')}>
          <FontAwesome5 name="tools" size={32} color="#1abc9c" />
          <Text style={styles.cardText}>سباك</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => goToProfession('Mechanical')}>
          <MaterialCommunityIcons name="robot-industrial" size={36} color="#1abc9c" />
          <Text style={styles.cardText}>ميكانيكي</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => goToProfession('Carpenter')}>
          <MaterialCommunityIcons name="hammer-screwdriver" size={36} color="#1abc9c" />
          <Text style={styles.cardText}>نجار</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={() => goToProfession('Other')}>
          <Ionicons name="construct" size={34} color="#1abc9c" />
          <Text style={styles.cardText}>أخرى</Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity
        style={styles.ordersButton}
        onPress={() => navigation.navigate('ClientOrdersScreen')}
      >
        <Text style={styles.ordersText}>📦 طلباتي</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1abc9c',
    textAlign: 'center',
    marginBottom: 6,
  },
  subTitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 30,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  ordersButton: {
    backgroundColor: '#1abc9c',
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 4,
  },
  ordersText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});

export default ClientHomeScreen;
