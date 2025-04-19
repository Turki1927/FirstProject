import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

// الشاشات
import WelcomeScreen from '../screens/WelcomeScreen';
import WorkerRegisterScreen from '../screens/WorkerRegisterScreen';
import WorkerLoginScreen from '../screens/WorkerLoginScreen';
import ClientLoginScreen from '../screens/ClientLoginScreen';
import ClientRegisterScreen from '../screens/ClientRegisterScreen';
import ClientHomeScreen from '../screens/ClientHomeScreen';
import WorkerListScreen from '../screens/WorkerListScreen';
import WorkerHomeScreen from '../screens/WorkerHomeScreen';
import EditWorkerProfileScreen from '../screens/EditWorkerProfileScreen';
import OrderConfirmationScreen from '../screens/OrderConfirmationScreen'; // تأكد من المسار حسب مكان الحفظ
import WorkerOrdersScreen from '../screens/WorkerOrdersScreen';
import ClientOrdersScreen from '../screens/ClientOrdersScreen';



const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: true }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="WorkerRegisterScreen" component={WorkerRegisterScreen} />
        <Stack.Screen name="WorkerLoginScreen" component={WorkerLoginScreen} />
        <Stack.Screen name="ClientLoginScreen" component={ClientLoginScreen} />
        <Stack.Screen name="ClientRegisterScreen" component={ClientRegisterScreen} />
        <Stack.Screen name="ClientHomeScreen" component={ClientHomeScreen} />
        <Stack.Screen name="WorkerListScreen" component={WorkerListScreen} />
        <Stack.Screen name="WorkerHomeScreen" component={WorkerHomeScreen} />
        <Stack.Screen name="EditWorkerProfileScreen" component={EditWorkerProfileScreen} />
        <Stack.Screen name="OrderConfirmationScreen" component={OrderConfirmationScreen} />
        <Stack.Screen name="WorkerOrdersScreen" component={WorkerOrdersScreen} />
        <Stack.Screen name="ClientOrdersScreen" component={ClientOrdersScreen} />
    





      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
