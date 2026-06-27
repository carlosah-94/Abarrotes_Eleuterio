const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

// GET /api/reportes/resumen — Resumen de ventas y gastos de la semana
router.get('/resumen', authMiddleware, async (req, res) => {
    try {
        const hoy = new Date();
        const diaSemana = hoy.getDay();
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
        inicioSemana.setHours(0, 0, 0, 0);

        const { data: ventas } = await supabase
            .from('venta')
            .select('total')
            .gte('fecha', inicioSemana.toISOString());

        const totalVentas = (ventas || []).reduce((sum, v) => sum + parseFloat(v.total), 0);

        const { data: ordenes } = await supabase
            .from('orden_proveedor')
            .select('costo_total')
            .gte('fecha_recepcion', inicioSemana.toISOString().split('T')[0]);

        const totalGastos = (ordenes || []).reduce((sum, o) => sum + parseFloat(o.costo_total), 0);

        res.json({
            totalVentas,
            totalGastos,
            totalTransacciones: (ventas || []).length,
            totalOrdenes: (ordenes || []).length
        });
    } catch (err) {
        console.error('Error al obtener resumen:', err);
        res.status(500).json({ error: 'Error al obtener resumen' });
    }
});

// GET /api/reportes/ventas-semana — Detalle de ventas de la semana
router.get('/ventas-semana', authMiddleware, async (req, res) => {
    try {
        const hoy = new Date();
        const diaSemana = hoy.getDay();
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
        inicioSemana.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
            .from('venta')
            .select(`
                *,
                items:venta_item (
                    cantidad, precio_unitario, subtotal,
                    producto:producto_id ( nombre, presentacion )
                )
            `)
            .gte('fecha', inicioSemana.toISOString())
            .order('fecha', { ascending: true });

        if (error) throw error;

        const total = data.reduce((sum, v) => sum + parseFloat(v.total), 0);

        res.json({
            ventas: data,
            total,
            transacciones: data.length
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener ventas semanales' });
    }
});

// GET /api/reportes/gastos-semana — Detalle de gastos de la semana
router.get('/gastos-semana', authMiddleware, async (req, res) => {
    try {
        const hoy = new Date();
        const diaSemana = hoy.getDay();
        const inicioSemana = new Date(hoy);
        inicioSemana.setDate(hoy.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
        inicioSemana.setHours(0, 0, 0, 0);

        const { data, error } = await supabase
            .from('orden_proveedor')
            .select(`
                *,
                proveedor:proveedor_id ( nombre_display ),
                items:item_orden_proveedor (
                    cantidad_recibida, fecha_vencimiento_lote, costo_total,
                    producto:producto_id ( nombre, presentacion )
                )
            `)
            .gte('fecha_recepcion', inicioSemana.toISOString().split('T')[0])
            .order('fecha_recepcion', { ascending: true });

        if (error) throw error;

        const total = data.reduce((sum, o) => sum + parseFloat(o.costo_total), 0);

        res.json({
            ordenes: data,
            total,
            totalOrdenes: data.length
        });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener gastos semanales' });
    }
});

// GET /api/reportes/proveedores-mes — Gastos mensuales por proveedor
router.get('/proveedores-mes', authMiddleware, async (req, res) => {
    try {
        const hoy = new Date();
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

        const { data: ordenes, error } = await supabase
            .from('orden_proveedor')
            .select(`
                costo_total,
                proveedor:proveedor_id ( id, nombre_display )
            `)
            .gte('fecha_recepcion', inicioMes.toISOString().split('T')[0]);

        if (error) throw error;

        const provMap = {};
        (ordenes || []).forEach(o => {
            const provNombre = o.proveedor ? o.proveedor.nombre_display : 'Desconocido';
            if (!provMap[provNombre]) {
                provMap[provNombre] = { proveedor: provNombre, gasto_mensual: 0, total_ordenes: 0 };
            }
            provMap[provNombre].gasto_mensual += parseFloat(o.costo_total);
            provMap[provNombre].total_ordenes++;
        });

        res.json(Object.values(provMap).sort((a, b) => b.gasto_mensual - a.gasto_mensual));
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener gastos por proveedor' });
    }
});

module.exports = router;
