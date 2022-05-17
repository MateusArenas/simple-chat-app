/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { FontAwesome } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { ColorSchemeName, Pressable } from 'react-native';

import Colors from '../constants/Colors';
import { MessagesProvider } from '../contexts/messages';
import useColorScheme from '../hooks/useColorScheme';
import ConversationsScreen from '../screens/ConversationsScreen';
import DirectScreen from '../screens/DirectScreen';
import ModalScreen from '../screens/ModalScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
import TabOneScreen from '../screens/TabOneScreen';
import TabTwoScreen from '../screens/TabTwoScreen';
import UsersScreen from '../screens/UsersScreen';
import { RootStackParamList, RootTabParamList, RootTabScreenProps } from '../types';
import LinkingConfiguration from './LinkingConfiguration';

import Routes from '../routes'
import { AuthProvider } from '../contexts/auth';
import { ConversationsProvider } from '../contexts/conversations';

export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
    >
      <AuthProvider>
        <ConversationsProvider>
          <MessagesProvider>
              <Routes />
          </MessagesProvider>
        </ConversationsProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}