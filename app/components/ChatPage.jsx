"use client";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Stethoscope } from "lucide-react";

export default function ChatPage({ d, user, onBack }) {
  const [msgs, setMsgs] = useState([
    { senderId: d._id, senderName: d.name, content: `Hi! I'm ${d.name}, ${d.specialty} specialist at ${d.clinic}. How can I help you today? 😊`, timestamp: new Date() }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const chatId = `${user.id}_${d._id}`;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  // Poll for new messages
  useEffect(() => {
    const poll = setInterval(() => {
      fetch(`/api/messages?chatId=${chatId}`)
        .then(r => r.json())
        .then(data => { if (data.length > 0) setMsgs(data); })
        .catch(() => {});
    }, 5000);
    return () => clearInterval(poll);
  }, [chatId]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const content = input.trim();
    setInput("");
    setLoading(true);

    const newMsg = { chatId, senderId: user.id, senderName: user.name, content, timestamp: new Date() };
    setMsgs(prev => [...prev, newMsg]);

    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMsg),
      });
    } catch {}
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg-primary)" }}>
      {/* Nav */}
      <div className="navbar" style={{ gap: 12 }}>
        <button className="btn-ghost" onClick={onBack}><ArrowLeft size={16} /></button>
        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(124,58,237,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid rgba(124,58,237,0.3)" }}>
          <Stethoscope size={18} color="var(--purple-400)" />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>{d.name}</p>
          <p style={{ margin: 0, fontSize: 11, color: "var(--purple-400)" }}>{d.specialty} · Online</p>
        </div>
        <span className="badge badge-purple" style={{ marginLeft: "auto" }}>Chat</span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px" }}>
        <div style={{ background: "rgba(124,58,237,0.1)", borderRadius: "var(--radius-md)", padding: "10px 14px", marginBottom: 20, textAlign: "center", border: "1px solid rgba(124,58,237,0.2)" }}>
          <p style={{ margin: 0, fontSize: 11, color: "var(--text-secondary)" }}>💬 Chat with {d.name} — ask about symptoms, treatments, or pricing</p>
        </div>

        {msgs.map((m, i) => {
          const isUser = m.senderId === user.id;
          return (
            <div key={i} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 14, gap: 10, alignItems: "flex-end" }}>
              {!isUser && (
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(124,58,237,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Stethoscope size={14} color="var(--purple-400)" />
                </div>
              )}
              <div style={{
                maxWidth: "75%",
                background: isUser ? "var(--gradient-btn)" : "var(--bg-card)",
                border: isUser ? "none" : "1px solid var(--border)",
                borderRadius: isUser ? "var(--radius-lg) var(--radius-lg) 4px var(--radius-lg)" : "var(--radius-lg) var(--radius-lg) var(--radius-lg) 4px",
                padding: "12px 16px",
              }}>
                <p style={{ margin: 0, fontSize: 13, color: isUser ? "#fff" : "var(--text-primary)", lineHeight: 1.6 }}>{m.content}</p>
              </div>
            </div>
          );
        })}

        {loading && (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", marginBottom: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(124,58,237,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Stethoscope size={14} color="var(--purple-400)" />
            </div>
            <div className="glass-card" style={{ borderRadius: "var(--radius-md)", padding: "12px 16px", display: "flex", gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--purple-400)", animation: "bounce 1.2s infinite" }} />
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--purple-400)", animation: "bounce 1.2s infinite 0.2s" }} />
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--purple-400)", animation: "bounce 1.2s infinite 0.4s" }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border)", padding: "12px 16px", display: "flex", gap: 10 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder={`Message ${d.name?.split(" ")[1]}…`}
          className="input" style={{ borderRadius: "var(--radius-lg)" }} />
        <button onClick={send} disabled={!input.trim()} className="btn-primary" style={{ borderRadius: "var(--radius-lg)", width: 48, height: 48, padding: 0, opacity: !input.trim() ? 0.4 : 1 }}>
          <Send size={16} color="#fff" />
        </button>
      </div>
    </div>
  );
}
