import type {Metadata} from "next";
import {AppRouterCacheProvider} from '@mui/material-nextjs/v14-appRouter';
import {ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '@/theme/theme';
import {Roboto} from "next/font/google";
import "./globals.css";

// Set up the font
const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: "Parsec - AI-Powered Data Transformation Tool",
    description: "Transform CSV, TSV, Excel, and text data with natural language instructions. No data storage, privacy-focused, and instant downloads.",
    metadataBase: new URL('https://parsec.baritoneblowfish.com'),
    openGraph: {
        title: 'Parsec - Transform Data with AI',
        description: 'Convert, clean, and transform your data files with simple English instructions',
        url: 'https://parsec.baritoneblowfish.com',
        siteName: 'Parsec',
        images: [
            {
                url: '/og-image.png',
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
        description: 'Transform your data files with natural language instructions',
        images: ['/twitter-image.png'],
    },
    keywords: 'data transformation, CSV transformation, Excel conversion, AI data processing, no-code data tools',
    icons: {
        icon: '/favicon.svg',
    },
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
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