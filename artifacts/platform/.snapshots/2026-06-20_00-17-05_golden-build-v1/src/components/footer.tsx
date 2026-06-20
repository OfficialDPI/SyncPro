import { Link } from "wouter";
import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/20 px-6 py-6 flex-shrink-0">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
            <Zap className="w-3 h-3 text-primary-foreground" />
          </div>
          <span className="text-sm font-medium text-foreground">Sync</span>
          <span className="text-xs text-muted-foreground/60 ml-1">by Demure Platform Inc.</span>
        </div>
        <div className="flex items-center gap-5 text-xs text-muted-foreground/60">
          <Link href="/pricing"><span className="hover:text-foreground cursor-pointer transition-colors">Pricing</span></Link>
          <Link href="/docs"><span className="hover:text-foreground cursor-pointer transition-colors">Docs</span></Link>
          <Link href="/about"><span className="hover:text-foreground cursor-pointer transition-colors">About</span></Link>
          <Link href="/terms"><span className="hover:text-foreground cursor-pointer transition-colors">Terms</span></Link>
          <Link href="/privacy"><span className="hover:text-foreground cursor-pointer transition-colors">Privacy</span></Link>
        </div>
        <div className="text-xs text-muted-foreground/40">© 2025 Demure Platform Inc.</div>
      </div>
    </footer>
  );
}
