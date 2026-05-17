'use client';

import { createContext, useContext, useState } from 'react';
import ChatEkrani from '@/components/chat/ChatEkrani';
import DestekWidget from '@/components/ui/DestekWidget';

interface ChatContextValue {
  chatAcik: boolean;
  setChatAcik: (v: boolean) => void;
}

export const ChatContext = createContext<ChatContextValue>({
  chatAcik: false,
  setChatAcik: () => {},
});

export function useChatContext() {
  return useContext(ChatContext);
}

export default function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chatAcik, setChatAcik] = useState(false);

  return (
    <ChatContext.Provider value={{ chatAcik, setChatAcik }}>
      {children}
      <ChatEkrani isOpen={chatAcik} onClose={() => setChatAcik(false)} />
      <DestekWidget chatAcik={chatAcik} />
    </ChatContext.Provider>
  );
}
