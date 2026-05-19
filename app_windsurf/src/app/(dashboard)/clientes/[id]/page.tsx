import { getCliente } from "@/actions/clientes";
import { notFound } from "next/navigation";
import { ClienteDetail } from "./cliente-detail";

export default async function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cliente = await getCliente(Number(id));
  if (!cliente) notFound();
  return <ClienteDetail cliente={JSON.parse(JSON.stringify(cliente))} />;
}
