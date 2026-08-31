import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "artistiQ • Sculptage Biométrique de Sourcils Sur-Mesure",
  description: "Scanner IA 3D pour la modélisation et confection de pochoirs en silicone médical sur-mesure pour sourcils.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body className="bg-obsidian text-gray-100 min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
