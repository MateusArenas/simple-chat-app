import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { CreateGroupProvider } from '../contexts/creategroup';
import CreateGroupMembersScreen from '../screens/CreateGroupMembersScreen';
import CreateGroupSubmitScreen from '../screens/CreateGroupSubmitScreen';

const CreateGroupStack = createNativeStackNavigator();

export default function AppRoute() {
  return (
      <CreateGroupProvider>
        <CreateGroupStack.Navigator>
        <CreateGroupStack.Screen name="CreateGroupMembers" component={CreateGroupMembersScreen} options={{ title: 'Oops!' }} />
        <CreateGroupStack.Screen name="CreateGroupSubmit" component={CreateGroupSubmitScreen} />
        </CreateGroupStack.Navigator>
      </CreateGroupProvider>
  );
}
