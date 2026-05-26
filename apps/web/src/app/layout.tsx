import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TRPCReactProvider } from "@/trpc/client";
import Favicon from "../../public/favicon.svg";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";

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
    icons: {
        icon: { url: Favicon.src, type: "image/svg+xml" },
        apple: { url: Favicon.src, type: "image/svg+xml" },
    },
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
                        <TooltipProvider>
                            <SidebarProvider>{children}</SidebarProvider>
                        </TooltipProvider>
                    </ThemeProvider>
                </TRPCReactProvider>
            </body>
        </html>
    );
}
