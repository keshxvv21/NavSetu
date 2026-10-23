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
      <body className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col antialiased">
        <ToastProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </main>
          <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-600 mt-auto">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p className="text-slate-700 font-medium">NavSetu | Built to GFR 2017 & GeM Fast-Track Mandates</p>
              <div className="flex items-center gap-4">
                <span className="text-blue-700 font-semibold font-mono text-[11px] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
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
