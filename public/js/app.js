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
        // Función auxiliar para normalizar texto (quitar tildes y convertir a minúsculas)
    function normalizeText(text) {
        if (!text) return '';
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }

    // Inicializar los datos de LocalStorage
    function initData() {
        if (!localStorage.getItem('products')) {
            const initialProducts = [
                { id: 1, name: 'Aceite Vegetal 1L', category: 'Abarrotes', stock: 42, price: 11.50, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSdyoT-pWaPag0pRUqTVjyMlYIdXIzPzzhoXsfG2JLfKPlbQ08vd3Ou77DoCalL0vk8OEJS47qpO3AVgwTBVz3qHSzH1gqMQD0RHPpIWQEhwxOaq-yP5hHIbqpbKl09Pj23-DIQ3XPEUJs4MNQ-lhwgjkRohCp-_663xiJqtxhE-G65whtGywBbaypraQKPfHneDzN-eN1D65yK07NqW_wWFf1s41UbTvIPH5vXg8cKnpY2BXxtf1aWVWi4hcyFu2nfzNX-Ds2on_U' },
                { id: 2, name: 'Arroz Extra 5kg', category: 'Abarrotes', stock: 5, price: 24.90, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3pLoVfn_cHSGBAgLCawkMy9JF3RpoavMJXPq5bE8ekikGRPBw-hgvId76H2HYoI97_xtHbBWdaKnWdERXhZMLy4TLo9zDUAa0h27fZ6bQeHXR6AToMIccogByWEoB_I8g2jMY76vP4BnJRelFRDzTSG3WJ53wtI_D2WPkXeFgZr5gkn_AlS0VL3KzfPQtYT2k88Ci1rIKhwbaisYKy6GgOucKRUR-g3x3kHHc4RlXcG3G43038Fqgx0gquIa8-79CT5mhviWSnqLh' },
                { id: 3, name: 'Leche Evaporada', category: 'Lácteos', stock: 120, price: 4.20, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgVkKE_tfawwqwEkLX-lyRmdSXUCTFajYQOShvl7TNY262UdpLieZNgN9sXz1dUYIKGVhRhj5EEMJ8UYvUh8arGs1ct8MkPl0dGY1ZqXvEpOOkOeq5FwLRDdswjmBFO302bIyTw9v7DditPXHjYE20AROaQ7J2lKF7CIIAcnzzZoGbCMcFc6Wd7lsJH58R2cHWieLPptQaijka01eZRuIvn6XljFNwF4Ugts08BdrOxZZvd-Rk28hQ3SEp27WW_oI4-X8CeZk46s54' },
                { id: 4, name: 'Pan Molde', category: 'Abarrotes', stock: 15, price: 7.20, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCujcMaJvzpK3auTF3xe0sscuwFryBw5EvP0seUXe1Ju_OBxqbafAZqGARER-FNnJw_qpTt5mYP-kLBmGcJnP2ANYoKUB_rlJlxBrMd0rxnzPHBWx5cVplYG6QC1Zrz-_QfAz5jlvtYniSoU9ri1lqA5t6kq5u7LHyfaQOvKl1p7phDKer-X28gjU5u202eCJitPLhmnXYJuVIdUF5rfdvS2sP8vZtJQn5opeM1pGKGENUqTIWKnb09A2BJxeJAQO5sNgb6wwxvcJTL' },
                { id: 5, name: 'Huevos x12', category: 'Lácteos', stock: 30, price: 8.50, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1mh0Jx1RSSNoJX9cfmnxHdhJ5uuyS-SUH3G-1UTH397BNLUEXm8fv1lwLOBOGhzwlNePQoEmitg7KzSvNU32xu0pSA3J1utH_08B387W1zKcRrnNv7jJpIx7o0XQWKNtVHrXOlBwWZC9XI9E0Ho7D152uBg1qEcKXeXmYp4sBPjLa8Wij0_JKcvxIsn4WHOUk5CvgI6DqgeSK0kMR5Mbs4AkISLLl4cgCiL2mXi_gUYKSxSgwDreIfjtuBfx5DNCRdN9LpxkICK1B' },
                { id: 6, name: 'Atún Campomar', category: 'Abarrotes', stock: 50, price: 5.20, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1mh0Jx1RSSNoJX9cfmnxHdhJ5uuyS-SUH3G-1UTH397BNLUEXm8fv1lwLOBOGhzwlNePQoEmitg7KzSvNU32xu0pSA3J1utH_08B387W1zKcRrnNv7jJpIx7o0XQWKNtVHrXOlBwWZC9XI9E0Ho7D152uBg1qEcKXeXmYp4sBPjLa8Wij0_JKcvxIsn4WHOUk5CvgI6DqgeSK0kMR5Mbs4AkISLLl4cgCiL2mXi_gUYKSxSgwDreIfjtuBfx5DNCRdN9LpxkICK1B' }
            ];
            localStorage.setItem('products', JSON.stringify(initialProducts));
        }
        if (!localStorage.getItem('cart')) {
            localStorage.setItem('cart', JSON.stringify([]));
        }
    }
    
    initData();

    // Acceso a datos
    function getProducts() {
        return JSON.parse(localStorage.getItem('products')) || [];
    }
    function saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products));
        renderInventory();
        renderFrequentProducts();
        updateProviderDatalist();
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
        if (viewName === 'inventario') renderInventory();
        if (viewName === 'ventas') {
            renderFrequentProducts();
            renderCart();
        }
        if (viewName === 'proveedores') {
            updateProviderDatalist();
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

    // === INVENTARIO Y PAGINACION ===
    let currentPage = 1;
    const itemsPerPage = 5;
    let currentSearchTerm = '';

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchTerm = e.target.value.toLowerCase();
            currentPage = 1;
            renderInventory();
            renderFrequentProducts();
        });
    }

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
            const stockClass = p.stock < 10 ? 'text-error' : '';
            const catColor = p.category === 'Lácteos' ? 'bg-primary-fixed/50 text-on-primary-fixed-variant' : 'bg-secondary-container/30 text-on-secondary-container';
            
            // Lógica de fecha vencimiento
            let dateClass = 'text-on-surface';
            let dateStr = 'N/A';
            if (p.dueDate) {
                dateStr = p.dueDate;
                const today = new Date();
                const due = new Date(p.dueDate);
                const diffTime = due - today;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (diffDays <= 0) dateClass = 'text-error font-bold';
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
        
        openModal('modal-edit-product');
    };

    // Guardar Edición
    document.getElementById('form-edit-product').addEventListener('submit', (e) => {
        e.preventDefault();
        const products = getProducts();
        const idx = products.findIndex(p => p.id === editingId);
        
        if(idx !== -1) {
            products[idx].name = document.getElementById('edit-product-name').value;
            products[idx].presentation = document.getElementById('edit-product-size').value;
            const typeInput = document.getElementById('edit-product-type');
            products[idx].type = typeInput ? typeInput.value : '';
            products[idx].price = parseFloat(document.getElementById('edit-product-price').value);
            products[idx].dueDate = document.getElementById('edit-product-date').value;
            saveProducts(products);
        }
        closeModal('modal-edit-product');
    });

    // Agregar Producto Nuevo
    document.getElementById('form-add-product').addEventListener('submit', (e) => {
        e.preventDefault();
        const products = getProducts();
        const categorySelect = document.getElementById('add-product-category');
        
        const newProduct = {
            id: Date.now(),
            name: document.getElementById('add-product-name').value,
            presentation: document.getElementById('add-product-size').value,
            type: document.getElementById('add-product-type') ? document.getElementById('add-product-type').value : '',
            price: parseFloat(document.getElementById('add-product-price').value),
            stock: parseInt(document.getElementById('add-product-stock').value, 10),
            dueDate: document.getElementById('add-product-date').value,
            category: categorySelect.options[categorySelect.selectedIndex].text,
            img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgVkKE_tfawwqwEkLX-lyRmdSXUCTFajYQOShvl7TNY262UdpLieZNgN9sXz1dUYIKGVhRhj5EEMJ8UYvUh8arGs1ct8MkPl0dGY1ZqXvEpOOkOeq5FwLRDdswjmBFO302bIyTw9v7DditPXHjYE20AROaQ7J2lKF7CIIAcnzzZoGbCMcFc6Wd7lsJH58R2cHWieLPptQaijka01eZRuIvn6XljFNwF4Ugts08BdrOxZZvd-Rk28hQ3SEp27WW_oI4-X8CeZk46s54'
        };
        
        products.push(newProduct);
        saveProducts(products); // Renderiza autom.
        
        e.target.reset();
        closeModal('modal-add-product');
    });

    // === LÓGICA DE VENTAS ===
    window.renderFrequentProducts = function() {
        const grid = document.getElementById('frequent-products-grid');
        if (!grid) return;
        
        let products = getProducts();
        if (currentSearchTerm) {
            products = products.filter(p => 
                (p.name && p.name.toLowerCase().includes(currentSearchTerm)) ||
                (p.type && p.type.toLowerCase().includes(currentSearchTerm)) ||
                (p.category && p.category.toLowerCase().includes(currentSearchTerm))
            );
        }
        products = products.slice(0, 8); // Máximo 8 productos

        grid.innerHTML = '';
        
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

            const div = document.createElement('div');
            div.className = 'bg-surface-container-lowest p-4 rounded-xl shadow-sm text-center flex flex-col justify-between';
            div.innerHTML = `
                ${typeTag}
                <div>
                    <img src="${p.img}" class="h-24 w-full object-cover rounded-md mb-2 bg-surface-container-low ${p.stock === 0 ? 'opacity-50' : ''}">
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

    // Finalizar Venta
    document.getElementById('form-sale').addEventListener('submit', (e) => {
        e.preventDefault();
        const cart = getCart();
        if(cart.length === 0) {
             alert('El carrito está vacío');
             return;
        }
        
        // Reducir stock del inventario
        const products = getProducts();
        
        cart.forEach(cartItem => {
             const prodIdx = products.findIndex(p => p.id === cartItem.id);
             if(prodIdx !== -1) {
                  products[prodIdx].stock -= cartItem.qty;
             }
        });
        
        saveProducts(products); // Guarda inventario actualizado
        saveCart([]); // Limpia el carrito
        
        alert('Venta finalizada exitosamente.\nSe ha descontado del inventario.');
    });
 
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
                    <span class="text-xs text-slate-500 block">Cant: ${item.qty}</span>
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
        const inputCost = document.getElementById('provider-cost');

        const name = inputName.value.trim();
        const qty = parseInt(inputQty.value, 10);
        const cost = parseFloat(inputCost.value);

        if(!name || isNaN(qty) || qty <= 0 || isNaN(cost) || cost <= 0) {
            alert('Por favor completa todos los campos del producto correctamente.');
            return;
        }

        currentProviderOrder.push({ name, qty, cost });
        renderProviderOrder();

        // Limpiar inputs del producto
        inputName.value = '';
        inputQty.value = '';
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
        
        // Sumar stock si el producto existe
        currentProviderOrder.forEach(orderItem => {
            const existing = products.find(p => p.name.toLowerCase() === orderItem.name.toLowerCase());
            if(existing) {
                existing.stock += orderItem.qty;
            } else {
                // Producto nuevo, lo agregamos al inventario por defecto
                products.push({
                    id: Date.now() + Math.random(),
                    name: orderItem.name,
                    price: 0, // Precio de venta 0 por defecto si no lo tenian registrado
                    stock: orderItem.qty,
                    category: 'Abarrotes',
                    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSdyoT-pWaPag0pRUqTVjyMlYIdXIzPzzhoXsfG2JLfKPlbQ08vd3Ou77DoCalL0vk8OEJS47qpO3AVgwTBVz3qHSzH1gqMQD0RHPpIWQEhwxOaq-yP5hHIbqpbKl09Pj23-DIQ3XPEUJs4MNQ-lhwgjkRohCp-_663xiJqtxhE-G65whtGywBbaypraQKPfHneDzN-eN1D65yK07NqW_wWFf1s41UbTvIPH5vXg8cKnpY2BXxtf1aWVWi4hcyFu2nfzNX-Ds2on_U'
                });
            }
        });

        saveProducts(products); // Actualiza localStorage

        alert('Orden Registrada Exitosamente en el inventario.');
        
        // Limpiamos todo
        currentProviderOrder = [];
        renderProviderOrder();
        e.target.reset(); // Botón form reset
    });


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

    // Inicializar renders on load
    renderInventory();
    renderFrequentProducts();
    renderCart();
});
