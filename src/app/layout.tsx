import type {Metadata} from "next";
import {AppRouterCacheProvider} from '@mui/material-nextjs/v14-appRouter';
import {ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/theme/theme';
import {Roboto} from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google'

// Set up the font
const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
});

// Enhanced metadata for better SEO
export const metadata: Metadata = {
    title: "Parsec - AI-Powered Data Transformation Tool",
    description: "Transform CSV, Excel, and text data with natural language instructions. No coding required. Process data files instantly with AI.",
    keywords: "data transformation, AI data tool, CSV converter, Excel transformation, data processing",
    metadataBase: new URL('https://parsec.baritoneblowfish.com'),
    alternates: {
        canonical: '/',
    },
    openGraph: {
        title: "Parsec - Transform Your Data with AI",
        description: "Convert, clean, and transform data files using plain English instructions",
        url: 'https://parsec.baritoneblowfish.com',
        siteName: 'Parsec',
        images: [
            {
                url: '/social-image.png',
                width: 1200,
                height: 630,
                alt: 'Parsec - AI Data Transformation Tool',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Parsec - AI-Powered Data Transformation',
        description: 'Transform CSV, Excel, and text data with natural language instructions',
        images: ['/social-image.png'],
    },
    icons: {
        icon: '/favicon.svg',
        apple: '/apple-icon.png',
    },
    robots: {
        index: true,
        follow: true,
    },
};

// Structured data for rich search results
function StructuredData() {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "SoftwareApplication",
                    "name": "Parsec",
                    "applicationCategory": "BusinessApplication",
                    "operatingSystem": "Web",
                    "offers": {
                        "@type": "Offer",
                        "price": "0",
                        "priceCurrency": "USD"
                    },
                    "description": "Transform data files using AI and natural language instructions",
                    "url": "https://parsec.baritoneblowfish.com",
                    "datePublished": "2025-03-06",
                    "softwareVersion": "0.1.0"
                })
            }}
        />
    );
}

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <head>
            {/* This helps with font display */}
            <link rel="preconnect" href="https://fonts.googleapis.com"/>
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>

            {/* Add structured data for rich search results */}
            <StructuredData/>
        </head>
        <GoogleAnalytics gaId="G-6VYLKTXF1J" />
        <body className={roboto.className}>
        <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                {children}
            </ThemeProvider>
        </AppRouterCacheProvider>
        </body>
        </html>
    );
}