import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = {
  title: 'NavSetu | Government Pilot-to-Procurement Platform',
  description: 'Smart India Hackathon 2026 - Fast-track startup pilot verification and tamper-evident contract conversion for public departments.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col antialiased">
        <ToastProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </main>
          <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>NavSetu — Smart India Hackathon 2026 | Built strictly to GFR 2017 & GeM Fast-Track Mandates</p>
              <div className="flex items-center gap-4">
                <span className="text-emerald-400 font-mono">Pipeline: Identify → Pilot → Procure → Scale</span>
              </div>
            </div>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
