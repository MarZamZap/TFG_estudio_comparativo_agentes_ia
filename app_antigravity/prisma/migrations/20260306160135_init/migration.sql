-- CreateTable
CREATE TABLE "Tienda" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tiendaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Usuario_tiendaId_fkey" FOREIGN KEY ("tiendaId") REFERENCES "Tienda" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "dni" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ClienteGraduacion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clienteId" TEXT NOT NULL,
    "odEsfera" DECIMAL NOT NULL,
    "odCilindro" DECIMAL NOT NULL,
    "odEje" INTEGER NOT NULL,
    "odAdicion" DECIMAL,
    "odAgudezaVisual" TEXT,
    "oiEsfera" DECIMAL NOT NULL,
    "oiCilindro" DECIMAL NOT NULL,
    "oiEje" INTEGER NOT NULL,
    "oiAdicion" DECIMAL,
    "oiAgudezaVisual" TEXT,
    "distanciaInter" DECIMAL,
    "notas" TEXT,
    "fechaCreacion" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClienteGraduacion_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nombre" TEXT NOT NULL,
    "idCategoriaPadre" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Categoria_idCategoriaPadre_fkey" FOREIGN KEY ("idCategoriaPadre") REFERENCES "Categoria" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoriaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL NOT NULL,
    "imageUrl" TEXT,
    "codigoBarras" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Producto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductoAtributos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productoId" TEXT NOT NULL,
    "material" TEXT,
    "color" TEXT,
    "marca" TEXT,
    "modelo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductoAtributos_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Stock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tiendaId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 0,
    "stockMinimoAlerta" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Stock_tiendaId_fkey" FOREIGN KEY ("tiendaId") REFERENCES "Tienda" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Stock_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OperacionCabecera" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tiendaId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "clienteId" TEXT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'COMPLETADO',
    "totalOperacion" DECIMAL NOT NULL DEFAULT 0,
    "notas" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OperacionCabecera_tiendaId_fkey" FOREIGN KEY ("tiendaId") REFERENCES "Tienda" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OperacionCabecera_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OperacionCabecera_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OperacionLinea" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "operacionId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" DECIMAL NOT NULL,
    "subtotal" DECIMAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OperacionLinea_operacionId_fkey" FOREIGN KEY ("operacionId") REFERENCES "OperacionCabecera" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OperacionLinea_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CajaMovimiento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tiendaId" TEXT NOT NULL,
    "operacionId" TEXT,
    "tipoMovimiento" TEXT NOT NULL,
    "monto" DECIMAL NOT NULL,
    "concepto" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CajaMovimiento_tiendaId_fkey" FOREIGN KEY ("tiendaId") REFERENCES "Tienda" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CajaMovimiento_operacionId_fkey" FOREIGN KEY ("operacionId") REFERENCES "OperacionCabecera" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IaLogConsulta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "consulta" TEXT NOT NULL,
    "respuesta" TEXT NOT NULL,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IaLogConsulta_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_username_key" ON "Usuario"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_dni_key" ON "Cliente"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_email_key" ON "Cliente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Producto_codigoBarras_key" ON "Producto"("codigoBarras");

-- CreateIndex
CREATE UNIQUE INDEX "ProductoAtributos_productoId_key" ON "ProductoAtributos"("productoId");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_tiendaId_productoId_key" ON "Stock"("tiendaId", "productoId");

-- CreateIndex
CREATE UNIQUE INDEX "CajaMovimiento_operacionId_key" ON "CajaMovimiento"("operacionId");
