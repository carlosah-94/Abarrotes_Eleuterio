// src/scripts/setup-db.js
// Ejecuta el schema SQL en Supabase. Requiere DATABASE_URL en .env
// Formato: postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function setupDb() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error('❌ Falta DATABASE_URL en .env');
        console.error('   Obtén la connection string en Supabase → Settings → Database');
        process.exit(1);
    }

    const { Client } = require('pg');
    const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

    try {
        await client.connect();
        console.log('📦 Conectado a PostgreSQL. Ejecutando schema...');

        const sqlPath = path.join(__dirname, '../../database/schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        await client.query(sql);

        console.log('✅ Schema ejecutado correctamente.');
    } catch (err) {
        console.error('❌ Error ejecutando schema:', err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

setupDb();
