import React from "react";
import usePersistedState from "../hooks/usePersistedState";
import api from "../modules/api";
import socket from "../modules/socket";
import AuthContext from "./auth";
import uuid from 'react-native-uuid';

interface conversationData {
    _id?: string
    group: { _id: string }
    direct: { _id: string }
    messages: Array<messageData>
    lastMessage: messageData
}

interface messageData {
    _id?: string
    outstanding?: string
    content: string
    conversations: Array<conversationData>
}

interface MessagesContextData {
    loading: boolean
    news: number
    conversations: Array<any>
    sendGroup: (group: { name: string, members: string[] }) => any
    sendMessage: (message: any, extra: any) => any
    removeMessage: (id: string) => any
    handleRemoveConversation: (id: string) => any
}

const MessagesContext = React.createContext<MessagesContextData>({} as MessagesContextData)

export const MessagesProvider: React.FC = ({ children }) => {
    const { user, signed } = React.useContext(AuthContext)

    const [loading, setLoading] = React.useState<boolean>(false)

    const [conversations, setConversations] = React.useState<Array<conversationData>>([] as Array<conversationData>);

    const [messages, setMessages] = React.useState<Array<messageData>>([] as Array<messageData>);

    const [notifications, setNotifications] = React.useState<number>(0);
    
    const news = React.useMemo(() => conversations?.reduce((acc, conversation) => acc+conversation?.news, 0), [conversations])

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


    function sendGroup ({ name, members }: any) {
        socket.emit('sendGroup', { name, members })  
    }

    function sendMessage (message: any, extra: any) {
        if (message?.content?.length > 0) {
            
            message.outstanding = uuid.v4();
            
            socket.emit('sendMessage', { ...message })  
            
            message.self = true;
            message.createdAt = new Date();
            message.user = user
            message.visualized = true;

            setConversations(conversations => {
                const existsConversation = conversations.find(item => 
                    item?.direct?._id === message?.direct && item?.group?._id == message?.group
                )

                if (existsConversation) {
                    return conversations?.map(conversation => {
                        if (conversation?._id === existsConversation?._id) {
                                conversation.messages.unshift(message)
                                conversation.lastMessage = message
                        }
                        return conversation
                    })
                }

                const conversation = {
                    user, direct: { _id: message?.direct }, group: { _id: message?.group }, messages: [message]
                }

                return [...conversations, conversation]
            })         
        }
    }

    function removeMessage (id: string) {
        socket.emit('removeMessage', { id })
        // setMessages(messages => messages.filter(message => message?._id !== id))
    }

    async function handleRemoveConversation (id: string) {
        try {
            const { data: conversation } = await api.delete(`/conversations/${id}`);
            setConversations(conversations => conversations?.filter(item => item?._id !== conversation?._id))
        } catch (err) {
            console.log(err);
        }
    }

    function handleReconnect () {
        conversations?.forEach(conversation => {
            conversation?.messages?.forEach(message => {
                if (!message?._id) {
                    socket.emit('sendMessage', { ...message })  
                }
            })
        })
    }

    function handleReceivedConversation (conversation: conversationData) {
        console.log({ conversation });
        
        setConversations(conversations => {
            const existsConversation = conversations.find(item => 
                item?.direct?._id == conversation?.direct?._id &&  item?.group?._id == conversation?.group?._id
            )

            if (existsConversation) {
                return conversations?.map(conv => {
                    const existsConversation = conversations.find(item => 
                        item?.direct?._id == conv?.direct?._id &&  item?.group?._id == conv?.group?._id
                    )
                    if (existsConversation) {
                        return { ...conversation, messages: [] }
                    }

                    return conv
                })
            }

            return [{ ...conversation, messages: [] }, ...conversations]
        })
    }

    function handleReceivedMessage (message: messageData) {
        setConversations(conversations => {
            const existsConversation = conversations.find(item => message?.conversations?.find(conversation => item?._id === conversation?._id) )

            return conversations?.map(conversation => {
                if (conversation?._id === existsConversation?._id) {
                    const existsOutstandingMessage = conversation.messages?.find(item => item?.outstanding === message?.outstanding)
                    if (existsOutstandingMessage) {

                        conversation.messages = conversation.messages?.map(item => {
                            if (item?.outstanding === existsOutstandingMessage?.outstanding) {
                                return message;
                            }
                            return item
                        })
                    } else {
                        conversation.messages.unshift(message)
                        if (!message?.self) {
                            conversation.news++;
                        }
                        conversation.lastMessage = message
                    }
                }
                return conversation
            })
        })
    }

    function handleReceivedMessageReader ({ message, reader }: { message: messageData, reader: any  }) {
        setConversations(conversations => {
            const existsConversation = conversations.find(item => message?.conversations?.find(conversation => item?._id === conversation?._id) )

            return conversations?.map(conversation => {
                if (conversation?._id === existsConversation?._id) {

                        conversation.messages = conversation.messages?.map(item => {
                            if (item?._id === message?._id) {
                                item.readers.push(reader)
                                item.read = item?.receivers?.map(receiver => 
                                    item?.readers?.find(reader => ((receiver?._id || receiver) === (reader?._id || reader) ))
                                )?.reduce((acc, cond) => acc&&cond, true)
                                item.visualized = true;
                                conversation.news--;
                            }
                            return item
                        })
                }
                return conversation
            })
        })
    }

    React.useEffect(() => { 
        socket.on('reconnect', handleReconnect)
        socket.on('receivedConversation', handleReceivedConversation)
        socket.on('receivedMessage', handleReceivedMessage)
        socket.on('receivedMessageReader', handleReceivedMessageReader)
        return () => {
            socket.off("reconnect", handleReconnect);
            socket.off('receivedConversation', handleReceivedConversation);
            socket.off('receivedMessage', handleReceivedMessage);
            socket.off('receivedMessageReader', handleReceivedMessageReader)
        }
    }, [])

    React.useEffect(() => {
        socket.on('deleteMessage', data => {
            // setMessages(messages => messages.filter(message => message?._id !== data?._id))
        })
    }, [])
    

  return (
    <MessagesContext.Provider value={{ 
        loading,
        conversations, news,
        sendGroup,
        sendMessage, removeMessage,
        handleRemoveConversation
    }} >
        {children}
    </MessagesContext.Provider>
  )
}

export default MessagesContext
