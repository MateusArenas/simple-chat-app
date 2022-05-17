import React from 'react';
import { TouchableOpacity, View, Image, Text, StyleProp, ColorValue, ScrollView, ViewStyle, Platform } from 'react-native';

import { formatDistance } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import Swipeout, { SwipeoutButtonProperties } from 'react-native-swipeout';
import { useThemeColor, ViewProps } from '../Themed';
import Avatar from '../Avatar';
const ProfileDefault = require('../../assets/images/account-circle.png')

interface SwipeoutButtonComponentProperties {
    style: StyleProp<ViewProps>
    backgroundColor: ColorValue
    tintColor: ColorValue
}

interface SwipeoutButtonPropertiesCustom extends Omit<SwipeoutButtonProperties, 'component'> {
    component?: (props: SwipeoutButtonComponentProperties) => JSX.Element;
    style?: StyleProp<ViewStyle>
}

export type SwipeoutButtonCallback = (item: any) => SwipeoutButtonPropertiesCustom[] | undefined

interface ConversationCardProps {
    onPress: () => any
    item: any
    swipeoutBtnsRight?: SwipeoutButtonCallback
    swipeoutBtnsLeft?: SwipeoutButtonCallback
}


const ConversationCard: React.FC<ConversationCardProps> = ({
    onPress,
    item,
    swipeoutBtnsRight=()=>undefined, 
    swipeoutBtnsLeft=()=>undefined,
}) => {
    const borderColor = useThemeColor({ light: 'rgba(0,0,0,.1)', dark: 'rgba(255,255,255,.1)' }, 'background');
    const backgroundColor = useThemeColor({}, 'background');
    const tintColor = useThemeColor({}, 'tint');
    const textColor = useThemeColor({}, 'text');

    const colors = {
        default: { backgroundColor: 'gray', tintColor: 'white' }, 
        delete: { backgroundColor: 'red', tintColor: 'white' }, 
        primary: { backgroundColor: 'blue', tintColor: 'white' }, 
        secondary: { backgroundColor: 'yellow', tintColor: 'white' }
    }

    const left: SwipeoutButtonProperties[] | undefined = React.useMemo(() => 
        swipeoutBtnsLeft(item)?.map(({ style, component, ...btn }) => ({
            ...btn,
            color: btn?.color || colors[btn.type || 'default'].tintColor,
            backgroundColor: btn?.backgroundColor || colors[btn.type || 'default'].backgroundColor,
            component: component?.({ style, ...colors[btn.type || 'default']  }),
        }))
    , [item])

    const right: SwipeoutButtonProperties[] | undefined = React.useMemo(() => 
        swipeoutBtnsRight(item)?.map(({ style, component, ...btn }) => ({
            ...btn,
            color: btn?.color || colors[btn.type || 'default'].tintColor,
            backgroundColor: btn?.backgroundColor || colors[btn.type || 'default'].backgroundColor,
            component: component?.({ style, ...colors[btn.type || 'default']  }),
        }))
    , [item])

  return (
    // <Swipeout left={left || []} right={right || []} backgroundColor={backgroundColor} autoClose close >
            <TouchableOpacity onPress={onPress}>
                <View style={[
                    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'  },
                ]}>
                    <Avatar style={{ margin: 10 }}
                        size={60}
                        uri={item?.uri} group={item?.group}
                        name={item?.direct ? item?.direct?.email : ''}
                    />

                    <View style={[{ width: '50%', height: '100%', padding: 10 }]}>
                        <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: 'bold' }}>{item?.group?.name || item?.direct?.email}</Text>
                        <Text style={{ fontSize: 14, width: '100%' }}>
                            {!(!item?.messages[0]?.self && item?.type === 'DIRECT') && (
                                <Text style={{ fontSize: 14, fontWeight: 'bold', opacity: .5 }}>
                                    {(item?.lastMessage?.self ? 'Você: ' : `${item?.lastMessage?.user?.email?.substr(0, 6)}: `)}
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
                        {item?.news > 0 && <View style={[
                            { width: 20, height: 20, borderRadius: 20, backgroundColor: tintColor },
                            { alignItems: 'center', justifyContent: 'center' }
                        ]}>
                            <Text style={{ color: 'white' }}>{item?.news}</Text>
                        </View>}
                    </View>
                </View>
            </TouchableOpacity>
    // </Swipeout> */
  )
}



export default ConversationCard;