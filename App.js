import React, { useState, useEffect, useMemo, useContext } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AuthContext } from './context/AuthContext';
import { saveToken, getToken, removeToken } from './api/tokenService';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import HomeScreen from './screens/HomeScreen';
import ChatScreen from './screens/ChatScreen';
import PlansListScreen from './screens/PlansListScreen';
import CreatePlanScreen from './screens/CreatePlanScreen';
import PlanDetailScreen from './screens/PlanDetailScreen';
import AuthScreen from './screens/authscreen';

import { registerForPushNotificationsAsync } from './services/pushNotifications';

const Stack = createNativeStackNavigator();

function AppStack() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat with Aura' }} />
      <Stack.Screen name="PlansList" component={PlansListScreen} options={{ title: "My Plans" }} />
      <Stack.Screen name="CreatePlan" component={CreatePlanScreen} options={{ title: 'Create a New Plan' }} />
      <Stack.Screen name="PlanDetail" component={PlanDetailScreen} options={({ route }) => ({ title: route.params.plan.title })} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { userToken, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return userToken ? <AppStack /> : <AuthStack />;
}

export default function App() {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);


   useEffect(() => {
    GoogleSignin.configure({
      webClientId: '710235343000-q8778jph39ksn57jvo5c14k6q3b3i256.apps.googleusercontent.com', // 👈 Replace this with your real Web Client ID
    });
  }, []);
  
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await getToken();
        setUserToken(token);
      } catch (e) {
        console.error('Restoring token failed', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  useEffect(() => {
    if (userToken) {
      console.log("User logged in. Registering for push notifications...");
      registerForPushNotificationsAsync();
    }
  }, [userToken]);

  const authContext = useMemo(() => ({
    signIn: async (token) => {
      await saveToken(token);
      setUserToken(token);
    },
    signOut: async () => {
      await removeToken();
      setUserToken(null);
    },
    userToken,
    isLoading,
  }), [userToken, isLoading]);

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
