Runtime Error



Failed to load external module node:path: TypeError: Native module not found: node:path
Call Stack
10

DevContext.externalRequire [as x]
file:///C:/Users/mzzbi/Desktop/Trabajo/Tfg-windsurf/optica-app/.next/dev/server/edge/chunks/turbopack-node_modules_next_dist_esm_build_templates_edge-wrapper_df2d4506.js (1626:15)
module evaluation
file:///C:/Users/mzzbi/Desktop/Trabajo/Tfg-windsurf/optica-app/.next/dev/server/edge/chunks/[root-of-the-server]__f237a8e0._.js (412:72)
<unknown>
file:///C:/Users/mzzbi/Desktop/Trabajo/Tfg-windsurf/optica-app/.next/dev/server/edge/chunks/turbopack-node_modules_next_dist_esm_build_templates_edge-wrapper_df2d4506.js (879:13)
runModuleExecutionHooks
file:///C:/Users/mzzbi/Desktop/Trabajo/Tfg-windsurf/optica-app/.next/dev/server/edge/chunks/turbopack-node_modules_next_dist_esm_build_templates_edge-wrapper_df2d4506.js (917:9)
instantiateModule
file:///C:/Users/mzzbi/Desktop/Trabajo/Tfg-windsurf/optica-app/.next/dev/server/edge/chunks/turbopack-node_modules_next_dist_esm_build_templates_edge-wrapper_df2d4506.js (877:9)
getOrInstantiateModuleFromParent
file:///C:/Users/mzzbi/Desktop/Trabajo/Tfg-windsurf/optica-app/.next/dev/server/edge/chunks/turbopack-node_modules_next_dist_esm_build_templates_edge-wrapper_df2d4506.js (830:12)
DevContext.esmImport [as i]
file:///C:/Users/mzzbi/Desktop/Trabajo/Tfg-windsurf/optica-app/.next/dev/server/edge/chunks/turbopack-node_modules_next_dist_esm_build_templates_edge-wrapper_df2d4506.js (238:20)
module evaluation
file:///C:/Users/mzzbi/Desktop/Trabajo/Tfg-windsurf/optica-app/.next/dev/server/edge/chunks/[root-of-the-server]__f237a8e0._.js (477:186)
<unknown>
file:///C:/Users/mzzbi/Desktop/Trabajo/Tfg-windsurf/optica-app/.next/dev/server/edge/chunks/turbopack-node_modules_next_dist_esm_build_templates_edge-wrapper_df2d4506.js (879:13)
runModuleExecutionHooks
file:///C:/Users/mzzbi/Desktop/Trabajo/Tfg-windsurf/optica-app/.next/dev/server/edge/chunks/turbopack-node_modules_next_dist_esm_build_templates_edge-wrapper_df2d4506.js (917:9)# Arquitectura - Aplicación de Gestión Óptica

## Stack Tecnológico

| Componente | Tecnología | Justificación |
|---|---|---|
| **Lenguaje** | TypeScript 5 | Tipado estático, autocompletado, detección de errores en compilación |
| **Framework** | Next.js 14 (App Router) | Full-stack React, Server Actions, SSR/SSG, API Routes integradas |
| **Base de Datos** | PostgreSQL 16 | ACID compliance, soporte decimal nativo, CTEs recursivas para jerarquías |
| **ORM** | Prisma 6 | Migraciones tipadas, cliente type-safe, mapeo directo Oracle→PostgreSQL |
| **UI Components** | shadcn/ui + Radix UI | Componentes accesibles, alta densidad, keyboard-first |
| **Estilos** | TailwindCSS 4 | Utility-first, responsive, consistente |
| **Tablas** | TanStack Table v8 | Virtualización, sorting, filtering, paginación server-side |
| **Formularios** | React Hook Form + Zod | Validación tipada, rendimiento optimizado |
| **Gráficos** | Recharts | React-native, responsive, composable |
| **Autenticación** | NextAuth.js v5 (Auth.js) | Credentials provider, sesión JWT, middleware de protección |
| **Iconos** | Lucide React | Set completo, tree-shakeable, consistente |

### ¿Por qué este stack y no otro?

