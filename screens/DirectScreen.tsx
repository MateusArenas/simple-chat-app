import React from 'react';
import { Image, FlatList, StyleSheet, TouchableOpacity, TextInput, TouchableWithoutFeedback, ImageBackground } from 'react-native';

import { format, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, useThemeColor, View } from '../components/Themed';
import { useDebounceEffect } from '../hooks/useDebounce';
import { RootStackScreenProps, RootTabScreenProps } from '../types';

import KeyboardSpacer from '../components/KeyboardSpacer';
import { MentionInput, parseValue, PartType, getMentionValue, isMentionPartType, MentionSuggestionsProps, mentionRegEx, Part  } from 'react-native-controlled-mentions';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import MessagesContext from '../contexts/messages';
import { useFocusEffect } from '@react-navigation/native';
import { HeaderTitle, HeaderBackButton } from '@react-navigation/elements';
import socket from '../modules/socket';
import api from '../modules/api';
import { useHeaderHeight } from '@react-navigation/elements';
import AuthContext from '../contexts/auth';

import { moderateScale } from 'react-native-size-matters'
import { Svg, Path } from 'react-native-svg'

const BackgroundDefault = require('../assets/images/chat-background-image.jpg')

const ProfileDefault = require('../assets/images/account-circle.png')

export default function DirectScreen({ navigation, route }: RootStackScreenProps<'Direct'>) {
  const borderColor = useThemeColor({ light: 'rgba(0,0,0,.1)', dark: 'rgba(255,255,255,.1)' }, 'background');
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

  const { user } = React.useContext(AuthContext)
  const { conversations, sendMessage, news } = React.useContext(MessagesContext)
  
  const inputRef = React.useRef<TextInput>(null)
  const flatListRef = React.useRef<FlatList>(null)

  const headerHeight = useHeaderHeight();
  const [boxHeight, setBoxHeight] = React.useState<number>(0)
  const [boxItemsHeight, setBoxItemsHeight] = React.useState<number>(0)

  const [scrollY, setScrollY] = React.useState<number>(0)

  const [message, setMessage] = React.useState<string>('')
  const [mentions, setMentions] = React.useState([])


  const [direct, setDirect] = React.useState<any>(null)

  const [status, setStatus] = React.useState<any>(null)

  
  React.useEffect(() => { 
    socket.emit('seeOnline', route.params.id)

    function handleNetworkStatus ({ online, lastSeenAt }: { online: boolean, lastSeenAt: Date }) {
        setStatus({ online, lastSeenAt })
    }

    socket.on('networkStatus', handleNetworkStatus)
    return () => {
        socket.off("networkStatus", handleNetworkStatus);
    }
}, [])

  React.useEffect(() => {
      (async () => {
        const response = await api.get(`/users/${route.params?.id}`);
        console.log({ direction: response?.data});
        
        setDirect(response?.data)
      })()
  }, [])

  function handleSendMessage () {
    
    sendMessage({ content: message, 
        mentions, 
        receivers: (user?._id !== route.params?.id) ? [user?._id, route.params?.id] : [route.params?.id], 
        direct: route.params?.id,
    }, { direct })
    setMentions([])
    setMessage('')
    flatListRef.current?.scrollToOffset({ offset: 0 })
  }

  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
        title: direct?.email,
        // headerTitleAlign: 'left',
        headerBackTitleStyle: { fontSize: 12 },
        headerTintColor: tintColor,
        headerLeft: ({ canGoBack, tintColor }) => (
            <HeaderBackButton disabled={!canGoBack} onPress={() => { navigation.goBack() }}
                style={{ left: -15 }} 
                labelStyle={{ padding: 5, fontWeight: '500' }} 
                canGoBack={canGoBack} 
                tintColor={tintColor} 
                labelVisible 
                label={String(news)} 
            />
        ),
        headerTitle: ({ children, tintColor }) => (
            <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: 'transparent' }}>
                <TouchableOpacity>
                    <Image style={{ marginHorizontal: 10, marginLeft: -10, width: 36, height: 36, borderRadius: 60, backgroundColor: borderColor }}
                        source={ProfileDefault}
                    />
                </TouchableOpacity>
                <View style={{ backgroundColor: 'transparent' }}>
                    <HeaderTitle style={{ fontSize: 16 }} numberOfLines={1}>{children}</HeaderTitle>
                    <Text style={{ fontWeight: '500', opacity: .4, fontSize: 12 }}>
                        {status?.online ? 'online' : status?.lastSeenAt ? '' : 'offline'}
                        {!status?.online && isValid(new Date(status?.lastSeenAt)) && <Text style={{ fontWeight: '500', fontSize: 12 }}>
                            {`visto as ${format(new Date(status?.lastSeenAt), 'HH:mm', { locale: ptBR })}`}
                        </Text>}
                    </Text>
                </View>
            </View>
        )
    })
  }, [direct, news, status]))

  const onViewableItemsChanged = React.useRef(({ changed, viewableItems }) => {
        const allViewableItemsChanged = [...viewableItems, ...changed]

        const viewableItemsChanged = allViewableItemsChanged.filter((item, index) => 
            allViewableItemsChanged?.findIndex(subItem => subItem?.item?._id === item?.item?._id) === index
        )   
        
        const items = viewableItemsChanged.map(viewableItem => viewableItem?.item)

        const viewables = items.filter(viewableItem => (
            (   // pega os items não visualizados e tbm os que não foram lidos por todos
                !viewableItem?.visualized || !viewableItem?.read
            ) && 
            viewableItem?._id && // pega somente se for um item com _id
            !viewableItem?.self// pega somente sé não for um item de sua autoria
        ) )

        if (viewables?.length > 0) {
            socket.emit('seeMessages', { ids: viewables?.map(viewable => viewable?._id) })
        }

    }).current

  return (
      <View style={{ flex: 1 }}>
          <ImageBackground style={{ flex: 1 }}
            source={BackgroundDefault}
          >
          <FlatList style={{ flex: 1 }} 
            ref={flatListRef}
            onScroll={event => {
                const positionX = event.nativeEvent.contentOffset.x;
                const positionY = event.nativeEvent.contentOffset.y;
                setScrollY(positionY)
            }}
            
            // contentInset={{ top: (boxHeight-boxItemsHeight)-headerHeight }}
            inverted
            
            onEndReached={() => {
                console.log('on end reached');
            }}
            keyExtractor={(item) => `${item?._id || item?.outstanding}`}
            onViewableItemsChanged={onViewableItemsChanged}
            maxToRenderPerBatch={20}
            scrollEventThrottle={16}
            onEndReachedThreshold={0}
            // onEndReachedThreshold={0.5}
            data={conversations?.find(conversation => conversation?.direct?._id === route.params?.id)?.messages}
            ItemSeparatorComponent={() => (<View style={{ width: '100%', height: 4, backgroundColor: 'transparent' }} />)}
            contentContainerStyle={{ padding: 4, flexGrow: 1 }}
            // onContentSizeChange={() => flatListRef.current?.scrollToOffset({ offset: 0 })}
            renderItem={({ item, index }) => (
                <View style={[
                    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' },
                    item?.self && { justifyContent: 'flex-end' },
                    { paddingHorizontal: 10, backgroundColor: 'transparent' },
                ]}>
                    <TouchableWithoutFeedback onPress={() => {}}>
                        <View style={{ maxWidth: '80%', backgroundColor: 'transparent' }}>
                            <View style={[
                                { padding: 10, paddingVertical: 15 },
                                // item?.self && { backgroundColor: borderColor },
                                {  borderRadius: 20, backgroundColor: 'transparent' },
                            ]}>
                                {(!item?.self && item?.group) && (
                                    <Text style={{ fontSize: 16, fontWeight: '500', color: tintColor }}>{item?.user?.email}</Text>
                                )}

                                {!item?.visualized && <TouchableOpacity onPress={() => {
                                    socket.emit('seeMessages', { ids: [item?._id] })
                                }}>
                                    <Text style={{ fontSize: 16, fontWeight: '500', color: tintColor }}>{'ver'}</Text>
                                </TouchableOpacity>}

                                <Text style={{ fontSize: 16 }}>
                                    <Text style={[{ fontSize: 16 }, item?.self && {  }]}>{item?.content}</Text>
                                    {(<Text style={{ fontSize: 12, opacity: 0, padding: 10, paddingBottom: 5 }}>
                                        {'HH:mm check'}
                                    </Text>)}
                                </Text>

                                <View style={[
                                    { backgroundColor: 'transparent' },
                                    { position: 'absolute', bottom: 0, right: 10 },
                                    { flexDirection: 'row', alignItems: 'flex-end' },
                                ]}>
                                    {!!item?.createdAt && (<Text style={[
                                        { fontSize: 10, fontWeight: '500', opacity: .8, padding: 0, paddingBottom: 5 },
                                        item?.self && {  },
                                    ]}>{format(new Date(item?.createdAt), 'HH:mm', { locale: ptBR })}</Text>)}

                                    <Ionicons 
                                        color={item?.read ? tintColor : item?.self ? textColor : textColor} 
                                        style={[{ padding: 4, paddingHorizontal: 4 }, { opacity: .8 }]} 
                                        name={!item?._id ? 'timer-outline' : item?.read ? 'checkmark-done-sharp' : 'checkmark-sharp' } 
                                        size={16} 
                                    />
                                </View>

                                <View
                                    style={[
                                        {
                                            shadowColor: "#000",
                                            shadowOffset: {
                                                width: 0,
                                                height: 1,
                                            },
                                            shadowOpacity: 0.12,
                                            shadowRadius: 1.00,
                                            
                                            elevation: 1,
                                        },
                                        item?.self && { backgroundColor: '#e4ffca'  },
                                        { borderRadius: 20 },
                                        {
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            zIndex: -1,
                                            flex: 1
                                        },
                                        { justifyContent: 'flex-end', alignItems: 'flex-start' },
                                        item?.self && { justifyContent: 'flex-end', alignItems: 'flex-end' },
                                    ]}
                                >
                                    <Svg style={[
                                        !item?.self && { left: moderateScale(-6, 0.5) },
                                        item?.self && { right: moderateScale(-6, 0.5) }
                                    ]} width={moderateScale(15.5, 0.6)} height={moderateScale(17.5, 0.6)} viewBox={item?.self ? "32.485 17.5 15.515 17.5" : "32.484 17.5 15.515 17.5"}  enable-background="new 32.485 17.5 15.515 17.5">
                                        <Path
                                            d={item?.self ? "M48,35c-7-4-6-8.75-6-17.5C28,17.5,29,35,48,35z" : "M38.484,17.5c0,8.75,1,13.5-6,17.5C51.484,35,52.484,17.5,38.484,17.5z"}
                                            fill={item?.self ? '#e4ffca' : "white"}
                                            x="0"
                                            y="0"
                                        />
                                    </Svg>
                                </View>

                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            )}
          />

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <TextInput style={[
                    { flexShrink: 1, padding: 15, color: 'black' }, 
                    { backgroundColor: backgroundColor },
                    { minHeight: 49, textAlignVertical: 'center' },
                    { fontSize: 16, paddingTop: 15, paddingRight: 40 }
                ]}
                ref={inputRef}
                multiline={true}
                textAlignVertical={'top'}
                placeholder={'Escreva algo aqui...'}
                value={message}
                onChangeText={setMessage}
                />
                <View style={{ position: 'absolute', bottom: 2.5, right: 0, backgroundColor: 'transparent' }}>

                <TouchableOpacity onPress={handleSendMessage}>
                    <View style={[
                            { backgroundColor: tintColor, borderRadius: 40, margin: 5, marginHorizontal: 10 },
                            { padding: 8 }
                    ]}>
                        <Ionicons name='send' size={18} color={'white'} />
                    </View>
                </TouchableOpacity>
                </View>
            </View>

          </ImageBackground>
        <KeyboardSpacer />
      </View>
  );
}

