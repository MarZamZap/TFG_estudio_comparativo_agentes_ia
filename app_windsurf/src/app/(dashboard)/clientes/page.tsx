import { getClientes } from "@/actions/clientes";
import { ClientesTable } from "./clientes-table";

export default async function ClientesPage() {
  const clientes = await getClientes();
  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-lg font-bold tracking-tight">Clientes</h1>
        <p className="text-xs text-muted-foreground/70 mt-0.5">Gestión del registro de clientes de la óptica</p>
      </div>
      <ClientesTable data={JSON.parse(JSON.stringify(clientes))} />
    </div>
  );
}
