import React from 'react';
import { Image, FlatList, StyleSheet, TouchableOpacity, useWindowDimensions, TextInput } from 'react-native';

import { TabView, SceneMap, TabBar, SceneRendererProps, NavigationState } from 'react-native-tab-view';

import ContentLoader from '../components/ContentLoader'

import { Text, useThemeColor, View } from '../components/Themed';
import MessagesContext from '../contexts/messages';
import { RootTabScreenProps } from '../types';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';
import { useFocusEffect } from '@react-navigation/native';
import AuthContext from '../contexts/auth';
import api from '../modules/api';
import { Ionicons } from '@expo/vector-icons';
import CreateGroupContext from '../contexts/creategroup';
import ConversationsContext from '../contexts/conversations';

const ProfileDefault = require('../assets/images/account-circle.png')

export default function CreateGroupSubmitScreen({ navigation }: RootTabScreenProps<'TabOne'>) {
  const borderColor = useThemeColor({ light: 'rgba(0,0,0,.1)', dark: 'rgba(255,255,255,.1)' }, 'background');
  const textColor = useThemeColor({}, 'text');

  const layout = useWindowDimensions();

  const { members, name, setName } = React.useContext(CreateGroupContext)
  const { sendGroup } = React.useContext(ConversationsContext)

  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({ 
        headerRight: ({ tintColor, canGoBack }) => (
            <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
                <TouchableOpacity disabled={!members?.length || !name?.length}
                    onPress={() => sendGroup({ name, members })}
                >
                    <Text style={{ color: tintColor, fontWeight: '500', fontSize: 16 }} >{'Criar'}</Text>
                </TouchableOpacity>
            </View>
        )
    })
  }, [members, name]))

  const theme = useColorScheme()
  const { width } = useWindowDimensions()

  return (
      <View style={{ flex: 1 }}>
        <View style={{ width: '100%',flexDirection: 'row', alignItems: 'center'  }}>

            <Image width={60} height={60} style={{ margin: 20, borderRadius: 80, backgroundColor: borderColor }}
                // defaultSource={ProfileDefault}
                source={ProfileDefault}
                // source={{ uri: '' }}
            />

            <View style={[{ flexGrow: 1, padding: 10 }]}>
                <TextInput style={{  padding: 10, margin: 10, borderBottomWidth: 1, borderTopWidth: 1, borderColor: borderColor }}
                    placeholder={'Digite o nome do grupo'}
                    value={name}
                    onChangeText={setName}
                />
                <Text numberOfLines={2} style={{ color: textColor, fontSize: 14 }} >{'Nomeie o grupo e escolha uma imagem (opcional)'}</Text>
            </View>
        </View>
      </View>
  );
}