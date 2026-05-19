import { getTraspaso } from "@/actions/traspasos";
import { getProductos } from "@/actions/productos";
import { notFound } from "next/navigation";
import { OperacionDetail } from "@/components/shared/operacion-detail";
import { serialize } from "@/lib/serialize";

export default async function TraspasoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [traspaso, productos] = await Promise.all([
    getTraspaso(Number(id)),
    getProductos(),
  ]);
  if (!traspaso) notFound();
  return (
    <OperacionDetail
      operacion={serialize(traspaso)}
      tipo="TRASPASO"
      productos={serialize(productos)}
    />
  );
}
