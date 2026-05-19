const { createClient } = require('@libsql/client');

const client = createClient({ url: 'file:dev.db' });

async function main() {
    // Show current balance first
    const balance = await client.execute("SELECT tipoMovimiento, SUM(monto) as total FROM CajaMovimiento GROUP BY tipoMovimiento");
    console.log("Current balance:");
    for (const row of balance.rows) {
        console.log(`  ${row.tipoMovimiento}: ${row.total}`);
    }

    // Delete all test CajaMovimiento records
    const deleted = await client.execute("DELETE FROM CajaMovimiento");
    console.log(`Deleted ${deleted.rowsAffected} CajaMovimiento records.`);

    // Also clean up test OperacionCabecera (Compras only, to avoid touching real sales)
    // Comment this out if you want to keep sale history
    // const deletedOps = await client.execute("DELETE FROM OperacionCabecera WHERE tipo = 'COMPRA'");
    // console.log(`Deleted ${deletedOps.rowsAffected} COMPRA operations.`);

    console.log("Done! The cash register has been reset to 0.");
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
