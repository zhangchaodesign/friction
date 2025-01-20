import './globals.css';
import type { Metadata } from 'next';
import { inter } from './fonts';
import Header from '@/components/Header';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Fr(i)ction: Feedback to Revision with AI Support in Action',
  description:
    'Fr(i)ction stands for Feedback to Revision with AI Support in Action.'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          inter.className + ' relative overflow-hidden text-gray-800'
        )}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
