import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '../contexts/ChatContext';
import { useTheme } from '../contexts/ThemeContext';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { createConversation } = useChat();
  const { isDark } = useTheme();

  const handleStartChat = () => {
    const id = createConversation();
    navigate(`/chat/${id}`);
  };

  const suggestions = [
    '💡 Explique um conceito complexo',
    '📝 Ajude-me a escrever um texto',
    '🔍 Responda minhas perguntas',
    '🎨 Seja criativo comigo',
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-3xl w-full text-center">
        <div className="mb-8">
          <div className="text-7xl mb-6">🤖</div>
          <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Bem-vindo ao Chat AI
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Converse com inteligência artificial e obtenha respostas instantâneas
          </p>
        </div>

        <button
          onClick={handleStartChat}
          className={`px-8 py-4 rounded-xl font-semibold text-lg mb-12 transition-all transform hover:scale-105
            ${isDark 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            } shadow-lg hover:shadow-xl`}
        >
          Iniciar Nova Conversa
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={handleStartChat}
              className={`p-6 rounded-xl text-left transition-all hover:scale-105
                ${isDark 
                  ? 'bg-gray-800 hover:bg-gray-750 text-white' 
                  : 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-200'
                } shadow-md hover:shadow-lg`}
            >
              <div className="font-medium">{suggestion}</div>
            </button>
          ))}
        </div>

        <div className={`mt-12 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          💡 Dica: Use a barra lateral para acessar suas conversas anteriores
        </div>
      </div>
    </div>
  );
};
