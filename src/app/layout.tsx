import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kopi Boy — From neighbourhoods to you",
  description:
    "Kopi Boy connects home cooks, hawkers, and small food businesses with customers nearby — zero food-order commission.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