- **Next.js vs. Vite+Express**: Next.js elimina la necesidad de un backend separado. Server Actions permiten lógica transaccional directa con acceso a Prisma, reduciendo latencia y complejidad de deployment.
- **PostgreSQL vs. MySQL/SQLite**: PostgreSQL ofrece `DECIMAL` nativo con precisión exacta (crítico para dioptrías), CTEs recursivas (necesarias para categorías jerárquicas), y transacciones SERIALIZABLE.
- **Prisma vs. Drizzle/TypeORM**: Prisma genera tipos TypeScript desde el schema, ofrece migraciones declarativas y `$transaction` para operaciones atómicas multi-tabla.
- **shadcn/ui vs. Ant Design/MUI**: shadcn/ui genera código copiable (no dependencia), usa Radix primitives accesibles, y permite personalización total para interfaces de alta densidad desktop.

## Estructura del Proyecto

```
optica-app/
├── prisma/
│   ├── schema.prisma          # Modelo de datos completo
│   └── seed.ts                # Datos iniciales
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # Rutas de autenticación (login)
│   │   ├── (dashboard)/       # Layout principal con sidebar
│   │   │   ├── page.tsx       # Dashboard / Página de inicio
│   │   │   ├── clientes/      # Gestión Clínica
│   │   │   │   ├── page.tsx              # Listado maestro
│   │   │   │   ├── nuevo/page.tsx        # Crear cliente
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx          # Detalle/edición
│   │   │   │       └── historial/page.tsx # Graduaciones
│   │   │   ├── ventas/        # Módulo Comercial
│   │   │   │   ├── page.tsx              # Listado de ventas
│   │   │   │   ├── nueva/page.tsx        # Nueva venta
│   │   │   │   └── [id]/page.tsx         # Detalle operación
│   │   │   ├── compras/       # Logística - Compras
│   │   │   │   ├── page.tsx
│   │   │   │   ├── nueva/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── traspasos/     # Logística - Traspasos
│   │   │   │   ├── page.tsx
│   │   │   │   ├── nuevo/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── catalogo/      # Catálogo de Productos
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── inventario/    # Monitor de Stock
│   │   │   │   └── page.tsx
│   │   │   ├── estadisticas/  # Dashboard analítico
│   │   │   │   └── page.tsx
│   │   │   ├── ia-log/        # Auditoría IA
│   │   │   │   └── page.tsx
│   │   │   └── admin/         # Maestros y Administración
│   │   │       ├── tiendas/page.tsx
│   │   │       ├── proveedores/page.tsx
│   │   │       ├── usuarios/page.tsx
│   │   │       └── categorias/page.tsx
│   │   ├── api/               # API Routes (si necesarias)
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── layout/            # Sidebar, Header, Navigation
│   │   └── shared/            # DataTable, FormFields, etc.
│   ├── lib/
│   │   ├── prisma.ts          # Singleton Prisma Client
│   │   ├── auth.ts            # Configuración NextAuth
│   │   ├── validators/        # Schemas Zod por entidad
│   │   └── utils.ts           # Utilidades generales
│   └── actions/               # Server Actions por módulo
│       ├── clientes.ts
│       ├── graduaciones.ts
│       ├── productos.ts
│       ├── stock.ts
│       ├── ventas.ts
│       ├── compras.ts
│       ├── traspasos.ts
│       ├── tiendas.ts
│       ├── proveedores.ts
│       ├── usuarios.ts
│       ├── categorias.ts
│       └── estadisticas.ts
└── ARCHITECTURE.md
```

## Mapeo de Rutas: Oracle APEX → Nueva App

| Página APEX Legacy | Nueva Ruta | Módulo |
|---|---|---|
| P1 (Clientes) | `/clientes` | Gestión Clínica |
| P2 (Detalle Cliente) | `/clientes/[id]` | Gestión Clínica |
| P24 (Graduaciones) | `/clientes/[id]/historial` | Gestión Clínica |
| P26 (Nueva Graduación) | Modal en `/clientes/[id]/historial` | Gestión Clínica |
| P4 (Ventas) | `/ventas` | Transacciones |
| P5 (Nueva Venta) | `/ventas/nueva` | Transacciones |
| P25 (Detalle Operación) | `/ventas/[id]`, `/compras/[id]`, `/traspasos/[id]` | Transacciones |
| P28 (Líneas) | Integrado en vista detalle | Transacciones |
| P19 (Compras) | `/compras` | Logística |
| P21 (Nuevo Traspaso) | `/traspasos/nuevo` | Logística |
| P22, P23, P29, P30 | `/compras`, `/traspasos` | Logística |
| P3 (Catálogo) | `/catalogo` | Catálogo |
| P6 (Producto) | `/catalogo/[id]` | Catálogo |
| P16 (Inventario) | `/inventario` | Inventario |
| P18 (Stock) | `/inventario` | Inventario |
| P8-P15 (Maestros) | `/admin/tiendas`, `/admin/proveedores`, etc. | Administración |
| P17 (Estadísticas) | `/estadisticas` | Análisis |
| P7 (IA Log) | `/ia-log` | Auditoría |
| P20 (Inicio) | `/` (Dashboard) | Navegación |

