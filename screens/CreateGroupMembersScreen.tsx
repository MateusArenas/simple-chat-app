import React from 'react';
import { Image, FlatList, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';

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

const ProfileDefault = require('../assets/images/account-circle.png')

export default function CreateGroupScreen({ navigation }: RootTabScreenProps<'TabOne'>) {
  const borderColor = useThemeColor({ light: 'rgba(0,0,0,.1)', dark: 'rgba(255,255,255,.1)' }, 'background');
  const textColor = useThemeColor({}, 'text');

  const layout = useWindowDimensions();

  const { members, setMembers} = React.useContext(CreateGroupContext)

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

  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({ 
        headerLeft: ({ tintColor, label, canGoBack }) => (
            <TouchableOpacity disabled={false}
                onPress={() => navigation.goBack()}
            >
                <Text style={{ color: tintColor, fontWeight: '500', fontSize: 16 }} >{'Sair'}</Text>
            </TouchableOpacity>
        ),
        headerRight: ({ tintColor, canGoBack }) => (
            <View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
                <TouchableOpacity disabled={!members?.length}
                    onPress={() => navigation.navigate('CreateGroupSubmit')}
                >
                    <Text style={{ color: tintColor, fontWeight: '500', fontSize: 16 }} >{'Avaçar'}</Text>
                </TouchableOpacity>
            </View>
        )
    })
  }, [members]))

  const theme = useColorScheme()
  const { width } = useWindowDimensions()

  return (
<FlatList style={{ flex: 1 }}
        data={users}
        ItemSeparatorComponent={() => (<View style={{ width: '100%', height: 1, backgroundColor: borderColor }} />)}
        ListEmptyComponent={<ContentLoader width={width} contentColor={Colors[theme].text} />}
        bounces={false}
        renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => {
                setMembers(selects => {
                    const selected = selects?.find(select => select === item?._id)
                    if (selected) {
                        return [...selects?.filter(select => select !== item?._id)]
                    } else {
                        return [...selects, item?._id]
                    }
                })
                // setMarks(selects => {
                //     const selected = selects?.find(select => select === item?._id)
                //     if (selected) {
                //         return [...selects?.filter(select => select !== item?._id)]
                //     } else {
                //         return [...selects, item?._id]
                //     }
                // })
            }}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'  }}>
                    <Image style={{ width: 60, height: 60, borderRadius: 80, backgroundColor: borderColor, margin: 10 }}
                        // defaultSource={ProfileDefault}
                        source={ProfileDefault}
                        // source={{ uri: '' }}
                    />

                    <View style={[{ flexGrow: 1, height: '100%', padding: 10 }]}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item?.email}</Text>
                        <Text style={{ fontSize: 14 }}>
                            {item?.about}
                        </Text>
                    </View>

                    <Ionicons style={{ padding: 10 }} 
                        name={members?.find(mark => mark === item?._id) ? 'md-radio-button-on' : 'md-radio-button-off'} size={24} 
                        color={textColor} 
                    />
                </View>
            </TouchableOpacity>
        )}
    />
  );
}