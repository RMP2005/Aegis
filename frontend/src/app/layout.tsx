import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aegis — Smart Contract Security Analysis",
  description: "Analyze smart contracts before deployment. Detect vulnerabilities, understand exploit paths, and secure your code with static analysis and AI reasoning.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