## Modelo de Datos

### Mapeo de Tipos Oracle → PostgreSQL (vía Prisma)

| Oracle | PostgreSQL | Prisma | Uso |
|---|---|---|---|
| NUMBER(10) | INTEGER | Int | IDs, cantidades |
| NUMBER(4,2) | DECIMAL(4,2) | Decimal | Dioptrías (esfera, cilindro, etc.) |
| NUMBER(10,2) | DECIMAL(10,2) | Decimal | Precios |
| NUMBER(12,2) | DECIMAL(12,2) | Decimal | Totales de operación |
| VARCHAR2(N) | VARCHAR(N) | String | Textos cortos |
| CLOB | TEXT | String | Textos largos |
| DATE | TIMESTAMP | DateTime | Fechas con hora |
| NUMBER(1) | BOOLEAN | Boolean | Flags activo/inactivo |

### Integridad Referencial

- **Stock**: `UNIQUE(id_tienda, id_producto)` — No permite duplicados tienda+producto
- **ProductoAtributos**: `UNIQUE(id_producto)` — Relación 1:1 estricta
- **ClienteGraduacion**: `ON DELETE CASCADE` desde Cliente
- **OperacionLinea**: `ON DELETE CASCADE` desde OperacionCabecera

### Validación de Circularidad en Categorías

Algoritmo implementado en la capa de servicio (`actions/categorias.ts`):

```
function validarCircularidad(categoriaId, nuevoPadreId):
  si categoriaId == nuevoPadreId → ERROR "Auto-referencia"
  
  ancestro = nuevoPadreId
  mientras ancestro != null:
    si ancestro == categoriaId → ERROR "Dependencia circular"
    ancestro = buscar_padre(ancestro)
  
  retornar VÁLIDO
```

Se ejecuta antes de cada INSERT/UPDATE que modifique `id_categoria_padre`.

### Sincronización Producto ↔ ProductoAtributos

Las operaciones de escritura sobre Producto y ProductoAtributos se ejecutan dentro de una misma transacción Prisma (`prisma.$transaction`), garantizando:
- Creación atómica: producto + atributos en una operación
- Actualización atómica: cambios en ambas tablas o rollback completo
- Eliminación en cascada: definida a nivel de schema (`onDelete: Cascade`)

### Lógica de Campos Calculados (Ventas)

- **subtotal** (OperacionLinea) = `cantidad × precio_momento`
- **total_operacion** (OperacionCabecera) = `SUM(subtotal)` de todas las líneas
- Calculados en Server Action al cerrar operación, no en frontend

### Procedimiento de Cierre de Venta (Transacción Atómica)

```
prisma.$transaction([
  1. Calcular SUM(subtotal) de líneas
  2. UPDATE operacion_cabecera SET total_operacion, estado='CERRADA'
  3. Para cada línea: UPDATE stock SET cantidad_actual -= cantidad
  4. INSERT INTO caja_movimiento (importe, tipo='INGRESO')
])
```

### Consultas de Agregación (Estadísticas)

- **Ventas por Tienda**: `GROUP BY id_tienda` con filtro de rango de fechas
- **Volumen Diario**: `GROUP BY DATE(fecha)` con COUNT y SUM
- **Top 5 Productos**: `GROUP BY id_producto ORDER BY SUM(cantidad) DESC LIMIT 5`

Todas las consultas utilizan índices sobre `fecha`, `id_tienda` y `tipo` en `operacion_cabecera`.

## Componente de Navegación

Sidebar persistente colapsable con estructura jerárquica:
- **Inicio** → Dashboard con KPIs
- **Clientes** → Gestión clínica y graduaciones
- **Ventas** → PdV y facturación
- **Logística** → Compras y traspasos
- **Catálogo** → Productos y atributos
- **Inventario** → Monitor de stock
- **Estadísticas** → Dashboard analítico
- **Administración** → Tiendas, proveedores, usuarios, categorías
- **Auditoría IA** → Log de consultas

## Validación de Unicidad en Stock

La validación se realiza en dos niveles:
1. **Base de datos**: `@@unique([idTienda, idProducto])` en schema Prisma
2. **Capa de servicio**: Verificación previa con `findUnique` antes de INSERT, retornando error descriptivo al usuario
