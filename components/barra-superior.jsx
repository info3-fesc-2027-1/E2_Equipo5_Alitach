"use client";

// Barra superior: botón para plegar el menú, ruta actual y acceso rápido a nuevo pedido

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const NOMBRES = {
    "": "Panel",
    pedidos: "Pedidos",
    "nuevo-pedido": "Nuevo pedido",
    clientes: "Clientes",
    catalogo: "Productos",
    pruebas: "Pruebas de lógica",
    "prueba-datos": "Prueba de datos",
};

export function BarraSuperior() {
    const pathname = usePathname();
    const partes = pathname.split("/").filter(Boolean);
    const seccion = NOMBRES[partes[0] || ""] || partes[0];
    const detalle = partes[0] === "pedidos" && partes[1] ? "#" + partes[1] : null;

    return (
        <header
            className={`sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-card px-4`}
        >
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <nav className="flex min-w-0 items-center gap-1.5 text-sm">
                {detalle ? (
                    <>
                        <Link href="/pedidos" className="text-muted-foreground hover:text-foreground">
                            {seccion}
                        </Link>
                        <span className="text-muted-foreground">/</span>
                        <span className="font-medium">Pedido {detalle}</span>
                    </>
                ) : (
                    <span className="font-medium">{seccion}</span>
                )}
            </nav>
            {pathname !== "/nuevo-pedido" && (
                <Button asChild size="sm" className="ml-auto">
                    <Link href="/nuevo-pedido">
                        <Plus /> <span className="hidden sm:inline">Nuevo pedido</span>
                    </Link>
                </Button>
            )}
        </header>
    );
}