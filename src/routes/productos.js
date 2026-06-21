// src/routes/productos.js
const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const authMiddleware = require('../middleware/auth');

function normalizarTexto(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

// GET /api/productos — Lista con filtros y paginación
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { busqueda, categoria, pagina = 1, limite = 5 } = req.query;
        const offset = (parseInt(pagina) - 1) * parseInt(limite);

        let query = supabase
            .from('producto')
            .select(`
                *,
                categoria:categoria_id ( id, nombre )
            `, { count: 'exact' })
            .eq('activo', true)
            .order('nombre')
            .range(offset, offset + parseInt(limite) - 1);

        if (categoria) {
            const { data: cat } = await supabase
                .from('categoria')
                .select('id')
                .ilike('nombre', `%${categoria}%`)
                .single();
            if (cat) query = query.eq('categoria_id', cat.id);
        }

        if (busqueda) {
            query = query.or(`nombre.ilike.%${busqueda}%,presentacion.ilike.%${busqueda}%,tipo.ilike.%${busqueda}%`);
        }

        const { data, error, count } = await query;
        if (error) throw error;

        const productosConVencimiento = await Promise.all(data.map(async (p) => {
            const { data: lotes } = await supabase
                .from('lote_producto')
                .select('fecha_venc')
                .eq('producto_id', p.id)
                .gt('cantidad', 0)
                .not('fecha_venc', 'is', null)
                .order('fecha_venc', { ascending: true })
                .limit(1);

            return {
                ...p,
                fecha_vencimiento: lotes && lotes.length > 0 ? lotes[0].fecha_venc : null,
                categoria_nombre: p.categoria ? p.categoria.nombre : 'Sin categoría'
            };
        }));

        res.json({ data: productosConVencimiento, total: count });
    } catch (err) {
        console.error('Error al obtener productos:', err);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// GET /api/productos/stats — Estadísticas del inventario
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const { data: productos, error } = await supabase
            .from('producto')
            .select('precio, stock_actual, stock_minimo, categoria_id')
            .eq('activo', true);

        if (error) throw error;

        const { data: categorias } = await supabase
            .from('categoria')
            .select('id');

        const totalProductos = productos.length;
        const valorInventario = productos.reduce((sum, p) => sum + (parseFloat(p.precio) * p.stock_actual), 0);
        const stockCritico = productos.filter(p => p.stock_actual <= p.stock_minimo).length;
        const totalCategorias = categorias ? categorias.length : 0;

        res.json({ totalProductos, valorInventario, stockCritico, totalCategorias });
    } catch (err) {
        console.error('Error al obtener estadísticas:', err);
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

// GET /api/productos/frecuentes — Top 8 más vendidos
router.get('/frecuentes', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('producto')
            .select(`*, categoria:categoria_id ( nombre )`)
            .eq('activo', true)
            .order('contador_ventas', { ascending: false })
            .limit(8);

        if (error) throw error;

        const productosConDatos = await Promise.all(data.map(async (p) => {
            const { data: lotes } = await supabase
                .from('lote_producto')
                .select('fecha_venc')
                .eq('producto_id', p.id)
                .gt('cantidad', 0)
                .not('fecha_venc', 'is', null)
                .order('fecha_venc', { ascending: true })
                .limit(1);

            return {
                ...p,
                fecha_vencimiento: lotes && lotes.length > 0 ? lotes[0].fecha_venc : null,
                categoria_nombre: p.categoria ? p.categoria.nombre : 'Sin categoría'
            };
        }));

        res.json(productosConDatos);
    } catch (err) {
        console.error('Error al obtener productos frecuentes:', err);
        res.status(500).json({ error: 'Error al obtener productos frecuentes' });
    }
});

