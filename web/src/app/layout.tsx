import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

const plusJakartaSans = localFont({
  src: './fonts/PlusJakartaSans-VariableFont_wght.woff2',
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
  weight: '200 800',
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
