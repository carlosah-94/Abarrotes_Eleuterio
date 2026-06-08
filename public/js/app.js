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

    // Imagen por defecto en formato SVG Data URL (Elegante, autocompletada y sin comillas dobles internas para evitar conflictos en HTML)
    const DEFAULT_PRODUCT_IMAGE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' width='100%' height='100%'><rect width='100%' height='100%' fill='%23f1f5f9'/><g fill='none' stroke='%2394a3b8' stroke-width='8' stroke-linecap='round' stroke-linejoin='round'><path d='M60 80h80v70a10 10 0 0 1-10 10H70a10 10 0 0 1-10-10V80z'/><path d='M85 80V60a15 15 0 0 1 30 0v20'/></g><text x='100' y='170' font-family='system-ui, sans-serif' font-size='13' font-weight='600' fill='%2364748b' text-anchor='middle'>Sin Imagen</text></svg>";

    // Función auxiliar para obtener la imagen correcta de un producto
    function getProductImage(p) {
        const oldMilkImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgVkKE_tfawwqwEkLX-lyRmdSXUCTFajYQOShvl7TNY262UdpLieZNgN9sXz1dUYIKGVhRhj5EEMJ8UYvUh8arGs1ct8MkPl0dGY1ZqXvEpOOkOeq5FwLRDdswjmBFO302bIyTw9v7DditPXHjYE20AROaQ7J2lKF7CIIAcnzzZoGbCMcFc6Wd7lsJH58R2cHWieLPptQaijka01eZRuIvn6XljFNwF4Ugts08BdrOxZZvd-Rk28hQ3SEp27WW_oI4-X8CeZk46s54';
        if (!p.img || (p.img === oldMilkImage && !p.name.toLowerCase().includes('leche'))) {
            return DEFAULT_PRODUCT_IMAGE;
        }
        return p.img;
    }

    // Función auxiliar para normalizar texto (quitar tildes y convertir a minúsculas)
    function normalizeText(text) {
        if (!text) return '';
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }

    // Convertidor de números a letras en español (Soles peruanos)
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

    // Inicializar los datos de LocalStorage
    function initData() {
        if (!localStorage.getItem('products')) {
            const initialProducts = [
                { id: 1, name: 'Aceite Vegetal 1L', category: 'Abarrotes', stock: 42, price: 11.50, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSdyoT-pWaPag0pRUqTVjyMlYIdXIzPzzhoXsfG2JLfKPlbQ08vd3Ou77DoCalL0vk8OEJS47qpO3AVgwTBVz3qHSzH1gqMQD0RHPpIWQEhwxOaq-yP5hHIbqpbKl09Pj23-DIQ3XPEUJs4MNQ-lhwgjkRohCp-_663xiJqtxhE-G65whtGywBbaypraQKPfHneDzN-eN1D65yK07NqW_wWFf1s41UbTvIPH5vXg8cKnpY2BXxtf1aWVWi4hcyFu2nfzNX-Ds2on_U', batches: [{ qty: 42, dueDate: '2026-12-31' }], salesCount: 0 },
                { id: 2, name: 'Arroz Extra 5kg', category: 'Abarrotes', stock: 5, price: 24.90, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3pLoVfn_cHSGBAgLCawkMy9JF3RpoavMJXPq5bE8ekikGRPBw-hgvId76H2HYoI97_xtHbBWdaKnWdERXhZMLy4TLo9zDUAa0h27fZ6bQeHXR6AToMIccogByWEoB_I8g2jMY76vP4BnJRelFRDzTSG3WJ53wtI_D2WPkXeFgZr5gkn_AlS0VL3KzfPQtYT2k88Ci1rIKhwbaisYKy6GgOucKRUR-g3x3kHHc4RlXcG3G43038Fqgx0gquIa8-79CT5mhviWSnqLh', batches: [{ qty: 5, dueDate: '2026-06-30' }], salesCount: 0 },
                { id: 3, name: 'Leche Evaporada', category: 'Lácteos', stock: 120, price: 4.20, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgVkKE_tfawwqwEkLX-lyRmdSXUCTFajYQOShvl7TNY262UdpLieZNgN9sXz1dUYIKGVhRhj5EEMJ8UYvUh8arGs1ct8MkPl0dGY1ZqXvEpOOkOeq5FwLRDdswjmBFO302bIyTw9v7DditPXHjYE20AROaQ7J2lKF7CIIAcnzzZoGbCMcFc6Wd7lsJH58R2cHWieLPptQaijka01eZRuIvn6XljFNwF4Ugts08BdrOxZZvd-Rk28hQ3SEp27WW_oI4-X8CeZk46s54', batches: [{ qty: 120, dueDate: '2026-08-15' }], salesCount: 0 },
                { id: 4, name: 'Pan Molde', category: 'Abarrotes', stock: 15, price: 7.20, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCujcMaJvzpK3auTF3xe0sscuwFryBw5EvP0seUXe1Ju_OBxqbafAZqGARER-FNnJw_qpTt5mYP-kLBmGcJnP2ANYoKUB_rlJlxBrMd0rxnzPHBWx5cVplYG6QC1Zrz-_QfAz5jlvtYniSoU9ri1lqA5t6kq5u7LHyfaQOvKl1p7phDKer-X28gjU5u202eCJitPLhmnXYJuVIdUF5rfdvS2sP8vZtJQn5opeM1pGKGENUqTIWKnb09A2BJxeJAQO5sNgb6wwxvcJTL', batches: [{ qty: 15, dueDate: '2026-06-10' }], salesCount: 0 },
                { id: 5, name: 'Huevos x12', category: 'Lácteos', stock: 30, price: 8.50, img: DEFAULT_PRODUCT_IMAGE, batches: [{ qty: 30, dueDate: '2026-06-25' }], salesCount: 0 },
                { id: 6, name: 'Atún Campomar', category: 'Abarrotes', stock: 50, price: 5.20, img: DEFAULT_PRODUCT_IMAGE, batches: [{ qty: 50, dueDate: '2027-01-20' }], salesCount: 0 }
            ];
            localStorage.setItem('products', JSON.stringify(initialProducts));
        }
        if (!localStorage.getItem('cart')) {
            localStorage.setItem('cart', JSON.stringify([]));
        }
        if (!localStorage.getItem('salesHistory')) {
            localStorage.setItem('salesHistory', JSON.stringify([]));
        }
        if (!localStorage.getItem('providerOrdersHistory')) {
            localStorage.setItem('providerOrdersHistory', JSON.stringify([]));
        }
        if (!localStorage.getItem('dismissedNotifications')) {
            localStorage.setItem('dismissedNotifications', JSON.stringify([]));
        }
        if (!localStorage.getItem('lastResetSunday')) {
            localStorage.setItem('lastResetSunday', '');
        }
    }
    
    initData();

    // Acceso a datos con normalización automática de lotes y campos faltantes
    function getProducts() {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        let updated = false;
        products.forEach(p => {
            if (!p.batches) {
                p.batches = [{ qty: p.stock, dueDate: p.dueDate || '' }];
                updated = true;
            }
            if (p.salesCount === undefined) {
                p.salesCount = 0;
                updated = true;
            }
        });
        if (updated) {
            localStorage.setItem('products', JSON.stringify(products));
        }
        return products;
    }

    function saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products));
        renderInventory();
        renderFrequentProducts();
        updateProviderDatalist();
        updateCategoryDatalist();
        updateDashboard();
        checkNotifications();
    }

    function getCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

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
            sectionMainApp.classList.remove('hidden');
            switchAppView('dashboard'); // Por defecto al tablero
        }
    };

    // Funciones de navegación de la app
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

    // Control de Modales
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

    // === INVENTARIO Y PAGINACION ===
    let currentPage = 1;
    const itemsPerPage = 5;
    let currentSearchTerm = '';

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchTerm = e.target.value;
            currentPage = 1;
            renderInventory();
            renderFrequentProducts();
        });
    }

    // Autocompletado de categorías
    window.updateCategoryDatalist = function() {
        const datalist = document.getElementById('categories-list');
        if (!datalist) return;
        datalist.innerHTML = '';
        
        const products = getProducts();
        const cats = new Set(products.map(p => p.category).filter(Boolean));
        if (cats.size === 0) {
            cats.add('Abarrotes');
            cats.add('Lácteos');
            cats.add('Bebidas');
        }
        cats.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            datalist.appendChild(opt);
        });
    };

    window.renderInventory = function() {
        const tableBody = document.querySelector('#inventory-table tbody');
        if (!tableBody) return;
        
        let allProducts = getProducts();
        
        // Calcular tarjetas dinámicas de inventario
        const totalProducts = allProducts.length;
        const totalValue = allProducts.reduce((sum, p) => sum + (parseFloat(p.price) || 0) * (p.stock || 0), 0);
        const criticalStockCount = allProducts.filter(p => p.stock <= 10).length;
        const uniqueCats = new Set(allProducts.map(p => p.category).filter(Boolean)).size;

        const cardTotal = document.getElementById('card-total-products');
        const cardValue = document.getElementById('card-inventory-value');
        const cardCritical = document.getElementById('card-critical-stock');
        const cardCats = document.getElementById('card-categories-count');

        if (cardTotal) cardTotal.innerText = totalProducts;
        if (cardValue) cardValue.innerText = `S/. ${totalValue.toFixed(2)}`;
        if (cardCritical) cardCritical.innerText = criticalStockCount;
        if (cardCats) cardCats.innerText = uniqueCats;

        // Búsqueda insensible a mayúsculas y tildes
        if (currentSearchTerm) {
            const cleanSearch = normalizeText(currentSearchTerm);
            allProducts = allProducts.filter(p => 
                normalizeText(p.name).includes(cleanSearch) ||
                (p.presentation && normalizeText(p.presentation).includes(cleanSearch)) ||
                (p.type && normalizeText(p.type).includes(cleanSearch)) ||
                normalizeText(p.category).includes(cleanSearch)
            );
        }
        
        const totalPages = Math.ceil(allProducts.length / itemsPerPage) || 1;
        
        // Asegurar que no se exceda el limite al borrar elementos finales
        if(currentPage > totalPages) currentPage = totalPages;
        if(currentPage < 1) currentPage = 1;

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const productsToRender = allProducts.slice(startIndex, endIndex);

        tableBody.innerHTML = '';
        
        productsToRender.forEach(p => {
            const stockClass = p.stock <= 10 ? 'text-error' : '';
            const catColor = normalizeText(p.category).includes('lacteo') ? 'bg-primary-fixed/50 text-on-primary-fixed-variant' : 'bg-secondary-container/30 text-on-secondary-container';
            
            // Lógica de fecha vencimiento (Rojo si venció, Naranja si vence en <= 30 días)
            let dateClass = 'text-on-surface';
            let dateStr = 'N/A';
            if (p.dueDate) {
                dateStr = p.dueDate;
                const today = new Date();
                today.setHours(0,0,0,0);
                const due = new Date(p.dueDate);
                due.setHours(0,0,0,0);
                const diffTime = due - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays <= 0) dateClass = 'text-error font-bold text-red-600';
                else if (diffDays <= 30) dateClass = 'text-orange-600 font-bold';
            }

            const tr = document.createElement('tr');
            tr.className = 'hover:bg-surface-container-low transition-colors';
            tr.innerHTML = `
                <td class="px-6 py-4 font-semibold text-on-surface">${p.name} ${p.presentation || ''}</td>
                <td class="px-6 py-4 text-center"><span class="px-3 py-1 ${catColor} rounded-full text-xs font-semibold">${p.category}</span></td>
                <td class="px-6 py-4 font-bold text-center ${stockClass}">${p.stock}</td>
                <td class="px-6 py-4 font-semibold text-center ${dateClass}">${dateStr}</td>
                <td class="px-6 py-4 text-center font-headline font-bold">${parseFloat(p.price).toFixed(2)}</td>
                <td class="px-6 py-4 text-center">
                    <button onclick="editProduct(${p.id})" class="text-slate-400 hover:text-primary transition-all p-1"><span class="material-symbols-outlined text-sm">edit</span></button>
                    <button onclick="deleteProduct(${p.id})" class="text-slate-400 hover:text-tertiary transition-all p-1 ml-1"><span class="material-symbols-outlined text-sm">delete</span></button>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        // Actualizar UI paginación
        const txtInfo = document.getElementById('pagination-info');
        const btnPrev = document.getElementById('btn-prev-page');
        const btnNext = document.getElementById('btn-next-page');

        if(txtInfo) txtInfo.innerText = `Página ${currentPage} de ${totalPages}`;
        if(btnPrev) {
            btnPrev.disabled = (currentPage === 1);
            btnPrev.onclick = () => { if(currentPage > 1) { currentPage--; renderInventory(); } };
        }
        if(btnNext) {
            btnNext.disabled = (currentPage === totalPages);
            btnNext.onclick = () => { if(currentPage < totalPages) { currentPage++; renderInventory(); } };
        }
    };

    // Eliminar producto
    window.deleteProduct = function(id) {
        if(confirm('¿Seguro que deseas eliminar este producto?')) {
            const products = getProducts().filter(p => p.id !== id);
            saveProducts(products);
            
            // También eliminarlo del carrito si estuviera
            const cart = getCart().filter(c => c.id !== id);
            saveCart(cart);
        }
    };

    // Editar producto
    let editingId = null;
    window.editProduct = function(id) {
        const product = getProducts().find(p => p.id === id);
        if(!product) return;
        editingId = id;
        
        document.getElementById('edit-product-name').value = product.name || '';
        document.getElementById('edit-product-size').value = product.presentation || '';
        const typeInput = document.getElementById('edit-product-type');
        if(typeInput) typeInput.value = product.type || '';
        document.getElementById('edit-product-price').value = product.price || 0;
        document.getElementById('edit-product-date').value = product.dueDate || '';
        
        const catInput = document.getElementById('edit-product-category');
        if(catInput) catInput.value = product.category || '';
        
        openModal('modal-edit-product');
    };

    // Guardar Edición
    document.getElementById('form-edit-product').addEventListener('submit', (e) => {
        e.preventDefault();
        const products = getProducts();
        const idx = products.findIndex(p => p.id === editingId);
        
        if(idx !== -1) {
            const newName = document.getElementById('edit-product-name').value;
            const newSize = document.getElementById('edit-product-size').value;
            const typeInput = document.getElementById('edit-product-type');
            const newType = typeInput ? typeInput.value : '';
            const newPrice = parseFloat(document.getElementById('edit-product-price').value);
            const newDueDate = document.getElementById('edit-product-date').value;
            const catInput = document.getElementById('edit-product-category');
            const newCat = catInput ? catInput.value.trim() : 'Abarrotes';

            products[idx].name = newName;
            products[idx].presentation = newSize;
            products[idx].type = newType;
            products[idx].price = newPrice;
            products[idx].dueDate = newDueDate;
            products[idx].category = newCat;

            // Sincronizar lotes
            if (!products[idx].batches || products[idx].batches.length === 0) {
                products[idx].batches = [{ qty: products[idx].stock, dueDate: newDueDate }];
            } else {
                products[idx].batches.sort((a, b) => {
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });
                products[idx].batches[0].dueDate = newDueDate;
            }

            saveProducts(products);
        }
        closeModal('modal-edit-product');
    });

    // Agregar Producto Nuevo
    document.getElementById('form-add-product').addEventListener('submit', (e) => {
        e.preventDefault();
        const products = getProducts();
        const catInput = document.getElementById('add-product-category');
        const categoryVal = catInput ? catInput.value.trim() : 'Abarrotes';
        
        const priceVal = parseFloat(document.getElementById('add-product-price').value);
        const stockVal = parseInt(document.getElementById('add-product-stock').value, 10);
        const dateVal = document.getElementById('add-product-date').value;
        const nameVal = document.getElementById('add-product-name').value;
        const sizeVal = document.getElementById('add-product-size').value;
        const typeVal = document.getElementById('add-product-type') ? document.getElementById('add-product-type').value : '';

        const newProduct = {
            id: Date.now(),
            name: nameVal,
            presentation: sizeVal,
            type: typeVal,
            price: priceVal,
            stock: stockVal,
            dueDate: dateVal,
            category: categoryVal,
            img: DEFAULT_PRODUCT_IMAGE,
            batches: [{ qty: stockVal, dueDate: dateVal }],
            salesCount: 0
        };
        
        products.push(newProduct);
        saveProducts(products); // Renderiza y limpia notificaciones
        
        e.target.reset();
        closeModal('modal-add-product');
    });

    // === LÓGICA DE VENTAS ===
    window.renderFrequentProducts = function() {
        const grid = document.getElementById('frequent-products-grid');
        if (!grid) return;
        
        let products = getProducts();
        
        if (currentSearchTerm) {
            const cleanSearch = normalizeText(currentSearchTerm);
            products = products.filter(p => 
                normalizeText(p.name).includes(cleanSearch) ||
                (p.presentation && normalizeText(p.presentation).includes(cleanSearch)) ||
                (p.type && normalizeText(p.type).includes(cleanSearch)) ||
                normalizeText(p.category).includes(cleanSearch)
            );
        }

        // Ordenar por volumen de ventas (Top 8 más vendidos)
        products.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
        products = products.slice(0, 8); // Muestra mínimo 1 y máximo 8

        grid.innerHTML = '';
        
        if (products.length === 0) {
            grid.innerHTML = '<p class="text-sm text-slate-400 text-center col-span-4 py-8">No hay productos que coincidan.</p>';
            return;
        }

        products.forEach(p => {
            let stockHtml = '';
            let btnDisabled = '';
            let btnClass = 'mt-auto w-full py-2 text-xs bg-primary/10 text-primary font-bold rounded-lg hover:bg-primary hover:text-white transition-colors';
            
            if (p.stock > 10) {
                stockHtml = `<p class="text-xs mb-2 text-slate-600"><strong>Stock: ${p.stock}</strong> 🟢</p>`;
            } else if (p.stock > 0 && p.stock <= 10) {
                stockHtml = `<p class="text-xs mb-2 text-orange-600"><strong>Stock: ${p.stock}</strong> 🟠</p>`;
            } else {
                stockHtml = `<p class="text-xs mb-2 text-red-600"><strong>Agotado</strong> 🔴</p>`;
                btnDisabled = 'disabled';
                btnClass = 'mt-auto w-full py-2 text-xs bg-slate-100 text-slate-400 font-bold rounded-lg cursor-not-allowed';
            }

            const typeTag = p.type ? `<div class="mb-2 flex justify-end min-h-[20px]"><span class="px-2 py-0.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-md text-[10px] font-bold leading-none">${p.type}</span></div>` : '<div class="mb-2 min-h-[20px]"></div>';

            const displayImg = getProductImage(p);

            const div = document.createElement('div');
            div.className = 'bg-surface-container-lowest p-4 rounded-xl shadow-sm text-center flex flex-col justify-between';
            div.innerHTML = `
                ${typeTag}
                <div>
                    <img src="${displayImg}" class="h-24 w-full object-cover rounded-md mb-2 bg-surface-container-low ${p.stock === 0 ? 'opacity-50' : ''}">
                    <p class="font-bold text-sm leading-tight mb-1">${p.name} ${p.presentation || ''}</p>
                    <p class="text-primary font-bold mb-1">S/. ${parseFloat(p.price).toFixed(2)}</p>
                    ${stockHtml}
                </div>
                <button onclick="addToCart(${p.id})" ${btnDisabled} class="${btnClass}">Agregar</button>
            `;
            grid.appendChild(div);
        });
    };

    window.addToCart = function(id) {
        const products = getProducts();
        const product = products.find(p => p.id === id);
        if(!product) return;
        
        const cart = getCart();
        const existing = cart.find(c => c.id === id);
        
        if (existing) {
            if(existing.qty < product.stock) {
                existing.qty++;
            } else {
                alert('Stock insuficiente para este producto');
            }
        } else {
            if(product.stock > 0) {
                cart.push({ ...product, qty: 1 });
            } else {
                alert('Producto fuera de stock');
                return;
            }
        }
        
        saveCart(cart);
    };

    window.updateCartQty = function(id, delta) {
        let cart = getCart();
        const item = cart.find(c => c.id === id);
        const products = getProducts();
        const product = products.find(p => p.id === id);
        
        if(item) {
            const newQty = item.qty + delta;
            if(newQty > 0 && newQty <= product.stock) {
                 item.qty = newQty;
            } else if (newQty <= 0) {
                 cart = cart.filter(c => c.id !== id);
            }
        }
        saveCart(cart);
    };

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

    // Finalizar Venta (Lógica FEFO - First Expired, First Out)
    document.getElementById('form-sale').addEventListener('submit', (e) => {
        e.preventDefault();
        const cart = getCart();
        if(cart.length === 0) {
             alert('El carrito está vacío');
             return;
        }
        
        const products = getProducts();
        
        cart.forEach(cartItem => {
             const p = products.find(p => p.id === cartItem.id);
             if(p) {
                 let qtyToDeduct = cartItem.qty;
                 if (!p.batches) p.batches = [{ qty: p.stock, dueDate: p.dueDate || '' }];
                 
                 // Ordenar lotes por fecha de vencimiento (los más antiguos primero)
                 p.batches.sort((a, b) => {
                     if (!a.dueDate) return 1;
                     if (!b.dueDate) return -1;
                     return new Date(a.dueDate) - new Date(b.dueDate);
                 });
                 
                 for (let i = 0; i < p.batches.length; i++) {
                     if (qtyToDeduct <= 0) break;
                     const batch = p.batches[i];
                     if (batch.qty > 0) {
                         if (batch.qty >= qtyToDeduct) {
                             batch.qty -= qtyToDeduct;
                             qtyToDeduct = 0;
                         } else {
                             qtyToDeduct -= batch.qty;
                             batch.qty = 0;
                         }
                     }
                 }
                 
                 // Filtrar lotes activos o vacíos
                 p.batches = p.batches.filter(b => b.qty > 0);
                 if (p.batches.length === 0) {
                     p.batches = [{ qty: 0, dueDate: '' }];
                 }
                 
                 // Recalcular stock y fecha de vencimiento
                 p.stock = p.batches.reduce((sum, b) => sum + b.qty, 0);
                 const activeDates = p.batches.filter(b => b.dueDate && b.qty > 0).map(b => b.dueDate);
                 if (activeDates.length > 0) {
                     activeDates.sort();
                     p.dueDate = activeDates[0];
                 } else {
                     p.dueDate = '';
                 }
                 
                 p.salesCount = (p.salesCount || 0) + cartItem.qty;
             }
        });
        
        saveProducts(products); // Guarda inventario y renderiza
        
        // Registrar en historial de ventas
        const salesHistory = JSON.parse(localStorage.getItem('salesHistory')) || [];
        const saleRecord = {
            id: Date.now(),
            date: new Date().toISOString(),
            items: cart.map(item => ({ id: item.id, name: item.name, price: item.price, qty: item.qty })),
            total: cart.reduce((sum, item) => sum + item.price * item.qty, 0),
            archived: false
        };
        salesHistory.push(saleRecord);
        localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
        localStorage.setItem('lastSale', JSON.stringify(saleRecord)); // Para descargar comprobante
        
        saveCart([]); // Limpia el carrito
        
        alert('Venta finalizada exitosamente.\nSe ha descontado del inventario y registrado en el historial.');
        updateDashboard();
        checkNotifications();
        updateReportsSummary();
    });

    // Descargar Comprobante PDF (Boleta Térmica de 80mm mejorada según imagen)
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
 
    // === LÓGICA DE PROVEEDORES ===
    let currentProviderOrder = [];

    window.updateProviderDatalist = function() {
        const datalist = document.getElementById('proveedores-products');
        if(!datalist) return;
        datalist.innerHTML = '';
        getProducts().forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.name;
            datalist.appendChild(opt);
        });
    };

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

        // Validar que el producto ya exista en el catálogo de inventario
        const products = getProducts();
        const exists = products.some(p => p.name.toLowerCase() === name.toLowerCase());
        if (!exists) {
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

    window.removeProviderProduct = function(index) {
        currentProviderOrder.splice(index, 1);
        renderProviderOrder();
    };

    document.getElementById('form-proveedores').addEventListener('submit', (e) => {
        e.preventDefault();
        if(currentProviderOrder.length === 0) {
            alert('Añade al menos un producto a la orden detallada abajo.');
            return;
        }

        const products = getProducts();
        
        // Sumar stock si el producto existe e insertar nuevo lote
        currentProviderOrder.forEach(orderItem => {
            const p = products.find(p => p.name.toLowerCase() === orderItem.name.toLowerCase());
            if(p) {
                if (!p.batches) p.batches = [];
                p.batches.push({ qty: orderItem.qty, dueDate: orderItem.expiry });
                
                // Recalcular stock y fecha de vencimiento
                p.stock = p.batches.reduce((sum, b) => sum + b.qty, 0);
                const activeDates = p.batches.filter(b => b.dueDate && b.qty > 0).map(b => b.dueDate);
                if (activeDates.length > 0) {
                    activeDates.sort();
                    p.dueDate = activeDates[0];
                } else {
                    p.dueDate = orderItem.expiry || p.dueDate;
                }
            }
        });

        saveProducts(products); // Actualiza localStorage

        // Guardar en el historial de proveedores
        const providerName = document.getElementById('provider-name').value;
        const date = document.getElementById('provider-date').value || new Date().toISOString().split('T')[0];
        const providerHistory = JSON.parse(localStorage.getItem('providerOrdersHistory')) || [];
        
        providerHistory.push({
            id: Date.now(),
            providerName,
            date,
            items: [...currentProviderOrder],
            total: currentProviderOrder.reduce((sum, item) => sum + item.cost, 0),
            archived: false
        });
        localStorage.setItem('providerOrdersHistory', JSON.stringify(providerHistory));

        alert('Orden Registrada Exitosamente en el inventario.');
        
        // Limpiamos todo
        currentProviderOrder = [];
        renderProviderOrder();
        e.target.reset(); // Botón form reset
        updateDashboard();
        checkNotifications();
        updateReportsSummary();
        renderProvidersListInReports();
    });

    // === REPORTES PDF ===
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

    function generateSalesWeeklyReportPDF(isAuto = false) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const sales = JSON.parse(localStorage.getItem('salesHistory')) || [];
        
        // Filtrar SOLO ventas activas (no archivadas)
        const activeSales = sales.filter(s => !s.archived);
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(0, 83, 91); // Color primario
        doc.text("Reporte Semanal de Ventas", 20, 20);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        doc.text(`Generado el: ${new Date().toLocaleString()}`, 20, 27);
        doc.text(`Modo: ${isAuto ? 'Autodescarga Dominical' : 'Descarga Manual'}`, 20, 32);
        
        doc.setLineWidth(0.5);
        doc.setDrawColor(0, 83, 91);
        doc.line(20, 36, 190, 36);
        
        // Tarjetas
        doc.setFillColor(240, 244, 248);
        doc.rect(20, 42, 80, 25, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0, 83, 91);
        doc.text("TOTAL VENDIDO", 25, 48);
        const totalAmount = activeSales.reduce((sum, s) => sum + s.total, 0);
        doc.setFontSize(16);
        doc.text(`S/. ${totalAmount.toFixed(2)}`, 25, 60);
        
        doc.setFillColor(240, 244, 248);
        doc.rect(110, 42, 80, 25, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0, 83, 91);
        doc.text("TRANSACCIONES", 115, 48);
        doc.setFontSize(16);
        doc.text(`${activeSales.length} ventas`, 115, 60);
        
        // Tabla
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
        activeSales.slice(-20).forEach(sale => {
            const dateStr = new Date(sale.date).toLocaleString();
            const itemsText = sale.items.map(item => `${item.qty}x ${item.name}`).join(", ");
            const splitItems = doc.splitTextToSize(itemsText, 55); // 55mm de ancho para envolver
            
            const linesCount = splitItems.length;
            const rowHeight = Math.max(8, linesCount * 5);
            
            if (y + rowHeight > 280) {
                doc.addPage();
                y = 20;
            }
            
            doc.text(dateStr, 20, y);
            doc.text(`TKT-${sale.id}`, 70, y);
            
            // Imprimir texto multilínea
            for (let i = 0; i < linesCount; i++) {
                doc.text(splitItems[i], 110, y + (i * 5));
            }
            
            doc.text(`S/. ${sale.total.toFixed(2)}`, 170, y);
            y += rowHeight + 3;
        });
        
        doc.save(`reporte_ventas_semanal_${isAuto ? 'auto_' : ''}${Date.now()}.pdf`);
    }

    function generateProvidersExpensesReportPDF(isAuto = false) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const orders = JSON.parse(localStorage.getItem('providerOrdersHistory')) || [];
        
        // Filtrar SOLO órdenes activas (no archivadas)
        const activeOrders = orders.filter(o => !o.archived);
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(43, 100, 133); // Color secundario
        doc.text("Reporte de Gastos con Proveedores", 20, 20);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        doc.text(`Generado el: ${new Date().toLocaleString()}`, 20, 27);
        doc.text(`Modo: ${isAuto ? 'Autodescarga Dominical' : 'Descarga Manual'}`, 20, 32);
        
        doc.setLineWidth(0.5);
        doc.setDrawColor(43, 100, 133);
        doc.line(20, 36, 190, 36);
        
        // Tarjetas
        doc.setFillColor(240, 244, 248);
        doc.rect(20, 42, 80, 25, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(43, 100, 133);
        doc.text("TOTAL INVERTIDO", 25, 48);
        const totalExpenses = activeOrders.reduce((sum, o) => sum + o.total, 0);
        doc.setFontSize(16);
        doc.text(`S/. ${totalExpenses.toFixed(2)}`, 25, 60);
        
        doc.setFillColor(240, 244, 248);
        doc.rect(110, 42, 80, 25, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(43, 100, 133);
        doc.text("REABASTECIMIENTOS", 115, 48);
        doc.setFontSize(16);
        doc.text(`${activeOrders.length} órdenes`, 115, 60);
        
        // Tabla
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
        activeOrders.forEach(order => {
            const itemsText = order.items.map(item => `${item.qty}x ${item.name} (Vence: ${item.expiry || 'N/A'})`).join(", ");
            const splitItems = doc.splitTextToSize(itemsText, 75); // 75mm de ancho para envolver
            
            const linesCount = splitItems.length;
            const rowHeight = Math.max(8, linesCount * 5);
            
            if (y + rowHeight > 280) {
                doc.addPage();
                y = 20;
            }
            
            doc.text(order.date, 20, y);
            doc.text(order.providerName || 'N/A', 50, y);
            
            // Imprimir texto multilínea
            for (let i = 0; i < linesCount; i++) {
                doc.text(splitItems[i], 90, y + (i * 5));
            }
            
            doc.text(`S/. ${order.total.toFixed(2)}`, 170, y);
            y += rowHeight + 3;
        });
        
        doc.save(`reporte_proveedores_${isAuto ? 'auto_' : ''}${Date.now()}.pdf`);
    }

    // === SISTEMA DE NOTIFICACIONES DINÁMICAS (En tiempo real y domingos) ===
    window.checkNotifications = function() {
        const products = getProducts();
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const currentPossible = [];

        // 1. Alertas de Stock y Vencimiento
        products.forEach(p => {
            // Agotado
            if (p.stock === 0) {
                currentPossible.push({
                    id: `no-stock-${p.id}`,
                    title: "Agotado",
                    message: `El producto "${p.name}" se encuentra sin stock.`,
                    type: "error"
                });
            } 
            // Bajo stock
            else if (p.stock <= 10) {
                currentPossible.push({
                    id: `low-stock-${p.id}-${p.stock}`,
                    title: "Bajo Stock",
                    message: `El producto "${p.name}" tiene stock bajo (${p.stock} pzas).`,
                    type: "warning"
                });
            }

            // Fechas de vencimiento
            if (p.dueDate) {
                const due = new Date(p.dueDate);
                due.setHours(0,0,0,0);
                const diffTime = due - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays <= 0) {
                    currentPossible.push({
                        id: `expired-${p.id}-${p.dueDate}`,
                        title: "Vencido",
                        message: `El producto "${p.name}" ya venció (Venció el ${p.dueDate}).`,
                        type: "error"
                    });
                } else if (diffDays <= 30) {
                    currentPossible.push({
                        id: `expiring-${p.id}-${p.dueDate}`,
                        title: "Próximo a Vencer",
                        message: `El producto "${p.name}" está próximo a vencer (Vence el ${p.dueDate}).`,
                        type: "warning"
                    });
                }
            }
        });

        // 2. Alerta de Domingo para Reportes
        if (today.getDay() === 0) { // Domingo
            const sundayStr = today.toISOString().split('T')[0];
            currentPossible.push({
                id: `sunday-report-${sundayStr}`,
                title: "Reporte Semanal Listo",
                message: "¡Hoy es Domingo! Ya puedes descargar los reportes de la semana en formato PDF.",
                type: "warning"
            });
        }

        // Cargar dismissals y filtrar los que ya no aplican para no inflar localStorage
        let dismissed = JSON.parse(localStorage.getItem('dismissedNotifications')) || [];
        dismissed = dismissed.filter(id => currentPossible.some(n => n.id === id));
        localStorage.setItem('dismissedNotifications', JSON.stringify(dismissed));

        // Filtrar notificaciones activas
        const activeNotifications = currentPossible.filter(n => !dismissed.includes(n.id));

        // Actualizar badges
        const badge = document.getElementById('notification-badge');
        const modalCount = document.getElementById('notification-modal-count');
        if (badge) {
            badge.innerText = activeNotifications.length;
            if (activeNotifications.length > 0) {
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
        if (modalCount) {
            modalCount.innerText = activeNotifications.length;
        }

        // Renderizar lista en el modal
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
                const iconColor = n.type === 'error' ? 'bg-error text-white' : 'bg-orange-500 text-white';
                const iconName = n.type === 'error' ? 'cancel' : 'warning';
                
                item.innerHTML = `
                    <div class="flex gap-4 items-center">
                        <div class="w-8 h-8 rounded-full ${iconColor} flex items-center justify-center shrink-0">
                            <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">${iconName}</span>
                        </div>
                        <div>
                            <span class="font-body font-semibold text-sm block leading-tight text-on-surface">${n.title}</span>
                            <span class="text-xs text-on-surface-variant">${n.message}</span>
                        </div>
                    </div>
                    <button onclick="dismissNotification('${n.id}')" class="text-slate-400 hover:text-slate-600 p-1 transition-colors shrink-0">
                        <span class="material-symbols-outlined text-[18px]">close</span>
                    </button>
                `;
                list.appendChild(item);
            });
        }
    };

    window.dismissNotification = function(id) {
        const dismissed = JSON.parse(localStorage.getItem('dismissedNotifications')) || [];
        if (!dismissed.includes(id)) {
            dismissed.push(id);
            localStorage.setItem('dismissedNotifications', JSON.stringify(dismissed));
        }
        checkNotifications();
    };

    window.clearAllNotifications = function() {
        const products = getProducts();
        const today = new Date();
        today.setHours(0,0,0,0);
        
        const possibleIds = [];
        
        products.forEach(p => {
            if (p.stock === 0) possibleIds.push(`no-stock-${p.id}`);
            else if (p.stock <= 10) possibleIds.push(`low-stock-${p.id}-${p.stock}`);
            
            if (p.dueDate) {
                const due = new Date(p.dueDate);
                due.setHours(0,0,0,0);
                const diffTime = due - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays <= 0) possibleIds.push(`expired-${p.id}-${p.dueDate}`);
                else if (diffDays <= 30) possibleIds.push(`expiring-${p.id}-${p.dueDate}`);
            }
        });

        if (today.getDay() === 0) {
            const sundayStr = today.toISOString().split('T')[0];
            possibleIds.push(`sunday-report-${sundayStr}`);
        }

        localStorage.setItem('dismissedNotifications', JSON.stringify(possibleIds));
        checkNotifications();
    };

    // === PANEL DE CONTROL / DASHBOARD FUNCIONAL ===
    window.updateDashboard = function() {
        const sales = JSON.parse(localStorage.getItem('salesHistory')) || [];
        const products = getProducts();
        
        const startOfToday = new Date();
        startOfToday.setHours(0,0,0,0);
        
        // Ventas del día actual (se resetea automáticamente al iniciar el nuevo día)
        const salesToday = sales
            .filter(s => new Date(s.date) >= startOfToday)
            .reduce((sum, s) => sum + s.total, 0);
            
        // Productos con bajo stock
        const lowStockCount = products.filter(p => p.stock <= 10).length;
        
        const salesValElement = document.getElementById('dashboard-sales-today');
        const lowStockElement = document.getElementById('dashboard-low-stock-count');
        
        if (salesValElement) salesValElement.innerText = salesToday.toFixed(2);
        if (lowStockElement) lowStockElement.innerText = lowStockCount;
    };

    // === RESUMEN GENERAL DE REPORTES (Ventas activas y Compras activas) ===
    window.updateReportsSummary = function() {
        const sales = JSON.parse(localStorage.getItem('salesHistory')) || [];
        const orders = JSON.parse(localStorage.getItem('providerOrdersHistory')) || [];
        
        // Sumar sólo lo que no se ha archivado el domingo
        const activeSalesTotal = sales.filter(s => !s.archived).reduce((sum, s) => sum + s.total, 0);
        const activeOrdersTotal = orders.filter(o => !o.archived).reduce((sum, o) => sum + o.total, 0);
        
        const salesTotalElement = document.getElementById('reports-sales-total');
        const ordersTotalElement = document.getElementById('reports-providers-total');
        
        if (salesTotalElement) salesTotalElement.innerText = `S/. ${activeSalesTotal.toFixed(2)}`;
        if (ordersTotalElement) ordersTotalElement.innerText = `S/. ${activeOrdersTotal.toFixed(2)}`;
    };

    // === RENDERIZADO DINÁMICO DE LA LISTA DE PROVEEDORES EN REPORTES ===
    window.renderProvidersListInReports = function() {
        const tbody = document.getElementById('reports-providers-table-body');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        const orders = JSON.parse(localStorage.getItem('providerOrdersHistory')) || [];
        const products = getProducts();
        
        // Agrupar gastos por proveedor único
        const providersMap = {};
        orders.forEach(order => {
            const name = order.providerName ? order.providerName.trim() : 'N/A';
            if (!providersMap[name]) {
                providersMap[name] = {
                    name: name,
                    categories: new Set(),
                    totalGasto: 0
                };
            }
            providersMap[name].totalGasto += order.total;
            
            // Buscar categorías de los productos involucrados
            order.items.forEach(item => {
                const matchedProduct = products.find(p => p.name.toLowerCase() === item.name.toLowerCase());
                if (matchedProduct && matchedProduct.category) {
                    providersMap[name].categories.add(matchedProduct.category);
                } else {
                    providersMap[name].categories.add('Abarrotes');
                }
            });
        });
        
        const providersList = Object.values(providersMap);
        if (providersList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" class="py-4 px-6 text-center text-slate-400 text-sm">No hay proveedores registrados aún.</td></tr>`;
            return;
        }
        
        providersList.forEach(prov => {
            const catsStr = Array.from(prov.categories).join(', ') || 'General';
            const tr = document.createElement('tr');
            tr.className = 'border-b border-slate-50 hover:bg-surface-container-low transition-colors';
            tr.innerHTML = `
                <td class="py-4 px-6 font-semibold">${prov.name}</td>
                <td class="py-4 px-6 text-sm">${catsStr}</td>
                <td class="py-4 px-6 text-right font-headline font-bold">S/. ${prov.totalGasto.toFixed(2)}</td>
            `;
            tbody.appendChild(tr);
        });
    };

    // === ARCHIVADO DE REPORTES SEMANALES ===
    window.archiveWeeklyData = function() {
        const sales = JSON.parse(localStorage.getItem('salesHistory')) || [];
        const orders = JSON.parse(localStorage.getItem('providerOrdersHistory')) || [];
        
        sales.forEach(s => s.archived = true);
        orders.forEach(o => o.archived = true);
        
        localStorage.setItem('salesHistory', JSON.stringify(sales));
        localStorage.setItem('providerOrdersHistory', JSON.stringify(orders));
    };

    // === CHEQUEO DE RESET DOMINICAL AUTOMÁTICO ===
    window.checkSundayResetAndDownload = function() {
        const today = new Date();
        const day = today.getDay(); // 0 es Domingo
        
        if (day === 0) {
            const todaySundayStr = today.toISOString().split('T')[0];
            const lastResetSunday = localStorage.getItem('lastResetSunday');
            
            // Si es domingo y hoy no se ha realizado el reset automático
            if (lastResetSunday !== todaySundayStr) {
                // Descargar PDFs automáticos de la semana acumulada
                generateSalesWeeklyReportPDF(true);
                generateProvidersExpensesReportPDF(true);
                
                // Archivar la semana (pone los contadores acumulativos activos a 0)
                archiveWeeklyData();
                
                localStorage.setItem('lastResetSunday', todaySundayStr);
                alert('¡Atención! Hoy es Domingo. Se han descargado y archivado tus reportes de la semana.');
                
                // Refrescar UI
                updateReportsSummary();
                renderProvidersListInReports();
            }
        }
    };

    // Validar Formularios - Simular navegación
    document.querySelectorAll('form').forEach(form => {
        if(form.id === 'form-add-product' || form.id === 'form-edit-product' || form.id === 'form-sale' || form.id === 'form-proveedores') return; // Ya manejados
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = form.querySelector('button[type="submit"]');
            if(submitBtn) {
                const text = submitBtn.innerText.toLowerCase();
                if (text.includes('acceder') || text.includes('crear')) {
                    navigateTo('main');
                } else if (text.includes('registrar orden') || text.includes('finalizar')) {
                    alert('Operación procesada con éxito.');
                }
            }
        });
    });

    // Logout
    document.querySelectorAll('[data-action="logout"]').forEach(btn => {
         btn.addEventListener('click', (e) => {
              e.preventDefault();
              navigateTo('login');
         });
    });

    // Inicializar renders e interfaces al cargar
    updateCategoryDatalist();
    renderInventory();
    renderFrequentProducts();
    renderCart();
    updateDashboard();
    checkNotifications();
    updateReportsSummary();
    renderProvidersListInReports();
    checkSundayResetAndDownload();

    // Loop de verificación cada 30 segundos (Para mantener reloj local en tab activa)
    setInterval(() => {
        updateDashboard();
        checkSundayResetAndDownload();
    }, 30000);
});
