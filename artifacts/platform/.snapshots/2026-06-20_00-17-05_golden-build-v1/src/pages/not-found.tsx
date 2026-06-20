import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-full text-center px-6">
      <div className="mb-6">
        <span className="text-8xl font-bold text-foreground/5 select-none leading-none block">404</span>
        <div className="-mt-4 text-6xl font-bold bg-gradient-to-r from-primary via-primary/70 to-primary/30 bg-clip-text text-transparent">
          Page Not Found
        </div>
      </div>
      <p className="text-muted-foreground text-base mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex items-center gap-3">
        <Button onClick={() => window.history.back()} variant="outline" className="rounded-full gap-2">
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </Button>
        <Link href="/">
          <Button className="rounded-full gap-2">
            <Home className="w-4 h-4" />
            Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