// GET /api/productos/alertas — Productos con bajo stock y próximos a vencer
router.get('/alertas', authMiddleware, async (req, res) => {
    try {
        const { data: productos, error } = await supabase
            .from('producto')
            .select(`*, categoria:categoria_id ( nombre )`)
            .eq('activo', true);

        if (error) throw error;

        const alertas = [];
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        for (const p of productos) {
            if (p.stock_actual === 0) {
                alertas.push({ tipo: 'error', titulo: 'Agotado', mensaje: `"${p.nombre}" sin stock.`, productoId: p.id });
            } else if (p.stock_actual <= p.stock_minimo) {
                alertas.push({ tipo: 'warning', titulo: 'Bajo Stock', mensaje: `"${p.nombre}" tiene stock bajo (${p.stock_actual}).`, productoId: p.id });
            }

            const { data: lotes } = await supabase
                .from('lote_producto')
                .select('fecha_venc')
                .eq('producto_id', p.id)
                .gt('cantidad', 0)
                .not('fecha_venc', 'is', null)
                .order('fecha_venc', { ascending: true })
                .limit(1);

            if (lotes && lotes.length > 0) {
                const fechaVenc = new Date(lotes[0].fecha_venc);
                fechaVenc.setHours(0, 0, 0, 0);
                const diffDias = Math.ceil((fechaVenc - hoy) / (1000 * 60 * 60 * 24));

                if (diffDias <= 0) {
                    alertas.push({ tipo: 'error', titulo: 'Vencido', mensaje: `"${p.nombre}" ya venció (${lotes[0].fecha_venc}).`, productoId: p.id });
                } else if (diffDias <= 30) {
                    alertas.push({ tipo: 'warning', titulo: 'Próximo a Vencer', mensaje: `"${p.nombre}" vence el ${lotes[0].fecha_venc}.`, productoId: p.id });
                }
            }
        }

        res.json(alertas);
    } catch (err) {
        console.error('Error al obtener alertas:', err);
        res.status(500).json({ error: 'Error al obtener alertas' });
    }
});

// POST /api/productos — Crear nuevo producto
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { nombre, presentacion, tipo, precio, stock_inicial, fecha_vencimiento, categoria } = req.body;

        if (!nombre || !precio || stock_inicial === undefined || !categoria) {
            return res.status(400).json({ error: 'Nombre, precio, stock inicial y categoría son requeridos' });
        }

        const catNorm = normalizarTexto(categoria);
        let { data: catExistente } = await supabase
            .from('categoria')
            .select('id')
            .eq('nombre_norm', catNorm)
            .single();

        if (!catExistente) {
            const { data: nuevaCat, error: errCat } = await supabase
                .from('categoria')
                .insert({ nombre: categoria.trim(), nombre_norm: catNorm })
                .select()
                .single();
            if (errCat) throw errCat;
            catExistente = nuevaCat;
        }

        const imagenUrl = `/img/productos/${normalizarTexto(nombre).replace(/\s+/g, '_')}.webp`;

        const { data: producto, error } = await supabase
            .from('producto')
            .insert({
                nombre: nombre.trim(),
                presentacion: presentacion || null,
                tipo: tipo || null,
                precio: parseFloat(precio),
                stock_actual: parseInt(stock_inicial),
                stock_minimo: 10,
                categoria_id: catExistente.id,
                imagen_url: imagenUrl
            })
            .select(`*, categoria:categoria_id ( nombre )`)
            .single();

        if (error) throw error;

        if (parseInt(stock_inicial) > 0) {
            await supabase
                .from('lote_producto')
                .insert({
                    producto_id: producto.id,
                    cantidad: parseInt(stock_inicial),
                    fecha_venc: fecha_vencimiento || null
                });
        }

        res.status(201).json({
            ...producto,
            fecha_vencimiento: fecha_vencimiento || null,
            categoria_nombre: producto.categoria ? producto.categoria.nombre : categoria
        });
    } catch (err) {
        console.error('Error al crear producto:', err);
        res.status(500).json({ error: 'Error al crear producto' });
    }
});

// PUT /api/productos/:id — Editar producto
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, presentacion, tipo, precio, categoria } = req.body;

        let categoriaId;
        if (categoria) {
            const catNorm = normalizarTexto(categoria);
            let { data: catExistente } = await supabase
                .from('categoria')
                .select('id')
                .eq('nombre_norm', catNorm)
                .single();

            if (!catExistente) {
                const { data: nuevaCat } = await supabase
                    .from('categoria')
                    .insert({ nombre: categoria.trim(), nombre_norm: catNorm })
                    .select()
                    .single();
                catExistente = nuevaCat;
            }
            categoriaId = catExistente.id;
        }

        const updateData = {};
        if (nombre !== undefined) updateData.nombre = nombre.trim();
        if (presentacion !== undefined) updateData.presentacion = presentacion || null;
        if (tipo !== undefined) updateData.tipo = tipo || null;
        if (precio !== undefined) updateData.precio = parseFloat(precio);
        if (categoriaId) updateData.categoria_id = categoriaId;

        const { data, error } = await supabase
            .from('producto')
            .update(updateData)
            .eq('id', id)
            .select(`*, categoria:categoria_id ( nombre )`)
            .single();

        if (error) throw error;

        res.json({
            ...data,
            categoria_nombre: data.categoria ? data.categoria.nombre : 'Sin categoría'
        });
    } catch (err) {
        console.error('Error al actualizar producto:', err);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

// DELETE /api/productos/:id — Soft delete
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase
            .from('producto')
            .update({ activo: false })
            .eq('id', id);

        if (error) throw error;
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (err) {
        console.error('Error al eliminar producto:', err);
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

module.exports = router;
