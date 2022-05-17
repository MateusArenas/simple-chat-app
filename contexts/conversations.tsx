import React from "react";
import api from "../modules/api";
import socket from "../modules/socket";
import AuthContext from "./auth";
import { messageData, SimpleSearching } from "./messages";

export interface conversationData {
    _id?: string
    user: any
    group: { _id: string }
    direct: { _id: string }
    messages: Array<messageData>
    lastMessage: messageData
    news: number
}

interface ConversationsContextData {
    loading: boolean
    conversations: Array<conversationData>
    setConversations: React.Dispatch<React.SetStateAction<conversationData[]>>
    sendGroup: (group: { name: string, members: string[] }) => any
    handleRemoveConversation: (id: string) => any
}

const ConversationsContext = React.createContext<ConversationsContextData>({} as ConversationsContextData)

export const ConversationsProvider: React.FC = ({ children }) => {
    const { user, signed } = React.useContext(AuthContext)

    const [loading, setLoading] = React.useState<boolean>(false)

    const [conversations, setConversations] = React.useState<Array<conversationData>>([] as Array<conversationData>);

    // const news = React.useMemo(() => conversations?.reduce((acc, conversation) => acc+conversation?.news, 0), [conversations])

    React.useEffect(() => {
        if (signed) {
            (async () => {
                setLoading(true)
                try {
                    const response = await api.get(`/users/${user?._id}/conversations`);
                    setConversations(response?.data?.results)
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

    async function handleRemoveConversation (id: string) {
        try {
            const { data: conversation } = await api.delete(`/conversations/${id}`);
            setConversations(conversations => conversations?.filter(item => item?._id !== conversation?._id))
        } catch (err) {
            console.log(err);
        }
    }

    function handleReceivedConversation (conversation: conversationData) {
        setConversations(conversations => {
            conversation.messages = []

            const Conversation = new SimpleSearching(conversations)

            const existsConversation = Conversation?.findOne({ direct: conversation?.direct?._id, group: conversation?.group?._id })

            if (existsConversation) {
                return conversations?.map(conv => {
                    if (conv?._id === existsConversation?._id) {
                        return conversation
                    }

                    return conv
                })
            }

            return [{ ...conversation, messages: [] }, ...conversations]
        })
    }

    React.useEffect(() => { 
        // socket.on('reconnect', handleReconnect)
        socket.on('receivedConversation', handleReceivedConversation)
        return () => {
            // socket.off("reconnect", handleReconnect);
            socket.off('receivedConversation', handleReceivedConversation);
        }
    }, [])
    

  return (
    <ConversationsContext.Provider value={{ 
        loading,
        conversations, setConversations,
        sendGroup,
        handleRemoveConversation
    }} >
        {children}
    </ConversationsContext.Provider>
  )
}

export default ConversationsContext
