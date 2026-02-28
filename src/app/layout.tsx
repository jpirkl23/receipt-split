import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { Header } from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Receipt Split - Split Bills Easily",
  description: "Upload a receipt, assign items, and calculate each person's share",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-100 min-h-screen`}>
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8 mb-20">
          {children}
        </main>
        <footer className="bg-gray-800 text-gray-300 text-center py-4 mt-8">
          <p>© 2024 Receipt Split MVP. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
