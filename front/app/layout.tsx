import type { Metadata } from "next";
import { ColorSchemeScript, MantineProvider, createTheme } from "@mantine/core";
import { Domine } from "next/font/google";

import '@mantine/core/styles.css';
import "./globals.css";

const domine = Domine({
  variable: "--font-domine",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const theme = createTheme({
  fontFamily: 'var(--font-domine), serif',
  fontFamilyMonospace: 'var(--font-domine), monospace',
  headings: { fontFamily: 'var(--font-domine), serif' },
});

export const metadata: Metadata = {
  title: "teeDB",
  description: "teeworlds mapres database",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={domine.variable} suppressHydrationWarning>
      <head>
        <ColorSchemeScript />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={theme}
        >
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
