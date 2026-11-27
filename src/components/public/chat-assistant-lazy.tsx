"use client";

import dynamic from "next/dynamic";

// Muat widget chat secara lazy di klien agar tidak menambah beban JS awal & transisi halaman.
const ChatAssistant = dynamic(
  () => import("@/components/public/chat-assistant").then((mod) => mod.ChatAssistant),
  { ssr: false }
);

export function ChatAssistantLazy() {
  return <ChatAssistant />;
}
