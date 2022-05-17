import React from 'react';
import { View, Image, ViewStyle, StyleProp, Text } from 'react-native';
import { useThemeColor } from './Themed';

const ProfileDefault = require('../assets/images/account.png')
const GroupDefault = require('../assets/images/account-group.png')

interface AvatarProps {
    uri?: string
    size?: number 
    style?: StyleProp<ViewStyle>
    group?: boolean
    name?: string
}

const Avatar: React.FC<AvatarProps> = ({ style, uri, size=36, group, name }) => {
  const tintColor = useThemeColor({}, 'tint');

  return (
    <View style={[{ width: size, height: size, borderRadius: size, overflow: 'hidden', justifyContent: 'center' }, style]}>
        {!uri && <View style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: tintColor, opacity: .2 }} />}
        {!name?.length && <Image style={[
            { width: '100%', height: '100%', alignSelf: 'center' },
            !uri && { width: '50%', height: '50%', tintColor },
        ]}
            defaultSource={group ? GroupDefault : ProfileDefault}
            source={{ uri }}
        />}
        {name?.length > 1 && <Text style={[
          { color: tintColor, alignSelf: 'center', fontSize: size/3.5, textTransform: 'uppercase' },
          { fontWeight: 'bold', letterSpacing: size/50 }
        ]}>{name?.substring(0, 2)}</Text>}
    </View>
  )
}

export default Avatar;