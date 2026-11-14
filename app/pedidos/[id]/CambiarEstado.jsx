"use client";
// Cambiar el estado de un pedido (RF4) guardando quién lo hizo 
import { useState, useEffect } from "react";
import { obtenerUsuarios, guardarCambioEstado } from "../../../lib/datos";
import { puedeCambiarEstado } from "../../../lib/logica";

export default function CambiarEstado({ pedido, alCambiar }) {
    const [usuarios, setUsuarios] = useState([]);
    const [usuarioId, setUsuarioId] = useState("");
    const [nuevo, setNuevo] = useState("");
    const [errores, setErrores] = useState([]);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        obtenerUsuarios()
            .then(setUsuarios)
            .catch((e) => setErrores(["Error al cargar usuarios: " + e.message]));
    }, []);

    // Revisa la regla RN-06 y, si se puede, guarda el cambio  
    async function cambiar() {
        const lista = [];
        if (!nuevo) {
            lista.push("Elige el nuevo estado");
        } else {
            lista.push(...puedeCambiarEstado(pedido.estado, nuevo).errores);
        }
        if (!usuarioId) {
            lista.push("Elige quién hace el cambio");
        }
        setErrores(lista);
        if (lista.length > 0) {
            return;
        }
        setGuardando(true);
        try {
            await guardarCambioEstado(pedido.id, pedido.estado, nuevo, Number(usuarioId));
            setNuevo("");
            setUsuarioId("");
            await alCambiar();
        } catch (e) {
            setErrores(["Error al guardar: " + e.message]);
        } finally {
            setGuardando(false);
        }
    }
    if (pedido.estado === "Entregado" || pedido.estado === "Cancelado") {
        return <p>Este pedido está {pedido.estado}: ya no cambia de estado.</p>;
    }

    return (
        <div>
            <select value={nuevo} onChange={(e) => setNuevo(e.target.value)}>
                <option value="">Nuevo estado</option>
                <option value="En proceso">En proceso</option>
                <option value="Entregado">Entregado</option>
            </select>{" "}
            <select value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)}>
                <option value="">¿Quién hace el cambio?</option>
                {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                        {u.nombre}
                    </option>
                ))}
            </select>{" "}
            <button type="button" onClick={cambiar} disabled={guardando}>
                {guardando ? "Guardando..." : "Cambiar estado"}
            </button>
            {errores.length > 0 && (
                <ul>
                    {errores.map((e) => (
                        <li key={e}>{e}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}