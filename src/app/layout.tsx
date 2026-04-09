import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gry Brzezinka | Platforma gier dla dzieci",
  description: "Platforma gier stworzonych przez dzieci z Brzezinki",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gradient-to-b from-sky-100 to-green-50 dark:from-gray-950 dark:to-gray-900">
        {children}
      </body>
    </html>
  );
}
