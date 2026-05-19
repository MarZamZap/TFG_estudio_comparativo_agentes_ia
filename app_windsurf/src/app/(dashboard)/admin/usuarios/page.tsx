import { getUsuarios } from "@/actions/usuarios";
import { getTiendas } from "@/actions/tiendas";
import { UsuariosClient } from "./usuarios-client";

export default async function UsuariosPage() {
  const [usuarios, tiendas] = await Promise.all([getUsuarios(), getTiendas()]);
  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-lg font-bold tracking-tight">Usuarios</h1>
        <p className="text-xs text-muted-foreground/70 mt-0.5">Gestión de personal y accesos</p>
      </div>
      <UsuariosClient
        data={JSON.parse(JSON.stringify(usuarios))}
        tiendas={JSON.parse(JSON.stringify(tiendas))}
      />
    </div>
  );
}
