import React from 'react';
import { Image, FlatList, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';

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
const ProfileDefault = require('../assets/images/account-circle.png')

export default function ConversationsScreen({ navigation }: RootTabScreenProps<'TabOne'>) {
  const borderColor = useThemeColor({ light: 'rgba(0,0,0,.1)', dark: 'rgba(255,255,255,.1)' }, 'background');
  const tintColor = useThemeColor({}, 'tint');

  const { user } = React.useContext(AuthContext)
  const { loading, conversations } = React.useContext(MessagesContext)

  useFocusEffect(React.useCallback(() => {
      navigation.setOptions({
          title: user?.email
      })
  }, [user]))

  React.useEffect(() => {
      console.log({ loading });
  }, [loading])

  const theme = useColorScheme()
  const { width } = useWindowDimensions()


  return (
      <FlatList style={{ flex: 1 }}
        data={conversations}
        ItemSeparatorComponent={() => (<View style={{ width: '100%', height: 1, backgroundColor: borderColor }} />)}
        ListEmptyComponent={<ContentLoader width={width} contentColor={Colors[theme].text} />}
        renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => navigation.navigate('Direct', { id: item?.group?._id || item?.direct?._id })}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'  }}>
                    <Image style={{ width: 60, height: 60, borderRadius: 80, backgroundColor: borderColor, margin: 10 }}
                        defaultSource={ProfileDefault}
                        source={{ uri: '' }}
                    />

                    <View style={[{ width: '50%', height: '100%', padding: 10 }]}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item?.group?.name || item?.direct?.email}</Text>
                        <Text style={{ fontSize: 14, width: '100%' }}>
                            {!(!item?.messages[0]?.self && item?.type === 'DIRECT') && (
                                <Text style={{ fontSize: 14, fontWeight: 'bold', opacity: .5 }}>
                                    {item?.lastMessage?.self ? 'Você: ' : `${item?.lastMessage?.user?.email}: `}
                                </Text>
                            )}
                            {item?.lastMessage?.content}
                        </Text>
                    </View>

                    <View style={{ alignItems: 'flex-end', padding: 10, flex: 1, justifyContent: 'space-evenly' }}>
                        {!!item?.lastMessage?.updatedAt && (
                            <Text numberOfLines={1} style={{ flex: 1, color: tintColor }}>
                                {formatDistance(new Date(item?.lastMessage?.updatedAt), new Date(), { locale: ptBR, addSuffix: false })}
                            </Text>
                        )}
                        <View style={[
                            { width: 20, height: 20, borderRadius: 20, backgroundColor: tintColor },
                            { alignItems: 'center', justifyContent: 'center' }
                        ]}>
                            <Text style={{ color: 'white' }}>{item?.news}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        )}
      />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
