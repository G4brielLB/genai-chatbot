import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

interface ChatContextType {
  conversations: Conversation[];
  currentConversationId: string | null;
  createConversation: () => string;
  deleteConversation: (id: string) => void;
  sendMessage: (conversationId: string, content: string) => void;
  getCurrentConversation: () => Conversation | undefined;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('conversations');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((conv: any) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
    }
    return [];
  });

  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Save to localStorage whenever conversations change
  React.useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  const createConversation = (): string => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'Nova conversa',
      messages: [],
      createdAt: new Date(),
    };
    setConversations([newConversation, ...conversations]);
    setCurrentConversationId(newConversation.id);
    return newConversation.id;
  };

  const deleteConversation = (id: string) => {
    setConversations(conversations.filter(conv => conv.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(null);
    }
  };

  const sendMessage = (conversationId: string, content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    // Simulate AI response (replace with actual API call later)
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: 'Esta é uma resposta simulada. Integre com o backend FastAPI para obter respostas reais do Gemini.',
      timestamp: new Date(),
    };

    setConversations(conversations.map(conv => {
      if (conv.id === conversationId) {
        const updatedMessages = [...conv.messages, userMessage, aiMessage];
        return {
          ...conv,
          messages: updatedMessages,
          title: conv.messages.length === 0 ? content.slice(0, 30) + '...' : conv.title,
        };
      }
      return conv;
    }));
  };

  const getCurrentConversation = () => {
    return conversations.find(conv => conv.id === currentConversationId);
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      currentConversationId,
      createConversation,
      deleteConversation,
      sendMessage,
      getCurrentConversation,
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
};
