import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  console.log("🌱 Seeding database...");

  // ---- TIENDAS ----
  const tienda1 = await prisma.tienda.upsert({
    where: { cif: "A12345678" },
    update: {},
    create: {
      nombreComercial: "Óptica Central",
      cif: "A12345678",
      direccion: "Calle Mayor 10",
      ciudad: "Madrid",
      codigoPostal: "28001",
      telefono: "911234567",
      email: "central@opticaapp.es",
      activa: true,
    },
  });

  const tienda2 = await prisma.tienda.upsert({
    where: { cif: "B87654321" },
    update: {},
    create: {
      nombreComercial: "Óptica Norte",
      cif: "B87654321",
      direccion: "Avda. de la Constitución 45",
      ciudad: "Madrid",
      codigoPostal: "28034",
      telefono: "912345678",
      email: "norte@opticaapp.es",
      activa: true,
    },
  });

  const tienda3 = await prisma.tienda.upsert({
    where: { cif: "C55566677" },
    update: {},
    create: {
      nombreComercial: "Óptica Sur",
      cif: "C55566677",
      direccion: "Calle Atocha 88",
      ciudad: "Madrid",
      codigoPostal: "28012",
      telefono: "913456789",
      email: "sur@opticaapp.es",
      activa: true,
    },
  });

  console.log(`  ✅ Tiendas: ${tienda1.nombreComercial}, ${tienda2.nombreComercial}, ${tienda3.nombreComercial}`);

  // ---- PROVEEDORES ----
  const prov1 = await prisma.proveedor.upsert({
    where: { cifNif: "B11111111" },
    update: {},
    create: {
      nombre: "Luxottica España",
      cifNif: "B11111111",
      direccion: "Pol. Industrial Norte, Nave 5",
      ciudad: "Barcelona",
      telefono: "934567890",
      emailPedidos: "pedidos@luxottica.es",
      personaContacto: "Carlos Ruiz",
      activo: true,
    },
  });

  const prov2 = await prisma.proveedor.upsert({
    where: { cifNif: "B22222222" },
    update: {},
    create: {
      nombre: "Essilor Ibérica",
      cifNif: "B22222222",
      direccion: "Calle de la Industria 12",
      ciudad: "Valencia",
      telefono: "963456789",
      emailPedidos: "pedidos@essilor.es",
      personaContacto: "Ana Martínez",
      activo: true,
    },
  });

  const prov3 = await prisma.proveedor.upsert({
    where: { cifNif: "B33333333" },
    update: {},
    create: {
      nombre: "Safilo Group",
      cifNif: "B33333333",
      direccion: "Via Enrico Lazzareschi 19",
      ciudad: "Padova",
      telefono: "934891234",
      emailPedidos: "orders@safilo.es",
      personaContacto: "Marco Bianchi",
      activo: true,
    },
  });

  console.log(`  ✅ Proveedores: ${prov1.nombre}, ${prov2.nombre}, ${prov3.nombre}`);

  // ---- USUARIOS ----
  const passwordAdmin = await bcrypt.hash("admin123", 10);
  const passwordEmpleado = await bcrypt.hash("empleado123", 10);

  // Delete any stale users that might conflict, then upsert cleanly
  // We upsert by username; if email conflicts exist, update to new values.
  const userAdmin = await prisma.usuario.upsert({
    where: { username: "admin" },
    update: { email: "admin@opticaapp.es", rol: "ADMIN", idTienda: tienda1.id, activo: true },
    create: {
      username: "admin",
      passwordHash: passwordAdmin,
      nombreCompleto: "Administrador",
      email: "admin@opticaapp.es",
      rol: "ADMIN",
      idTienda: tienda1.id,
      activo: true,
    },
  });

  // Remove old vendedor1 if it exists and has conflicting email
  await prisma.usuario.deleteMany({ where: { username: "vendedor1" } });

  const userMaria = await prisma.usuario.upsert({
    where: { username: "mgarcial" },
    update: { email: "mgarcial@opticaapp.es", rol: "EMPLEADO", idTienda: tienda1.id, activo: true },
    create: {
      username: "mgarcial",
      passwordHash: passwordEmpleado,
      nombreCompleto: "María García López",
      email: "mgarcial@opticaapp.es",
      rol: "EMPLEADO",
      idTienda: tienda1.id,
      activo: true,
    },
  });

  const userPedro = await prisma.usuario.upsert({
    where: { username: "plopez" },
    update: { email: "plopez@opticaapp.es", rol: "EMPLEADO", idTienda: tienda2.id, activo: true },
    create: {
      username: "plopez",
      passwordHash: passwordEmpleado,
      nombreCompleto: "Pedro López Ruiz",
      email: "plopez@opticaapp.es",
      rol: "EMPLEADO",
      idTienda: tienda2.id,
      activo: true,
    },
  });

  const userSofia = await prisma.usuario.upsert({
    where: { username: "sromero" },
    update: { email: "sromero@opticaapp.es", rol: "EMPLEADO", idTienda: tienda3.id, activo: true },
    create: {
      username: "sromero",
      passwordHash: passwordEmpleado,
      nombreCompleto: "Sofía Romero Vidal",
      email: "sromero@opticaapp.es",
      rol: "EMPLEADO",
      idTienda: tienda3.id,
      activo: true,
    },
  });

  console.log(`  ✅ Usuarios: ${userAdmin.username}, ${userMaria.username}, ${userPedro.username}, ${userSofia.username}`);

  // ---- CATEGORÍAS ----
  const catMonturas = await prisma.categoria.upsert({
    where: { id: 1 },
    update: {},
    create: { nombre: "Monturas", descripcion: "Monturas de gafas graduadas y de sol", activa: true },
  });

  const catLentes = await prisma.categoria.upsert({
    where: { id: 2 },
    update: {},
    create: { nombre: "Lentes", descripcion: "Lentes oftálmicas", activa: true },
  });

  const catSol = await prisma.categoria.upsert({
    where: { id: 3 },
    update: {},
    create: { nombre: "Gafas de Sol", descripcion: "Gafas de sol con y sin graduación", activa: true },
  });

  const catAccesorios = await prisma.categoria.upsert({
    where: { id: 4 },
    update: {},
    create: { nombre: "Accesorios", descripcion: "Fundas, cordones, gamuzas y otros", activa: true },
  });

  const catContacto = await prisma.categoria.upsert({
    where: { id: 5 },
    update: {},
    create: { nombre: "Lentes de Contacto", descripcion: "Lentes de contacto y líquidos", activa: true },
  });

  console.log(`  ✅ Categorías: 5 categorías`);

  // ---- PRODUCTOS ----
  const prod1 = await prisma.producto.upsert({
    where: { codigo: "MON-RB-001" },
    update: {},
    create: {
      codigo: "MON-RB-001",
      nombre: "Ray-Ban RB5154 Clubmaster",
      descripcion: "Montura icónica estilo browline en acetato y metal",
      marca: "Ray-Ban",
      modelo: "RB5154",
      precioCoste: 65.00,
      precioVenta: 145.00,
      idCategoria: catMonturas.id,
      idProveedor: prov1.id,
      activo: true,
    },
  });
  await prisma.productoAtributos.upsert({
    where: { idProducto: prod1.id },
    update: {},
    create: { idProducto: prod1.id, calibre: "51", puente: "21", varilla: "145", colorCodigo: "2000", colorDescripcion: "Negro brillante", material: "Acetato/Metal", tipoMontura: "Browline", genero: "Unisex" },
  });

  const prod2 = await prisma.producto.upsert({
    where: { codigo: "MON-OA-001" },
    update: {},
    create: {
      codigo: "MON-OA-001",
      nombre: "Oakley OX8046 Airdrop",
      descripcion: "Montura deportiva ultrafina y ligera",
      marca: "Oakley",
      modelo: "OX8046",
      precioCoste: 72.00,
      precioVenta: 159.00,
      idCategoria: catMonturas.id,
      idProveedor: prov1.id,
      activo: true,
    },
  });
  await prisma.productoAtributos.upsert({
    where: { idProducto: prod2.id },
    update: {},
    create: { idProducto: prod2.id, calibre: "55", puente: "18", varilla: "143", colorCodigo: "0101", colorDescripcion: "Negro satinado", material: "O-Matter", tipoMontura: "Completa", genero: "Hombre" },
  });

  const prod3 = await prisma.producto.upsert({
    where: { codigo: "SOL-RB-001" },
    update: {},
    create: {
      codigo: "SOL-RB-001",
      nombre: "Ray-Ban Aviator Classic",
      descripcion: "Gafas de sol aviador clásicas con cristales G-15",
      marca: "Ray-Ban",
      modelo: "RB3025",
      precioCoste: 55.00,
      precioVenta: 135.00,
      idCategoria: catSol.id,
      idProveedor: prov1.id,
      activo: true,
    },
  });
  await prisma.productoAtributos.upsert({
    where: { idProducto: prod3.id },
    update: {},
    create: { idProducto: prod3.id, calibre: "58", puente: "14", varilla: "135", colorCodigo: "L0205", colorDescripcion: "Dorado/Verde G-15", material: "Metal", tipoMontura: "Completa", genero: "Unisex" },
  });

  const prod4 = await prisma.producto.upsert({
    where: { codigo: "LEN-ES-001" },
    update: {},
    create: {
      codigo: "LEN-ES-001",
      nombre: "Essilor Varilux Comfort Max",
      descripcion: "Lente progresiva de última generación sin deslumbramiento",
      marca: "Essilor",
      modelo: "Varilux Comfort Max",
      precioCoste: 120.00,
      precioVenta: 285.00,
      idCategoria: catLentes.id,
      idProveedor: prov2.id,
      activo: true,
    },
  });

  const prod5 = await prisma.producto.upsert({
    where: { codigo: "ACC-FUN-001" },
    update: {},
    create: {
      codigo: "ACC-FUN-001",
      nombre: "Funda Rígida Premium",
      descripcion: "Funda protectora rígida con cierre magnético y gamuza interior",
      marca: "Genérica",
      modelo: "FRP-01",
      precioCoste: 3.50,
      precioVenta: 12.00,
      idCategoria: catAccesorios.id,
      activo: true,
    },
  });

  const prod6 = await prisma.producto.upsert({
    where: { codigo: "SOL-SF-001" },
    update: {},
    create: {
      codigo: "SOL-SF-001",
      nombre: "Carrera CA Flaglab 13",
      descripcion: "Gafas de sol deportivas de grandes dimensiones",
      marca: "Carrera",
      modelo: "CA Flaglab 13",
      precioCoste: 48.00,
      precioVenta: 119.00,
      idCategoria: catSol.id,
      idProveedor: prov3.id,
      activo: true,
    },
  });
  await prisma.productoAtributos.upsert({
    where: { idProducto: prod6.id },
    update: {},
    create: { idProducto: prod6.id, calibre: "63", puente: "13", varilla: "130", colorCodigo: "807HA", colorDescripcion: "Negro/Gris", material: "Plástico", tipoMontura: "Wrap", genero: "Unisex" },
  });

  const prod7 = await prisma.producto.upsert({
    where: { codigo: "LCO-AC-001" },
    update: {},
    create: {
      codigo: "LCO-AC-001",
      nombre: "Acuvue Oasys 1-Day (30 uds)",
      descripcion: "Lentillas de hidrogel de silicona desechables diarias",
      marca: "Acuvue",
      modelo: "Oasys 1-Day",
      precioCoste: 14.00,
      precioVenta: 32.00,
      idCategoria: catContacto.id,
      idProveedor: prov2.id,
      activo: true,
    },
  });

  const prod8 = await prisma.producto.upsert({
    where: { codigo: "MON-SA-001" },
    update: {},
    create: {
      codigo: "MON-SA-001",
      nombre: "Safilo Elasta Stretch 883",
      descripcion: "Montura flexible de titanio para niños",
      marca: "Safilo",
      modelo: "Elasta Stretch 883",
      precioCoste: 38.00,
      precioVenta: 89.00,
      idCategoria: catMonturas.id,
      idProveedor: prov3.id,
      activo: true,
    },
  });
  await prisma.productoAtributos.upsert({
    where: { idProducto: prod8.id },
    update: {},
    create: { idProducto: prod8.id, calibre: "43", puente: "16", varilla: "125", colorCodigo: "0D6E", colorDescripcion: "Azul translúcido", material: "Titanio/Plástico", tipoMontura: "Completa", genero: "Niño" },
  });

  const prod9 = await prisma.producto.upsert({
    where: { codigo: "ACC-LIQ-001" },
    update: {},
    create: {
      codigo: "ACC-LIQ-001",
      nombre: "Renu Multi-Plus 360ml",
      descripcion: "Solución multiusos para lentes de contacto blandas",
      marca: "Bausch+Lomb",
      modelo: "ReNu Multi-Plus",
      precioCoste: 4.20,
      precioVenta: 11.50,
      idCategoria: catContacto.id,
      idProveedor: prov2.id,
      activo: true,
    },
  });

  const prod10 = await prisma.producto.upsert({
    where: { codigo: "LEN-ES-002" },
    update: {},
    create: {
      codigo: "LEN-ES-002",
      nombre: "Essilor Airwear Monofocal",
      descripcion: "Lente monofocal orgánica ultraligera con antirreflejante",
      marca: "Essilor",
      modelo: "Airwear",
      precioCoste: 35.00,
      precioVenta: 85.00,
      idCategoria: catLentes.id,
      idProveedor: prov2.id,
      activo: true,
    },
  });

  const products = [prod1, prod2, prod3, prod4, prod5, prod6, prod7, prod8, prod9, prod10];
  console.log(`  ✅ Productos: ${products.length} productos creados`);

  // ---- STOCK ----
  const stockData = [
    { idTienda: tienda1.id, idProducto: prod1.id, cantidadActual: 15, stockMinimoAlerta: 5 },
    { idTienda: tienda1.id, idProducto: prod2.id, cantidadActual: 8, stockMinimoAlerta: 3 },
    { idTienda: tienda1.id, idProducto: prod3.id, cantidadActual: 20, stockMinimoAlerta: 5 },
    { idTienda: tienda1.id, idProducto: prod4.id, cantidadActual: 30, stockMinimoAlerta: 10 },
    { idTienda: tienda1.id, idProducto: prod5.id, cantidadActual: 50, stockMinimoAlerta: 15 },
    { idTienda: tienda1.id, idProducto: prod6.id, cantidadActual: 12, stockMinimoAlerta: 4 },
    { idTienda: tienda1.id, idProducto: prod7.id, cantidadActual: 40, stockMinimoAlerta: 10 },
    { idTienda: tienda1.id, idProducto: prod8.id, cantidadActual: 6, stockMinimoAlerta: 3 },
    { idTienda: tienda1.id, idProducto: prod9.id, cantidadActual: 25, stockMinimoAlerta: 8 },
    { idTienda: tienda1.id, idProducto: prod10.id, cantidadActual: 18, stockMinimoAlerta: 5 },
    { idTienda: tienda2.id, idProducto: prod1.id, cantidadActual: 10, stockMinimoAlerta: 5 },
    { idTienda: tienda2.id, idProducto: prod2.id, cantidadActual: 3, stockMinimoAlerta: 5 },  // bajo stock
    { idTienda: tienda2.id, idProducto: prod3.id, cantidadActual: 12, stockMinimoAlerta: 5 },
    { idTienda: tienda2.id, idProducto: prod5.id, cantidadActual: 2, stockMinimoAlerta: 10 }, // bajo stock
    { idTienda: tienda2.id, idProducto: prod6.id, cantidadActual: 8, stockMinimoAlerta: 4 },
    { idTienda: tienda2.id, idProducto: prod7.id, cantidadActual: 20, stockMinimoAlerta: 8 },
    { idTienda: tienda2.id, idProducto: prod9.id, cantidadActual: 4, stockMinimoAlerta: 8 },  // bajo stock
    { idTienda: tienda3.id, idProducto: prod1.id, cantidadActual: 7, stockMinimoAlerta: 5 },
    { idTienda: tienda3.id, idProducto: prod3.id, cantidadActual: 9, stockMinimoAlerta: 5 },
    { idTienda: tienda3.id, idProducto: prod4.id, cantidadActual: 1, stockMinimoAlerta: 5 },  // bajo stock
    { idTienda: tienda3.id, idProducto: prod6.id, cantidadActual: 5, stockMinimoAlerta: 4 },
    { idTienda: tienda3.id, idProducto: prod8.id, cantidadActual: 4, stockMinimoAlerta: 3 },
    { idTienda: tienda3.id, idProducto: prod10.id, cantidadActual: 11, stockMinimoAlerta: 5 },
  ];

  for (const s of stockData) {
    await prisma.stock.upsert({
      where: { idTienda_idProducto: { idTienda: s.idTienda, idProducto: s.idProducto } },
      update: { cantidadActual: s.cantidadActual, stockMinimoAlerta: s.stockMinimoAlerta },
      create: s,
    });
  }
  console.log(`  ✅ Stock: ${stockData.length} registros (incluyendo 4 con stock bajo)`);

  // ---- CLIENTES ----
  const clientesData = [
    { tipoDocumento: "DNI", numeroDocumento: "12345678A", nombre: "Juan", apellidos: "Pérez García", fechaNacimiento: new Date("1985-03-15"), sexo: "M", direccion: "Calle Gran Vía 22, 3ºB", ciudad: "Madrid", codigoPostal: "28013", telefono: "612345678", email: "juan.perez@email.com" },
    { tipoDocumento: "DNI", numeroDocumento: "87654321B", nombre: "Laura", apellidos: "Martínez Sánchez", fechaNacimiento: new Date("1992-07-22"), sexo: "F", direccion: "Avda. de América 56, 1ºA", ciudad: "Madrid", codigoPostal: "28028", telefono: "698765432", email: "laura.martinez@email.com" },
    { tipoDocumento: "NIE", numeroDocumento: "X1234567L", nombre: "Paolo", apellidos: "Rossi", fechaNacimiento: new Date("1978-11-05"), sexo: "M", telefono: "655123456", ciudad: "Madrid", codigoPostal: "28001" },
    { tipoDocumento: "DNI", numeroDocumento: "11223344C", nombre: "Carmen", apellidos: "Ruiz Fernández", fechaNacimiento: new Date("1968-04-30"), sexo: "F", direccion: "Calle Serrano 88", ciudad: "Madrid", codigoPostal: "28006", telefono: "666112233", email: "carmen.ruiz@gmail.com" },
    { tipoDocumento: "DNI", numeroDocumento: "55667788D", nombre: "Miguel", apellidos: "Torres Blanco", fechaNacimiento: new Date("2001-09-10"), sexo: "M", direccion: "Paseo de la Castellana 102", ciudad: "Madrid", codigoPostal: "28046", telefono: "677556677", email: "miguel.torres@outlook.com" },
    { tipoDocumento: "DNI", numeroDocumento: "99887766E", nombre: "Elena", apellidos: "Castro Morales", fechaNacimiento: new Date("1955-12-18"), sexo: "F", telefono: "688998877", ciudad: "Madrid", codigoPostal: "28020" },
    { tipoDocumento: "PASAPORTE", numeroDocumento: "PAS123456", nombre: "Sophie", apellidos: "Dupont", fechaNacimiento: new Date("1990-06-05"), sexo: "F", telefono: "644001122", email: "sophie.dupont@mail.fr", ciudad: "Madrid" },
    { tipoDocumento: "DNI", numeroDocumento: "33445566F", nombre: "Antonio", apellidos: "Jiménez Vera", fechaNacimiento: new Date("1972-02-28"), sexo: "M", direccion: "Calle Toledo 15, 5ºC", ciudad: "Madrid", codigoPostal: "28005", telefono: "655334455" },
  ];

  const createdClientes: Awaited<ReturnType<typeof prisma.cliente.upsert>>[] = [];
  for (const c of clientesData) {
    const cli = await prisma.cliente.upsert({
      where: { numeroDocumento: c.numeroDocumento },
      update: {},
      create: c,
    });
    createdClientes.push(cli);
  }
  const [cli1, cli2, cli3, cli4, cli5, cli6, cli7, cli8] = createdClientes;
  console.log(`  ✅ Clientes: ${createdClientes.length} clientes creados`);

  // ---- GRADUACIONES ----
  // Only create if none exist for that client (avoid duplicates on re-seed)
  const existingGrad1 = await prisma.clienteGraduacion.findFirst({ where: { idCliente: cli1.id } });
  if (!existingGrad1) {
    await prisma.clienteGraduacion.create({
      data: {
        idCliente: cli1.id,
        fecha: new Date("2024-01-15"),
        odEsfera: -2.50, odCilindro: -0.75, odEje: 180, odAv: "1.0", odDnp: 32.5, odAltura: 22.0,
        oiEsfera: -3.00, oiCilindro: -1.00, oiEje: 175, oiAv: "1.0", oiDnp: 31.5, oiAltura: 21.5,
        tipoLente: "Monofocal", observaciones: "Primera revisión del año",
      },
    });
    await prisma.clienteGraduacion.create({
      data: {
        idCliente: cli1.id,
        fecha: new Date("2025-01-20"),
        odEsfera: -2.75, odCilindro: -0.75, odEje: 180, odAv: "1.0", odDnp: 32.5, odAltura: 22.0,
        oiEsfera: -3.25, oiCilindro: -1.00, oiEje: 175, oiAv: "1.0", oiDnp: 31.5, oiAltura: 21.5,
        tipoLente: "Monofocal", observaciones: "Leve progresión",
      },
    });
  }

  const existingGrad2 = await prisma.clienteGraduacion.findFirst({ where: { idCliente: cli2.id } });
  if (!existingGrad2) {
    await prisma.clienteGraduacion.create({
      data: {
        idCliente: cli2.id,
        fecha: new Date("2024-06-10"),
        odEsfera: 1.25, odCilindro: -0.50, odEje: 90, odAdicion: 2.00, odAv: "0.9", odDnp: 30.0, odAltura: 20.0,
        oiEsfera: 1.50, oiCilindro: -0.25, oiEje: 85, oiAdicion: 2.00, oiAv: "0.8", oiDnp: 30.5, oiAltura: 20.5,
        tipoLente: "Progresiva", observaciones: "Adaptación a progresivos",
      },
    });
  }

  const existingGrad4 = await prisma.clienteGraduacion.findFirst({ where: { idCliente: cli4.id } });
  if (!existingGrad4) {
    await prisma.clienteGraduacion.create({
      data: {
        idCliente: cli4.id,
        fecha: new Date("2025-02-12"),
        odEsfera: -0.50, odCilindro: -1.25, odEje: 95, odAdicion: 2.50, odAv: "0.8", odDnp: 31.0, odAltura: 19.5,
        oiEsfera: -0.75, oiCilindro: -1.50, oiEje: 100, oiAdicion: 2.50, oiAv: "0.7", oiDnp: 31.0, oiAltura: 19.0,
        tipoLente: "Progresiva", observaciones: "Astigmatismo moderado. Primer progresivo.",
      },
    });
  }

  const existingGrad5 = await prisma.clienteGraduacion.findFirst({ where: { idCliente: cli5.id } });
  if (!existingGrad5) {
    await prisma.clienteGraduacion.create({
      data: {
        idCliente: cli5.id,
        fecha: new Date("2025-03-01"),
        odEsfera: -5.00, odCilindro: 0, odEje: 0, odAv: "1.0", odDnp: 33.0, odAltura: 23.0,
        oiEsfera: -4.75, oiCilindro: -0.25, oiEje: 80, oiAv: "1.0", oiDnp: 33.0, oiAltura: 23.0,
        tipoLente: "Monofocal", observaciones: "Alta miopía. Recomienda lente orgánica delgada.",
      },
    });
  }

  console.log("  ✅ Graduaciones creadas");

  // ---- OPERACIONES (VENTAS, COMPRAS, TRASPASOS) ----
  // Helper to create a closed sale
  async function createVenta(opts: {
    tienda: typeof tienda1;
    cliente: typeof cli1;
    usuario: typeof userMaria;
    date: Date;
    lines: { producto: (typeof prod1); cantidad: number }[];
    formaPago: string;
  }) {
    const total = opts.lines.reduce((s, l) => s + Number(l.producto.precioVenta) * l.cantidad, 0);
    const op = await prisma.operacionCabecera.create({
      data: {
        tipo: "VENTA",
        fecha: opts.date,
        idTienda: opts.tienda.id,
        idCliente: opts.cliente.id,
        idUsuario: opts.usuario.id,
        totalOperacion: total,
        formaPago: opts.formaPago,
        estado: "CERRADA",
      },
    });
    for (const l of opts.lines) {
      await prisma.operacionLinea.create({
        data: {
          idOperacion: op.id,
          idProducto: l.producto.id,
          cantidad: l.cantidad,
          precioMomento: l.producto.precioVenta,
          subtotal: Number(l.producto.precioVenta) * l.cantidad,
        },
      });
    }
    await prisma.cajaMovimiento.create({
      data: {
        idTienda: opts.tienda.id,
        idOperacion: op.id,
        idUsuario: opts.usuario.id,
        tipo: "INGRESO",
        importe: total,
        formaPago: opts.formaPago,
        concepto: `Venta #${op.id}`,
        fecha: opts.date,
      },
    });
    return op;
  }

  // Ventas pasadas (últimos 30 días)
  const ventas = [
    { tienda: tienda1, cliente: cli1, usuario: userMaria, date: daysAgo(1), lines: [{ producto: prod1, cantidad: 1 }, { producto: prod10, cantidad: 2 }], formaPago: "EFECTIVO" },
    { tienda: tienda1, cliente: cli2, usuario: userMaria, date: daysAgo(1), lines: [{ producto: prod4, cantidad: 2 }], formaPago: "TARJETA" },
    { tienda: tienda1, cliente: cli3, usuario: userAdmin, date: daysAgo(2), lines: [{ producto: prod3, cantidad: 1 }, { producto: prod5, cantidad: 1 }], formaPago: "TARJETA" },
    { tienda: tienda1, cliente: cli4, usuario: userMaria, date: daysAgo(3), lines: [{ producto: prod4, cantidad: 2 }, { producto: prod9, cantidad: 2 }], formaPago: "BIZUM" },
    { tienda: tienda2, cliente: cli5, usuario: userPedro, date: daysAgo(4), lines: [{ producto: prod6, cantidad: 1 }], formaPago: "TARJETA" },
    { tienda: tienda2, cliente: cli6, usuario: userPedro, date: daysAgo(5), lines: [{ producto: prod2, cantidad: 1 }, { producto: prod5, cantidad: 2 }], formaPago: "EFECTIVO" },
    { tienda: tienda3, cliente: cli7, usuario: userSofia, date: daysAgo(6), lines: [{ producto: prod8, cantidad: 1 }, { producto: prod10, cantidad: 2 }], formaPago: "TARJETA" },
    { tienda: tienda1, cliente: cli8, usuario: userAdmin, date: daysAgo(8), lines: [{ producto: prod7, cantidad: 3 }], formaPago: "EFECTIVO" },
    { tienda: tienda2, cliente: cli1, usuario: userPedro, date: daysAgo(10), lines: [{ producto: prod3, cantidad: 1 }], formaPago: "TARJETA" },
    { tienda: tienda3, cliente: cli2, usuario: userSofia, date: daysAgo(12), lines: [{ producto: prod4, cantidad: 1 }, { producto: prod1, cantidad: 1 }], formaPago: "TARJETA" },
    { tienda: tienda1, cliente: cli5, usuario: userMaria, date: daysAgo(14), lines: [{ producto: prod6, cantidad: 2 }], formaPago: "BIZUM" },
    { tienda: tienda1, cliente: cli3, usuario: userAdmin, date: daysAgo(17), lines: [{ producto: prod2, cantidad: 1 }, { producto: prod10, cantidad: 1 }], formaPago: "TARJETA" },
    { tienda: tienda2, cliente: cli4, usuario: userPedro, date: daysAgo(20), lines: [{ producto: prod4, cantidad: 2 }], formaPago: "TARJETA" },
    { tienda: tienda3, cliente: cli6, usuario: userSofia, date: daysAgo(22), lines: [{ producto: prod9, cantidad: 4 }], formaPago: "EFECTIVO" },
    { tienda: tienda1, cliente: cli7, usuario: userMaria, date: daysAgo(25), lines: [{ producto: prod1, cantidad: 1 }, { producto: prod5, cantidad: 1 }], formaPago: "TARJETA" },
    { tienda: tienda1, cliente: cli8, usuario: userAdmin, date: daysAgo(28), lines: [{ producto: prod7, cantidad: 2 }, { producto: prod9, cantidad: 1 }], formaPago: "EFECTIVO" },
  ];

  for (const v of ventas) {
    await createVenta(v);
  }
  console.log(`  ✅ Ventas: ${ventas.length} ventas cerradas con caja`);

  // ---- COMPRAS ----
  const comprasData = [
    {
      tienda: tienda1, proveedor: prov1, usuario: userAdmin, date: daysAgo(5),
      lines: [{ producto: prod1, cantidad: 10 }, { producto: prod2, cantidad: 5 }],
    },
    {
      tienda: tienda1, proveedor: prov2, usuario: userAdmin, date: daysAgo(10),
      lines: [{ producto: prod4, cantidad: 20 }, { producto: prod10, cantidad: 15 }],
    },
    {
      tienda: tienda2, proveedor: prov1, usuario: userPedro, date: daysAgo(7),
      lines: [{ producto: prod3, cantidad: 8 }, { producto: prod6, cantidad: 6 }],
    },
    {
      tienda: tienda3, proveedor: prov3, usuario: userSofia, date: daysAgo(15),
      lines: [{ producto: prod8, cantidad: 5 }],
    },
    {
      tienda: tienda2, proveedor: prov2, usuario: userPedro, date: daysAgo(20),
      lines: [{ producto: prod7, cantidad: 30 }, { producto: prod9, cantidad: 20 }],
    },
  ];

  for (const c of comprasData) {
    const total = c.lines.reduce((s, l) => s + Number(l.producto.precioCoste) * l.cantidad, 0);
    const op = await prisma.operacionCabecera.create({
      data: {
        tipo: "COMPRA",
        fecha: c.date,
        idTienda: c.tienda.id,
        idProveedor: c.proveedor.id,
        idUsuario: c.usuario.id,
        totalOperacion: total,
        estado: "CERRADA",
      },
    });
    for (const l of c.lines) {
      await prisma.operacionLinea.create({
        data: {
          idOperacion: op.id,
          idProducto: l.producto.id,
          cantidad: l.cantidad,
          precioMomento: l.producto.precioCoste,
          subtotal: Number(l.producto.precioCoste) * l.cantidad,
        },
      });
    }
    await prisma.cajaMovimiento.create({
      data: {
        idTienda: c.tienda.id,
        idOperacion: op.id,
        idUsuario: c.usuario.id,
        tipo: "EGRESO",
        importe: total,
        concepto: `Compra proveedor #${op.id}`,
        fecha: c.date,
      },
    });
  }
  console.log(`  ✅ Compras: ${comprasData.length} compras cerradas`);

  // ---- TRASPASOS ----
  const traspasosData = [
    { origen: tienda1, destino: tienda2, usuario: userAdmin, date: daysAgo(3), lines: [{ producto: prod5, cantidad: 10 }] },
    { origen: tienda1, destino: tienda3, usuario: userAdmin, date: daysAgo(8), lines: [{ producto: prod4, cantidad: 5 }] },
    { origen: tienda2, destino: tienda3, usuario: userPedro, date: daysAgo(13), lines: [{ producto: prod7, cantidad: 8 }] },
  ];

  for (const t of traspasosData) {
    const total = t.lines.reduce((s, l) => s + Number(l.producto.precioCoste) * l.cantidad, 0);
    const op = await prisma.operacionCabecera.create({
      data: {
        tipo: "TRASPASO",
        fecha: t.date,
        idTienda: t.origen.id,
        idTiendaOrigen: t.origen.id,
        idTiendaDestino: t.destino.id,
        idUsuario: t.usuario.id,
        totalOperacion: total,
        estado: "CERRADA",
      },
    });
    for (const l of t.lines) {
      await prisma.operacionLinea.create({
        data: {
          idOperacion: op.id,
          idProducto: l.producto.id,
          cantidad: l.cantidad,
          precioMomento: l.producto.precioCoste,
          subtotal: Number(l.producto.precioCoste) * l.cantidad,
        },
      });
    }
  }
  console.log(`  ✅ Traspasos: ${traspasosData.length} traspasos cerrados`);

  // ---- MOVIMIENTOS DE CAJA ADICIONALES (apertura/cierre) ----
  const cajaExtras = [
    { tienda: tienda1, usuario: userAdmin, tipo: "INGRESO", importe: 200, concepto: "Apertura de caja - Fondo inicial", date: daysAgo(30) },
    { tienda: tienda2, usuario: userPedro, tipo: "INGRESO", importe: 150, concepto: "Apertura de caja - Fondo inicial", date: daysAgo(30) },
    { tienda: tienda3, usuario: userSofia, tipo: "INGRESO", importe: 150, concepto: "Apertura de caja - Fondo inicial", date: daysAgo(30) },
    { tienda: tienda1, usuario: userMaria, tipo: "EGRESO", importe: 45.00, concepto: "Gastos de limpieza y suministros", date: daysAgo(15) },
    { tienda: tienda2, usuario: userPedro, tipo: "EGRESO", importe: 30.00, concepto: "Material de oficina", date: daysAgo(18) },
  ];

  for (const m of cajaExtras) {
    await prisma.cajaMovimiento.create({
      data: {
        idTienda: m.tienda.id,
        idUsuario: m.usuario.id,
        tipo: m.tipo,
        importe: m.importe,
        concepto: m.concepto,
        fecha: m.date,
      },
    });
  }
  console.log(`  ✅ Caja: ${cajaExtras.length} movimientos adicionales`);

  // ---- IA LOG ----
  const iaLogs = [
    { idUsuario: userAdmin.id, pregunta: "¿Cuáles son los productos con más ventas este mes?", sqlGenerado: "SELECT p.nombre, SUM(ol.cantidad) as total FROM operacion_linea ol JOIN producto p ON ol.id_producto = p.id_producto JOIN operacion_cabecera oc ON ol.id_operacion = oc.id_operacion WHERE oc.tipo = 'VENTA' AND oc.fecha >= date_trunc('month', now()) GROUP BY p.nombre ORDER BY total DESC LIMIT 10", respuesta: "Los 3 productos más vendidos este mes son: Essilor Varilux Comfort Max (12 uds), Ray-Ban Aviator Classic (8 uds) y Acuvue Oasys 1-Day (7 uds).", date: daysAgo(2) },
    { idUsuario: userMaria.id, pregunta: "¿Qué clientes no han comprado en los últimos 6 meses?", sqlGenerado: "SELECT c.nombre, c.apellidos FROM cliente c WHERE c.id_cliente NOT IN (SELECT DISTINCT id_cliente FROM operacion_cabecera WHERE fecha > now() - interval '6 months' AND id_cliente IS NOT NULL)", respuesta: "Se han encontrado 3 clientes sin actividad en los últimos 6 meses: Elena Castro Morales, Paolo Rossi y Sophie Dupont.", date: daysAgo(5) },
    { idUsuario: userAdmin.id, pregunta: "¿Cuál es el total de facturación por tienda este trimestre?", sqlGenerado: "SELECT t.nombre_comercial, SUM(oc.total_operacion) FROM operacion_cabecera oc JOIN tienda t ON oc.id_tienda = t.id_tienda WHERE oc.tipo = 'VENTA' AND oc.estado = 'CERRADA' AND oc.fecha >= date_trunc('quarter', now()) GROUP BY t.nombre_comercial", respuesta: "Facturación trimestral: Óptica Central 8.420€, Óptica Norte 4.180€, Óptica Sur 2.950€.", date: daysAgo(1) },
  ];

  for (const log of iaLogs) {
    await prisma.iaLogConsulta.create({
      data: {
        idUsuario: log.idUsuario,
        pregunta: log.pregunta,
        sqlGenerado: log.sqlGenerado,
        respuesta: log.respuesta,
        fechaHora: log.date,
      },
    });
  }
  console.log(`  ✅ IA Log: ${iaLogs.length} consultas registradas`);

  console.log("\n✨ Seed completado con éxito!");
  console.log("   Usuarios disponibles:");
  console.log("   - admin / admin123 (ADMIN)");
  console.log("   - mgarcial / empleado123 (EMPLEADO - Óptica Central)");
  console.log("   - plopez / empleado123 (EMPLEADO - Óptica Norte)");
  console.log("   - sromero / empleado123 (EMPLEADO - Óptica Sur)");
  console.log("   (nota: email = username@opticaapp.es para todos)");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
