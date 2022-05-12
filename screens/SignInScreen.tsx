import React from 'react';
import { Button, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Switch, TextInput, TouchableWithoutFeedback } from 'react-native';

import { Text, View } from '../components/Themed';
import AuthContext from '../contexts/auth';
import { RootStackScreenProps } from '../types';

export default function NotFoundScreen({ navigation }: RootStackScreenProps<'NotFound'>) {

    const accounts = [
        { email: 'mateusarenas97@gmail.com', password: '12345678', primary: true },
        { email: 'simplechatpop@gmail.com', password: '12345678', primary: false },
    ]
    
    const [primary, setPrimary] = React.useState(true)

    const [email, setEmail] = React.useState('mateusarenas97@gmail.com')
    const [password, setPassword] = React.useState('12345678')

    const { signIn } = React.useContext(AuthContext)

    function handleSubmit () {
        signIn(email, password)
    }

    function handleEmail (email: string) {
        setEmail(email)
    }

    function handlePassword (password: string) {
        setPassword(password)
    }

  return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            {/* <TouchableWithoutFeedback onPress={Keyboard.dismiss}> */}
            <View style={styles.inner}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Switch 
                        onValueChange={value => {
                            setEmail(accounts.find(account => account.primary === value)?.email || 'mateusarenas97@gmail.com')
                            setPassword(accounts.find(account => account.primary === value)?.password || '12345678')
                            setPrimary(value)
                        }}
                        value={primary}
                    />
                    <Text style={{ fontSize: 16, fontWeight: 'bold', opacity: .8, padding: 10 }}>{primary ? 'Primaria' : 'Secundaria'}</Text>
                </View>
                <TextInput style={styles.textInput} 
                    value={email}
                    onChangeText={handleEmail}
                    keyboardType='email-address' 
                    textContentType='emailAddress'
                    placeholder="Email" 
                />
                <TextInput style={styles.textInput}
                    // keyboardType='visible-password'
                    value={password}
                    onChangeText={handlePassword}
                    textContentType='password'
                    placeholder="Password" 
                />
                <View style={styles.btnContainer}>
                <Button title="Submit" onPress={handleSubmit} />
                </View>
            </View>
            {/* </TouchableWithoutFeedback> */}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1
    },
    inner: {
      padding: 24,
      flex: 1,
      justifyContent: "space-around"
    },
    header: {
      fontSize: 36,
      marginBottom: 48
    },
    textInput: {
      height: 40,
      borderColor: "#000000",
      borderBottomWidth: 1,
      marginBottom: 36
    },
    btnContainer: {
      backgroundColor: "white",
      marginTop: 12
    }
  });
