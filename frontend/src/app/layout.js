import './globals.css';
import ClientProviders from '../components/ClientProviders';
import Script from 'next/script';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  title: 'AgriMart - High-Yield Seeds, Certified Fertilizers & Farm Inputs',
  description: 'Government-certified hybrid seeds, pure organic vermicompost, NPK fertilizers, bio-fungicides, and foliar crop stimulants delivered direct to your farm.',
  icons: {
    icon: '/images/icon.png',
    apple: '/images/icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#FAF5EB] text-[#263449] antialiased overflow-x-hidden w-full max-w-full">
        <ClientProviders>
          {children}
        </ClientProviders>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
