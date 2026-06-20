import { ReactNode } from "react";
import AppSidebar from "@/components/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Footer from "@/components/footer";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background font-sans text-foreground">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {/* Subtle grid pattern */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(hsl(var(--muted-foreground)/0.07)_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
          {/* Toggle trigger */}
          <div className="absolute top-3 left-3 z-20">
            <SidebarTrigger className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors" />
          </div>
          <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
            {children}
          </div>
          <Footer />
        </main>
      </div>
    </SidebarProvider>
  );
}
