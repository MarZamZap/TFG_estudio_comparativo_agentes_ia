import { getCliente } from "@/actions/clientes";
import { getGraduaciones } from "@/actions/graduaciones";
import { notFound } from "next/navigation";
import { HistorialClinico } from "./historial-clinico";

export default async function HistorialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const idNum = Number(id);
  const [cliente, graduaciones] = await Promise.all([
    getCliente(idNum),
    getGraduaciones(idNum),
  ]);
  if (!cliente) notFound();

  return (
    <HistorialClinico
      cliente={JSON.parse(JSON.stringify(cliente))}
      graduaciones={JSON.parse(JSON.stringify(graduaciones))}
    />
  );
}
