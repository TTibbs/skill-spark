import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/features/auth/auth-provider";

export const metadata: Metadata = {
  title: "Skill Spark",
  description: "Learning games, chores and rewards for families",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
