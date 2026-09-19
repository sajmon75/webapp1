// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { getCurrentUser } from '@/lib/auth';
import Navbar from '@/components/Navbar';
import DemoSwitcher from '@/components/DemoSwitcher';

export const metadata: Metadata = {
  title: 'Paninoteca Scolastica - Ordinazioni Intervallo',
  description: 'Applicazione moderna per la gestione delle ordinazioni dei panini per l’intervallo scolastico.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#16a34a',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="it">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
        <Navbar user={user} />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {children}
        </main>
        <DemoSwitcher currentUserEmail={user?.email} />
      </body>
    </html>
  );
}

