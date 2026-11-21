import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground">The page you are looking for doesn&rsquo;t exist or you don&rsquo;t have access to it.</p>
      <Button asChild><Link href="/">Back to home</Link></Button>
    </main>
  );
}
