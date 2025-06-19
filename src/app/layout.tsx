import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/contexts/UserContext";
import AuthLayout from "@/components/AuthLayout";
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
      <body 
        className={cn(inter.className, "min-h-screen antialiased bg-slate-50 dark:bg-slate-900 transition-colors duration-300")}
        suppressHydrationWarning={true}
      >
        <UserProvider>
          {/* <ThemeProvider> */}
            <AuthLayout>
              {children}
            </AuthLayout>
            <Toaster />
          {/* </ThemeProvider> */}
        </UserProvider>
      </body>
    </html>
  );
}
