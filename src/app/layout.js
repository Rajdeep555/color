import './globals.css';
import { Inter } from 'next/font/google';
// import { AuthProvider } from '@/context/AuthProvider'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: '91league',
  description: ' app description',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* <AuthProvider> */}
        {children}
        {/* </AuthProvider> */}
      </body>
    </html>
  );
}