import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TRPCReactProvider } from "@/trpc/client";

const notoSans = Noto_Sans({ variable: "--font-sans" });

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin", "cyrillic"],
});

const playfair_Display = Playfair_Display({
    variable: "--font-playfair-display",
    subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
    title: "Потужний адвокат",
    description: "Система потужний адвокат",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={notoSans.variable} suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} ${playfair_Display.variable} antialiased`}
            >
                <TRPCReactProvider>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        {children}
                    </ThemeProvider>
                </TRPCReactProvider>
            </body>
        </html>
    );
}
