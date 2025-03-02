// utils.js - Funciones de utilidad global

// Funciones para manejar el modal de carga
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
        
        // Fallback method to ensure modal closes
        loadingModalEl.classList.remove('show');
        document.body.classList.remove('modal-open');
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
    }
};

// Función para formatear fecha
window.formatDate = function(timestamp) {
    if (!timestamp) return 'Fecha no disponible';
    
    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('es-CL', {
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric'
        });
    } catch (e) {
        console.error("Error al formatear fecha:", e);
        return 'Fecha inválida';
    }
};

// Función para formatear hora
window.formatTime = function(timestamp) {
    if (!timestamp) return '';
    
    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleTimeString('es-CL', {
            hour: '2-digit', 
            minute: '2-digit'
        });
    } catch (e) {
        console.error("Error al formatear hora:", e);
        return '';
    }
};
