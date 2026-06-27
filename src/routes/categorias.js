const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

function normalizarTexto(texto) {
    return texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

// GET /api/categorias — Obtener todas las categorías
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('categoria')
            .select('*')
            .order('nombre');

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('Error al obtener categorías:', err);
        res.status(500).json({ error: 'Error al obtener categorías' });
    }
});

// POST /api/categorias — Crear categoría si no existe
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { nombre } = req.body;
        if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });

        const nombreNorm = normalizarTexto(nombre);

        const { data: existente } = await supabase
            .from('categoria')
            .select('*')
            .eq('nombre_norm', nombreNorm)
            .single();

        if (existente) {
            return res.json(existente);
        }

        const { data, error } = await supabase
            .from('categoria')
            .insert({ nombre: nombre.trim(), nombre_norm: nombreNorm })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        console.error('Error al crear categoría:', err);
        res.status(500).json({ error: 'Error al crear categoría' });
    }
});

module.exports = router;
