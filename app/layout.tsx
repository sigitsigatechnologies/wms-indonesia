import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { LanguageProvider } from "@/contexts/LanguageContext";

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "WMS Indonesia",
  description: "Warehouse Management System Indonesia",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
      </head>
      <body
        className={`${notoSans.variable} antialiased`}
        style={{ margin: 0, padding: 0 }}
      >
        <LanguageProvider>
          <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
            {/* Desktop Sidebar */}
            <div className="desktop-sidebar">
              <Sidebar />
            </div>
            
            {/* Mobile Navigation */}
            <MobileNav />
            
            {/* Main Content */}
            <main className="main-content">
              {children}
            </main>
          </div>
        </LanguageProvider>

        <style>{`
          .desktop-sidebar {
            display: block;
          }
          .main-content {
            flex: 1;
            margin-left: 260px;
            background-color: #f8f7fc;
            min-height: 100vh;
          }
          
          @media (max-width: 768px) {
            .desktop-sidebar {
              display: none !important;
            }
            .main-content {
              margin-left: 0;
              margin-top: 60px;
              padding: 1rem;
            }
          }
          
          @media (min-width: 769px) {
            .main-content {
              padding: 2rem;
            }
          }
        `}</style>
      </body>
    </html>
  );
}
