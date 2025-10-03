"use client";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

interface Message {
  id: number;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm WasteWise Assistant. How can I help you today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const getBotResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("schedule") || lowerMessage.includes("pickup")) {
      return "You can check your waste collection schedule in the Schedules section. Is there a specific day you're asking about?";
    } else if (lowerMessage.includes("report") || lowerMessage.includes("issue")) {
      return "To report a waste issue, go to the Reports section and fill out the form with a description, location, and photo if possible.";
    } else if (lowerMessage.includes("location") || lowerMessage.includes("find")) {
      return "You can find waste collection points and facilities using our Locators feature. What type of location are you looking for?";
    } else if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return "Hello! I'm here to help with waste management questions. What would you like to know?";
    } else if (lowerMessage.includes("help")) {
      return "I can help you with:\n• Waste collection schedules\n• Reporting waste issues\n• Finding collection locations\n• General waste management tips";
    } else {
      return "I understand you're asking about waste management. Could you be more specific? I can help with schedules, reports, locations, or general information.";
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const botResponse: Message = {
        id: Date.now() + 1,
        text: getBotResponse(inputValue),
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <>
      <style jsx>{`
        .chatTrigger {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 60px;
          height: 60px;
          background: #047857;
          border: none;
          border-radius: 50%;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(4, 120, 87, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          z-index: 1000;
        }

        .chatTrigger:hover {
          background: #065f46;
          transform: scale(1.1);
          box-shadow: 0 6px 25px rgba(4, 120, 87, 0.4);
        }

        .chatPanel {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 350px;
          height: 500px;
          background: white;
          border-radius: 1.2rem;
          box-shadow: 0 8px 32px rgba(4, 120, 87, 0.15);
          display: flex;
          flex-direction: column;
          z-index: 1001;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }

        .chatHeader {
          background: #047857;
          color: white;
          padding: 1rem 1.2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 1.2rem 1.2rem 0 0;
        }

        .botInfo {
          display: flex;
          align-items: center;
          font-weight: 600;
        }

        .botName {
          font-size: 1.1rem;
        }

        .closeButton {
          background: none;
          border: none;
          color: white;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0.2rem;
          border-radius: 0.3rem;
          transition: background 0.2s ease;
        }

        .closeButton:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .messagesArea {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          background: white;
        }

        .message {
          display: flex;
          flex-direction: column;
          max-width: 80%;
        }

        .botMessage {
          align-self: flex-start;
        }

        .userMessage {
          align-self: flex-end;
        }

        .messageContent {
          padding: 0.7rem 1rem;
          border-radius: 1rem;
          font-size: 0.95rem;
          line-height: 1.4;
          white-space: pre-line;
          border: 1px solid #d1d5db;
        }

        .botMessage .messageContent {
          background: white;
          color: #374151;
          border-bottom-left-radius: 0.3rem;
        }

        .userMessage .messageContent {
          background: #047857;
          color: white;
          border-bottom-right-radius: 0.3rem;
          border-color: #047857;
        }

        .messageTime {
          font-size: 0.75rem;
          color: #9ca3af;
          margin-top: 0.2rem;
          padding: 0 0.3rem;
        }

        .userMessage .messageTime {
          text-align: right;
        }

        .typingIndicator {
          display: flex;
          gap: 0.2rem;
          align-items: center;
        }

        .typingIndicator span {
          width: 6px;
          height: 6px;
          background: #9ca3af;
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typingIndicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typingIndicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
          }
          30% {
            transform: translateY(-10px);
          }
        }

        .inputArea {
          display: flex;
          padding: 1rem;
          gap: 0.5rem;
          background: white;
          border-top: 1px solid #e5e7eb;
        }

        .messageInput {
          flex: 1;
          padding: 0.7rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 1.5rem;
          outline: none;
          font-size: 0.95rem;
          transition: border-color 0.2s ease;
          background: white;
          color: #374151;
        }

        .messageInput:focus {
          border-color: #047857;
        }

        .sendButton {
          background: #047857;
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease;
          font-size: 0.9rem;
        }

        .sendButton:hover {
          background: #065f46;
        }

        .sendButton:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .chatPanel {
            width: calc(100vw - 2rem);
            height: calc(100vh - 4rem);
            bottom: 1rem;
            right: 1rem;
            left: 1rem;
          }
          
          .chatTrigger {
            bottom: 1.5rem;
            right: 1.5rem;
            width: 50px;
            height: 50px;
            font-size: 1.2rem;
          }
        }

        @media (max-width: 480px) {
          .chatPanel {
            width: calc(100vw - 1rem);
            height: calc(100vh - 2rem);
            bottom: 0.5rem;
            right: 0.5rem;
            left: 0.5rem;
            border-radius: 1rem;
          }
          
          .chatHeader {
            border-radius: 1rem 1rem 0 0;
          }
        }
      `}</style>

      {/* Trigger Button */}
      <button
        className="chatTrigger"
        onClick={() => setIsOpen(true)}
        style={{ display: isOpen ? "none" : "flex" }}
      >
        <i className="fa-solid fa-message"></i>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="chatPanel">
          {/* Header */}
          <div className="chatHeader">
            <div className="botInfo">
              <i className="fa-solid fa-robot" style={{ color: "white", marginRight: "0.5rem" }}></i>
              <span className="botName">WasteWise Assistant</span>
            </div>
            <button
              className="closeButton"
              onClick={() => setIsOpen(false)}
            >
              <i className="fa-solid fa-times"></i>
            </button>
          </div>

          {/* Messages Area */}
          <div className="messagesArea">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.isBot ? "botMessage" : "userMessage"}`}
              >
                <div className="messageContent">
                  {message.text}
                </div>
                <div className="messageTime">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message botMessage">
                <div className="messageContent">
                  <div className="typingIndicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="inputArea">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="messageInput"
            />
            <button
              onClick={handleSendMessage}
              className="sendButton"
              disabled={!inputValue.trim()}
            >
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function ConditionalChatbot() {
  const pathname = usePathname();
  
  // Don't show chatbot on login page
  if (pathname === '/login') {
    return null;
  }
  
  return <Chatbot />;
}