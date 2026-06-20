// src/scripts/seed.js
// Script para insertar el usuario Don Eleuterio en la base de datos
// Ejecutar UNA SOLA VEZ con: node src/scripts/seed.js
const bcrypt = require('bcryptjs');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function seed() {
    console.log('🌱 Iniciando seed de la base de datos...');

    // Crear hash de la contraseña
    const passwordHash = await bcrypt.hash('Eleuterio2024!', 12);

    // Insertar usuario
    const { data, error } = await supabase
        .from('usuario')
        .upsert({
            email: 'eleuterio@abarrotes.com',
            password_hash: passwordHash,
            nombre: 'Don Eleuterio',
            activo: true
        }, { onConflict: 'email' })
        .select();

    if (error) {
        console.error('❌ Error al insertar usuario:', error);
    } else {
        console.log('✅ Usuario creado:', data[0].email);
        console.log('   Contraseña: Eleuterio2024!');
    }

    console.log('🌱 Seed completado.');
    process.exit(0);
}

seed();
