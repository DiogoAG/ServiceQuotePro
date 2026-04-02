import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';

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
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%231a468c'/%3E%3Cg transform='translate(4, 4)' stroke='white' stroke-width='2.5' fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M18 13L18 2L6 2C4.89543 2 4 2.89543 4 4L4 20C4 21.1046 4.89543 22 6 22L18 22C19.1046 22 20 21.1046 20 20L20 7L15 2'/%3E%3Cpath d='M14 2L14 6C14 7.10457 14.8954 8 16 8L20 8'/%3E%3Cpath d='M10 9L8 9'/%3E%3Cpath d='M16 13L8 13'/%3E%3Cpath d='M16 17L8 17'/%3E%3C/g%3E%3C/svg%3E" />
      </head>
      <body className="font-body antialiased selection:bg-accent/30">
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
