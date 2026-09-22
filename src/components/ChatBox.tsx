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
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="max-h-[420px] space-y-2 overflow-y-auto p-4">
        {messages.map((m) => (
          <div key={m.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <p className="text-xs text-slate-500">
              {m.fromUser.name} ·{" "}
              {new Date(m.createdAt).toLocaleString("es-AR")}
            </p>
            <p>{m.body}</p>
          </div>
        ))}
        {messages.length === 0 ? (
          <p className="text-sm text-slate-500">Sin mensajes todavía.</p>
        ) : null}
      </div>
      <form onSubmit={send} className="flex gap-2 border-t border-slate-100 p-3">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escribí un mensaje…"
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
          required
        />
        <button
          type="submit"
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm text-white"
        >
          Enviar
        </button>
      </form>
      {error ? <p className="px-3 pb-3 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
