document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los contenedores principales
    const sectionLogin = document.getElementById('view-login');
    const sectionRegister = document.getElementById('view-register');
    const sectionMainApp = document.getElementById('view-main-app');

    // Referencias a las vistas dentro de la aplicación
    const appViews = {
        'dashboard': document.getElementById('app-dashboard'),
        'inventario': document.getElementById('app-inventario'),
        'ventas': document.getElementById('app-ventas'),
        'reportes': document.getElementById('app-reportes'),
        'proveedores': document.getElementById('app-proveedores')
    };

    // Imagen por defecto en formato SVG Data URL
    const DEFAULT_PRODUCT_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' width='100%' height='100%'><rect width='100%' height='100%' fill='%23f1f5f9'/><g fill='none' stroke='%2394a3b8' stroke-width='8' stroke-linecap='round' stroke-linejoin='round'><path d='M60 80h80v70a10 10 0 0 1-10 10H70a10 10 0 0 1-10-10V80z'/><path d='M85 80V60a15 15 0 0 1 30 0v20'/></g><text x='100' y='170' font-family='system-ui, sans-serif' font-size='13' font-weight='600' fill='%2364748b' text-anchor='middle'>Sin Imagen</text></svg>";

    // Función auxiliar para obtener la imagen correcta de un producto
    function getProductImage(p) {
        const oldMilkImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgVkKE_tfawwqwEkLX-lyRmdSXUCTFajYQOShvl7TNY262UdpLieZNgN9sXz1dUYIKGVhRhj5EEMJ8UYvUh8arGs1ct8MkPl0dGY1ZqXvEpOOkOeq5FwLRDdswjmBFO302bIyTw9v7DditPXHjYE20AROaQ7J2lKF7CIIAcnzzZoGbCMcFc6Wd7lsJH58R2cHWieLPptQaijka01eZRuIvn6XljFNwF4Ugts08BdrOxZZvd-Rk28hQ3SEp27WW_oI4-X8CeZk46s54';
        if (!p.img || (p.img === oldMilkImage && !p.name.toLowerCase().includes('leche'))) {
            return DEFAULT_PRODUCT_IMAGE;
        }
        return p.img;
    }

    // Función auxiliar para normalizar texto
    function normalizeText(text) {
        if (!text) return '';
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }

    // Convertidor de números a letras en español
    function numberToLetters(num) {
        const units = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
        const tens = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
        const teens = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
        const twenties = ['VEINTE', 'VEINTIUNO', 'VEINTIDOS', 'VEINTITRES', 'VEINTICUATRO', 'VEINTICINCO', 'VEINTISEIS', 'VEINTISIETE', 'VEINTIOCHO', 'VEINTINUEVE'];
        const hundreds = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SIETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

        function convertGroup(n) {
            if (n === 100) return 'CIEN';
            let output = '';
            let h = Math.floor(n / 100);
            let r = n % 100;
            if (h > 0) output += hundreds[h] + ' ';
            if (r > 0) {
                if (r < 10) output += units[r];
                else if (r < 20) output += teens[r - 10];
                else if (r < 30) output += twenties[r - 20];
                else {
                    let t = Math.floor(r / 10);
                    let u = r % 10;
                    output += tens[t];
                    if (u > 0) output += ' Y ' + units[u];
                }
            }
            return output.trim();
        }

        const integerPart = Math.floor(num);
        const decimalPart = Math.round((num - integerPart) * 100);
        const decimalStr = String(decimalPart).padStart(2, '0') + '/100 SOLES';

        if (integerPart === 0) return 'CERO Y ' + decimalStr;

        let result = '';
        let thousands = Math.floor(integerPart / 1000);
        let remainder = integerPart % 1000;

        if (thousands > 0) {
            if (thousands === 1) result += 'MIL ';
            else result += convertGroup(thousands) + ' MIL ';
        }
        if (remainder > 0) {
            result += convertGroup(remainder) + ' ';
        }

        return (result.trim() + ' CON ' + decimalStr).toUpperCase();
    }

    // Inicializar carrito en localStorage
    if (!localStorage.getItem('cart')) {
        localStorage.setItem('cart', JSON.stringify([]));
    }
    if (!localStorage.getItem('dismissedNotifications')) {
        localStorage.setItem('dismissedNotifications', JSON.stringify([]));
    }

    // FUNCIÓN HELPER PARA PETICIONES AUTENTICADAS
    async function apiFetch(url, options = {}) {
        const token = localStorage.getItem('authToken');
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers
        };
        const response = await fetch(url, { ...options, headers });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('authToken');
            navigateTo('login');
            throw new Error('Sesión expirada');
        }

        return response;
    }
    window.apiFetch = apiFetch;

    // Función para obtener carrito desde localStorage
    function getCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

    // Función para guardar carrito y actualizar vista
    function saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
    }

    // Mostrar/ocultar contraseña en el login
    const loginToggleBtn = document.getElementById('login-toggle-password');
    const loginPasswordInput = document.getElementById('login-password');
    if (loginToggleBtn && loginPasswordInput) {
        loginToggleBtn.addEventListener('click', () => {
            const iconSpan = loginToggleBtn.querySelector('span');
            if (loginPasswordInput.type === 'password') {
                loginPasswordInput.type = 'text';
                if (iconSpan) iconSpan.innerText = 'visibility_off';
            } else {
                loginPasswordInput.type = 'password';
                if (iconSpan) iconSpan.innerText = 'visibility';
            }
        });
    }

    // Funciones de navegación principal
    window.navigateTo = function(viewName) {
        sectionLogin.classList.add('hidden');
        sectionRegister.classList.add('hidden');
        sectionMainApp.classList.add('hidden');

        if (viewName === 'login') sectionLogin.classList.remove('hidden');
        if (viewName === 'register') sectionRegister.classList.remove('hidden');
        if (viewName === 'main') {
            if (!localStorage.getItem('authToken')) {
                sectionLogin.classList.remove('hidden');
                return;
            }
            sectionMainApp.classList.remove('hidden');
            switchAppView('dashboard');
        }
    };

    // Funciones de navegación de la app (switchAppView)
    window.switchAppView = function(viewName) {
        // Ocultar todas las vistas principales
        Object.values(appViews).forEach(view => {
            if (view) {
                view.classList.add('hidden');
                // Quitar display flex temporal si lo tenía
                if(view.id === 'app-ventas') view.classList.remove('flex');
            }
        });
        
        // Mostrar vista objetivo
        if (appViews[viewName]) {
            appViews[viewName].classList.remove('hidden');
            if(viewName === 'ventas') {
                appViews[viewName].classList.add('flex'); // ventas es un flex container
            }
        }

        // Actualizar visibilidad de barra de búsqueda (Solo en inventario y ventas)
        const topSearchBar = document.getElementById('top-search-bar');
        if (topSearchBar) {
            if (viewName === 'inventario' || viewName === 'ventas') {
                topSearchBar.classList.remove('hidden');
                topSearchBar.classList.add('md:block');
            } else {
                topSearchBar.classList.add('hidden');
                topSearchBar.classList.remove('md:block');
            }
        }

        // Actualizar estado activo en Sidebar
        document.querySelectorAll('.sidebar-link').forEach(link => {
            link.classList.remove('text-teal-900', 'font-bold', 'border-r-4', 'border-teal-700', 'bg-teal-50/30');
            link.classList.add('text-slate-600');
            
            if (link.dataset.target === viewName) {
                link.classList.remove('text-slate-600');
                link.classList.add('text-teal-900', 'font-bold', 'border-r-4', 'border-teal-700', 'bg-teal-50/30');
            }
        });

        // Refrescar data según vista
        if (viewName === 'dashboard') updateDashboard();
        if (viewName === 'inventario') renderInventory();
        if (viewName === 'ventas') {
            renderFrequentProducts();
            renderCart();
        }
        if (viewName === 'proveedores') {
            updateProviderDatalist();
        }
        if (viewName === 'reportes') {
            updateReportsSummary();
            renderProvidersListInReports();
        }
    };

    // Control de Modales (abrir/cerrar)
    window.openModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('hidden');
    };

    window.closeModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
             modal.classList.add('hidden');
        }
    };

    // Toggle para notificaciones
    window.toggleNotifications = function(event) {
        if (event) {
            event.stopPropagation();
        }
        const modal = document.getElementById('modal-notifications');
        if (modal) {
            modal.classList.toggle('hidden');
        }
    };

    // Cerrar notificaciones al hacer click fuera
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('modal-notifications');
        if (modal && !modal.classList.contains('hidden')) {
            const modalContent = modal.querySelector('.pointer-events-auto');
            const bellBtn = document.querySelector('[onclick="toggleNotifications(event)"]');
            if (modalContent && !modalContent.contains(e.target) && (!bellBtn || !bellBtn.contains(e.target))) {
                modal.classList.add('hidden');
            }
        }
    });

    // INVENTARIO Y PAGINACION - variables de estado
    let currentPage = 1;
    const itemsPerPage = 5;
    let currentSearchTerm = '';

    // Event listener para búsqueda en inventario
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchTerm = e.target.value;
            currentPage = 1;
            renderInventory();
            renderFrequentProducts();
        });
    }

    // Función para actualizar datalist de categorías
    window.updateCategoryDatalist = async function() {
        const datalist = document.getElementById('categories-list');
        if (!datalist) return;
        try {
            const res = await apiFetch('/api/categorias');
            const categorias = await res.json();
            datalist.innerHTML = '';
            categorias.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.nombre;
                datalist.appendChild(opt);
            });
        } catch (err) {
            console.error('Error cargando categorías:', err);
        }
    };

    // Función para renderizar inventario con paginación
    window.renderInventory = async function() {
        const tableBody = document.querySelector('#inventory-table tbody');
        if (!tableBody) return;

        try {
            const statsRes = await apiFetch('/api/productos/stats');
            const stats = await statsRes.json();

            const cardTotal = document.getElementById('card-total-products');
            const cardValue = document.getElementById('card-inventory-value');
            const cardCritical = document.getElementById('card-critical-stock');
            const cardCats = document.getElementById('card-categories-count');

            if (cardTotal) cardTotal.innerText = stats.totalProductos;
            if (cardValue) cardValue.innerText = `S/. ${stats.valorInventario.toFixed(2)}`;
            if (cardCritical) cardCritical.innerText = stats.stockCritico;
            if (cardCats) cardCats.innerText = stats.totalCategorias;

            const params = new URLSearchParams();
            if (currentSearchTerm) params.set('busqueda', currentSearchTerm);
            params.set('pagina', currentPage);
            params.set('limite', itemsPerPage);

            const prodRes = await apiFetch(`/api/productos?${params}`);
            const { data: productos, total } = await prodRes.json();

            const totalPages = Math.ceil(total / itemsPerPage) || 1;
            if (currentPage > totalPages) currentPage = totalPages;
            if (currentPage < 1) currentPage = 1;

            tableBody.innerHTML = '';

            productos.forEach(p => {
                const stockClass = p.stock_actual <= p.stock_minimo ? 'text-error' : '';
                const catName = p.categoria_nombre || (p.categoria ? p.categoria.nombre : 'Sin categoría');
                const catColor = normalizeText(catName).includes('lacteo') ? 'bg-primary-fixed/50 text-on-primary-fixed-variant' : 'bg-secondary-container/30 text-on-secondary-container';

                let dateClass = 'text-on-surface';
                let dateStr = 'N/A';
                if (p.fecha_vencimiento) {
                    dateStr = p.fecha_vencimiento;
                    const today = new Date(); today.setHours(0,0,0,0);
                    const due = new Date(p.fecha_vencimiento); due.setHours(0,0,0,0);
                    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
                    if (diffDays <= 0) dateClass = 'text-error font-bold text-red-600';
                    else if (diffDays <= 30) dateClass = 'text-orange-600 font-bold';
                }

                const displayName = p.nombre + (p.presentacion ? ' ' + p.presentacion : '');
                const tr = document.createElement('tr');
                tr.className = 'hover:bg-surface-container-low transition-colors';
                tr.innerHTML = `
                    <td class="px-6 py-4 font-semibold text-on-surface">${displayName}</td>
                    <td class="px-6 py-4 text-center"><span class="px-3 py-1 ${catColor} rounded-full text-xs font-semibold">${catName}</span></td>
                    <td class="px-6 py-4 font-bold text-center ${stockClass}">${p.stock_actual}</td>
                    <td class="px-6 py-4 font-semibold text-center ${dateClass}">${dateStr}</td>
                    <td class="px-6 py-4 text-center font-headline font-bold">${parseFloat(p.precio).toFixed(2)}</td>
                    <td class="px-6 py-4 text-center">
                        <button onclick="editProduct(${p.id})" class="text-slate-400 hover:text-primary transition-all p-1"><span class="material-symbols-outlined text-sm">edit</span></button>
                        <button onclick="deleteProduct(${p.id})" class="text-slate-400 hover:text-tertiary transition-all p-1 ml-1"><span class="material-symbols-outlined text-sm">delete</span></button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

            const txtInfo = document.getElementById('pagination-info');
            const btnPrev = document.getElementById('btn-prev-page');
            const btnNext = document.getElementById('btn-next-page');

            if (txtInfo) txtInfo.innerText = `Página ${currentPage} de ${totalPages}`;
            if (btnPrev) { btnPrev.disabled = (currentPage === 1); btnPrev.onclick = () => { if (currentPage > 1) { currentPage--; renderInventory(); } }; }
            if (btnNext) { btnNext.disabled = (currentPage === totalPages); btnNext.onclick = () => { if (currentPage < totalPages) { currentPage++; renderInventory(); } }; }

        } catch (err) {
            console.error('Error al cargar inventario:', err);
            if (err.message !== 'Sesión expirada') {
                tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-error">Error al cargar inventario</td></tr>`;
            }
        }
    };

    // Función para eliminar producto
    window.deleteProduct = async function(id) {
        if (confirm('¿Seguro que deseas eliminar este producto?')) {
            try {
                await apiFetch(`/api/productos/${id}`, { method: 'DELETE' });
                await renderInventory();
            } catch (err) {
                console.error('Error al eliminar:', err);
            }
        }
    };

    // Variables y función para editar producto
    let editingId = null;
    window.editProduct = async function(id) {
        try {
            const res = await apiFetch(`/api/productos?busqueda=&pagina=1&limite=100`);
            const { data: productos } = await res.json();
            const product = productos.find(p => p.id === id);
            if (!product) return;

            editingId = id;
            document.getElementById('edit-product-name').value = product.nombre || '';
            document.getElementById('edit-product-size').value = product.presentacion || '';
            const typeInput = document.getElementById('edit-product-type');
            if (typeInput) typeInput.value = product.tipo || '';
            document.getElementById('edit-product-price').value = product.precio || 0;
            document.getElementById('edit-product-date').value = product.fecha_vencimiento || '';
            const catInput = document.getElementById('edit-product-category');
            if (catInput) catInput.value = product.categoria_nombre || '';

            openModal('modal-edit-product');
        } catch (err) {
            console.error('Error cargando producto para editar:', err);
        }
    };

    // Event listener para formulario de edición de producto
    document.getElementById('form-edit-product').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const response = await apiFetch(`/api/productos/${editingId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    nombre: document.getElementById('edit-product-name').value,
                    presentacion: document.getElementById('edit-product-size').value,
                    tipo: document.getElementById('edit-product-type') ? document.getElementById('edit-product-type').value : '',
                    precio: parseFloat(document.getElementById('edit-product-price').value),
                    categoria: document.getElementById('edit-product-category') ? document.getElementById('edit-product-category').value.trim() : 'Abarrotes'
                })
            });

            if (response.ok) {
                closeModal('modal-edit-product');
                await renderInventory();
            } else {
                const err = await response.json();
                alert('Error: ' + err.error);
            }
        } catch (err) {
            if (err.message !== 'Sesión expirada') alert('Error de conexión');
        }
    });

    // Event listener para formulario de agregar producto
    document.getElementById('form-add-product').addEventListener('submit', async (e) => {
        e.preventDefault();
        const catInput = document.getElementById('add-product-category');
        const categoryVal = catInput ? catInput.value.trim() : 'Abarrotes';
        const priceVal = parseFloat(document.getElementById('add-product-price').value);
        const stockVal = parseInt(document.getElementById('add-product-stock').value, 10);
        const dateVal = document.getElementById('add-product-date').value;
        const nameVal = document.getElementById('add-product-name').value;
        const sizeVal = document.getElementById('add-product-size').value;
        const typeVal = document.getElementById('add-product-type') ? document.getElementById('add-product-type').value : '';

        try {
            const response = await apiFetch('/api/productos', {
                method: 'POST',
                body: JSON.stringify({
                    nombre: nameVal,
                    presentacion: sizeVal,
                    tipo: typeVal,
                    precio: priceVal,
                    stock_inicial: stockVal,
                    fecha_vencimiento: dateVal,
                    categoria: categoryVal
                })
            });

            if (response.ok) {
                e.target.reset();
                closeModal('modal-add-product');
                await renderInventory();
                checkNotifications();
            } else {
                const err = await response.json();
                alert('Error: ' + err.error);
            }
        } catch (err) {
            if (err.message !== 'Sesión expirada') alert('Error de conexión');
        }
    });

    // Función para renderizar productos frecuentes en ventas
    window.renderFrequentProducts = async function() {
        const grid = document.getElementById('frequent-products-grid');
        if (!grid) return;

        try {
            let url = '/api/productos/frecuentes';
            if (currentSearchTerm) {
                url = `/api/productos?busqueda=${encodeURIComponent(currentSearchTerm)}&limite=8`;
            }

            const res = await apiFetch(url);
            let productos;
            const data = await res.json();
            productos = data.data ? data.data : data;

            grid.innerHTML = '';
            if (!productos || productos.length === 0) {
                grid.innerHTML = '<p class="text-sm text-slate-400 text-center col-span-4 py-8">No hay productos que coincidan.</p>';
                return;
            }

            productos.forEach(p => {
                let stockHtml = '';
                let btnDisabled = '';
                let btnClass = 'mt-auto w-full py-2 text-xs bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-colors';

                if (p.stock_actual > 10) {
                    stockHtml = `<p class="text-xs mb-2 text-slate-600"><strong>Stock: ${p.stock_actual}</strong> 🟢</p>`;
                } else if (p.stock_actual > 0) {
                    stockHtml = `<p class="text-xs mb-2 text-orange-600"><strong>Stock: ${p.stock_actual}</strong> 🟠</p>`;
                } else {
                    stockHtml = `<p class="text-xs mb-2 text-red-600"><strong>Agotado</strong> 🔴</p>`;
                    btnDisabled = 'disabled';
                    btnClass = 'mt-auto w-full py-2 text-xs bg-slate-100 text-slate-400 font-bold rounded-lg cursor-not-allowed';
                }

                const typeTag = p.tipo ? `<div class="mb-2 flex justify-end min-h-[20px]"><span class="px-2 py-0.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-md text-[10px] font-bold leading-none">${p.tipo}</span></div>` : '<div class="mb-2 min-h-[20px]"></div>';

                const imgSrc = p.imagen_url || DEFAULT_PRODUCT_IMAGE;

                const div = document.createElement('div');
                div.className = 'bg-surface-container-lowest p-4 rounded-xl shadow-sm text-center flex flex-col justify-between';
                div.innerHTML = `
                    ${typeTag}
                    <div>
                        <img src="${imgSrc}" onerror="this.src='${DEFAULT_PRODUCT_IMAGE}'" class="h-24 w-full object-cover rounded-md mb-2 bg-surface-container-low ${p.stock_actual === 0 ? 'opacity-50' : ''}">
                        <p class="font-bold text-sm leading-tight mb-1">${p.nombre} ${p.presentacion || ''}</p>
                        <p class="text-primary font-bold mb-1">S/. ${parseFloat(p.precio).toFixed(2)}</p>
                        ${stockHtml}
                    </div>
                    <button onclick="addToCart(${p.id}, '${p.nombre.replace(/'/g, "\\'")}', ${p.precio}, ${p.stock_actual}, '${(p.presentacion || '').replace(/'/g, "\\'")}')" ${btnDisabled} class="${btnClass}">Agregar</button>
                `;
                grid.appendChild(div);
            });
        } catch (err) {
            if (err.message !== 'Sesión expirada') {
                grid.innerHTML = '<p class="text-error text-center col-span-4">Error al cargar productos</p>';
            }
        }
    };

    // Función para agregar producto al carrito
    window.addToCart = function(id, nombre, precio, stockDisponible, presentacion) {
        const cart = getCart();
        const existing = cart.find(c => c.id === id);

        if (existing) {
            if (existing.qty < stockDisponible) {
                existing.qty++;
            } else {
                alert('Stock insuficiente para este producto');
                return;
            }
        } else {
            if (stockDisponible > 0) {
                cart.push({ id, name: nombre, price: precio, qty: 1, stock: stockDisponible, presentation: presentacion });
            } else {
                alert('Producto fuera de stock');
                return;
            }
        }
        saveCart(cart);
    };

    // Función para actualizar cantidad en carrito
    window.updateCartQty = function(id, delta) {
        let cart = getCart();
        const item = cart.find(c => c.id === id);

        if(item) {
            const newQty = item.qty + delta;
            const maxStock = item.stock || 999;
            if(newQty > 0 && newQty <= maxStock) {
                 item.qty = newQty;
            } else if (newQty <= 0) {
                 cart = cart.filter(c => c.id !== id);
            }
        }
        saveCart(cart);
    };

    // Función para renderizar carrito en vista de ventas
    window.renderCart = function() {
        const cartContainer = document.getElementById('cart-items');
        const cartTotalSpan = document.getElementById('cart-total');
        if (!cartContainer || !cartTotalSpan) return;
        
        const cart = getCart();
        cartContainer.innerHTML = '';
        
        let total = 0;
        cart.forEach(item => {
            total += (item.price * item.qty);
            
            const div = document.createElement('div');
            div.className = 'flex justify-between items-center bg-surface-container-low p-2 rounded-lg';
            div.innerHTML = `
                <div>
                    <p class="text-sm font-bold truncate max-w-[150px]">${item.name} ${item.presentation || ''}</p>
                    <p class="text-xs text-slate-500">S/. ${parseFloat(item.price).toFixed(2)}</p>
                </div>
                <div class="flex items-center gap-2 bg-white px-2 py-1 rounded-full shadow-sm shrink-0">
                    <button type="button" onclick="updateCartQty(${item.id}, -1)" class="w-5 h-5 flex text-primary hover:bg-surface-container rounded-full items-center justify-center transition-colors"><span class="material-symbols-outlined text-[14px]">remove</span></button>
                    <span class="text-xs font-bold w-4 text-center">${item.qty}</span>
                    <button type="button" onclick="updateCartQty(${item.id}, 1)" class="w-5 h-5 flex text-primary hover:bg-surface-container rounded-full items-center justify-center transition-colors"><span class="material-symbols-outlined text-[14px]">add</span></button>
                </div>
            `;
            cartContainer.appendChild(div);
        });
        
        if(cart.length === 0) {
             cartContainer.innerHTML = '<p class="text-xs text-slate-400 text-center py-4">No hay productos en la venta actual.</p>';
             total = 0;
        }
        
        cartTotalSpan.innerText = `S/. ${total.toFixed(2)}`;
    };

    // Event listener para formulario de venta
    document.getElementById('form-sale').addEventListener('submit', async (e) => {
        e.preventDefault();
        const cart = getCart();
        if (cart.length === 0) { alert('El carrito está vacío'); return; }

        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<span class="material-symbols-outlined text-[20px] animate-spin">progress_activity</span> Procesando...';

        try {
            const response = await apiFetch('/api/ventas', {
                method: 'POST',
                body: JSON.stringify({
                    items: cart.map(item => ({
                        producto_id: item.id,
                        cantidad: item.qty,
                        precio_unitario: item.price
                    }))
                })
            });

            if (response.ok) {
                const venta = await response.json();
                localStorage.setItem('lastSale', JSON.stringify({
                    id: venta.numero_boleta,
                    date: venta.fecha,
                    items: venta.items.map(i => ({
                        name: i.producto ? i.producto.nombre + (i.producto.presentacion ? ' ' + i.producto.presentacion : '') : 'Producto',
                        price: i.precio_unitario,
                        qty: i.cantidad
                    })),
                    total: parseFloat(venta.total),
                    base_imponible: parseFloat(venta.base_imponible),
                    igv: parseFloat(venta.igv),
                    numero_boleta: venta.numero_boleta
                }));
                saveCart([]);
                alert('Venta finalizada exitosamente.');
                await renderFrequentProducts();
                updateDashboard();
                checkNotifications();
            } else {
                const err = await response.json();
                alert('Error: ' + err.error);
            }
        } catch (err) {
            if (err.message !== 'Sesión expirada') alert('Error de conexión al registrar venta');
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'Finalizar Venta <span class="material-symbols-outlined">check_circle</span>';
        }
    });

    // Event listener para descargar comprobante PDF
    const btnReceipt = document.getElementById('btn-download-receipt');
    if (btnReceipt) {
        btnReceipt.addEventListener('click', () => {
            const lastSale = JSON.parse(localStorage.getItem('lastSale'));
            if (!lastSale) {
                alert('No hay ninguna venta reciente para descargar comprobante.');
                return;
            }
            generateReceiptPDF(lastSale);
        });
    }

    // Función para generar comprobante PDF (boleta térmica)
    function generateReceiptPDF(sale) {
        const { jsPDF } = window.jspdf;
        const itemsCount = sale.items.length;
        // Altura dinámica: header + items + pie
        const receiptHeight = 85 + (itemsCount * 6) + 55;
        
        const doc = new jsPDF({
            unit: 'mm',
            format: [80, Math.max(120, receiptHeight)]
        });
        
        // --- 1. DIBUJAR QR PLACEHOLDER ---
        doc.setLineWidth(0.5);
        doc.setDrawColor(0);
        doc.rect(28, 5, 24, 24); // Centrado en la cinta de 80mm
        
        // Patrones mock del QR
        doc.setFillColor(0);
        doc.rect(30, 7, 6, 6, "F");
        doc.rect(44, 7, 6, 6, "F");
        doc.rect(30, 21, 6, 6, "F");
        doc.rect(38, 15, 4, 4, "F");
        doc.rect(45, 22, 4, 4, "F");
        
        // --- 2. CABECERA DE LA TIENDA ---
        doc.setFont("courier", "bold");
        doc.setFontSize(11);
        doc.text("ABARROTES ELEUTERIO", 40, 34, { align: "center" });
        
        doc.setFont("courier", "normal");
        doc.setFontSize(7.5);
        doc.text("Sector 6, Grupo 5-A, Mz. k, lote 24", 40, 38, { align: "center" });
        doc.text("LIMA - LIMA - VILLA EL SALVADOR", 40, 42, { align: "center" });
        doc.text("RUC: 10089803361", 40, 46, { align: "center" });
        
        doc.setFont("courier", "bold");
        doc.text("BOLETA DE VENTA ELECTRONICA", 40, 51, { align: "center" });
        
        // Boleta ID (basado en los últimos 6 dígitos del ID)
        const ticketNum = String(sale.id).substring(String(sale.id).length - 6);
        doc.text(`B002-${ticketNum}`, 40, 55, { align: "center" });
        
        doc.setFont("courier", "normal");
        const saleDate = new Date(sale.date);
        doc.text(`FECHA EMISION: ${saleDate.toLocaleDateString()}`, 5, 60);
        
        doc.text("=====================================", 40, 64, { align: "center" });
        doc.text("UDS DESCRIPCION          P.U.  IMPORTE", 5, 68);
        doc.text("=====================================", 40, 72, { align: "center" });
        
        // --- 3. ITEMS DE LA COMPRA ---
        let y = 76;
        sale.items.forEach(item => {
            const qtyStr = String(item.qty).padEnd(3, ' ');
            const nameStr = item.name.substring(0, 15).padEnd(16, ' ');
            const puStr = parseFloat(item.price).toFixed(2).padStart(8, ' ');
            const totalStr = (item.price * item.qty).toFixed(2).padStart(11, ' ');
            doc.text(`${qtyStr}${nameStr}${puStr}${totalStr}`, 5, y);
            y += 6;
        });
        
        doc.text("=====================================", 40, y, { align: "center" });
        y += 5;
        
        // --- 4. TOTALES (Con desglose de IGV peruano incluido) ---
        const baseImponible = sale.total / 1.18;
        const igv = sale.total - baseImponible;
        
        doc.text(`BASE IMPONIBLE : S/. ${baseImponible.toFixed(2).padStart(8, ' ')}`, 15, y);
        y += 5;
        doc.text(`IGV (18%)      : S/. ${igv.toFixed(2).padStart(8, ' ')}`, 15, y);
        y += 5;
        doc.text("=====================================", 40, y, { align: "center" });
        y += 5;
        
        doc.setFont("courier", "bold");
        doc.text(`TOTAL S/       : S/. ${sale.total.toFixed(2).padStart(8, ' ')}`, 15, y);
        y += 7;
        
        // --- 5. MONTO EN LETRAS ---
        doc.setFont("courier", "normal");
        doc.setFontSize(7);
        const letters = numberToLetters(sale.total);
        const splitLetters = doc.splitTextToSize(letters, 70);
        splitLetters.forEach(line => {
            doc.text(line, 5, y);
            y += 4;
        });
        
        // --- 6. PIE DE PÁGINA ---
        y += 2;
        doc.text("Condición: Contado", 5, y);
        y += 4;
        const printDate = new Date();
        const printDateStr = `${printDate.toLocaleDateString()} ${printDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
        doc.text(`Impresión: ${printDateStr}`, 5, y);
        
        y += 6;
        doc.setFontSize(6.5);
        doc.text("Representación del Comprobante Electrónico, ingrese a:", 40, y, { align: "center" });
        y += 4;
        doc.text("www.abaroteseleuterio.com/cpe/comprobante", 40, y, { align: "center" });
        
        doc.save(`boleta_${sale.id}.pdf`);
    }
 
    // LÓGICA DE PROVEEDORES - variables de estado
    let currentProviderOrder = [];

    // Función para actualizar datalist de productos en proveedores
    window.updateProviderDatalist = async function() {
        const datalist = document.getElementById('proveedores-products');
        if (!datalist) return;
        try {
            const res = await apiFetch('/api/productos?limite=200');
            const { data: productos } = await res.json();
            datalist.innerHTML = '';
            productos.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.nombre;
                datalist.appendChild(opt);
            });
        } catch (err) {
            console.error('Error cargando productos para proveedores:', err);
        }
    };

    // Función para renderizar orden de proveedor
    window.renderProviderOrder = function() {
        const container = document.getElementById('provider-added-products');
        const costSpan = document.getElementById('provider-total-cost');
        if(!container || !costSpan) return;

        container.innerHTML = '';
        let total = 0;

        currentProviderOrder.forEach((item, index) => {
            total += item.cost;
            const div = document.createElement('div');
            div.className = 'flex justify-between items-center bg-white border border-slate-100 p-3 rounded-lg text-sm';
            div.innerHTML = `
                <div class="flex-1">
                    <span class="font-bold text-on-surface">${item.name}</span>
                    <span class="text-xs text-slate-500 block">Cant: ${item.qty} | Venc: ${item.expiry || 'N/A'}</span>
                </div>
                <div class="font-headline font-bold text-primary mr-4">S/. ${parseFloat(item.cost).toFixed(2)}</div>
                <button type="button" onclick="removeProviderProduct(${index})" class="text-error hover:text-tertiary transition-colors"><span class="material-symbols-outlined text-[18px]">delete</span></button>
            `;
            container.appendChild(div);
        });

        costSpan.innerText = `S/. ${total.toFixed(2)}`;
    };

    // Función para agregar producto a orden de proveedor
    window.addProviderProduct = function() {
        const inputName = document.getElementById('provider-product');
        const inputQty = document.getElementById('provider-qty');
        const inputExpiry = document.getElementById('provider-product-expiry');
        const inputCost = document.getElementById('provider-cost');

        const name = inputName.value.trim();
        const qty = parseInt(inputQty.value, 10);
        const expiry = inputExpiry.value;
        const cost = parseFloat(inputCost.value);

        if(!name || isNaN(qty) || qty <= 0 || isNaN(cost) || cost <= 0) {
            alert('Por favor completa todos los campos del producto correctamente.');
            return;
        }

        const datalist = document.getElementById('proveedores-products');
        const validNames = datalist ? Array.from(datalist.options).map(o => o.value.toLowerCase()) : [];
        if (validNames.length > 0 && !validNames.includes(name.toLowerCase())) {
            alert(`El producto "${name}" no existe en el inventario. Debe crearlo primero en la pestaña de Inventario.`);
            return;
        }

        currentProviderOrder.push({ name, qty, expiry, cost });
        renderProviderOrder();

        // Limpiar inputs del producto
        inputName.value = '';
        inputQty.value = '';
        inputExpiry.value = '';
        inputCost.value = '';
    };

    // Función para eliminar producto de orden de proveedor
    window.removeProviderProduct = function(index) {
        currentProviderOrder.splice(index, 1);
        renderProviderOrder();
    };

    // Event listener para formulario de proveedores
    document.getElementById('form-proveedores').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (currentProviderOrder.length === 0) {
            alert('Añade al menos un producto a la orden.');
            return;
        }

        const providerName = document.getElementById('provider-name').value;
        const date = document.getElementById('provider-date').value;

        try {
            const response = await apiFetch('/api/ordenes', {
                method: 'POST',
                body: JSON.stringify({
                    nombre_proveedor: providerName,
                    fecha_recepcion: date,
                    items: currentProviderOrder.map(item => ({
                        nombre_producto: item.name,
                        cantidad_recibida: item.qty,
                        fecha_vencimiento_lote: item.expiry,
                        costo_total: item.cost
                    }))
                })
            });

            if (response.ok) {
                currentProviderOrder = [];
                renderProviderOrder();
                e.target.reset();
                alert('Orden registrada exitosamente.');
                await renderFrequentProducts();
                updateDashboard();
                checkNotifications();
                updateReportsSummary();
                renderProvidersListInReports();
            } else {
                const err = await response.json();
                alert('Error: ' + err.error);
            }
        } catch (err) {
            if (err.message !== 'Sesión expirada') alert('Error de conexión');
        }
    });

    // === REPORTES PDF === - event listeners para botones
    const btnSalesPdf = document.getElementById('btn-report-sales-pdf');
    if (btnSalesPdf) {
        btnSalesPdf.addEventListener('click', () => {
            generateSalesWeeklyReportPDF();
        });
    }

    const btnProvidersPdf = document.getElementById('btn-report-providers-pdf');
    if (btnProvidersPdf) {
        btnProvidersPdf.addEventListener('click', () => {
            generateProvidersExpensesReportPDF();
        });
    }

    // Función para generar reporte PDF de ventas semanales
    async function generateSalesWeeklyReportPDF(isAuto = false) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        try {
            const res = await apiFetch('/api/reportes/ventas-semana');
            const { ventas, total, transacciones } = await res.json();

            doc.setFont("helvetica", "bold");
            doc.setFontSize(18);
            doc.setTextColor(0, 83, 91);
            doc.text("Reporte Semanal de Ventas", 20, 20);

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100);
            doc.text(`Generado el: ${new Date().toLocaleString()}`, 20, 27);
            doc.text(`Modo: ${isAuto ? 'Autodescarga Dominical' : 'Descarga Manual'}`, 20, 32);

            doc.setLineWidth(0.5);
            doc.setDrawColor(0, 83, 91);
            doc.line(20, 36, 190, 36);

            doc.setFillColor(240, 244, 248);
            doc.rect(20, 42, 80, 25, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(0, 83, 91);
            doc.text("TOTAL VENDIDO", 25, 48);
            doc.setFontSize(16);
            doc.text(`S/. ${total.toFixed(2)}`, 25, 60);

            doc.setFillColor(240, 244, 248);
            doc.rect(110, 42, 80, 25, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(0, 83, 91);
            doc.text("TRANSACCIONES", 115, 48);
            doc.setFontSize(16);
            doc.text(`${transacciones} ventas`, 115, 60);

            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(50);
            doc.text("Detalle de Ventas del Periodo", 20, 80);

            doc.setFontSize(10);
            doc.text("Fecha y Hora", 20, 88);
            doc.text("Código Boleta", 70, 88);
            doc.text("Productos Vendidos", 110, 88);
            doc.text("Total", 170, 88);

            doc.setLineWidth(0.2);
            doc.setDrawColor(200);
            doc.line(20, 91, 190, 91);

            doc.setFont("helvetica", "normal");
            let y = 97;
            ventas.forEach(venta => {
                const dateStr = new Date(venta.fecha).toLocaleString();
                const itemsText = venta.items.map(i => `${i.cantidad}x ${i.producto ? i.producto.nombre : 'Producto'}`).join(", ");
                const splitItems = doc.splitTextToSize(itemsText, 55);

                if (y + splitItems.length * 5 > 280) { doc.addPage(); y = 20; }

                doc.text(dateStr, 20, y);
                doc.text(venta.numero_boleta, 70, y);
                splitItems.forEach((line, i) => doc.text(line, 110, y + (i * 5)));
                doc.text(`S/. ${parseFloat(venta.total).toFixed(2)}`, 170, y);
                y += Math.max(8, splitItems.length * 5) + 3;
            });

            doc.save(`reporte_ventas_${isAuto ? 'auto_' : ''}${Date.now()}.pdf`);
        } catch (err) {
            console.error('Error generando PDF de ventas:', err);
            alert('Error al generar el reporte de ventas');
        }
    }

    // Función para generar reporte PDF de gastos con proveedores
    async function generateProvidersExpensesReportPDF(isAuto = false) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        try {
            const res = await apiFetch('/api/reportes/gastos-semana');
            const { ordenes, total, totalOrdenes } = await res.json();

            doc.setFont("helvetica", "bold");
            doc.setFontSize(18);
            doc.setTextColor(43, 100, 133);
            doc.text("Reporte de Gastos con Proveedores", 20, 20);

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100);
            doc.text(`Generado el: ${new Date().toLocaleString()}`, 20, 27);
            doc.text(`Modo: ${isAuto ? 'Autodescarga Dominical' : 'Descarga Manual'}`, 20, 32);

            doc.setLineWidth(0.5);
            doc.setDrawColor(43, 100, 133);
            doc.line(20, 36, 190, 36);

            doc.setFillColor(240, 244, 248);
            doc.rect(20, 42, 80, 25, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.setTextColor(43, 100, 133);
            doc.text("TOTAL INVERTIDO", 25, 48);
            doc.setFontSize(16);
            doc.text(`S/. ${total.toFixed(2)}`, 25, 60);

            doc.setFillColor(240, 244, 248);
            doc.rect(110, 42, 80, 25, "F");
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            doc.text("REABASTECIMIENTOS", 115, 48);
            doc.setFontSize(16);
            doc.text(`${totalOrdenes} órdenes`, 115, 60);

            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(50);
            doc.text("Detalle de Órdenes a Proveedores", 20, 80);

            doc.setFontSize(10);
            doc.text("Fecha", 20, 88);
            doc.text("Proveedor", 50, 88);
            doc.text("Detalle de Lotes Recibidos (Vencimiento)", 90, 88);
            doc.text("Costo Total", 170, 88);

            doc.setLineWidth(0.2);
            doc.setDrawColor(200);
            doc.line(20, 91, 190, 91);

            doc.setFont("helvetica", "normal");
            let y = 97;
            ordenes.forEach(orden => {
                const provNombre = orden.proveedor ? orden.proveedor.nombre_display : 'N/A';
                const itemsText = orden.items.map(i =>
                    `${i.cantidad_recibida}x ${i.producto ? i.producto.nombre + (i.producto.presentacion ? ' ' + i.producto.presentacion : '') : 'Producto'} (Vence: ${i.fecha_vencimiento_lote || 'N/A'})`
                ).join(", ");
                const splitItems = doc.splitTextToSize(itemsText, 75);

                if (y + splitItems.length * 5 > 280) { doc.addPage(); y = 20; }

                doc.text(orden.fecha_recepcion, 20, y);
                doc.text(provNombre, 50, y);
                splitItems.forEach((line, i) => doc.text(line, 90, y + (i * 5)));
                doc.text(`S/. ${parseFloat(orden.costo_total).toFixed(2)}`, 170, y);
                y += Math.max(8, splitItems.length * 5) + 3;
            });

            doc.save(`reporte_proveedores_${isAuto ? 'auto_' : ''}${Date.now()}.pdf`);
        } catch (err) {
            console.error('Error generando PDF de proveedores:', err);
            alert('Error al generar el reporte de proveedores');
        }
    }

    // Función para verificar notificaciones activas
    window.checkNotifications = async function() {
        try {
            const res = await apiFetch('/api/productos/alertas');
            const alertas = await res.json();

            const dismissed = JSON.parse(localStorage.getItem('dismissedNotifications')) || [];
            const activeNotifications = alertas.filter(a => !dismissed.includes(`${a.tipo}-${a.productoId}`));

            const badge = document.getElementById('notification-badge');
            const modalCount = document.getElementById('notification-modal-count');
            if (badge) {
                badge.innerText = activeNotifications.length;
                badge.classList.toggle('hidden', activeNotifications.length === 0);
            }
            if (modalCount) modalCount.innerText = activeNotifications.length;

            const list = document.getElementById('notifications-list');
            if (list) {
                list.innerHTML = '';
                if (activeNotifications.length === 0) {
                    list.innerHTML = `<div class="p-6 text-center text-slate-400 text-sm">No hay notificaciones.</div>`;
                    return;
                }

                activeNotifications.forEach(n => {
                    const item = document.createElement('div');
                    item.className = 'px-6 py-4 hover:bg-surface-container-low flex gap-4 items-center justify-between';
                    const iconColor = n.tipo === 'error' ? 'bg-error text-white' : 'bg-orange-500 text-white';
                    const iconName = n.tipo === 'error' ? 'cancel' : 'warning';
                    const notifId = `${n.tipo}-${n.productoId}`;

                    item.innerHTML = `
                        <div class="flex gap-4 items-center">
                            <div class="w-8 h-8 rounded-full ${iconColor} flex items-center justify-center shrink-0">
                                <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">${iconName}</span>
                            </div>
                            <div>
                                <span class="font-body font-semibold text-sm block leading-tight text-on-surface">${n.titulo}</span>
                                <span class="text-xs text-on-surface-variant">${n.mensaje}</span>
                            </div>
                        </div>
                        <button onclick="dismissNotification('${notifId}')" class="text-slate-400 hover:text-slate-600 p-1 transition-colors shrink-0">
                            <span class="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    `;
                    list.appendChild(item);
                });
            }
        } catch (err) {
            console.error('Error cargando notificaciones:', err);
        }
    };

    // Función para descartar notificación individual
    window.dismissNotification = function(id) {
        const dismissed = JSON.parse(localStorage.getItem('dismissedNotifications')) || [];
        if (!dismissed.includes(id)) {
            dismissed.push(id);
            localStorage.setItem('dismissedNotifications', JSON.stringify(dismissed));
        }
        checkNotifications();
    };

    // Función para limpiar todas las notificaciones
    window.clearAllNotifications = async function() {
        try {
            const res = await apiFetch('/api/productos/alertas');
            const alertas = await res.json();
            const possibleIds = alertas.map(a => `${a.tipo}-${a.productoId}`);
            localStorage.setItem('dismissedNotifications', JSON.stringify(possibleIds));
            checkNotifications();
        } catch (err) {
            console.error('Error limpiando notificaciones:', err);
        }
    };

    // Función para actualizar dashboard con datos del día
    window.updateDashboard = async function() {
        try {
            const ventasRes = await apiFetch('/api/ventas/hoy');
            const ventasData = await ventasRes.json();

            const statsRes = await apiFetch('/api/productos/stats');
            const statsData = await statsRes.json();

            const salesValElement = document.getElementById('dashboard-sales-today');
            const lowStockElement = document.getElementById('dashboard-low-stock-count');

            if (salesValElement) salesValElement.innerText = ventasData.total.toFixed(2);
            if (lowStockElement) lowStockElement.innerText = statsData.stockCritico;
        } catch (err) {
            console.error('Error actualizando dashboard:', err);
        }
    };

    // Función para actualizar resumen en reportes
    window.updateReportsSummary = async function() {
        try {
            const res = await apiFetch('/api/reportes/resumen');
            const reportes = await res.json();

            const salesTotalEl = document.getElementById('reports-sales-total');
            const ordersTotalEl = document.getElementById('reports-providers-total');

            if (salesTotalEl) salesTotalEl.innerText = `S/. ${reportes.totalVentas.toFixed(2)}`;
            if (ordersTotalEl) ordersTotalEl.innerText = `S/. ${reportes.totalGastos.toFixed(2)}`;
        } catch (err) {
            console.error('Error cargando reportes:', err);
        }
    };

    // Función para renderizar lista de proveedores en reportes
    window.renderProvidersListInReports = async function() {
        const tbody = document.getElementById('reports-providers-table-body');
        if (!tbody) return;

        try {
            const res = await apiFetch('/api/reportes/proveedores-mes');
            const proveedores = await res.json();
            tbody.innerHTML = '';

            if (proveedores.length === 0) {
                tbody.innerHTML = `<tr><td colspan="3" class="py-4 px-6 text-center text-slate-400 text-sm">No hay proveedores registrados este mes.</td></tr>`;
                return;
            }

            proveedores.forEach(prov => {
                const tr = document.createElement('tr');
                tr.className = 'border-b border-slate-50 hover:bg-surface-container-low transition-colors';
                tr.innerHTML = `
                    <td class="py-4 px-6 font-semibold">${prov.proveedor}</td>
                    <td class="py-4 px-6 text-sm">General</td>
                    <td class="py-4 px-6 text-right font-headline font-bold">S/. ${prov.gasto_mensual.toFixed(2)}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (err) {
            console.error('Error cargando proveedores en reportes:', err);
            tbody.innerHTML = `<tr><td colspan="3" class="text-center py-4 text-error">Error al cargar proveedores</td></tr>`;
        }
    };

    // LOGIN REAL CON JWT - event listener
    const loginForm = document.querySelector('#view-login form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.querySelector('#view-login input[type="email"]').value;
            const password = document.getElementById('login-password').value;
            const btn = loginForm.querySelector('button[type="submit"]');

            const prevError = document.getElementById('login-error-msg');
            if (prevError) prevError.remove();

            btn.disabled = true;
            btn.innerHTML = '<span class="material-symbols-outlined text-[20px] animate-spin">progress_activity</span> Verificando...';

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok && data.token) {
                    localStorage.setItem('authToken', data.token);
                    navigateTo('main');
                    updateCategoryDatalist();
                    renderInventory();
                    renderFrequentProducts();
                    renderCart();
                    updateDashboard();
                    checkNotifications();
                    updateReportsSummary();
                    renderProvidersListInReports();
                } else {
                    showLoginError(data.error || 'Credenciales incorrectas');
                }
            } catch (err) {
                showLoginError('Error de conexión. Inténtalo de nuevo.');
            } finally {
                btn.disabled = false;
                btn.innerHTML = 'Acceder al Panel <span class="material-symbols-outlined text-[20px]">arrow_forward</span>';
            }
        });
    }

    // Función auxiliar para mostrar error en login
    function showLoginError(msg) {
        let errDiv = document.getElementById('login-error-msg');
        if (!errDiv) {
            errDiv = document.createElement('p');
            errDiv.id = 'login-error-msg';
            errDiv.style.cssText = 'color: #ba1a1a; font-size: 0.875rem; font-weight: 600; text-align: center; margin-top: 0.5rem;';
            const form = document.querySelector('#view-login form');
            if (form) form.appendChild(errDiv);
        }
        errDiv.innerText = msg;
    }

    // Logout real con limpieza de token
    document.querySelectorAll('[data-action="logout"]').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await fetch('/api/auth/logout', { method: 'POST' });
            } catch (err) { /* ignorar errores de red */ }
            localStorage.removeItem('authToken');
            navigateTo('login');
        });
    });

    // Inicialización según sesión existente
    if (localStorage.getItem('authToken')) {
        navigateTo('main');
        updateCategoryDatalist();
        renderInventory();
        renderFrequentProducts();
        renderCart();
        updateDashboard();
        checkNotifications();
        updateReportsSummary();
        renderProvidersListInReports();
    } else {
        navigateTo('login');
    }

    // Loop de verificación cada 60 segundos
    setInterval(() => {
        if (localStorage.getItem('authToken')) {
            updateDashboard();
            checkNotifications();
        }
    }, 60000);
});
