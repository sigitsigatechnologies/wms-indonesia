'use client'

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import MobileNav from "@/components/MobileNav";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { layoutType } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isSidebar = layoutType === 'sidebar';

  // Server-side and first client render always show sidebar to match layout.tsx
  // This prevents hydration mismatch. Once mounted, we switch to user preference.
  const currentLayout = mounted ? layoutType : 'sidebar';
  const effectiveSidebar = currentLayout === 'sidebar';

  return (
    <div 
      className="layout-root" 
      style={{ 
        display: 'flex', 
        flexDirection: effectiveSidebar ? 'row' : 'column', 
        minHeight: '100vh', 
        width: '100%',
        willChange: 'flex-direction'
      }}
    >
      {/* Navigation Layer */}
      {effectiveSidebar ? (
        <div className="desktop-sidebar" style={{ transform: 'translate3d(0,0,0)', willChange: 'transform' }}>
          <Sidebar />
        </div>
      ) : (
        <div className="desktop-topnav" style={{ transform: 'translate3d(0,0,0)', willChange: 'transform' }}>
          <TopNav />
        </div>
      )}
      
      {/* Mobile Navigation (Always active on small screens via CSS) */}
      <MobileNav />
      
      {/* Main Content Layer */}
      <main className={`main-content ${effectiveSidebar ? 'with-sidebar' : 'with-topnav'}`}>
        {children}
      </main>
    </div>
  );
}
