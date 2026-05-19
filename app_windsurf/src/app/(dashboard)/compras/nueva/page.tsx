import { getTiendas } from "@/actions/tiendas";
import { getProveedores } from "@/actions/proveedores";
import { auth } from "@/lib/auth";
import { NuevaCompraForm } from "./nueva-compra-form";

export default async function NuevaCompraPage() {
  const [tiendas, proveedores, session] = await Promise.all([
    getTiendas(),
    getProveedores(),
    auth(),
  ]);

  const idUsuario = session?.user?.id ? Number(session.user.id) : 1;

  return (
    <NuevaCompraForm
      tiendas={JSON.parse(JSON.stringify(tiendas))}
      proveedores={JSON.parse(JSON.stringify(proveedores))}
      idUsuario={idUsuario}
    />
  );
}
