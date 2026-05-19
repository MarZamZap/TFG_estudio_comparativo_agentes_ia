import { getTiendas } from "@/actions/tiendas";
import { auth } from "@/lib/auth";
import { NuevoTraspasoForm } from "./nuevo-traspaso-form";

export default async function NuevoTraspasoPage() {
  const [tiendas, session] = await Promise.all([
    getTiendas(),
    auth(),
  ]);

  const idUsuario = session?.user?.id ? Number(session.user.id) : 1;

  return (
    <NuevoTraspasoForm
      tiendas={JSON.parse(JSON.stringify(tiendas))}
      idUsuario={idUsuario}
    />
  );
}
