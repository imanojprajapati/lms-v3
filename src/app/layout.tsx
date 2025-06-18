import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Sidebar from "../components/Sidebar";
import { Toaster } from "@/components/ui/toaster";
// import { ThemeProvider } from "@/contexts/ThemeContext";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  title: "LMS v3 - Lead Management System",
  description: "A comprehensive lead management system for visa consultants",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "min-h-screen antialiased bg-slate-50 dark:bg-slate-900 transition-colors duration-300")}>
        {/* <ThemeProvider> */}
          <div className="flex min-h-screen relative">
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 opacity-30">
              <div className="w-full h-full bg-slate-100/50 dark:bg-slate-800/50"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)]"></div>
            </div>
          
          <Sidebar />
          <main className="flex-1 overflow-auto transition-all duration-300 relative z-10 md:ml-64">
            <div className="container-responsive py-4 sm:py-6 md:py-8 pt-20 md:pt-6">
              <div className="animate-fade-in">
                {children}
              </div>
            </div>
          </main>
          </div>
          <Toaster />
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
