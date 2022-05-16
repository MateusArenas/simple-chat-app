import React from 'react';
import { Image, FlatList, StyleSheet, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';

import { formatDistance, formatISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import ContentLoader from '../components/ContentLoader'

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, useThemeColor, View } from '../components/Themed';
import MessagesContext from '../contexts/messages';
import { RootTabScreenProps } from '../types';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';
import { useFocusEffect } from '@react-navigation/native';
import AuthContext from '../contexts/auth';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';


import ConversationCard, { SwipeoutButtonCallback } from '../components/ConversationCard';

const ProfileDefault = require('../assets/images/account-circle.png')


export default function ConversationsScreen({ navigation }: RootTabScreenProps<'TabOne'>) {
  const borderColor = useThemeColor({ light: 'rgba(0,0,0,.1)', dark: 'rgba(255,255,255,.1)' }, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

  const { user } = React.useContext(AuthContext)
  const { loading, conversations, handleRemoveConversation } = React.useContext(MessagesContext)

  useFocusEffect(React.useCallback(() => {
      navigation.setOptions({
          title: user?.email
      })
  }, [user]))

  const theme = useColorScheme()
  const { width } = useWindowDimensions()

  const swipeoutBtnsLeft: SwipeoutButtonCallback = (item) => [
    {
        onPress: () => {},
        type: 'default',
        style: { flex: 1, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
        component: ({ tintColor, style }) => (
            <View style={[style]}>
                <Ionicons name='logo-firefox' size={24} color={tintColor} />
                <Text style={{ color: tintColor, fontWeight: '500', fontSize: 12, opacity: .8 }}>{'Mais'}</Text>
            </View>
        )
    },
  ]

  const swipeoutBtnsRight: SwipeoutButtonCallback = (item) => [
    {
        onPress: () => {},
        type: 'default',
        style: { flex: 1, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
        component: ({ tintColor, style }) => (
            <View style={[style]}>
                <Ionicons name='ellipsis-horizontal' size={24} color={tintColor} />
                <Text style={{ color: tintColor, fontWeight: '500', fontSize: 12, opacity: .8 }}>{'Mais'}</Text>
            </View>
        )
    },
    {
      onPress: () => handleRemoveConversation(item?._id),
      type: 'delete',
      style: { flex: 1, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
      component: ({ tintColor, backgroundColor, style }) => (
          <View style={[style]}>
              <Ionicons name='archive' size={24} color={tintColor} />
              <Text style={{ color: tintColor, fontWeight: '500', fontSize: 12, opacity: .8 }}>{'Remover'}</Text>
          </View>
      )
    },
  ]


  return (
      <FlatList style={{ flex: 1 }}
        data={conversations}
        ItemSeparatorComponent={() => (<View style={{ width: '100%', height: 1, backgroundColor: borderColor }} />)}
        ListEmptyComponent={<ContentLoader width={width} contentColor={Colors[theme].text} />}
        bounces={false}
        renderItem={({ item, index }) => (
            <ConversationCard 
                onPress={() => {
                  if (item?.direct?._id || item?.direct) {
                    navigation.navigate('Direct', { id: item?.direct?._id })
                  } else if (item?.group?._id || item?.group) {
                    navigation.navigate('Group', { id: item?.group?._id })
                  }
                }}
                item={item}
                swipeoutBtnsRight={swipeoutBtnsRight} swipeoutBtnsLeft={swipeoutBtnsLeft}
            />
        )}
      />
  );
}