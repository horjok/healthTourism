
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import ChatProvider from "@/components/ui/ChatProvider";
import { DilProvider } from "@/lib/DilContext";
import { DovizProvider } from "@/lib/DovizContext";
import { KullaniciProvider } from "@/lib/KullaniciContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "HealthTour — Sağlık Turizmi Platformu",
  description: "Uçak + Otel + Klinik paketlerini tek yerden keşfet.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <DilProvider>
          <DovizProvider>
            <KullaniciProvider>
              <ChatProvider>
                <Navbar />
                {children}
              </ChatProvider>
            </KullaniciProvider>
          </DovizProvider>
        </DilProvider>
      </body>
    </html>
  );
}