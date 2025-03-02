// utils.js - Funciones de utilidad global

// Funciones para manejar el modal de carga con mejor manejo de errores
window.showLoadingModal = function() {
    try {
        const loadingModalEl = document.getElementById('loadingModal');
        if (!loadingModalEl) {
            console.error('Modal de carga no encontrado');
            return;
        }

        // Usar Bootstrap Modal con opciones de configuración
        const loadingModal = new bootstrap.Modal(loadingModalEl, {
            backdrop: 'static',  // Evitar que se cierre al hacer clic fuera
            keyboard: false      // Evitar que se cierre con tecla Esc
        });
        
        loadingModal.show();

        // Añadir un timeout de seguridad por si el modal no se oculta
        setTimeout(() => {
            window.hideLoadingModal();
        }, 30000);  // 30 segundos
    } catch (error) {
        console.error('Error al mostrar el modal de carga:', error);
    }
};

window.hideLoadingModal = function() {
    try {
        const loadingModalEl = document.getElementById('loadingModal');
        if (!loadingModalEl) {
            console.error('Modal de carga no encontrado');
            return;
        }

        // Intentar obtener la instancia del modal
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
    } catch (error) {
        console.error('Error al ocultar el modal de carga:', error);
    }
};

// Función para formatear fecha con mejor manejo de errores
window.formatDate = function(timestamp) {
    if (!timestamp) return 'Fecha no disponible';
    
    try {
        // Manejar diferentes tipos de objetos de fecha
        const date = timestamp instanceof Date 
            ? timestamp 
            : (timestamp.toDate ? timestamp.toDate() : new Date(timestamp));
        
        // Verificar si la fecha es válida
        if (isNaN(date.getTime())) {
            return 'Fecha inválida';
        }
        
        // Formateo de fecha localizado
        return date.toLocaleDateString('es-CL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    } catch (e) {
        console.error("Error al formatear fecha:", e);
        return 'Fecha no procesable';
    }
};

// Función para formatear hora con mejor manejo de errores
window.formatTime = function(timestamp) {
    if (!timestamp) return '';
    
    try {
        // Manejar diferentes tipos de objetos de fecha
        const date = timestamp instanceof Date 
            ? timestamp 
            : (timestamp.toDate ? timestamp.toDate() : new Date(timestamp));
        
        // Verificar si la fecha es válida
        if (isNaN(date.getTime())) {
            return '';
        }
        
        // Formateo de hora localizado
        return date.toLocaleTimeString('es-CL', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    } catch (e) {
        console.error("Error al formatear hora:", e);
        return '';
    }
};

// Función de utilidad para validar RUT chileno
window.validateRUT = function(rut) {
    // Eliminar puntos y guión
    rut = rut.replace(/[.-]/g, '');
    
    // Validar formato
    if (!/^[0-9]+[0-9kK]$/.test(rut)) {
        return false;
    }
    
    // Separar dígito verificador
    const body = rut.slice(0, -1);
    const verifier = rut.slice(-1).toUpperCase();
    
    // Calcular dígito verificador
    let sum = 0;
    let multiplier = 2;
    
    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body.charAt(i)) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    
    const calculatedVerifier = 11 - (sum % 11);
    const expectedVerifier = calculatedVerifier === 11 
        ? '0' 
        : (calculatedVerifier === 10 
            ? 'K' 
            : calculatedVerifier.toString());
    
    return verifier === expectedVerifier;
};

// Manejo global de errores
window.addEventListener('error', function(event) {
    console.error('Error global capturado:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
    });
    
    // Intentar ocultar modal de carga si hay un error
    try {
        window.hideLoadingModal();
    } catch(e) {
        console.error('Error al ocultar modal de carga:', e);
    }
});
