import React, { useState,useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { View, Text, TextInput, TouchableOpacity, ToastAndroid, StyleSheet, Alert,AppState } from 'react-native';
import CountryPicker from 'react-native-country-picker-modal';
import {supabase} from "../../utils/supabaseConfig"
import { doc, setDoc, getDoc } from "firebase/firestore";
import { firestore } from "../../utils/firebaseConfig";
import * as Location from 'expo-location';
AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  }
);


export default function Auth() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [countryCode, setCountryCode] = useState('IN'); 
  const [callingCode, setCallingCode] = useState('91'); 


  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        ToastAndroid.show(
          'Permission to access location was denied',
          ToastAndroid.SHORT
        )
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location?.coords); // latitude & longitude are here
    })();
  }, []);

  const sendOtp = async () => {
    if (!phoneNumber) {
      ToastAndroid.show(
        'Please enter a valid phone number.',
        ToastAndroid.SHORT
      )
      return;
    }

    const fullPhoneNumber = `+${callingCode}${phoneNumber}`;

    try {

      const { error } = await supabase.auth.signInWithOtp({ phone: fullPhoneNumber });
      if (error) {
        ToastAndroid.show(
          error.message,
          ToastAndroid.SHORT
        )
      } else {
        setIsOtpSent(true);
        ToastAndroid.show(
          'OTP has been sent to your phone.',
          ToastAndroid.SHORT
        )
      }
    } catch (err) {
      ToastAndroid.show(
        'An unexpected error occurred. Please try again later.',
        ToastAndroid.SHORT
      )
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      ToastAndroid.show(
        'Please enter the OTP.',
        ToastAndroid.SHORT
      )
      return;
    }

    const fullPhoneNumber = `+${callingCode}${phoneNumber}`;

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: fullPhoneNumber,
        token: otp,
        type: 'sms',
      });

      if (error) {
        ToastAndroid.show(
          error.message,
          ToastAndroid.SHORT
        )
      } else {
        ToastAndroid.show(
          'Logged in successfully!',
          ToastAndroid.SHORT
        )

        // const user = {
        //   id:  data?.user?.id,
        //   name: "Name",
        //   contact: phoneNumber,
        //   status: false,
        //   image: "https://zfcmfksnxyzfgrbhxsts.supabase.co/storage/v1/object/sign/userdummyimage/customerImage.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJ1c2VyZHVtbXlpbWFnZS9jdXN0b21lckltYWdlLndlYnAiLCJpYXQiOjE3NDIzMTgxNjYsImV4cCI6MTc3Mzg1NDE2Nn0.KcsjwoUZTWOxcw8M1Kvx-sV4bYMCnoyVvBWgYPUYLzA",
        // }
       // console.log('User data:', data?.user?.id);
       const id = data?.user?.id
       if(id){
        const docRef = doc(firestore, "vendors", id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          await setDoc(docRef, {
            id:  data?.user?.id,
            name: "Name",
            ContactNo: Number(phoneNumber),
            status: false,
            type: 'HANDCART' ,
            image: "https://zfcmfksnxyzfgrbhxsts.supabase.co/storage/v1/object/sign/userdummyimage/customerImage.webp?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJ1c2VyZHVtbXlpbWFnZS9jdXN0b21lckltYWdlLndlYnAiLCJpYXQiOjE3NDIzMTgxNjYsImV4cCI6MTc3Mzg1NDE2Nn0.KcsjwoUZTWOxcw8M1Kvx-sV4bYMCnoyVvBWgYPUYLzA",
            latitude: location?.latitude,
            longitude:location?.longitude,
            averageRating:0.0,
            totalDelivery: 0,
            totalRatings: 0,
            vegetables: [],
          });
          console.log("Document created!");
        } else {
          console.log("Document with this ID already exists. Skipping creation.");
        }
        // const { error } = await supabase.from('Vendors').upsert(user,{onConflict:'id', ignoreDuplicates:true});
        // if (error) {
        //   console.error('Error inserting customer:', error);
        // }
       }
      }
    } catch (err) {
      ToastAndroid.show(
        'An unexpected error occurred. Please try again later.',
        ToastAndroid.SHORT
      )
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OTP Login</Text>

      {!isOtpSent ? (
        <>
          <View style={styles.phoneInputContainer}>
            <CountryPicker
              withCallingCode
              withFlag
              withFilter
              withCountryNameButton
              countryCode={countryCode}
              onSelect={(country) => {
                setCountryCode(country.cca2);
                setCallingCode(country.callingCode[0]);
              }}
            />
            <Text style={styles.callingCode}>+{callingCode}</Text>
            <TextInput
              style={styles.phoneInput}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>
          <TouchableOpacity style={styles.button} onPress={sendOtp}>
            <Text style={styles.buttonText}>Send OTP</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            keyboardType="numeric"
            value={otp}
            onChangeText={setOtp}
          />
          <TouchableOpacity style={styles.button} onPress={verifyOtp}>
            <Text style={styles.buttonText}>Verify OTP</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  callingCode: {
    fontSize: 16,
    marginRight: 10,
  },
  phoneInput: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
