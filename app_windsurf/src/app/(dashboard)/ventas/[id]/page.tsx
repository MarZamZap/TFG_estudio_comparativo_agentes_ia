import { getVenta } from "@/actions/ventas";
import { getProductos } from "@/actions/productos";
import { notFound } from "next/navigation";
import { OperacionDetail } from "@/components/shared/operacion-detail";
import { serialize } from "@/lib/serialize";

export default async function VentaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [venta, productos] = await Promise.all([
    getVenta(Number(id)),
    getProductos(),
  ]);
  if (!venta) notFound();
  return (
    <OperacionDetail
      operacion={serialize(venta)}
      tipo="VENTA"
      productos={serialize(productos)}
    />
  );
}
