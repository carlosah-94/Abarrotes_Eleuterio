# Sistema de Gestión de Inventario - Abarrotes Eleuterio

## Descripción
Es una plataforma web diseñada para optimizar la logística y el control de inventario de una tienda de abarrotes. Permite gestionar productos, registrar ventas y monitorear el stock mediante un dashboard intuitivo.

## Tecnologías
- **Frontend:** HTML5, CSS3, JavaScript
- **Backend:** Node.js, Express
- **Base de Datos:** PostgreSQL
- **Control de Versiones:** Git & GitHub (Git Flow)

## Instalación y Ejecución Local

1. Para instalar y ejecutar el sistema en tu computadora, es requisito indispensable tener instalado previamente Node.js (el cual ya incluye el gestor de paquetes npm). *No cuenta con base de datos actualmente*

2. Primero, debes clonar este repositorio en tu computadora usando Git o descargarlo como archivo ZIP y extraerlo en una carpeta de tu preferencia. Una vez descargado, abre una terminal (o consola de comandos) asegurándote de estar ubicado exactamente dentro de la carpeta principal del proyecto.

3. A continuación, en la misma terminal, ejecuta el comando "npm install". Esto le indicará a Node.js que lea el archivo "package.json" y descargue automáticamente todas las dependencias necesarias (como el framework Express) para que el servidor funcione.

4. Una vez que termine la instalación de las dependencias, inicializa el sistema ejecutando el comando **node server.js**. Si la consola te indica que el servidor está corriendo, el proceso fue exitoso.

5. Abre tu navegador web e ingresa la dirección local predeterminada, que es `http://localhost:3000`

**Sprint 2 - Mejoras y control de inventario**

- **Nuevas Características:** Semáforo de stock (Prevención de ventas sin unidades), Alertas de vencimiento de productos, Filtrado y búsqueda global en tiempo real, Tipos de productos dinámicos (Retornables, etc.).
- **Decisiones Técnicas:** Se restringió el modelo de usuarios a un entorno de negocio cerrado (Privado) eliminando registros públicos.

## Sprint 3

Durante el Sprint 3, se implementaron diversas mejoras funcionales y de experiencia de usuario enfocadas en el control financiero y gestión de inventario:

- **Buscador Inteligente:** Búsqueda flexible en el inventario y ventas (ignora mayúsculas y tildes).
- **Gestión de Notificaciones:** Sistema dinámico de alertas tempranas sobre stock bajo y productos próximos a caducar.
- **Control de Vencimientos y Categorías:** Posibilidad de agregar categorías al vuelo (ComboBox) y registrar fechas de vencimiento específicas por lote al reabastecer productos desde proveedores.
- **Generación de Comprobantes:** Exportación de boletas de venta en formato "ticket" optimizado para impresión térmica (mediante jsPDF).
- **Reportes Automatizados:** Generación y descarga automática de reportes PDF (Ventas Semanales y Gastos de Proveedores) todos los domingos a medianoche.
- **Dashboard Dinámico:** Tarjetas funcionales de resumen (Ventas del día, Stock Crítico) con reseteo automático a medianoche.


## Equipo de Desarrollo
- **Connery Diaz** - Product Owner
- **Carlos Atahua** - Scrum Master
- **Avril Soriano** - Desarrolladora
- **Marco Martínez** - Desarrollador
- **Ricardo De La Cruz** - Desarrollador