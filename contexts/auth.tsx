import React from "react";
import { ActivityIndicator } from "react-native";
import Colors from "../constants/Colors";
import useColorScheme from "../hooks/useColorScheme";
import api from "../modules/api";
import usePersistedState from "../hooks/usePersistedState"
import socket from "../modules/socket";
const apiConfig = require( "../config/api.json");

interface AuthContextData {
    token: string
    signed: boolean
    user: any
    loading: boolean
    signIn: (email: string, password: string, refresh?: boolean) => Promise<any>
    signUp: (email: string, password: string) => Promise<any>
    signOut: () => Promise<any>
}

const AuthContext = React.createContext<AuthContextData>({} as AuthContextData)

function clearAuthorization () {
    if (api.defaults.headers.common?.[apiConfig.tokenProvider]) { 
        console.log({ api: api.defaults.headers.common[apiConfig.tokenProvider]  });
        api.defaults.headers.common = {} // unico jeito que não da erro | delete não funciona
    }
    if (socket) {
        if (socket.io.opts.extraHeaders?.[apiConfig.tokenProvider]) { 
        console.log({ socket: socket.io.opts.extraHeaders[apiConfig.tokenProvider]  });
            socket.io.opts.extraHeaders = {} // unico jeito que não da erro | delete não funciona
        }
        socket.disconnect();
    }
}

export const AuthProvider: React.FC = ({ children }) => {
    const theme = useColorScheme();

    const [user, setUser] = usePersistedState('simple-chat-storage: accounts', null)
    const [token, setToken] = usePersistedState('simple-chat-storage: token', '')

    const signed = React.useMemo(() => (!!user && !!token), [user, token])

    const [loading, setLoading] = React.useState(false)
    
    React.useEffect(() => {
        clearAuthorization()
        if (token) {
            api.defaults.headers.common[apiConfig.tokenProvider] = `${apiConfig.tokenPrefix} ${token}`
            
            socket.io.opts.extraHeaders = { [apiConfig.tokenProvider]: `${apiConfig.tokenPrefix} ${token}` }

            socket.connect()
        } 

        return () => { clearAuthorization() }
    }, [token])

    async function signIn (email: string, password: string, refresh?: boolean) {
        setLoading(true)
        try {
            const { data: { user, token } } = await api.post('/authenticate', { email, password })
            setUser(user)
            setToken(token)
            
        } catch(err) {
            console.log(err);
        } finally {
            setLoading(false)
        }
    }

    async function signUp (email: string, password: string) {
        setLoading(true)
        try {
            const { data: { user, token } } = await api.post('/register', { email, password })
            setUser(user)
            setToken(token)
            
        } catch(err) {
            console.log(err);
        } finally {
            setLoading(false)
        }
    }

    async function signOut () {
        setLoading(true)
        try {
            setUser(null)
            setToken('')
        } catch(err) {
            console.log(err);
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <ActivityIndicator style={{ flex: 1, alignSelf: 'center' }} animating color={Colors[theme].text}  size='large' />

  return (
    <AuthContext.Provider value={{ 
        token,
        user,
        signed,
        loading,
        signIn,
        signUp,
        signOut
    }} >
        {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
