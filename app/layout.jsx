// Plantilla del sitio: barra lateral, barra superior y avisos ^^

import { Inter } from "next/font/google";
import "./globals.css";
import { HiloScroll } from "@/components/alitachs/hilo-scroll";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AppSidebar } from "@/components/app-sidebar";
import { BarraSuperior } from "@/components/barra-superior";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Alitach · Pedidos",
  description: "Sistema de pedidos del taller Alitach",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={inter.variable}>
      <body>
         <HiloScroll />
        <TooltipProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-background">
              <BarraSuperior />
              {children}
            </SidebarInset>
          </SidebarProvider>
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}