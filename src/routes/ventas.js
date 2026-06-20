// src/routes/ventas.js
const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

// POST /api/ventas — Registrar venta completa
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { items } = req.body;
        const usuarioId = req.usuario.id;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'La venta debe tener al menos un producto' });
        }

        // Calcular totales
        let total = 0;
        for (const item of items) {
            total += item.precio_unitario * item.cantidad;
        }
        const baseImponible = total / 1.18;
        const igv = total - baseImponible;

        // Generar número de boleta
        const { data: ultimaBoleta } = await supabase
            .from('venta')
            .select('numero_boleta')
            .like('numero_boleta', 'B002-%')
            .order('id', { ascending: false })
            .limit(1)
            .single();

        let siguienteNum = 524001;
        if (ultimaBoleta) {
            const numActual = parseInt(ultimaBoleta.numero_boleta.substring(5));
            siguienteNum = numActual + 1;
        }
        const numeroBoleta = 'B002-' + String(siguienteNum).padStart(6, '0');

        // Insertar cabecera de venta
        const { data: venta, error: errorVenta } = await supabase
            .from('venta')
            .insert({
                usuario_id: usuarioId,
                total: parseFloat(total.toFixed(2)),
                base_imponible: parseFloat(baseImponible.toFixed(2)),
                igv: parseFloat(igv.toFixed(2)),
                numero_boleta: numeroBoleta,
                fecha: new Date().toISOString()
            })
            .select()
            .single();

        if (errorVenta) throw errorVenta;

        // Insertar items y descontar stock
        for (const item of items) {
            const subtotal = item.precio_unitario * item.cantidad;

            // Insertar venta_item
            await supabase.from('venta_item').insert({
                venta_id: venta.id,
                producto_id: item.producto_id,
                cantidad: item.cantidad,
                precio_unitario: item.precio_unitario,
                subtotal: parseFloat(subtotal.toFixed(2))
            });

            // Descontar stock con FEFO
            const { data: resultado, error: errorFefo } = await supabase
                .rpc('descontar_stock_fefo', {
                    p_producto_id: item.producto_id,
                    p_cantidad: item.cantidad
                });

            if (errorFefo) {
                console.error('Error FEFO:', errorFefo);
                throw new Error(`Error al descontar stock del producto ${item.producto_id}`);
            }

            // Actualizar contador de ventas del producto
            await supabase.rpc('', {}).then(() => {});
            const { data: prod } = await supabase
                .from('producto')
                .select('contador_ventas')
                .eq('id', item.producto_id)
                .single();

            await supabase
                .from('producto')
                .update({ contador_ventas: (prod.contador_ventas || 0) + item.cantidad })
                .eq('id', item.producto_id);
        }

        // Devolver venta con items para el PDF
        const { data: ventaCompleta } = await supabase
            .from('venta')
            .select(`
                *,
                items:venta_item (
                    cantidad,
                    precio_unitario,
                    subtotal,
                    producto:producto_id ( nombre, presentacion )
                )
            `)
            .eq('id', venta.id)
            .single();

        res.status(201).json(ventaCompleta);
    } catch (err) {
        console.error('Error al registrar venta:', err);
        res.status(500).json({ error: 'Error al registrar venta: ' + err.message });
    }
});

// GET /api/ventas/hoy — Total vendido hoy
router.get('/hoy', authMiddleware, async (req, res) => {
    try {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
            .from('venta')
            .select('total')
            .gte('fecha', hoy.toISOString());

        if (error) throw error;

        const total = data.reduce((sum, v) => sum + parseFloat(v.total), 0);
        res.json({ total, transacciones: data.length });
    } catch (err) {
        console.error('Error al obtener ventas de hoy:', err);
        res.status(500).json({ error: 'Error al obtener ventas de hoy' });
    }
});

// GET /api/ventas/semana — Ventas de la semana (no archivadas)
router.get('/semana', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('venta')
            .select(`
                *,
                items:venta_item (
                    cantidad,
                    precio_unitario,
                    subtotal,
                    producto:producto_id ( nombre, presentacion )
                )
            `)
            .order('fecha', { ascending: false });

        if (error) throw error;

        // Calcular inicio de la semana (lunes)
        const hoy = new Date();
        const diaSemana = hoy.getDay();
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
        inicioSemana.setHours(0, 0, 0, 0);

        const ventasSemana = data.filter(v => new Date(v.fecha) >= inicioSemana);
        const total = ventasSemana.reduce((sum, v) => sum + parseFloat(v.total), 0);

        res.json({
            ventas: ventasSemana,
            total,
            transacciones: ventasSemana.length
        });
    } catch (err) {
        console.error('Error al obtener ventas semanales:', err);
        res.status(500).json({ error: 'Error al obtener ventas semanales' });
    }
});

module.exports = router;
