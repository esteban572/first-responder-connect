import { ReactNode } from "react";
import { Header } from "./Header";
import { MobileNav } from "./MobileNav";
import { DesktopSidebar } from "./DesktopSidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />
      <Header />
      
      <main className="md:ml-64 pb-20 md:pb-0">
        {children}
      </main>

      <MobileNav />
    </div>
  );
}
