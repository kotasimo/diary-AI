import type { Metadata } from "next";
import "../styles.css";

export const metadata: Metadata = {
  title: "RUNNET風 ダイアリー",
  description: "週単位で日記を記録できるRUNNET風ダイアリーアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
