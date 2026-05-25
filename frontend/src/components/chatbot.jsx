import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE_URL } from "../config/api";

// define Brand/UX Constants for easy tuning
const COLORS = {
  primary: "#2e7d32",
  primaryLight: "#66bb6a",
  botBg: "#e8f5e9", // Very light green for bot
  botText: "#1b5e20",
  userBg: "#1b5e20", // Dark green for user
  userText: "#ffffff",
  glassBg: "rgba(255, 255, 255, 0.4)", // Heavy glass effect
  glassBorder: "rgba(102, 187, 106, 0.5)",
};

export default function Chatbot() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [isIdleBouncing, setIsIdleBouncing] = useState(true);
  const chatEndRef = useRef(null);
  const [jump, setJump] = useState(false);

  // Initialize first message on load or language change
  useEffect(() => {
    if (messages.length <= 1) {
      setMessages([{ type: "bot", text: t('chatbot.title') + " 👋" }]);
    }
  }, [i18n.language]);

  useEffect(() => {
    const interval = setInterval(() => {
      setJump(true);
      setTimeout(() => setJump(false), 300);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // 1. 🔥 Inject Keyframe Animations dynamically
  useEffect(() => {
    const cssKeyframes = `
      @keyframes agromitra-pulse-glow {
        0% { box-shadow: 0 0 0 0 rgba(102, 187, 106, 0.6); }
        70% { box-shadow: 0 0 15px 25px rgba(102, 187, 106, 0); }
        100% { box-shadow: 0 0 0 0 rgba(102, 187, 106, 0); }
      }
      @keyframes agromitra-idle-bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0) scale(1); }
        40% { transform: translateY(-15px) scale(1.05); }
        60% { transform: translateY(-8px) scale(1.02); }
      }
      @keyframes agromitra-message-entry {
        from { opacity: 0; transform: translateY(15px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes agromitra-typing-dot {
        0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
        40% { transform: translateY(-6px); opacity: 1; }
      }
      @keyframes agromitra-online-pulse {
        0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
        70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(76, 175, 80, 0); }
        100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
      }
      
      /* Custom scrollbar for glass effect */
      .agromitra-chat-area::-webkit-scrollbar { width: 4px; }
      .agromitra-chat-area::-webkit-scrollbar-track { background: transparent; }
      .agromitra-chat-area::-webkit-scrollbar-thumb { background: rgba(46, 125, 50, 0.2); border-radius: 10px; }
      .agromitra-chat-area::-webkit-scrollbar-thumb:hover { background: rgba(46, 125, 50, 0.5); }
      
      .quick-action-btn {
        transition: all 0.2s ease-in-out;
      }
      .quick-action-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(46, 125, 50, 0.15);
        background: #e8f5e9 !important;
        border-color: #2e7d32 !important;
      }
      .chat-send-btn {
        transition: all 0.2s ease-in-out;
      }
      .chat-send-btn:hover:not(:disabled) {
        transform: scale(1.05);
        box-shadow: 0 4px 15px rgba(0, 230, 118, 0.4);
      }
      .chat-send-btn:active:not(:disabled) {
        transform: scale(0.95);
      }
    `;
    const styleTag = document.createElement("style");
    styleTag.type = "text/css";
    styleTag.innerHTML = cssKeyframes;
    document.head.appendChild(styleTag);
    return () => document.head.removeChild(styleTag);
  }, []);

  // 2. 🔥 Auto Scroll
  useEffect(() => {
    if (visible) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typing, visible]);

  useEffect(() => {
    if (open || messages.length > 1) {
      setIsIdleBouncing(false);
    } else {
      const timer = setTimeout(() => setIsIdleBouncing(true), 20000);
      return () => clearTimeout(timer);
    }
  }, [open, messages]);

  // 3. 🔥 SEND MESSAGE
  const sendMessage = async (textParam) => {
    const text = textParam || input;
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { type: "user", text }]);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, lang: i18n.language }),
      });

      if (!res.ok) throw new Error("API Network issues");
      const data = await res.json();

      const responseDelay = data.reply.length > 50 ? 1200 : 600;
      setTimeout(() => {
        setMessages((prev) => [...prev, { type: "bot", text: data.reply }]);
        setTyping(false);
      }, responseDelay);

    } catch (error) {
      console.error("AgroMitra Chat Error:", error);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { type: "bot", text: t('chatbot.serverError') },
        ]);
        setTyping(false);
      }, 1000);
    }
  };

  const getQuickActions = () => ({
    weather: t('chatbot.weather'),
    price: t('chatbot.price'),
    fertilizer: t('chatbot.fertilizer'),
    disease: t('chatbot.disease')
  });

  // Bot & User Avatar Components
  const BotAvatar = () => (
    <div style={{
      width: 36, height: 36, borderRadius: "50%", background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 2px 5px rgba(0,0,0,0.05)", border: "1px solid rgba(46,125,50,0.1)", flexShrink: 0
    }}>
      <span style={{ fontSize: 18 }}>🌿</span>
    </div>
  );

  const UserAvatar = () => (
    <div style={{
      width: 36, height: 36, borderRadius: "50%", background: "#1b5e20", display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 2px 5px rgba(0,0,0,0.1)", flexShrink: 0
    }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    </div>
  );

  // UI Structure
  return (
    <>
      {/* 🌿 FLOAT BUTTON */}
      <div
        onClick={() => {
          if (!open) {
            setOpen(true);
            setTimeout(() => setVisible(true), 10);
          } else {
            setVisible(false);
            setTimeout(() => setOpen(false), 300);
          }
        }}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${COLORS.primaryLight}, ${COLORS.primary})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 28,
          cursor: "pointer",
          zIndex: 9999,
          boxShadow: jump ? "0 0 25px rgba(102, 187, 106, 0.8)" : "0 8px 20px rgba(0,0,0,0.2)",
          transform: jump ? "translateY(-12px)" : "translateY(0)",
          transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease",
          animation: (!open && isIdleBouncing) ? "agromitra-pulse-glow 3s infinite" : "none",
        }}
      >
        <span style={{ 
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", 
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            fontSize: open ? 24 : 28 
        }}>
          {open ? "✕" : "🌿"}
        </span>
      </div>

      {/* 💬 CHATBOX UI (Glassmorphism & WhatsApp Style) */}
      {open && (
        <div

          style={{
            position: "fixed",
            bottom: 100,
            right: 24,
            width: 380,
            maxWidth: "calc(100vw - 48px)",
            height: "75vh",
            maxHeight: 650,
            minHeight: 450,
            borderRadius: 24,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: COLORS.glassBg,
            backdropFilter: "blur(30px)",
            WebkitBackdropFilter: "blur(30px)",
            border: `2px solid ${COLORS.glassBorder}`,
            boxShadow: "0 20px 40px rgba(0,0,0,0.15), 0 0 40px rgba(102,187,106,0.1)",
            zIndex: 9998,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0) scale(1)" : "translateY(20px) scale(0.9)",
            transformOrigin: "bottom right",
            transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* HEADER (Matches Reference Image) */}
          <div
            style={{
              padding: "20px 20px 10px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              borderBottom: "1px solid rgba(46,125,50,0.1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 24 }}>🌿</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#1b5e20", letterSpacing: "-0.5px" }}>{t('chatbot.title')}</span>
            </div>
            
            <div style={{ 
              background: "rgba(232, 245, 233, 0.8)", 
              padding: "4px 10px", 
              borderRadius: "20px",
              display: "flex",
              alignItems: "center",
              gap: 6,
              border: "1px solid rgba(76,175,80,0.2)"
            }}>
              <div style={{
                width: 8, height: 8, background: "#4caf50", borderRadius: "50%",
                animation: "agromitra-online-pulse 2s infinite"
              }}></div>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#2e7d32" }}>{t('chatbot.online')}</span>
            </div>
          </div>

          <div
            className="agromitra-chat-area"
            style={{
              flex: 1,
              padding: "20px 16px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* Quick Actions Intro Message */}
            {messages.length === 1 && (
              <div style={{ display: "flex", gap: 10, animation: "agromitra-message-entry 0.4s forwards", animationDelay: "0.2s", opacity: 0 }}>
                <BotAvatar />
                <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: "75%" }}>
                  <div style={{
                    background: COLORS.botBg, color: COLORS.botText, padding: "12px 16px",
                    fontSize: 15, lineHeight: 1.4, borderRadius: "16px 16px 16px 4px",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)", fontWeight: 500
                  }}>
                    {t('chatbot.intro')}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {Object.entries(getQuickActions()).map(([key, value]) => (
                      <button
                        key={key}
                        className="quick-action-btn"
                        onClick={() => sendMessage(value)}
                        style={{
                          padding: "8px 12px", borderRadius: 8, border: "1px solid #4caf50",
                          background: "rgba(255,255,255,0.6)", color: "#1b5e20",
                          fontWeight: 600, fontSize: 13, cursor: "pointer", backdropFilter: "blur(4px)"
                        }}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 10,
                  alignSelf: msg.type === "user" ? "flex-end" : "flex-start",
                  flexDirection: msg.type === "user" ? "row-reverse" : "row",
                  maxWidth: "90%",
                  animation: "agromitra-message-entry 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                }}
              >
                {msg.type === "bot" ? <BotAvatar /> : <UserAvatar />}
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 11, color: "rgba(0,0,0,0.5)", alignSelf: msg.type === "user" ? "flex-end" : "flex-start", marginLeft: 4, marginRight: 4 }}>
                    {msg.type === "bot" ? t('chatbot.bot') : t('chatbot.you')}
                  </span>
                  <div
                    style={{
                      background: msg.type === "user" ? COLORS.userBg : COLORS.botBg,
                      color: msg.type === "user" ? COLORS.userText : COLORS.botText,
                      padding: "12px 16px",
                      fontSize: 15,
                      lineHeight: 1.4,
                      boxShadow: msg.type === "user" ? "0 4px 15px rgba(27, 94, 32, 0.2)" : "0 2px 5px rgba(0,0,0,0.05)",
                      borderRadius: msg.type === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      fontWeight: msg.type === "bot" ? 500 : 400
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}

            {typing && (
              <div style={{ display: "flex", gap: 10, alignSelf: "flex-start", animation: "agromitra-message-entry 0.3s forwards" }}>
                <BotAvatar />
                <div style={{
                  background: COLORS.botBg,
                  padding: "14px 18px",
                  borderRadius: "16px 16px 16px 4px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                  display: "flex",
                  gap: "6px",
                  alignItems: "center"
                }}>
                  <div style={{ width: 8, height: 8, background: "#4caf50", borderRadius: "50%", animation: "agromitra-typing-dot 1.4s infinite ease-in-out" }}></div>
                  <div style={{ width: 8, height: 8, background: "#4caf50", borderRadius: "50%", animation: "agromitra-typing-dot 1.4s infinite ease-in-out 0.2s" }}></div>
                  <div style={{ width: 8, height: 8, background: "#4caf50", borderRadius: "50%", animation: "agromitra-typing-dot 1.4s infinite ease-in-out 0.4s" }}></div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* INPUT AREA */}
          <div
            style={{
              padding: "16px",
              background: "rgba(255, 255, 255, 0.3)",
              borderTop: "1px solid rgba(255,255,255,0.4)",
              display: "flex",
              gap: 12,
              backdropFilter: "blur(10px)",
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('chatbot.placeholder')}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              style={{
                flex: 1,
                padding: "14px 18px",
                borderRadius: 12,
                border: "1px solid rgba(102, 187, 106, 0.4)",
                background: "rgba(255, 255, 255, 0.75)",
                fontSize: 15,
                color: "#1b5e20",
                outline: "none",
                boxShadow: "inset 0 2px 5px rgba(0,0,0,0.02)",
                transition: "all 0.2s",
                fontWeight: 500
              }}
              onFocus={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.95)";
                e.target.style.borderColor = "#4caf50";
                e.target.style.boxShadow = "0 0 0 3px rgba(76, 175, 80, 0.2)";
              }}
              onBlur={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.75)";
                e.target.style.borderColor = "rgba(102, 187, 106, 0.4)";
                e.target.style.boxShadow = "inset 0 2px 5px rgba(0,0,0,0.02)";
              }}
            />

            <button
              className="chat-send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim()}
              style={{
                background: input.trim() ? "#00e676" : "rgba(255,255,255,0.6)",
                color: input.trim() ? "white" : "#9e9e9e",
                border: input.trim() ? "none" : "1px solid rgba(0,0,0,0.1)",
                borderRadius: 12,
                width: 52,
                height: 52,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: input.trim() ? "pointer" : "not-allowed",
                boxShadow: input.trim() ? "0 4px 15px rgba(0, 230, 118, 0.4)" : "none",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "translateX(-2px) translateY(1px)" }}>
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}   
