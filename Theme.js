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
            const currentTheme = document.body.classList.contains('dark-mode');
            const newTheme = !currentTheme;
            
            applyTheme(newTheme);
            localStorage.setItem('darkMode', newTheme);
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
    }
});
