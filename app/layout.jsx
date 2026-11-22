// Plantilla del sitio: barra lateral, barra superior y avisos
import { Caveat, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import "@/components/alitachs/cuaderno.css";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { BarraSuperior } from "@/components/barra-superior";
import { EntradaLogo } from "@/components/alitachs/entrada-logo";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// Títulos: la misma familia del monograma «AL» del logo
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: "800",
  style: ["normal", "italic"],
  variable: "--font-playfair",
});
// Notas a mano en tinta azul
const caveat = Caveat({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-caveat" });

export const metadata = {
  title: "Alitach Pedidos",
  description: "Sistema de pedidos del taller Alitach",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable} ${caveat.variable}`}>
      <body className="cuaderno">
        <TooltipProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="hoja min-w-0 bg-background">
              <BarraSuperior />
              {children}
            </SidebarInset>
          </SidebarProvider>
          <Toaster richColors position="top-right" />
          <EntradaLogo />
        </TooltipProvider>
      </body>
    </html>
  );
}