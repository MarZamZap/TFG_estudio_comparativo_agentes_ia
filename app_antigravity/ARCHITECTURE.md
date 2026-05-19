# ARCHITECTURE.md - Sistema de Gestión Óptica

## Visión General
Esta aplicación es un rediseño del sistema de gestión óptica original, migrando de Oracle APEX a un entorno moderno web (SPA/SSR) focalizado exclusivamente en el uso en monitores de escritorio por personal clínico y de ventas.

La interfaz prescinde del paradigma mobile-first para maximizar la densidad de información visible, usando componentes tipo "grid", atajos de teclado y modales rápidos. No se aplican restricciones de roles, simplificando el acceso colaborativo.

## Stack Tecnológico

1. **Next.js (App Router) + TypeScript**
   - **Por qué:** Unifica servidor y cliente. Las *Server Actions* permiten realizar mutaciones a la base de datos directamente desde componentes de React de manera segura y sin gestionar manualmente una API REST, reduciendo el código boilerplate y asegurando un ecosistema fuertemente tipado.
   - **Performance:** Renderizado híbrido (SSR + CSR) que asegura cargas iniciales muy rápidas.

2. **Base de Datos: SQLite + Prisma ORM**
   - **Por qué Prisma:** Su validación de esquemas y generación de tipos para TypeScript previene errores en tiempo de pre-compilación, crítico para sistemas financieros o de inventario.
   - **Por qué SQLite:** Ideal para desarrollo, tests locales y despliegue simple. Es relacional, soporta restricciones FK (Foreign Keys), UNIQUE constraints e índices, modelando perfectamente los requerimientos de la base de datos Oracle original. En producción, el cambio a PostgreSQL es trivial (`provider = "postgresql"`).

3. **Frontend: Tailwind CSS + Shadcn UI**
   - **Por qué Tailwind:** Estilización funcional que permite construir rápidamente layouts densos sin contexto CSS externo.
   - **Por qué Shadcn UI:** Componentes accesibles (radix-ui) y personalizables que no están ocultos tras librerías "caja negra". Excelente para tablas (DataTables de TanStack), diálogos de confirmación, paneles laterales (Drawers) y formularios que admiten navegación por teclado.

4. **Visualización de Datos: Recharts / Chart.js**
   - **Por qué:** Óptimas para mostrar gráficos estadísticos en el "Dashboard" con integración natural en React.

---

## Mapeo de Entidades y Estructura Prisma

El esquema traduce fielmente los requerimientos relacionales de Oracle al formato declarativo de Prisma:

- **TIENDA**: Entidad raíz para inventario y transacciones.
- **USUARIO**: Vinculado a tienda. Autenticación simulará accesos sin restricciones de rol.
- **CLIENTE** y **CLIENTE_GRADUACION**: Este último incluye campos `Decimal(4,2)` críticos para datos ópticos precisos y una relación temporal (`FECHA_CREACION`) para su historial cronológico.
- **CATEGORIA**: Relación recursiva 1:N consigo misma (`ID_CATEGORIA_PADRE`), con control lógico en capa de negocio para prevenir dependencias circulares.
- **PRODUCTO** y **PRODUCTO_ATRIBUTOS**: Relación estricta 1:1, unificados frecuentemente en la UI. Inclusión de `IMAGE_URL`.
- **STOCK**: Tabla de intersección entre Tienda y Producto. Incluye disparadores implícitos en UI/API para alertas de resurtido basado en `STOCK_MINIMO_ALERTA`.
- **OPERACION_CABECERA** / **OPERACION_LINEA**: Núcleo transaccional de ventas, compras y traspasos (Modelo Cabecera-Detalle).
- **CAJA_MOVIMIENTO** e **IA_LOG_CONSULTA**: Registros de auditoría financiera y operativa de flujos especiales (IA/Chat).

---

## Flujos Transaccionales Atómicos

Para garantizar la coherencia de los datos en ventas, compras y traspasos (ej. que no se descuente stock de caja sin actualizar la venta, o viceversa), se implementará el uso de **Transacciones Interactivas (Prisma `$transaction`)**.

Ejecución típica (Venta):
1. Validación de stock previo.
2. Deducción del inventario exacto en `STOCK`.
3. Actualización de `TOTAL_OPERACION` en la cabecera tras iterar `OPERACION_LINEA`.
4. Inserción del asiento de venta en `CAJA_MOVIMIENTO`.
Si algún paso falla, se ejecuta un *rollback* completo de forma nativa por la base de datos.
