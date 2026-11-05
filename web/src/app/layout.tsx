import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Hospital Management System (HMS)',
  description: 'Enterprise healthcare patient queue and consultation management system',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${plusJakartaSans.variable}`}>
      <body className="h-full bg-[#F8FAFC] text-slate-600 font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
