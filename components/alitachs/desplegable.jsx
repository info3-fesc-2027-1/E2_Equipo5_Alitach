"use client";
// Sección que se abre y se cierra suavemente (Accordion Expand)
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function Desplegable({ titulo, detalle, abierto = false, children }) {
    const [abrir, setAbrir] = useState(abierto);

    return (
        <div>
            <button
                type="button"
                onClick={() => setAbrir(!abrir)}
                className="flex w-full items-center justify-between gap-2 text-left"
                aria-expanded={abrir}
            >
                <span>
                    <span className="font-semibold">{titulo}</span>
                    {detalle && <span className="ml-2 text-sm text-muted-foreground">{detalle}</span>}
                </span>
                <ChevronDown
                    className={cn("size-5 text-muted-foreground transition-transform duration-300", abrir && "rotate-180")}
                />
            </button>
            {/* El truco de grid-rows de 0fr a 1fr anima la altura */}
            <div
                className={cn(
                    "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
                    abrir ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                )}
            >
                <div className="overflow-hidden">
                    <div className="pt-4">{children}</div>
                </div>
            </div>
        </div>
    );
}