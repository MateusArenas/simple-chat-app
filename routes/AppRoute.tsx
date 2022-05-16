import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack'
import DirectScreen from '../screens/DirectScreen';
import ModalScreen from '../screens/ModalScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
import UsersScreen from '../screens/UsersScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootTabParamList, RootTabScreenProps } from '../types';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';
import ConversationsScreen from '../screens/ConversationsScreen';
import { Pressable, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import TabTwoScreen from '../screens/TabTwoScreen';
import AuthContext from '../contexts/auth';
import CreateGroupRoute from './CreateGroupRoute';
import GroupScreen from '../screens/GroupScreen';

const AppStack = createNativeStackNavigator();

export default function AppRoute() {
  return (
    <AppStack.Navigator>
      <AppStack.Screen name="Root" component={BottomTabNavigator} options={{ headerShown: false }} />
      <AppStack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />

      <AppStack.Screen name="Direct" component={DirectScreen} options={{ title: 'Oops!' }} />
      <AppStack.Screen name="Group" component={GroupScreen} options={{ title: 'Oops!' }} />
      <AppStack.Group screenOptions={{ presentation: 'modal' }}>
        <AppStack.Screen name="Users" component={UsersScreen} />
        <AppStack.Screen name="CreateGroup" component={CreateGroupRoute} options={{ title: 'CreateGroup', headerShown: false }} />
        <AppStack.Screen name="Modal" component={ModalScreen} />
      </AppStack.Group>
    </AppStack.Navigator>
  );
}

const BottomTab = createBottomTabNavigator<RootTabParamList>();

export function BottomTabNavigator() {
  const colorScheme = useColorScheme();

  const { signOut } = React.useContext(AuthContext)

  return (
    <BottomTab.Navigator
      initialRouteName="TabOne"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
      }}>
      <BottomTab.Screen
        name="TabOne"
        component={ConversationsScreen}
        options={({ navigation }: RootTabScreenProps<'TabOne'>) => ({
          title: 'Tab One',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          headerRight: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 }}>
                <Pressable onPress={() => navigation.navigate('Users')}
                style={({ pressed }) => ({
                    opacity: pressed ? 0.5 : 1,
                })}>
                <FontAwesome
                    name="info-circle"
                    size={24}
                    color={Colors[colorScheme].text}
                    style={{ marginRight: 15 }}
                />
                </Pressable>

                <Pressable onPress={() => signOut()}
                style={({ pressed }) => ({
                    opacity: pressed ? 0.5 : 1,
                })}>
                <FontAwesome
                    name="sign-out"
                    size={24}
                    color={Colors[colorScheme].text}
                    style={{ marginRight: 15 }}
                />
                </Pressable>
              </View>
          ),
        })}
      />
      <BottomTab.Screen
        name="TabTwo"
        component={TabTwoScreen}
        options={{
          title: 'Tab Two',
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
        }}
      />
    </BottomTab.Navigator>
  );
}

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={30} style={{ marginBottom: -3 }} {...props} />;
}

