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

    // Initialize LocalStorage Data
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

    // Data Access
    function getProducts() {
        return JSON.parse(localStorage.getItem('products')) || [];
    }
    function saveProducts(products) {
        localStorage.setItem('products', JSON.stringify(products));
        renderInventory();
        renderFrequentProducts();
        updateProviderDatalist();
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

    window.renderInventory = function() {
        const tableBody = document.querySelector('#inventory-table tbody');
        if (!tableBody) return;
        
        const allProducts = getProducts();
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
            
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-surface-container-low transition-colors';
            tr.innerHTML = `
                <td class="px-6 py-4 font-semibold text-on-surface">${p.name}</td>
                <td class="px-6 py-4"><span class="px-3 py-1 ${catColor} rounded-full text-xs font-semibold">${p.category}</span></td>
                <td class="px-6 py-4 font-bold ${stockClass}">${p.stock}</td>
                <td class="px-6 py-4 text-right font-headline font-bold">${parseFloat(p.price).toFixed(2)}</td>
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
        
        const form = document.getElementById('form-edit-product');
        const inputs = form.closest('.glass-panel').querySelectorAll('input, select');
        
        inputs[0].value = product.name;         // Nombre
        inputs[1].value = product.category;     // Categoria
        inputs[2].value = product.stock;        // Stock
        inputs[3].value = product.price;        // Precio
        
        openModal('modal-edit-product');
    };

    // Guardar Edición
    document.getElementById('form-edit-product').addEventListener('submit', (e) => {
        e.preventDefault();
        const inputs = e.target.closest('.glass-panel').querySelectorAll('input, select');
        const products = getProducts();
        const idx = products.findIndex(p => p.id === editingId);
        
        if(idx !== -1) {
            products[idx].name = inputs[0].value;
            products[idx].category = inputs[1].value;
            products[idx].stock = parseInt(inputs[2].value, 10);
            products[idx].price = parseFloat(inputs[3].value);
            saveProducts(products);
        }
        closeModal('modal-edit-product');
    });

    // Agregar Producto Nuevo
    document.getElementById('form-add-product').addEventListener('submit', (e) => {
        e.preventDefault();
        const inputs = e.target.querySelectorAll('input, select');
        const products = getProducts();
        
        const newProduct = {
            id: Date.now(),
            name: inputs[0].value,
            price: parseFloat(inputs[1].value),
            stock: parseInt(inputs[2].value, 10),
            category: inputs[3].options[inputs[3].selectedIndex].text,
            img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgVkKE_tfawwqwEkLX-lyRmdSXUCTFajYQOShvl7TNY262UdpLieZNgN9sXz1dUYIKGVhRhj5EEMJ8UYvUh8arGs1ct8MkPl0dGY1ZqXvEpOOkOeq5FwLRDdswjmBFO302bIyTw9v7DditPXHjYE20AROaQ7J2lKF7CIIAcnzzZoGbCMcFc6Wd7lsJH58R2cHWieLPptQaijka01eZRuIvn6XljFNwF4Ugts08BdrOxZZvd-Rk28hQ3SEp27WW_oI4-X8CeZk46s54'
        };
        
        products.push(newProduct);
        saveProducts(products); // Renderiza autom.
        
        e.target.reset();
        closeModal('modal-add-product');
    });
 

    // Validar Formularios - Simular navegación (para forms que no atrapamos antes)
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

    renderInventory();

});