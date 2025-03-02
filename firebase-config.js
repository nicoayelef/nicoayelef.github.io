// Configuración de Firebase para el Sistema de Fichas Clínicas

// Configuración de Firebase (reemplaza con tus propias credenciales)
const firebaseConfig = {
    apiKey: "AIzaSyBYaNbZWHUS-Pvm49kmMtHw9LqqxUDySYA",
    authDomain: "base-de-datos-poli.firebaseapp.com",
    projectId: "base-de-datos-poli",
    storageBucket: "base-de-datos-poli.appspot.com",
    messagingSenderId: "954754202697",
    appId: "1:954754202697:web:e06171f6b0ade314259398"
};

// Función para inicializar Firebase de manera segura
function initializeFirebase() {
    return new Promise((resolve, reject) => {
        // Verificar si Firebase ya está disponible
        if (typeof firebase === 'undefined') {
            reject(new Error("Firebase no está cargado. Verifica las bibliotecas."));
            return;
        }

        try {
            // Inicializar solo si no hay apps
            if (!firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
                console.log("Firebase inicializado correctamente");
            }

            // Obtener instancias
            const firestore = firebase.firestore();
            const storage = firebase.storage();

            // Configuraciones adicionales de Firestore
            firestore.settings({
                cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
            });

            // Habilitar persistencia (opcional, manejo de errores)
            firestore.enablePersistence()
                .catch((err) => {
                    if (err.code === 'failed-precondition') {
                        console.warn("Persistencia de caché no disponible: múltiples pestañas abiertas");
                    } else if (err.code === 'unimplemented') {
                        console.warn("Persistencia no soportada en este navegador");
                    }
                });

            resolve({
                firestore: firestore,
                storage: storage
            });

        } catch (error) {
            console.error("Error al inicializar Firebase:", error);
            reject(error);
        }
    });
}

// Exportar configuración (si estás usando módulos)
export { 
    firebaseConfig, 
    initializeFirebase 
};
