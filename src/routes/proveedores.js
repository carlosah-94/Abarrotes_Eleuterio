const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

function normalizarTexto(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

// GET /api/proveedores — Lista de proveedores
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('proveedor')
            .select('*')
            .eq('activo', true)
            .order('nombre_display');

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener proveedores' });
    }
});

// POST /api/ordenes — Registrar orden de proveedor
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { nombre_proveedor, fecha_recepcion, items } = req.body;
        const usuarioId = req.usuario.id;

        if (!nombre_proveedor || !items || items.length === 0) {
            return res.status(400).json({ error: 'Nombre del proveedor e items son requeridos' });
        }

        const provNorm = normalizarTexto(nombre_proveedor);
        let { data: proveedor } = await supabase
            .from('proveedor')
            .select('*')
            .eq('nombre_norm', provNorm)
            .single();

        if (!proveedor) {
            const { data: nuevoProv, error: errProv } = await supabase
                .from('proveedor')
                .insert({
                    nombre_norm: provNorm,
                    nombre_display: nombre_proveedor.trim()
                })
                .select()
                .single();
            if (errProv) throw errProv;
            proveedor = nuevoProv;
        }

        const costoTotal = items.reduce((sum, item) => sum + parseFloat(item.costo_total), 0);

        const { data: orden, error: errOrden } = await supabase
            .from('orden_proveedor')
            .insert({
                proveedor_id: proveedor.id,
                usuario_id: usuarioId,
                fecha_recepcion: fecha_recepcion,
                costo_total: parseFloat(costoTotal.toFixed(2))
            })
            .select()
            .single();

        if (errOrden) throw errOrden;

        for (const item of items) {
            const { data: producto } = await supabase
                .from('producto')
                .select('id, stock_actual')
                .ilike('nombre', item.nombre_producto)
                .eq('activo', true)
                .single();

            if (!producto) {
                return res.status(400).json({
                    error: `El producto "${item.nombre_producto}" no existe en el inventario. Debe crearlo primero.`
                });
            }

            await supabase.from('item_orden_proveedor').insert({
                orden_id: orden.id,
                producto_id: producto.id,
                cantidad_recibida: item.cantidad_recibida,
                fecha_vencimiento_lote: item.fecha_vencimiento_lote || null,
                costo_total: parseFloat(item.costo_total)
            });

            await supabase.from('lote_producto').insert({
                producto_id: producto.id,
                cantidad: item.cantidad_recibida,
                fecha_venc: item.fecha_vencimiento_lote || null,
                costo_unitario: parseFloat(item.costo_total) / item.cantidad_recibida
            });

            await supabase
                .from('producto')
                .update({ stock_actual: producto.stock_actual + item.cantidad_recibida })
                .eq('id', producto.id);
        }

        res.status(201).json({ message: 'Orden registrada exitosamente', orden });
    } catch (err) {
        console.error('Error al registrar orden:', err);
        res.status(500).json({ error: 'Error al registrar orden: ' + err.message });
    }
});

module.exports = router;
