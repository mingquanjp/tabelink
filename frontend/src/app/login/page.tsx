import { cn } from "@/lib/utils";
import { HeroPanel } from "@/components/login/hero-panel";
import { LoginPanel } from "@/components/login/login-panel";

export default function LoginPage() {
  return (
    <main
      className={cn(
        "min-h-screen bg-(--surface-cream) text-(--ink-900) font-jp"
      )}
    >
      <div className="min-h-screen grid lg:grid-cols-2">
        <HeroPanel />
        <LoginPanel />
      </div>
    </main>
  );
}
