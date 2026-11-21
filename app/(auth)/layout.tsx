import { GraduationCap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-4">
      <div className="flex items-center gap-2 text-xl font-semibold">
        <GraduationCap className="h-6 w-6 text-primary" aria-hidden /> ClassHub
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
