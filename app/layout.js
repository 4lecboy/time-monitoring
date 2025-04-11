import './globals.css';
import ClientProvider from '@/components/auth/ClientProvider';

export const metadata = {
  title: 'Time Monitoring System',
  description: 'Track work tasks and auxiliary activities',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}