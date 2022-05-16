import React from 'react';
import { Image, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';

import { formatDistance, formatISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, useThemeColor, View } from '../components/Themed';
import MessagesContext from '../contexts/messages';
import { RootTabScreenProps } from '../types';
import api from '../modules/api';
import ContentLoader from '../components/ContentLoader'
import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';

const ProfileDefault = require('../assets/images/account-circle.png')

export default function ConversationsScreen({ navigation }: RootTabScreenProps<'TabOne'>) {
  const borderColor = useThemeColor({ light: 'rgba(0,0,0,.1)', dark: 'rgba(255,255,255,.1)' }, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

  const [loading, setLoading] = React.useState<boolean>(false)
  const [users, setUsers] = React.useState<Array<any>>([])

  React.useEffect(() => {
      (async () => {
          setLoading(true)
          try {
              const response = await api.get('/users');
              setUsers(response?.data?.results)
          } catch (err) {
          } finally {
              setLoading(false)
          }
      })()
  }, [])

  const { width } = useWindowDimensions()
  const theme = useColorScheme()

  return (
      <FlatList style={{ flex: 1 }}
        data={users}
        ItemSeparatorComponent={() => (<View style={{ width: '100%', height: 1, backgroundColor: borderColor }} />)}
        ListEmptyComponent={<ContentLoader width={width} contentColor={Colors[theme].text} />}
        ListHeaderComponent={
          <TouchableOpacity onPress={() => {
            navigation.goBack();
            navigation.navigate('CreateGroup')
          }}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 }}>
                  <View style={[
                    { marginVertical: 10, padding: 10, backgroundColor: borderColor, borderRadius: 100 },
                  ]}>
                    <Ionicons name="ios-people-sharp" size={30} color={tintColor} />
                  </View>

                  <View style={[{ flexGrow: 1, padding: 10, paddingVertical: 20, borderBottomWidth: 1, borderColor: borderColor }]}>
                      <Text style={[
                        { fontSize: 14, color: tintColor, padding: 10, fontWeight: 'bold', textTransform: 'uppercase' },
                      ]}>{'Adicionar Grupo'}</Text>
                  </View>
              </View>
          </TouchableOpacity>
        }
        renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => {
                navigation.goBack();
                navigation.navigate('Direct', { type: 'DIRECT', id: item?._id })
            }}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'  }}>
                    <Image style={{ width: 60, height: 60, borderRadius: 80, backgroundColor: borderColor, margin: 10 }}
                        defaultSource={ProfileDefault}
                        source={{ uri: '' }}
                    />

                    <View style={[{ flexGrow: 1, height: '100%', padding: 10 }]}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item?.email}</Text>
                        <Text style={{ fontSize: 14 }}>
                            {item?.about}
                        </Text>
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
