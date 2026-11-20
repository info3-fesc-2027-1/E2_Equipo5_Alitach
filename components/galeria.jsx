"use client";

// Galería "Nuestros trabajos": fotos reales de Alitach para mostrar al cliente al cotizar.
// Las fotos están en public/catalogo (no usan Supabase).

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Qué fotos van en cada pestaña
const TRABAJOS = {
  Chamarras: 7,
  Chalecos: 4,
  Gorras: 1,
  Bordados: 7,
  Serigrafía: 7,
};

// Nombre del archivo de cada pestaña (chamarra-1.webp, chaleco-1.webp, ...)
const ARCHIVO = {
  Chamarras: "chamarra",
  Chalecos: "chaleco",
  Gorras: "gorra",
  Bordados: "bordado",
  Serigrafía: "serigrafia",
};

export default function Galeria() {
  const [pestana, setPestana] = useState("Chamarras");
  const [grande, setGrande] = useState(null);

  // Arma la lista de fotos de la pestaña elegida
  const fotos = [];
  for (let i = 1; i <= TRABAJOS[pestana]; i++) {
    fotos.push(`/catalogo/${ARCHIVO[pestana]}-${i}.webp`);
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Nuestros trabajos</CardTitle>
        <CardDescription>
          Fotos de prendas reales para mostrar al cliente al cotizar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Pestañas */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {Object.keys(TRABAJOS).map((nombre) => (
            <Button
              key={nombre}
              type="button"
              size="sm"
              variant={nombre === pestana ? "default" : "outline"}
              className="shrink-0 rounded-full"
              onClick={() => setPestana(nombre)}
            >
              {nombre} ({TRABAJOS[nombre]})
            </Button>
          ))}
        </div>

        {/* Fotos */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {fotos.map((foto, i) => (
            <button
              key={foto}
              type="button"
              onClick={() => setGrande(foto)}
              className="group overflow-hidden rounded-lg border bg-white"
            >
              <img
                src={foto}
                alt={`${pestana} ${i + 1}`}
                loading="lazy"
                className="aspect-square w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </button>
          ))}
        </div>
      </CardContent>

      {/* Foto en grande */}
      {grande && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setGrande(null)}
        >
          <img
            src={grande}
            alt="Foto en grande"
            className="max-h-[90vh] max-w-full rounded-xl"
          />
        </div>
      )}
    </Card>
  );
}
