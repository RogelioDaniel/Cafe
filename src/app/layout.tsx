import type { Metadata, Viewport } from "next";
import { Bowlby_One, IBM_Plex_Mono, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const nunito = Nunito_Sans({
  variable: "--font-karla",
  subsets: ["latin"],
  display: "swap",
});

const bowlby = Bowlby_One({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
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
  themeColor: "#1f7df0",
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
    <html lang="es-MX">
      <body
        className={`${nunito.variable} ${bowlby.variable} ${plexMono.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <a className="skip-link" href="#main-content">
          Saltar al contenido
        </a>
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
      </body>
    </html>
  );
}
