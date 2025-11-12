import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';
import { MessageList } from '../components/MessageList';
import { MessageInput } from '../components/MessageInput';

export const ChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { conversations, sendMessage, createConversation } = useChat();

  const conversation = conversations.find(conv => conv.id === id);

  useEffect(() => {
    // If no conversation exists, create a new one
    if (!id) {
      const newId = createConversation();
      navigate(`/chat/${newId}`, { replace: true });
    }
  }, [id, createConversation, navigate]);

  const handleSendMessage = (content: string) => {
    if (id) {
      sendMessage(id, content);
    }
  };

  if (!conversation && id) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-semibold mb-2">Conversa não encontrada</h2>
          <p className="text-gray-500 mb-4">Esta conversa pode ter sido excluída</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      <MessageList messages={conversation?.messages || []} />
      <MessageInput onSend={handleSendMessage} />
    </div>
  );
};
