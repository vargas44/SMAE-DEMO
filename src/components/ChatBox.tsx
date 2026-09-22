"use client";

import { FormEvent, useEffect, useState } from "react";

type Message = {
  id: string;
  body: string;
  createdAt: string;
  fromUser: { id: string; name: string; role: string };
};

export function ChatBox({ withUserId }: { withUserId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch(`/api/messages?with=${withUserId}`);
    if (!res.ok) return;
    setMessages(await res.json());
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, [withUserId]);

  async function send(e: FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId: withUserId, body }),
    });
    if (!res.ok) {
      setError("No se pudo enviar");
      return;
    }
    setBody("");
    await load();
  }

  return (
    <div className="su-card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ maxHeight: 420, overflowY: "auto", padding: 18 }} className="su-stack">
        {messages.map((m) => (
          <div
            key={m.id}
            className="su-inset-box"
            style={{ borderRadius: 12, padding: "12px 14px" }}
          >
            <p className="su-label">
              {m.fromUser.name} · {new Date(m.createdAt).toLocaleString("es-AR")}
            </p>
            <p style={{ margin: "8px 0 0", lineHeight: 1.5 }}>{m.body}</p>
          </div>
        ))}
        {messages.length === 0 ? (
          <p style={{ color: "var(--su-ink-muted)" }}>Sin mensajes todavía.</p>
        ) : null}
      </div>
      <form
        onSubmit={send}
        style={{
          display: "flex",
          gap: 8,
          padding: 14,
          background: "var(--su-surface-muted)",
        }}
      >
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escribí un mensaje…"
          className="su-field"
          style={{ flex: 1 }}
          required
        />
        <button type="submit" className="su-btn su-btn--primary">
          Enviar
        </button>
      </form>
      {error ? (
        <p style={{ padding: "0 14px 14px", color: "var(--su-danger)" }}>{error}</p>
      ) : null}
    </div>
  );
}
