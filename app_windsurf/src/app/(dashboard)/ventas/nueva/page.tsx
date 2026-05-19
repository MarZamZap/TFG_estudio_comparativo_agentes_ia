import { getTiendas } from "@/actions/tiendas";
import { getClientes } from "@/actions/clientes";
import { auth } from "@/lib/auth";
import { NuevaVentaForm } from "./nueva-venta-form";

export default async function NuevaVentaPage() {
  const [tiendas, clientes, session] = await Promise.all([
    getTiendas(),
    getClientes(),
    auth(),
  ]);

  const idUsuario = session?.user?.id ? Number(session.user.id) : 1;

  return (
    <NuevaVentaForm
      tiendas={JSON.parse(JSON.stringify(tiendas))}
      clientes={JSON.parse(JSON.stringify(clientes))}
      idUsuario={idUsuario}
    />
  );
}
