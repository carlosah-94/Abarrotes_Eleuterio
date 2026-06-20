// src/routes/auth.js
// Rutas de autenticación: login y logout
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        // Buscar usuario por email
        const { data: usuario, error } = await supabase
            .from('usuario')
            .select('*')
            .eq('email', email.toLowerCase().trim())
            .eq('activo', true)
            .single();

        if (error || !usuario) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        // Verificar contraseña con bcrypt
        const passwordOk = await bcrypt.compare(password, usuario.password_hash);
        if (!passwordOk) {
            return res.status(401).json({ error: 'Credenciales incorrectas' });
        }

        // Actualizar último acceso
        await supabase
            .from('usuario')
            .update({ ultimo_acceso: new Date().toISOString() })
            .eq('id', usuario.id);

        // Generar token JWT (expira en 8 horas)
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({ token, nombre: usuario.nombre });
    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    // El token se invalida en el cliente eliminando el localStorage
    res.json({ message: 'Sesión cerrada correctamente' });
});

module.exports = router;
