import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gitframe.dev';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Gitframe — Instant GitHub Social Preview & Open Graph Card Studio',
    template: '%s | Gitframe',
  },
  description:
    'Generate pixel-perfect GitHub social preview cards (1280×640) in 5 seconds. 8 Satori-safe templates, generative SVG backgrounds, social simulator, and zero mandatory sign-up.',
  keywords: [
    'github social preview',
    'open graph generator',
    'github og image',
    'readme banner generator',
    'satori cards',
    'developer branding',
    'gitframe',
  ],
  authors: [{ name: 'David Sandoval', url: 'https://github.com/sandovaldavid' }],
  creator: 'David Sandoval',
  openGraph: {
    title: 'Gitframe — Instant GitHub Social Preview & Open Graph Card Studio',
    description:
      'Turn underused GitHub Social Previews into iconic visual identities in 5 seconds. 8 Satori templates, generative backgrounds, zero sign-up.',
    url: siteUrl,
    siteName: 'Gitframe',
    images: [
      {
        url: '/api/card/sandovaldavid/gitframe.png',
        width: 1280,
        height: 640,
        alt: 'Gitframe Social Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gitframe — Instant GitHub Social Preview Generator',
    description:
      'Transform boring GitHub social cards into modern visual identities in 5 seconds. 100% free and developer-first.',
    images: ['/api/card/sandovaldavid/gitframe.png'],
    creator: '@sandovaldavid',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      style={{ colorScheme: 'dark' }}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 selection:bg-blue-600 selection:text-white">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
