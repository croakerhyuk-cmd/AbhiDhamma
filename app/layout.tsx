import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: 'citta atlas · 마음의 지도',
  description: '분류의 렌즈를 바꾸며 54가지 마음을 탐색하는 아비담마 시각화',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko"><body>{children}</body></html>
  );
}
