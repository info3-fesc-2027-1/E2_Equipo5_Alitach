"use client";

// Cancelar un pedido con motivo (RF4, RC-01): solo Pendiente o En proceso

import { useState, useEffect } from "react";
import { obtenerUsuarios, guardarCambioEstado } from "../../../lib/datos";
import { validarCancelacion } from "../../../lib/logica";

export default function CancelarPedido({ pedido, alCambiar }) {
    const [usuarios, setUsuarios] = useState([]);
    const [usuarioId, setUsuarioId] = useState("");
    const [motivo, setMotivo] = useState("");
    const [errores, setErrores] = useState([]);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        obtenerUsuarios()
            .then(setUsuarios)
            .catch((e) => setErrores(["Error al cargar usuarios: " + e.message]));
    }, []);

    // Revisa la regla RN-07 y si se puede, guarda la cancelación con su motivo
    async function cancelar(e) {
        e.preventDefault();
        const lista = [...validarCancelacion(pedido, motivo).errores];
        if (!usuarioId) {
            lista.push("Elige quién cancela");
        }
        setErrores(lista);
        if (lista.length > 0) {
            return;
        }
        setGuardando(true);
        try {
            await guardarCambioEstado(
                pedido.id,
                pedido.estado,
                "Cancelado",
                Number(usuarioId),
                motivo.trim(),
            );
            setMotivo("");
            setUsuarioId("");
            await alCambiar();
        } catch (error) {
            setErrores(["Error al cancelar: " + error.message]);
        } finally {
            setGuardando(false);
        }
    }

    return (
        <form onSubmit={cancelar}>
            <h2>Cancelar pedido</h2>
            <p>
                <label>
                    Motivo
                    <br />
                    <textarea
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        rows={2}
                    />
                </label>
            </p>
            <select value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)}>
                <option value="">¿Quién cancela?</option>
                {usuarios.map((u) => (
                    <option key={u.id} value={u.id}>
                        {u.nombre}
                    </option>
                ))}
            </select>{" "}
            <button type="submit" disabled={guardando}>
                {guardando ? "Cancelando..." : "Cancelar pedido"}
            </button>
            {errores.length > 0 && (
                <ul>
                    {errores.map((e) => (
                        <li key={e}>{e}</li>
                    ))}
                </ul>
            )}
        </form>
    );
}