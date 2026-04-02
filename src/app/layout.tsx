import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: 'ServiceQuotePro - Professional Contractor Quotes',
  description: 'Generate professional service quotes and manage clients with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%231a468c'/%3E%3Cg transform='translate(4, 4)' stroke='white' stroke-width='2.5' fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'/%3E%3Cpath d='M14 2v4a2 2 0 0 0 2 2h4'/%3E%3Cpath d='M10 9H8'/%3E%3Cpath d='M16 13H8'/%3E%3Cpath d='M16 17H8'/%3E%3C/g%3E%3C/svg%3E" />
      </head>
      <body className="font-body antialiased selection:bg-accent/30">
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
