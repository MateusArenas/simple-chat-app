import React from 'react';
import { ColorValue, FlatList, Platform, useWindowDimensions, View } from 'react-native';
import ContentLoaderMobile from 'react-content-loader/native'
import Svg, { Circle, Rect } from 'react-native-svg';
import useColorScheme from '../hooks/useColorScheme';
import Colors from '../constants/Colors';
// import ContentLoaderWeb from 'react-content-loader'

interface ContentLoaderProps {
    width?: number
    contentColor?: ColorValue 
}

const MyLoader: React.FC<ContentLoaderProps> = ({ width=300, contentColor='gray' }) => (
    <ContentLoaderMobile
      height={90}
      speed={1}
      backgroundColor={contentColor as string}
      opacity={.1}
      foregroundColor={'#999'}
      viewBox={`0 0 ${width} 80`}
    >
      {/* Only SVG shapes */}
      <Circle x="30" y="30" cx="10" cy="10" r="30" />
      <Rect x="80" y="17" rx="4" ry="4" width={width-(60+20)-10} height="13" />
      <Rect x="80" y="40" rx="3" ry="3" width={(width-(60+20)-10) / 1.5} height="10" />
    </ContentLoaderMobile>
  )

  
  const ContentLoader: React.FC<ContentLoaderProps> = ({ width=300, contentColor='gray' }) => {
    return (
        <FlatList style={{ flex: 1 }} 
            scrollEnabled={false} 
            data={new Array(10).fill({ enabled: true })} 
            renderItem={() => <MyLoader width={width} contentColor={contentColor} />} 
        />
    )
  }
  
  export default ContentLoader;