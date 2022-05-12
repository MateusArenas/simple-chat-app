import React from "react";
import api from "../modules/api";
import socket from "../modules/socket";
import AuthContext from "./auth";

interface MessagesContextData {
    loading: boolean
    conversations: Array<any>
    sendMessage: (message: any, extra: any) => any
    removeMessage: (id: string) => any
}

const MessagesContext = React.createContext<MessagesContextData>({} as MessagesContextData)

export const MessagesProvider: React.FC = ({ children }) => {
    const { user, signed } = React.useContext(AuthContext)

    const [conversations, setConversations] = React.useState<Array<any>>([]);

    const [loading, setLoading] = React.useState<boolean>(false)

    React.useEffect(() => {
        if (signed) {
            (async () => {
                setLoading(true)
                try {
                    const response = await api.get(`/users/${user?._id}/conversations`);
                    setConversations(response?.data?.results)
                    console.log({ conv: response?.data?.results });
                    
                } catch (err) {
                } finally {
                    setLoading(false)
                }
            })()
        }
    }, [signed, user])



    function sendMessage (message: any, extra: any) {
        if (message?.content?.length > 0) {
            console.log('emitindo o evento...');
            
            socket.emit('sendMessage', { ...message })            
        }
    }

    function removeMessage (id: string) {
        socket.emit('removeMessage', { id })
        // setMessages(messages => messages.filter(message => message?._id !== id))
    }

    // React.useEffect(() => {
    //     socket.on("previousMessages", data => {
    //         console.log('previousMessages: ',{ data });
    //         setMessages(data)
    //     });
    // }, [])


    React.useEffect(() => {
        socket.on("receivedMessage", data => {
            console.log('receivedMessage: ',{ data });
            setConversations(conversations => {
                const existsConversation = conversations.find(conversation => conversation?._id === data?.conversation?._id)

                if (existsConversation) {
                    return conversations?.map(conversation => {
                        if (conversation?._id === existsConversation?._id) {
                            conversation.messages.unshift(data)
                            conversation.lastMessage = data
                        }
                        return conversation
                    })
                }

                const conversation = { ...data?.conversation, messages: [data], lastMessage: data };

                return [...conversations, conversation]
            })
        });

    }, [])

    React.useEffect(() => {
        socket.on('deleteMessage', data => {
            // setMessages(messages => messages.filter(message => message?._id !== data?._id))
        })
    }, [])
    

  return (
    <MessagesContext.Provider value={{ 
        loading,
        conversations,
        sendMessage, removeMessage
    }} >
        {children}
    </MessagesContext.Provider>
  )
}

export default MessagesContext
