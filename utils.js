// utils.js - Funciones de utilidad global

// Funciones para manejar el modal de carga
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

// Función para formatear fecha
window.formatDate = function(timestamp) {
    if (!timestamp) return 'Fecha no disponible';
    
    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString();
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
        return date.toLocaleTimeString();
    } catch (e) {
        console.error("Error al formatear hora:", e);
        return '';
    }
};
