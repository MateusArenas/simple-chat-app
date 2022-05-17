import React from "react";
import api from "../modules/api";
import socket from "../modules/socket";
import AuthContext from "./auth";
import uuid from 'react-native-uuid';
import ConversationsContext, { conversationData } from "./conversations";

export class SimpleSearching {
    data: any[];
    constructor(data: any[]) {  // Constructor
        this.data = data;
    }

    find (where: any) {
        return this.data?.filter(item => {
            return Object?.keys(where)
            ?.map(key => {
                
                let query = where?.[key]
    
                if (typeof where?.[key] === 'object') {
                    if (!Array.isArray(where?.[key])) {
                        if (query?.$in) {
                            return query?.$in?.find(q => q === (item?.[key]?._id || item?.[key]))
                        } else {
                        }
                    } 
                }
                
                let dinamc = item?.[key];
                if (typeof item?.[key] === 'object') {
                    if (!Array.isArray(item?.[key])) {
                        // if (dinamc?.$in) {
                            // return dinamc?.$in?.find(field => field === where?.[key])
                        // } else {
                            dinamc = dinamc?._id
                            // }
                        } else {
                            return dinamc?.find(field => (field?._id || field) === where?.[key] )
                        }
                    }

                return dinamc === where?.[key]
            })
            ?.reduce((acc, val) => acc&&val, true)
        })
    }

    findOne (where: any) {
        return this.data?.find(item => {
            return Object?.keys(where)
            ?.map(key => {
                
                let query = where?.[key]
    
                if (typeof where?.[key] === 'object') {
                    if (!Array.isArray(where?.[key])) {
                        if (query?.$in) {
                            return query?.$in?.find(q => q === (item?.[key]?._id || item?.[key]))
                        } else {
                        }
                    } 
                }
                
                let dinamc = item?.[key];
                if (typeof item?.[key] === 'object') {
                    if (!Array.isArray(item?.[key])) {
                        // if (dinamc?.$in) {
                            // return dinamc?.$in?.find(field => field === where?.[key])
                        // } else {
                            dinamc = dinamc?._id
                            // }
                        } else {
                            return dinamc?.find(field => (field?._id || field) === where?.[key] )
                        }
                    }

                return dinamc === where?.[key]
            })
            ?.reduce((acc, val) => acc&&val, true)
        })
    }
}

export interface messageData {
    _id?: string
    self: boolean
    outstanding?: string
    content: string
    conversations: Array<conversationData>
    group: any
    direct: any
}

interface MessagesContextData {
    loading: boolean
    // news: number
    messages: Array<messageData>
    sendMessage: (message: any, extra: any) => any
    removeMessage: (id: string) => any
}

const MessagesContext = React.createContext<MessagesContextData>({} as MessagesContextData)

export const MessagesProvider: React.FC = ({ children }) => {
    const { user, signed } = React.useContext(AuthContext)

    const [loading, setLoading] = React.useState<boolean>(false)

    // const [conversations, setConversations] = React.useState<Array<conversationData>>([] as Array<conversationData>);

    const [messages, setMessages] = React.useState<Array<messageData>>([] as Array<messageData>);

    // const [notifications, setNotifications] = React.useState<number>(0);
    
    // const news = React.useMemo(() => conversations?.reduce((acc, conversation) => acc+conversation?.news, 0), [conversations])

    const { setConversations } = React.useContext(ConversationsContext)

    function sendMessage (message: any, extra: any) {
        if (message?.content?.length > 0) {
            
            message.outstanding = uuid.v4();
            
            socket.emit('sendMessage', { ...message })  
            
            message.self = true;
            message.createdAt = new Date();
            message.user = user
            message.visualized = true;
            if (message?.direct) {
                message.conversations = [{ direct: { _id: message?.direct } }];
                message.direct = { _id: message?.direct };
            } else if (message?.group) {
                message.conversations = [{ group: { _id: message?.group } }];
                message.group = { _id: message?.group };
            }

            setMessages(messages => [message, ...messages])

            
            setConversations(conversations => {
                const lastMessage = message

                const Conversation = new SimpleSearching(conversations)
                
                const conversation = Conversation?.findOne({ direct: message?.direct?._id, group: message?.group?._id })

                if (conversation) {
                    conversation.lastMessage = lastMessage
                    return [conversation, ...conversations?.filter(item => item?._id !== conversation?._id)]
                }

                return [{ user, news: 0, direct: message?.direct, group: message?.group, lastMessage, messages: [] }, ...conversations]
            })         
        }
    }

    function removeMessage (id: string) {
        socket.emit('removeMessage', { id })
        // setMessages(messages => messages.filter(message => message?._id !== id))
    }

    function handleReconnect () {
        messages?.forEach(message => {
            if (!message?._id) {
                socket.emit('sendMessage', { ...message })  
            }
        })
    }


    function handleReceivedMessage (message: messageData) {
        // essa parte é a implementação da inserção da mensagen
        setMessages(messages => {
            const Message = new SimpleSearching(messages)

            const existsOutstandingMessage = Message.findOne({ outstanding: message?.outstanding })

            if (existsOutstandingMessage) {
                return messages?.map(item => {
                    if (item?.outstanding === existsOutstandingMessage?.outstanding) {
                        return message;
                    }
                    return item
                })
            } 

            return [message, ...messages]
        })

        // essa parte é a implementação da inserção da lastMessage e news em uma conversa
        setConversations(conversations => {
            const MessageConversation = new SimpleSearching(message?.conversations)
            
            const existsConversation = MessageConversation.findOne({ _id: { $in: conversations?.map(conversation => conversation?._id) } })

            if (existsConversation) {
                return conversations?.map(conversation => {
                    if (MessageConversation.findOne({ _id: conversation?._id })) {
                        if (!message?.self) {
                            conversation.news++;
                        }
                        conversation.lastMessage = message
                    }
                    return conversation;
                })
            }

            return conversations
        })
    }

    function handleReceivedMessageReader ({ message, reader }: { message: messageData, reader: any  }) {

        setMessages(messages => messages?.map(item => {
            if (item?._id === message?._id) {
                item.readers.push(reader)
                item.read = item?.receivers?.map(receiver => 
                    item?.readers?.find(reader => ((receiver?._id || receiver) === (reader?._id || reader) ))
                )?.reduce((acc, cond) => acc&&cond, true)
                item.visualized = true;
                // conversation.news--;
            }

            return item
        }))

        setConversations(conversations => {
            const MessageConversation = new SimpleSearching(message?.conversations)

            const existsConversation = MessageConversation.findOne({ _id: { $in: conversations?.map(conversation => conversation?._id) } })

            if (existsConversation) {
                return conversations?.map(conversation => {
                    if (MessageConversation.findOne({ _id: conversation?._id })) {
                        conversation.news--;
                        if (conversation.lastMessage?._id === message?._id) {
                            conversation.lastMessage = message
                        }
                    }
                    return conversation;
                })
            }

            return conversations
        })
    }

    React.useEffect(() => { 
        socket.on('reconnect', handleReconnect)
        socket.on('receivedMessage', handleReceivedMessage)
        socket.on('receivedMessageReader', handleReceivedMessageReader)
        return () => {
            socket.off("reconnect", handleReconnect);
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
        // conversations, news,
        messages,
        sendMessage, removeMessage,
    }} >
        {children}
    </MessagesContext.Provider>
  )
}

export default MessagesContext
