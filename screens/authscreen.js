// import React, { useState, useContext } from 'react';
// import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
// import { AuthContext } from '../context/AuthContext';

// const API_URL = 'https://backend-app-jjw5.onrender.com';

// const AuthScreen = () => {
//   const { signIn } = useContext(AuthContext);

//   const [isLogin, setIsLogin] = useState(true);
//   const [name, setName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   const handleAuth = async () => {
//     if (!email || !password || (!isLogin && !name)) {
//       Alert.alert('Error', 'Please fill in all fields.');
//       return;
//     }

//     setIsLoading(true);
//     const endpoint = isLogin ? '/api/users/login' : '/api/users/register';
//     const body = isLogin ? { email, password } : { name, email, password };

//     try {
//       const response = await fetch(API_URL + endpoint, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(body),
//       });

//       const data = await response.json();

//       if (response.ok) {
//         signIn(data.token); // Now works on web + mobile
//       } else {
//         const errorMessage = data.msg || (data.errors && data.errors[0].msg) || 'An error occurred.';
//         Alert.alert('Authentication Failed', errorMessage);
//       }
//     } catch (error) {
//       console.error(error);
//       Alert.alert('Network Error', 'Unable to connect to the server.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       style={styles.container}
//     >
//       <View style={styles.innerContainer}>
//         <Text style={styles.title}>{isLogin ? 'Welcome Back!' : 'Create Account'}</Text>

//         {!isLogin && (
//           <TextInput
//             style={styles.input}
//             placeholder="Name"
//             value={name}
//             onChangeText={setName}
//             editable={!isLoading}
//           />
//         )}

//         <TextInput
//           style={styles.input}
//           placeholder="Email"
//           value={email}
//           onChangeText={setEmail}
//           keyboardType="email-address"
//           autoCapitalize="none"
//           editable={!isLoading}
//         />
//         <TextInput
//           style={styles.input}
//           placeholder="Password"
//           value={password}
//           onChangeText={setPassword}
//           secureTextEntry
//           editable={!isLoading}
//         />

//         <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={isLoading}>
//           {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Register'}</Text>}
//         </TouchableOpacity>

//         <TouchableOpacity onPress={() => !isLoading && setIsLogin(!isLogin)} disabled={isLoading}>
//           <Text style={styles.toggleText}>{isLogin ? 'Need an account? Register' : 'Have an account? Login'}</Text>
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f4f4f8' },
//   innerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
//   title: { fontSize: 32, fontWeight: 'bold', marginBottom: 40, color: '#333' },
//   input: { width: '100%', height: 50, backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, borderWidth: 1, borderColor: '#ddd', fontSize: 16, color: '#333' },
//   button: { width: '100%', height: 50, backgroundColor: '#6200ee', justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginTop: 10 },
//   buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
//   toggleText: { marginTop: 20, color: '#6200ee', fontWeight: '600' }
// });

// export default AuthScreen;

import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { AuthContext } from '../context/AuthContext';

const API_URL = 'https://backend-app-jjw5.onrender.com';

const AuthScreen = () => {
  const { signIn } = useContext(AuthContext);

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    const endpoint = isLogin ? '/api/users/login' : '/api/users/register';
    const body = isLogin ? { email, password } : { name, email, password };

    try {
      const response = await fetch(API_URL + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        signIn(data.token);
      } else {
        const errorMessage = data.msg || (data.errors && data.errors[0].msg) || 'An error occurred.';
        Alert.alert('Authentication Failed', errorMessage);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Network Error', 'Unable to connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log('Google User Info:', userInfo);

      const idToken = userInfo.idToken;

      const response = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }),
      });

      const data = await response.json();

      if (response.ok) {
        signIn(data.token);
        Alert.alert('Login Success', `Welcome ${userInfo.user.name}`);
      } else {
        Alert.alert('Login Failed', data.message || 'Unable to authenticate with Google');
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      Alert.alert('Login Failed', 'Something went wrong during Google Sign-In.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.title}>{isLogin ? 'Welcome Back!' : 'Create Account'}</Text>

        {!isLogin && (
          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
            editable={!isLoading}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isLoading}
        />

        <TouchableOpacity style={styles.button} onPress={handleAuth} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Register'}</Text>}
        </TouchableOpacity>

        {/* 👇 Add Google Sign-In button */}
        <TouchableOpacity
          style={[styles.googleButton, isLoading && { opacity: 0.7 }]}
          onPress={handleGoogleLogin}
          disabled={isLoading}
        >
          <Text style={styles.googleButtonText}>Sign in with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => !isLoading && setIsLogin(!isLogin)} disabled={isLoading}>
          <Text style={styles.toggleText}>{isLogin ? 'Need an account? Register' : 'Have an account? Login'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f8' },
  innerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 40, color: '#333' },
  input: { width: '100%', height: 50, backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, borderWidth: 1, borderColor: '#ddd', fontSize: 16, color: '#333' },
  button: { width: '100%', height: 50, backgroundColor: '#6200ee', justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  googleButton: { width: '100%', height: 50, backgroundColor: '#DB4437', justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginTop: 15 },
  googleButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  toggleText: { marginTop: 20, color: '#6200ee', fontWeight: '600' }
});

export default AuthScreen;
