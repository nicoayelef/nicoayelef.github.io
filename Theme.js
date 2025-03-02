// theme.js - Manejo del tema claro/oscuro

document.addEventListener('DOMContentLoaded', function() {
    // Detectar tema guardado en localStorage con fallback
    const savedTheme = localStorage.getItem('darkMode');
    const isDarkMode = savedTheme === 'true';
    
    // Función para aplicar el tema
    function applyTheme(darkMode) {
        // Aplicar clase de modo oscuro al body
        document.body.classList.toggle('dark-mode', darkMode);
        
        // Actualizar texto del botón de tema
        const themeSwitcher = document.getElementById('theme-switcher');
        if (themeSwitcher) {
            themeSwitcher.innerHTML = darkMode ? 
                '<i class="fas fa-sun"></i> Modo Claro' : 
                '<i class="fas fa-moon"></i> Modo Oscuro';
        }
        
        // Aplicar estilos específicos para elementos del formulario
        const formElements = document.querySelectorAll(
            '.form-control, .form-select, .form-range, textarea, ' +
            '.table, .card, .modal-content, .alert'
        );
        
        formElements.forEach(element => {
            element.classList.toggle('dark-mode', darkMode);
        });
    }
    
    // Aplicar tema inicial
    applyTheme(isDarkMode);
    
    // Configurar botón de cambio de tema
    const themeToggle = document.getElementById('theme-switcher');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentMode = document.body.classList.contains('dark-mode');
            const newMode = !currentMode;
            
            // Guardar preferencia
            localStorage.setItem('darkMode', newMode);
            
            // Aplicar nuevo tema
            applyTheme(newMode);
        });
    }
    
    // Funciones globales para modal de carga
    window.showLoadingModal = function() {
        const loadingModalEl = document.getElementById('loadingModal');
        if (loadingModalEl) {
            const loadingModal = new bootstrap.Modal(loadingModalEl, {
                backdrop: 'static',
                keyboard: false
            });
            loadingModal.show();
        }
    };

    window.hideLoadingModal = function() {
        const loadingModalEl = document.getElementById('loadingModal');
        if (loadingModalEl) {
            const loadingModal = bootstrap.Modal.getInstance(loadingModalEl);
            if (loadingModal) {
                loadingModal.hide();
            }
            
            // Forzar ocultamiento
            loadingModalEl.classList.remove('show');
            document.body.classList.remove('modal-open');
            
            // Remover backdrop si existe
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
            
            // Restaurar estilos del body
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }
    };
});

// Manejo de errores
window.addEventListener('error', function(event) {
    console.error('Error global:', event.error);
    
    // Intentar ocultar modal de carga si hay un error
    try {
        window.hideLoadingModal();
    } catch(e) {
        console.error('Error al ocultar modal de carga:', e);
    }
});
