'use client';

import { createContext, useContext, useState } from 'react';
import ChatEkrani from '@/components/chat/ChatEkrani';
import DestekWidget from '@/components/ui/DestekWidget';

interface ChatContextValue {
  chatAcik: boolean;
  setChatAcik: (v: boolean) => void;
  /** Panel'den gelen ön-dolu mesaj. ChatEkrani açıldığında adım 1'e yükler. */
  onAcilMesaj: string;
  setOnAcilMesaj: (v: string) => void;
}

export const ChatContext = createContext<ChatContextValue>({
  chatAcik: false,
  setChatAcik: () => {},
  onAcilMesaj: '',
  setOnAcilMesaj: () => {},
});

export function useChatContext() {
  return useContext(ChatContext);
}

export default function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chatAcik, setChatAcik] = useState(false);
  const [onAcilMesaj, setOnAcilMesaj] = useState('');

  return (
    <ChatContext.Provider value={{ chatAcik, setChatAcik, onAcilMesaj, setOnAcilMesaj }}>
      {children}
      <ChatEkrani isOpen={chatAcik} onClose={() => setChatAcik(false)} />
      <DestekWidget chatAcik={chatAcik} />
    </ChatContext.Provider>
  );
}
