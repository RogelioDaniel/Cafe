import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz", "SOFT", "WONK"],
});

export const metadata: Metadata = {
  title: "Café Tonalli — Del metate a la taza | CDMX",
  description:
    "Cafetería mexicana de autor en Colonia Roma Norte, CDMX. Café de olla, antojitos, pan dulce y postres hechos a mano cada día. Reserva tu mesa o pide para recoger.",
  keywords: [
    "café de olla",
    "cafetería CDMX",
    "cafetería Roma Norte",
    "café mexicano",
    "antojitos",
    "pan dulce",
    "reservación cafetería",
    "Café Tonalli",
  ],
  authors: [{ name: "Café Tonalli" }],
  openGraph: {
    title: "Café Tonalli — Del metate a la taza",
    description:
      "Cafetería mexicana de autor en Colonia Roma Norte, CDMX. Café de olla, antojitos y pan dulce hechos a mano cada día.",
    type: "website",
    locale: "es_MX",
    siteName: "Café Tonalli",
  },
  twitter: {
    card: "summary_large_image",
    title: "Café Tonalli — Del metate a la taza",
    description: "Cafetería mexicana de autor en Colonia Roma Norte, CDMX.",
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#b5651d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${fraunces.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              classNames: {
                toast:
                  "bg-card text-card-foreground border-border rounded-xl shadow-lg",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
