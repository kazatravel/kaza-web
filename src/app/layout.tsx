import './globals.css';
import { cn } from "@/lib/utils";

// NOTE: Avoid `next/font/google` for now because production builds can fail
// if Google Fonts fetch is blocked/unstable in the build environment.

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans")}>
      <body>{children}</body>
    </html>
  );
}
