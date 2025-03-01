// Funciones para controlar el tema oscuro/claro
let darkMode = localStorage.getItem('darkMode') === 'true';

// Función para cambiar entre modo claro y oscuro
function toggleDarkMode() {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode);
    applyTheme();
}

// Función para aplicar el tema actual
function applyTheme() {
    document.body.classList.toggle('dark-mode', darkMode);
    
    // Actualizar el texto del botón
    const themeSwitcher = document.getElementById('theme-switcher');
    if (themeSwitcher) {
        themeSwitcher.innerHTML = darkMode ? 
            '<i class="fas fa-sun"></i> Modo Claro' : 
            '<i class="fas fa-moon"></i> Modo Oscuro';
    }
    
    console.log('Tema aplicado:', darkMode ? 'oscuro' : 'claro');
}

// Solución para el modal de carga que se queda atascado
function setupLoadingModalSafety() {
    // Esta función configura un "safety net" para el modal de carga
    setInterval(() => {
        // Verifica si el modal de carga está visible por más de 10 segundos
        const loadingModal = document.getElementById('loadingModal');
        if (loadingModal && loadingModal.classList.contains('show')) {
            const modalInstance = bootstrap.Modal.getInstance(loadingModal);
            if (modalInstance) {
                modalInstance.hide();
                console.log('Modal de carga cerrado automáticamente por tiempo de seguridad');
            }
        }
    }, 10000); // Revisar cada 10 segundos
}

// Aplicar los arreglos cuando el documento esté listo
document.addEventListener('DOMContentLoaded', function() {
    // Aplicar tema basado en la preferencia guardada
    applyTheme();
    
    // Configurar el botón de cambio de tema
    const themeBtn = document.getElementById('theme-switcher');
    if (themeBtn) {
        themeBtn.addEventListener('click', toggleDarkMode);
        console.log('Event listener para tema configurado');
    } else {
        console.error('Botón de tema no encontrado');
    }

    // Establecer mecanismo de seguridad para el modal de carga
    setupLoadingModalSafety();
    
    // Reescribir el comportamiento de cerrar modal para los modales existentes
    // Para el modal de detalles del paciente
    document.querySelectorAll('.modal .btn-close, .modal .btn-secondary').forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.closest('.modal').id;
            const modalElement = document.getElementById(modalId);
            if (modalElement) {
                const modalInstance = bootstrap.Modal.getInstance(modalElement);
                if (modalInstance) {
                    modalInstance.hide();
                    console.log(`Modal ${modalId} cerrado correctamente`);
                }
            }
        });
    });
    
    // Asegurarse de que el loadingModal se cierra correctamente
    // Sobrescribir métodos problemáticos
    const originalShowPatientDetails = window.showPatientDetails;
    if (typeof originalShowPatientDetails === 'function') {
        window.showPatientDetails = function(patientId) {
            // Asegurarse de que no hay modal de carga abierto
            const loadingModal = document.getElementById('loadingModal');
            if (loadingModal && loadingModal.classList.contains('show')) {
                const modalInstance = bootstrap.Modal.getInstance(loadingModal);
                if (modalInstance) modalInstance.hide();
            }
            
            // Llamar a la función original
            return originalShowPatientDetails(patientId);
        };
    }

    // También para loadPatientPSFS
    const originalLoadPatientPSFS = window.loadPatientPSFS;
    if (typeof originalLoadPatientPSFS === 'function') {
        window.loadPatientPSFS = function() {
            // Asegurarse de que no hay modal de carga abierto
            const loadingModal = document.getElementById('loadingModal');
            if (loadingModal && loadingModal.classList.contains('show')) {
                const modalInstance = bootstrap.Modal.getInstance(loadingModal);
                if (modalInstance) modalInstance.hide();
            }
            
            // Llamar a la función original
            return originalLoadPatientPSFS();
        };
    }
});
