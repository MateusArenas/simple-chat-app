import React from 'react';
import { Image, FlatList, StyleSheet, TouchableOpacity, TextInput, TouchableWithoutFeedback, ImageBackground } from 'react-native';

import { formatDistance } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, useThemeColor, View } from '../components/Themed';
import { useDebounceEffect } from '../hooks/useDebounce';
import { RootTabScreenProps } from '../types';

import KeyboardSpacer from '../components/KeyboardSpacer';
import { MentionInput, parseValue, PartType, getMentionValue, isMentionPartType, MentionSuggestionsProps, mentionRegEx, Part  } from 'react-native-controlled-mentions';
import { Ionicons } from '@expo/vector-icons';
import MessagesContext from '../contexts/messages';
import { useFocusEffect } from '@react-navigation/native';
import socket from '../modules/socket';
import api from '../modules/api';
import { useHeaderHeight } from '@react-navigation/elements';

const BackgroundDefault = require('../assets/images/chat-background-image.jpg')

export default function DirectScreen({ navigation, route }: RootTabScreenProps<'TabOne'>) {
  const borderColor = useThemeColor({ light: 'rgba(0,0,0,.1)', dark: 'rgba(255,255,255,.1)' }, 'background');
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');

  const { conversations, sendMessage } = React.useContext(MessagesContext)
  

  const inputRef = React.useRef<TextInput>(null)
  const flatListRef = React.useRef<FlatList>(null)

  const headerHeight = useHeaderHeight();
  const [boxHeight, setBoxHeight] = React.useState<number>(0)
  const [boxItemsHeight, setBoxItemsHeight] = React.useState<number>(0)

  const [scrollY, setScrollY] = React.useState<number>(0)

  const [message, setMessage] = React.useState<string>('')
  const [mentions, setMentions] = React.useState([])


  const [direct, setDirect] = React.useState<any>(null)

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
        receivers: [route.params?.id], 
        direct: route.params?.id
    }, { direct })
    setMentions([])
    setMessage('')
    flatListRef.current?.scrollToOffset({ offset: 0 })
  }

  useFocusEffect(React.useCallback(() => {
    navigation.setOptions({
        title: direct?.email
    })
  }, [direct]))

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
                    { paddingHorizontal: 10, backgroundColor: 'transparent' }
                ]}>
                    <TouchableWithoutFeedback onPress={() => {}}>
                        <View style={{ flex: 1, maxWidth: '80%', borderRadius: 10, overflow: 'hidden' }}>
                            <View style={[
                                { flex: 1, padding: 10, paddingVertical: 15 },
                                item?.self && { backgroundColor: borderColor },
                                {  borderRadius: 10, borderWidth: 1, borderColor: borderColor }
                            ]}>
                                {(!item?.self && item?.group) && (
                                    <Text style={{ fontSize: 16, fontWeight: '500', color: tintColor }}>{item?.user?.email}</Text>
                                )}
                                <Text style={{ fontSize: 16 }}>
                                    <Text style={{ fontSize: 16 }}>{item?.content}</Text>
                                    {!!item?.createdAt && (<Text style={{ fontSize: 12, opacity: 0, padding: 10, paddingBottom: 5 }}>
                                        {formatDistance(new Date(item?.createdAt), new Date(), { locale: ptBR })}
                                    </Text>)}
                                </Text>
                                {!!item?.createdAt && (<Text style={[
                                    { position: 'absolute', bottom: 0, right: 0 }, 
                                    { fontSize: 12, opacity: .5, padding: 10, paddingBottom: 5 },
                                ]}>{formatDistance(new Date(item?.createdAt), new Date(), { locale: ptBR })}</Text>)}
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

