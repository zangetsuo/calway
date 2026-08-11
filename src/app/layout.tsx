import type { Metadata, Viewport } from "next";
import { Archivo, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// grotesca condensada, para os títulos e números grandes da "etiqueta"
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CalWay — Calculadora de calorias do Subway",
  description:
    "Monte seu sanduíche Subway e veja calorias, macronutrientes e sódio em tempo real, com base na tabela nutricional oficial da Subway Brasil.",
  keywords: [
    "subway",
    "calorias",
    "tabela nutricional",
    "calculadora",
    "sanduíche",
    "macros",
  ],
  openGraph: {
    title: "CalWay — Calculadora de calorias do Subway",
    description:
      "Monte seu sub e veja calorias, macros e sódio em tempo real com a tabela oficial da Subway Brasil.",
    locale: "pt_BR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbfbf7",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${archivo.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
