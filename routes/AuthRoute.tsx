import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import SignInScreen from '../screens/SignInScreen';

const AuthStack = createNativeStackNavigator();

export default function ModalScreen() {
  return (
    <AuthStack.Navigator>
        <AuthStack.Screen name="SignIn" component={SignInScreen} />
    </AuthStack.Navigator>
  );
}
