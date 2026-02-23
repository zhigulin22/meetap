import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Znakomstva MVP",
  description: "Сервис знакомств через ленту событий и умные подсказки сообщений",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
