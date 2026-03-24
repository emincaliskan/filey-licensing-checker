import { cn } from "@/lib/utils";

export function Footer({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "border-t py-6 md:py-0",
        className
      )}
    >
      <div className="container flex h-14 max-w-screen-2xl items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Built with AI &middot; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
