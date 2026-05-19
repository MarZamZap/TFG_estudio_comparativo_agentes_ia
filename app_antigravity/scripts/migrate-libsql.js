const { createClient } = require('@libsql/client');

const client = createClient({ url: 'file:dev.db' });

async function main() {
    // Check existing columns in Producto
    const res = await client.execute("PRAGMA table_info(Producto)");
    const cols = res.rows.map(r => r.name);
    console.log("Current Producto columns:", cols.join(', '));

    // Add coste column if missing
    if (!cols.includes('coste')) {
        await client.execute("ALTER TABLE Producto ADD COLUMN coste REAL");
        console.log("Added: coste column");
    } else {
        console.log("Already exists: coste");
    }

    // Add proveedorId column if missing
    if (!cols.includes('proveedorId')) {
        await client.execute("ALTER TABLE Producto ADD COLUMN proveedorId TEXT");
        console.log("Added: proveedorId column");
    } else {
        console.log("Already exists: proveedorId");
    }

    // Create Proveedor table if missing
    const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
    const tableNames = tables.rows.map(r => r.name);
    console.log("Tables:", tableNames.join(', '));

    if (!tableNames.includes('Proveedor')) {
        await client.execute(`
            CREATE TABLE "Proveedor" (
                "id" TEXT NOT NULL PRIMARY KEY,
                "nombre" TEXT NOT NULL,
                "cif" TEXT UNIQUE,
                "telefono" TEXT,
                "email" TEXT,
                "direccion" TEXT,
                "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("Created table: Proveedor");
    } else {
        console.log("Table Proveedor already exists");
    }

    // Seed Proveedores
    const existingGenerico = await client.execute("SELECT id FROM Proveedor WHERE cif = 'GENERIC-001'");
    let genericoId;
    if (existingGenerico.rows.length === 0) {
        const id = 'prv_' + Math.random().toString(36).substr(2, 9);
        await client.execute({
            sql: "INSERT INTO Proveedor (id, nombre, cif, telefono, email, direccion) VALUES (?, ?, ?, ?, ?, ?)",
            args: [id, "Proveedor Genérico S.L.", "GENERIC-001", "900123456", "contacto@proveedorgenerico.com", "Calle Principal 123"]
        });
        genericoId = id;
        console.log("Created Proveedor Genérico with id:", id);
    } else {
        genericoId = existingGenerico.rows[0].id;
        console.log("Proveedor Genérico already exists with id:", genericoId);
    }

    const existingLuxottica = await client.execute("SELECT id FROM Proveedor WHERE cif = 'LUXOTTICA-001'");
    let luxotticaId;
    if (existingLuxottica.rows.length === 0) {
        const id = 'prv_' + Math.random().toString(36).substr(2, 9);
        await client.execute({
            sql: "INSERT INTO Proveedor (id, nombre, cif, telefono, email, direccion) VALUES (?, ?, ?, ?, ?, ?)",
            args: [id, "Luxottica Group", "LUXOTTICA-001", "912345678", "pedidos@luxottica.com", "Milán, Italia"]
        });
        luxotticaId = id;
        console.log("Created Luxottica with id:", id);
    } else {
        luxotticaId = existingLuxottica.rows[0].id;
        console.log("Luxottica already exists with id:", luxotticaId);
    }

    // Update products with missing proveedorId or coste
    const productos = await client.execute("SELECT id, nombre, precio, coste, proveedorId FROM Producto");
    let updated = 0;
    for (const p of productos.rows) {
        const precio = p.precio ? Number(p.precio) : 0;
        const currentCoste = p.coste ? Number(p.coste) : 0;
        const newCoste = currentCoste <= 0 ? (precio > 0 ? precio * 0.5 : 10) : currentCoste;
        const nombre = String(p.nombre || '').toLowerCase();
        const targetProv = nombre.includes('ray') || nombre.includes('oak') ? luxotticaId : genericoId;
        const newProvId = p.proveedorId || targetProv;

        await client.execute({
            sql: "UPDATE Producto SET coste = ?, proveedorId = ? WHERE id = ?",
            args: [newCoste, newProvId, p.id]
        });
        updated++;
    }
    console.log(`Updated ${updated} products with provider and cost.`);
}

main().then(() => {
    console.log("Migration complete!");
    process.exit(0);
}).catch(e => {
    console.error("Error:", e);
    process.exit(1);
});
