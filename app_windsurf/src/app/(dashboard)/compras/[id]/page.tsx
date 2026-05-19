import { getCompra, getProductosProveedor } from "@/actions/compras";
import { getProductos } from "@/actions/productos";
import { notFound } from "next/navigation";
import { OperacionDetail } from "@/components/shared/operacion-detail";
import { serialize } from "@/lib/serialize";

export default async function CompraDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const compra = await getCompra(Number(id));
  if (!compra) notFound();

  const productos = compra.idProveedor
    ? await getProductosProveedor(compra.idProveedor)
    : await getProductos();

  return (
    <OperacionDetail
      operacion={serialize(compra)}
      tipo="COMPRA"
      productos={serialize(productos)}
    />
  );
}
