import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Synth-Gaze",
  description:
    "CNN-Based 3D Gaze Estimation Using Synthetic Data Augmentation",
  keywords: [
    "eye tracking",
    "gaze detection",
    "computer vision",
    "AI",
    "research",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
