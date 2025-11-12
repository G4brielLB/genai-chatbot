import React, { useState, FormEvent } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled }) => {
  const [message, setMessage] = useState('');
  const { isDark } = useTheme();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`border-t ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'} p-4`}>
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className={`flex items-end gap-2 p-2 rounded-2xl ${
          isDark ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem... (Shift+Enter para nova linha)"
            disabled={disabled}
            rows={1}
            className={`flex-1 resize-none bg-transparent outline-none px-3 py-2 max-h-32
              ${isDark ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'}
              disabled:opacity-50`}
            style={{ minHeight: '40px' }}
          />
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className={`px-4 py-2 rounded-xl font-medium transition-all flex-shrink-0
              ${message.trim() && !disabled
                ? isDark
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                : isDark
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            Enviar
          </button>
        </div>
        <div className={`text-xs text-center mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Pressione Enter para enviar, Shift+Enter para nova linha
        </div>
      </form>
    </div>
  );
};
