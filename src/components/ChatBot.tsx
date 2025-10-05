import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface Message {
    id: string;
    text: string;
    isBot: boolean;
    timestamp: Date;
}

const dummyResponses = [
    "I'd be happy to help you with that!",
    "That's an interesting question. Let me explain...",
    "Based on what you're asking, I think...",
    "Here's what I know about that topic...",
    "I understand your question. Here's my response..."
];

const ChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: "Hello! I'm your AI assistant. How can I help you today?",
            isBot: true,
            timestamp: new Date()
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            isBot: false,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsTyping(true);

        // Simulate typing delay
        setTimeout(() => {
            // Get random response from dummy responses
            const randomResponse = dummyResponses[Math.floor(Math.random() * dummyResponses.length)];
            
            // Add bot response
            const botMessage: Message = {
                id: Date.now().toString(),
                text: randomResponse,
                isBot: true,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
        }, 1000); // 1 second typing delay
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-all duration-200 ease-in-out"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-96 h-[32rem] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-200">
                    {/* Header */}
                    <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
                        <h3 className="font-semibold">AI Assistant</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:text-gray-200"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                            >
                                <div
                                    className={`max-w-[75%] rounded-lg p-3 backdrop-blur-sm ${
                                        message.isBot
                                            ? 'bg-blue-50/70 text-gray-800 border border-blue-100'
                                            : 'bg-blue-600 text-white shadow-lg'
                                    }`}
                                >
                                    <p className="text-sm">{message.text}</p>
                                    <p className="text-xs mt-1 opacity-70">
                                        {message.timestamp.toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-blue-50/70 backdrop-blur-sm border border-blue-100 rounded-lg p-3">
                                    <p className="text-sm">typing...</p>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-blue-100 p-4 bg-white/50 backdrop-blur-sm">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSendMessage();
                                    }
                                }}
                                placeholder="Type your message..."
                                className="flex-1 bg-blue-50/50 border border-blue-100 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all backdrop-blur-sm"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputText.trim()}
                                className="bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-200 transition-all"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBot;