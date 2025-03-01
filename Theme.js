/* theme.css - Estilos para modo claro/oscuro */
:root {
  --background-color: #ffffff;
  --text-color: #333333;
  --card-bg: #f5f5f5;
  --header-bg: #f0f0f0;
  --border-color: #ddd;
  --button-bg: #4a89dc;
  --button-text: white;
  --modal-bg: rgba(0, 0, 0, 0.5);
  --modal-content-bg: white;
}

[data-theme="dark"] {
  --background-color: #121212;
  --text-color: #e0e0e0;
  --card-bg: #1e1e1e;
  --header-bg: #2d2d2d;
  --border-color: #444;
  --button-bg: #6c5ce7;
  --button-text: white;
  --modal-bg: rgba(0, 0, 0, 0.7);
  --modal-content-bg: #2d2d2d;
}

/* Asegúrate de aplicar estas variables en tus elementos */
body {
  background-color: var(--background-color);
  color: var(--text-color);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.card, .form-container {
  background-color: var(--card-bg);
}

.modal-content {
  background-color: var(--modal-content-bg);
}

/* Utilizar !important solo si es necesario para sobrescribir estilos inline */
.dark-mode .text-muted {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

/* Asegurarse de que los inputs sean legibles en modo oscuro */
.dark-mode .form-control,
.dark-mode .form-select {
  background-color: #333;
  color: #fff;
  border-color: #555;
}

/* Estilos específicos para Safari */
@supports (-webkit-touch-callout: none) {
  .dark-mode {
    background-color: #121212 !important;
  }
  
  .light-mode {
    background-color: #f8f9fa !important;
  }
}
