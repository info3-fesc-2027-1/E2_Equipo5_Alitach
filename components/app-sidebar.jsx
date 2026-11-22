"use client";

// Barra lateral del sistema: tapa de tela marino con costura verde (Operación y Catálogo)

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ClipboardList,
    PlusCircle,
    Users,
    Shirt,
} from "lucide-react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import { LogoAlitachs } from "@/components/alitachs/logo-svg";

const GRUPOS = [
    {
        titulo: "Operación",
        enlaces: [
            { href: "/", texto: "Panel", icono: LayoutDashboard },
            { href: "/pedidos", texto: "Pedidos", icono: ClipboardList },
            { href: "/nuevo-pedido", texto: "Nuevo pedido", icono: PlusCircle },
        ],
    },
    {
        titulo: "Catálogo",
        enlaces: [
            { href: "/clientes", texto: "Clientes", icono: Users },
            { href: "/catalogo", texto: "Productos", icono: Shirt },
        ],
    },
];

// Una ruta está activa si es la misma o una subruta (ej. /pedidos/3)
function estaActiva(pathname, href) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
}

export function AppSidebar() {
    const pathname = usePathname();

    return (
        <Sidebar collapsible="icon" className="tapa-tela">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/">
                                <div className="size-8 shrink-0 overflow-hidden rounded-full bg-[#f0f0f0]">
                                    <LogoAlitachs className="size-full" />
                                </div>
                                <div className="grid leading-tight group-data-[collapsible=icon]:hidden">
                                    <span className="font-semibold">Alitach</span>
                                    <span className="text-xs text-sidebar-foreground/70">
                                        Taller de confección
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {GRUPOS.map((grupo) => (
                    <SidebarGroup key={grupo.titulo}>
                        <SidebarGroupLabel>{grupo.titulo}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {grupo.enlaces.map((e) => (
                                    <SidebarMenuItem key={e.href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={estaActiva(pathname, e.href)}
                                            tooltip={e.texto}
                                        >
                                            <Link href={e.href}>
                                                <e.icono />
                                                <span>{e.texto}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <p className="px-2 text-xs text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
                    Equipo 5 · Modelo Espiral
                </p>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}