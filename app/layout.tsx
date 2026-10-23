import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = {
  title: 'NavSetu | Government Pilot-to-Procurement Platform',
  description: 'Fast-track startup pilot verification and tamper-evident contract conversion for public departments.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50/60 text-zinc-950 flex flex-col antialiased selection:bg-zinc-900 selection:text-white font-sans">
        <ToastProvider>
          <Navbar />
          <main className="flex-1 w-full">
            {children}
          </main>
          <footer className="border-t border-zinc-200 bg-white py-6 text-center text-xs text-zinc-600 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-zinc-950 tracking-tight">NavSetu</span>
                <span className="text-zinc-300">•</span>
                <p className="text-zinc-600 font-medium">Built to GFR 2017 & GeM Fast-Track Mandates</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-zinc-900 font-semibold font-mono text-[11px] bg-zinc-100 px-2.5 py-1 rounded-md border border-zinc-200">
                  Pipeline: Identify → Pilot → Procure → Scale
                </span>
              </div>
            </div>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
