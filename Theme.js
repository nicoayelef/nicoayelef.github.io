// theme.js - Manejo del tema claro/oscuro

document.addEventListener('DOMContentLoaded', function() {
    // Detectar tema guardado en localStorage
    const savedTheme = localStorage.getItem('darkMode');
    const darkMode = savedTheme === 'true';
    
    // Aplicar tema al cargar la página
    applyTheme(darkMode);
    
    // Configurar botón de cambio de tema
    const themeToggle = document.getElementById('theme-switcher');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const newDarkMode = !document.body.classList.contains('dark-mode');
            applyTheme(newDarkMode);
            localStorage.setItem('darkMode', newDarkMode);
        });
    }
    
    // Función para aplicar el tema
    function applyTheme(darkMode) {
        document.body.classList.toggle('dark-mode', darkMode);
        
        // Actualizar texto del botón
        const themeSwitcher = document.getElementById('theme-switcher');
        if (themeSwitcher) {
            themeSwitcher.innerHTML = darkMode ? 
                '<i class="fas fa-sun"></i> Modo Claro' : 
                '<i class="fas fa-moon"></i> Modo Oscuro';
        }
        
        // Aplicar estilos específicos para modo oscuro a elementos del formulario
        const formControls = document.querySelectorAll('.form-control, .form-select');
        formControls.forEach(element => {
            if (darkMode) {
                element.style.backgroundColor = '#333';
                element.style.color = '#fff';
                element.style.borderColor = '#555';
            } else {
                element.style.backgroundColor = '';
                element.style.color = '';
                element.style.borderColor = '';
            }
        });
    }
    
    // Configurar funciones globales para modals
    window.showLoadingModal = function() {
        const loadingModalEl = document.getElementById('loadingModal');
        const loadingModal = new bootstrap.Modal(loadingModalEl);
        loadingModal.show();
    };

    window.hideLoadingModal = function() {
        const loadingModalEl = document.getElementById('loadingModal');
        const loadingModal = bootstrap.Modal.getInstance(loadingModalEl);
        if (loadingModal) {
            loadingModal.hide();
        } else {
            // Forzar ocultamiento si no se puede obtener la instancia
            loadingModalEl.classList.remove('show');
            document.body.classList.remove('modal-open');
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }
    };
});
