import React from "react";

interface CreateGroupContextData {
    members: string[]
    setMembers: React.Dispatch<React.SetStateAction<string[]>>
    name: string
    setName: React.Dispatch<React.SetStateAction<string>>
}

const CreateGroupContext = React.createContext<CreateGroupContextData>({} as CreateGroupContextData)

export const CreateGroupProvider: React.FC = ({ children }) => {
  const [members, setMembers] = React.useState<Array<string>>([])
  const [name, setName] = React.useState<string>('')

  return (
    <CreateGroupContext.Provider value={{ 
        members,
        setMembers,
        name, setName
    }} >
        {children}
    </CreateGroupContext.Provider>
  )
}

export default CreateGroupContext
