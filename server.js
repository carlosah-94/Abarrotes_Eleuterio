const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de API
const authRouter = require('./src/routes/auth');
const productosRouter = require('./src/routes/productos');
const categoriasRouter = require('./src/routes/categorias');
const ventasRouter = require('./src/routes/ventas');
const proveedoresRouter = require('./src/routes/proveedores');
const reportesRouter = require('./src/routes/reportes');

app.use('/api/auth', authRouter);
app.use('/api/productos', productosRouter);
app.use('/api/categorias', categoriasRouter);
app.use('/api/ventas', ventasRouter);
app.use('/api/ordenes', proveedoresRouter);
app.use('/api/proveedores', proveedoresRouter);
app.use('/api/reportes', reportesRouter);

// Ruta principal — sirve el frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
    console.log(`🏪 Servidor Abarrotes Eleuterio corriendo en http://localhost:${PORT}`);
});
