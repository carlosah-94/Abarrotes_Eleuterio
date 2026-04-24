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
});