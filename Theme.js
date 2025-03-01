// theme.js - Solución robusta para cambio de tema y modal
document.addEventListener('DOMContentLoaded', function() {
  // Controlador para el modal de carga
  window.loadingCount = 0;

  // Función para mostrar el modal de carga
  window.showLoadingModal = function() {
    window.loadingCount++;
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModal) {
      const bsModal = new bootstrap.Modal(loadingModal);
      bsModal.show();
    }
  };

  // Función para ocultar el modal de carga
  window.hideLoadingModal = function() {
    window.loadingCount--;
    if (window.loadingCount <= 0) {
      window.loadingCount = 0;
      const loadingModal = document.getElementById('loadingModal');
      if (loadingModal) {
        const modalInstance = bootstrap.Modal.getInstance(loadingModal);
        if (modalInstance) modalInstance.hide();
      }
    }
  };

  // Configuración del tema claro/oscuro
  const themeToggleBtn = document.getElementById('theme-switcher');
  if (!themeToggleBtn) {
    console.error('Botón de tema no encontrado');
    return;
  }
  
  // Detectar preferencia del sistema
  const prefiereDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Obtener tema guardado o usar preferencia del sistema
  const savedTheme = localStorage.getItem('theme') || (prefiereDarkMode ? 'dark' : 'light');
  
  // Aplicar tema inmediatamente
  applyTheme(savedTheme);
  
  // Función para aplicar el tema
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
      document.body.classList.remove('light-mode');
      if (themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
    } else {
      document.body.classList.add('light-mode');
      document.body.classList.remove('dark-mode');
      if (themeToggleBtn) themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i> Modo Oscuro';
    }
  }
  
  // Manejar clic en el botón
  themeToggleBtn.addEventListener('click', function() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Guardar y aplicar el nuevo tema
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
    
    // Forzar repintado (para Safari)
    document.body.style.display = 'none';
    document.body.offsetHeight; // Forzar repintado
    document.body.style.display = '';
    
    console.log('Tema cambiado a:', newTheme);
  });
  
  // Protección de seguridad para el modal
  setInterval(function() {
    const loadingModal = document.getElementById('loadingModal');
    if (loadingModal && loadingModal.classList.contains('show')) {
      // Si el modal ha estado abierto por más de 10 segundos, cerrarlo
      window.loadingCount = 0;
      const modalInstance = bootstrap.Modal.getInstance(loadingModal);
      if (modalInstance) modalInstance.hide();
    }
  }, 10000);
});
