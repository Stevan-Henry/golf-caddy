import "./globals.css";
import { Metadata, Viewport } from "next";
import { Fredoka } from "next/font/google";
import BottomNav from "@/components/ui/BottomNav";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Golf Caddy",
  description: "Your smart golf companion",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#111827",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${fredoka.variable}`}>
      <body className="bg-gray-900 text-white antialiased">
        <main className="relative h-[calc(100dvh-4rem)]">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
