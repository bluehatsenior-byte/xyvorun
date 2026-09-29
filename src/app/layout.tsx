import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Xyvorun â€” The Digital Economy",
  description:
    "Xyvorun connects AI, Web3 and community-powered growth through the XYV ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

