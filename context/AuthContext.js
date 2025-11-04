import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Call this when logging in
  const signIn = async (token) => {
    setUserToken(token); // Updates context state
    await SecureStore.setItemAsync('userToken', token);
  };

  // Call this when logging out
  const signOut = async () => {
    setUserToken(null);
    await SecureStore.deleteItemAsync('userToken');
  };

  // Load token on app start
  const loadToken = async () => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) setUserToken(token);
    setIsLoading(false);
  };

  useEffect(() => {
    loadToken();
  }, []);

  return (
    <AuthContext.Provider value={{ userToken, signIn, signOut, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
