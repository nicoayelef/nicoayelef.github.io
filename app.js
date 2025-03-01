// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBYaNbZWHUS-Pvm49kmMtHw9LqqxUDySYA",
  authDomain: "base-de-datos-poli.firebaseapp.com",
  projectId: "base-de-datos-poli",
  storageBucket: "base-de-datos-poli.appspot.com", 
  messagingSenderId: "954754202697",
  appId: "1:954754202697:web:e06171f6b0ade314259398"
};

// Inicializar Firebase (con verificación para evitar inicializaciones múltiples)
if (!firebase.apps || !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
} else {
  firebase.app(); // Si ya está inicializado, usa la instancia existente
}

console.log("Firebase inicializado correctamente");

// Inicializar Firestore
const db = firebase.firestore();

// Verificar conexión a Firestore
console.log("Verificando conexión a Firestore...");
db.collection("patients").limit(1).get()
  .then(snapshot => {
    console.log("Conexión a Firestore exitosa. Documentos encontrados:", snapshot.size);
  })
  .catch(error => {
    console.error("Error al conectar con Firestore:", error);
    alert("Error de conexión a la base de datos: " + error.message);
  });

// Variables globales
let currentPatientId = null;
let currentEvolutionId = null;

// Función para convertir archivos a Base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    });
}

// Función para actualizar el valor mostrado de los sliders de valoración
function updateRatingValue(sliderId, valueId) {
    const slider = document.getElementById(sliderId);
    const valueDisplay = document.getElementById(valueId);
    
    if (slider && valueDisplay) {
    // Actualizar el valor inicial
    valueDisplay.textContent = slider.value;
    
    // Agregar evento para actualizar cuando cambia el deslizador
    slider.oninput = function() {
    valueDisplay.textContent = this.value;
    };
    } else {
    console.error(`Elementos no encontrados: slider=${sliderId}, value=${valueId}`);
    }
}

// Función para procesar archivos (convertir a Base64)
async function processFiles(files) {
    if (!files || files.length === 0) return [];
    
    const processedFiles = [];
    const largeFiles = [];
    const MAX_SIZE = 1 * 1024 * 1024; // 1MB máximo para Base64
    
    // Mostrar indicador de progreso
    const progressContainer = document.createElement('div');
    progressContainer.innerHTML = `
    <div class="progress mt-2 mb-2">
    <div class="progress-bar progress-bar-striped progress-bar-animated" 
    role="progressbar" style="width: 0%" 
    id="uploadProgressBar">0%</div>
    </div>
    `;
    
    const formContainer = document.querySelector('.form-container');
    if (formContainer) {
    formContainer.insertBefore(progressContainer, formContainer.firstChild);
    }
    
    for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    // Actualizar barra de progreso
    const progress = Math.round(((i + 1) / files.length) * 100);
    const progressBar = document.getElementById('uploadProgressBar');
    if (progressBar) {
    progressBar.style.width = progress + '%';
    progressBar.textContent = progress + '%';
    }
    
    // Verificar tamaño
    if (file.size > MAX_SIZE) {
    largeFiles.push(file.name);
    continue;
    }
    
    try {
    // Convertir a Base64
    const base64Data = await fileToBase64(file);
    
    processedFiles.push({
    name: file.name,
    type: file.type,
    url: base64Data, // Usar el mismo nombre de propiedad para compatibilidad
    data: base64Data,
    uploadedAt: firebase.firestore.Timestamp.now()
    });
    } catch (error) {
    console.error("Error al convertir archivo a Base64:", error);
    showAlert(`Error al procesar el archivo ${file.name}`, "danger");
    }
    }
    
    // Eliminar barra de progreso
    if (progressContainer.parentNode) {
    progressContainer.parentNode.removeChild(progressContainer);
    }
    
    // Mostrar advertencia para archivos grandes
    if (largeFiles.length > 0) {
    showAlert(`Los siguientes archivos son demasiado grandes (>1MB) y no se guardarán: ${largeFiles.join(", ")}. Considere comprimir las imágenes antes de subirlas.`, "warning");
    }
    
    return processedFiles;
}

// Función para mostrar alertas
function showAlert(message, type) {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) {
    console.error("Elemento alertContainer no encontrado");
    return;
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = 'alert';
    alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    alertContainer.appendChild(alert);
    
    // Auto-cerrar alertas después de 5 segundos
    setTimeout(() => {
    if (alert.parentNode) {
    alert.parentNode.removeChild(alert);
    }
    }, 5000);
}
// Función para guardar un nuevo paciente
async function savePatient(e) {
    e.preventDefault();
    console.log("Función savePatient() ejecutada");
    
    try {
        // Obtener valores de PSFS
        const psfs1 = {
            activity: document.getElementById('psfs1Activity').value,
            rating: document.getElementById('psfs1Rating').value
        };
        
        const psfs2 = {
            activity: document.getElementById('psfs2Activity').value,
            rating: document.getElementById('psfs2Rating').value
        };
        
        const psfs3 = {
            activity: document.getElementById('psfs3Activity').value,
            rating: document.getElementById('psfs3Rating').value
        };
        
        // Crear objeto paciente
        const patient = {
            evaluator: document.getElementById('evaluator').value,
            email: document.getElementById('email').value,
            name: document.getElementById('name').value,
            rut: document.getElementById('rut').value,
            contactNumber: document.getElementById('contactNumber').value,
            patientEmail: document.getElementById('patientEmail').value,
            nationality: document.getElementById('nationality').value,
            age: document.getElementById('age').value,
            birthdate: document.getElementById('birthdate').value,
            civilStatus: document.getElementById('civilStatus').value,
            education: document.getElementById('education').value,
            address: document.getElementById('address').value,
            emergencyContact: document.getElementById('emergencyContact').value,
            occupation: document.getElementById('occupation').value,
            laterality: document.getElementById('laterality').value,
            consultReason: document.getElementById('consultReason').value,
            diagnosis: document.getElementById('diagnosis').value,
            expectations: document.getElementById('expectations').value,
            proximateAnamnesis: document.getElementById('proximateAnamnesis').value,
            remoteAnamnesis: document.getElementById('remoteAnamnesis').value,
            habitsHobbies: document.getElementById('habitsHobbies').value,
            homeSupport: document.getElementById('homeSupport').value,
            psfs1: psfs1,
            psfs2: psfs2,
            psfs3: psfs3,
            extraQuestionnaire: document.getElementById('extraQuestionnaire').value,
            vitalSigns: document.getElementById('vitalSigns').value,
            anthropometry: document.getElementById('anthropometry').value,
            physicalExam: document.getElementById('physicalExam').value,
            createdAt: firebase.firestore.Timestamp.now(),
            complementaryExams: [] // Inicializar como array vacío
        };
        
        console.log("Datos del paciente a guardar:", patient);
        
        // Mostrar mensaje de carga
        const saveBtn = document.getElementById('savePatientBtn');
        if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
        }
        
        // Obtener archivos del input
        const fileInput = document.getElementById('medicalExams');
        const hasFiles = fileInput && fileInput.files && fileInput.files.length > 0;
        
        // Procesar archivos si existen
        let processedFiles = [];
        if (hasFiles) {
            try {
                console.log(`Procesando ${fileInput.files.length} archivos...`);
                processedFiles = await processFiles(fileInput.files);
                console.log(`${processedFiles.length} archivos procesados correctamente`);
            } catch (error) {
                console.error("Error al procesar archivos:", error);
                showAlert("Error al procesar archivos: " + error.message, "warning");
            }
        }
        
        // Añadir archivos procesados al objeto paciente
        if (processedFiles.length > 0) {
            patient.complementaryExams = processedFiles;
        }
        
        console.log("Timestamp de creación:", patient.createdAt);
        
        // Guardar en Firestore
        console.log("Intentando guardar en Firestore...");
        db.collection("patients").add(patient)
            .then((docRef) => {
                console.log("Paciente guardado con ID:", docRef.id);
                
                // Restaurar botón
                if (saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = 'Guardar Ficha';
                }
                
                // Mostrar mensaje de éxito
                showAlert("Paciente guardado correctamente", "success");
                
                // Resetear formulario
                document.getElementById('patientForm').reset();
                
                // Actualizar la lista de pacientes si estamos en la pestaña de registros
                loadPatients();
            })
            .catch((error) => {
                console.error("Error al guardar paciente en Firestore:", error);
                
                // Información adicional para depuración
                if (error.code) {
                    console.error("Código de error:", error.code);
                }
                
                // Restaurar botón
                if (saveBtn) {
                    saveBtn.disabled = false;
                    saveBtn.innerHTML = 'Guardar Ficha';
                }
                
                // Mostrar mensaje de error
                showAlert("Error al guardar paciente: " + error.message, "danger");
            });
    } catch (error) {
        console.error("Error en la función savePatient:", error);
        
        // Restaurar botón
        const saveBtn = document.getElementById('savePatientBtn');
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Guardar Ficha';
        }
        
        showAlert("Error al procesar el formulario: " + error.message, "danger");
    }
}

// Función para cargar pacientes en la lista
function loadPatients() {
    console.log("Cargando pacientes...");
    const patientsTableBody = document.getElementById('patientsTableBody');
    if (!patientsTableBody) {
        console.error("No se encontró el elemento patientsTableBody");
        return;
    }
    
    // Limpiar tabla actual
    patientsTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Cargando pacientes...</td></tr>';
    
    // Obtener pacientes de Firestore
    db.collection("patients")
      .get()
      .then((querySnapshot) => {
        // Convertir querySnapshot a array para ordenar
        const patients = [];
        querySnapshot.forEach(doc => {
            const data = doc.data();
            data.id = doc.id;
            patients.push(data);
        });
        
        // Ordenar por fecha de creación (más reciente primero)
        patients.sort((a, b) => {
            const dateA = a.createdAt && a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const dateB = b.createdAt && b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            
            return dateB - dateA;
        });
        
        // Limpiar mensaje de carga
        patientsTableBody.innerHTML = '';
        
        // Si no hay pacientes, mostrar mensaje
        if (patients.length === 0) {
            patientsTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay pacientes registrados</td></tr>';
            return;
        }
        
        // Agregar cada paciente a la tabla
        patients.forEach((patient) => {
            // Formatear fecha y hora de creación
            let createdDate = 'No disponible';
            let createdTime = '';
            if (patient.createdAt && patient.createdAt.toDate) {
                const date = patient.createdAt.toDate();
                createdDate = date.toLocaleDateString();
                createdTime = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            } else if (patient.createdAt) {
                const date = new Date(patient.createdAt);
                createdDate = date.toLocaleDateString();
                createdTime = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${patient.name || 'Sin nombre'}</td>
                <td>${patient.rut || 'No especificado'}</td>
                <td>${patient.age || 'No especificada'}</td>
                <td>${createdDate}<br><small class="text-muted">${createdTime}</small></td>
                <td>
                    <button class="btn btn-primary btn-sm view-details" data-patient-id="${patient.id}">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    <button class="btn btn-danger btn-sm delete-patient" data-patient-id="${patient.id}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            `;
            patientsTableBody.appendChild(row);
        });
        
        // Agregar event listeners a los botones
        document.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', function() {
                const patientId = this.getAttribute('data-patient-id');
                showPatientDetails(patientId);
            });
        });
        
        document.querySelectorAll('.delete-patient').forEach(button => {
            button.addEventListener('click', function() {
                const patientId = this.getAttribute('data-patient-id');
                deletePatient(patientId);
            });
        });
      })
      .catch((error) => {
        console.error("Error al cargar pacientes: ", error);
        patientsTableBody.innerHTML = `<tr><td colspan="5" class="text-center">Error al cargar pacientes: ${error.message}</td></tr>`;
      });
}
// Función para buscar pacientes
function searchPatients() {
    const searchTerm = document.getElementById('searchPatient').value.trim().toLowerCase();
    console.log("Buscando:", searchTerm);
    
    const patientsTableBody = document.getElementById('patientsTableBody');
    if (!patientsTableBody) {
        console.error("No se encontró el elemento patientsTableBody");
        return;
    }
    
    // Si el término de búsqueda está vacío, cargar todos los pacientes
    if (searchTerm === '') {
        loadPatients();
        return;
    }
    
    // Mostrar mensaje de carga
    patientsTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Buscando pacientes...</td></tr>';
    
    // Obtener todos los pacientes y filtrar en el cliente
    db.collection("patients")
      .get()
      .then((querySnapshot) => {
        // Convertir querySnapshot a array para filtrar y ordenar
        const patients = [];
        querySnapshot.forEach(doc => {
            const data = doc.data();
            data.id = doc.id;
            patients.push(data);
        });
        
        // Filtrar pacientes que coincidan con el término de búsqueda
        const filteredPatients = patients.filter(patient => {
            const name = (patient.name || '').toLowerCase();
            const rut = (patient.rut || '').toLowerCase();
            
            return name.includes(searchTerm) || rut.includes(searchTerm);
        });
        
        // Ordenar por fecha de creación (más reciente primero)
        filteredPatients.sort((a, b) => {
            const dateA = a.createdAt && a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const dateB = b.createdAt && b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            
            return dateB - dateA;
        });
        
        // Limpiar tabla
        patientsTableBody.innerHTML = '';
        
        // Si no hay resultados, mostrar mensaje
        if (filteredPatients.length === 0) {
            patientsTableBody.innerHTML = `<tr><td colspan="5" class="text-center">No se encontraron pacientes que coincidan con "${searchTerm}"</td></tr>`;
            return;
        }
        
        // Mostrar pacientes filtrados
        filteredPatients.forEach(patient => {
            // Formatear fecha y hora de creación
            let createdDate = 'No disponible';
            let createdTime = '';
            if (patient.createdAt && patient.createdAt.toDate) {
                const date = patient.createdAt.toDate();
                createdDate = date.toLocaleDateString();
                createdTime = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            } else if (patient.createdAt) {
                const date = new Date(patient.createdAt);
                createdDate = date.toLocaleDateString();
                createdTime = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${patient.name || 'Sin nombre'}</td>
                <td>${patient.rut || 'No especificado'}</td>
                <td>${patient.age || 'No especificada'}</td>
                <td>${createdDate}<br><small class="text-muted">${createdTime}</small></td>
                <td>
                    <button class="btn btn-primary btn-sm view-details" data-patient-id="${patient.id}">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    <button class="btn btn-danger btn-sm delete-patient" data-patient-id="${patient.id}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            `;
            patientsTableBody.appendChild(row);
        });
        
        // Agregar event listeners a los botones
        document.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', function() {
                const patientId = this.getAttribute('data-patient-id');
                showPatientDetails(patientId);
            });
        });
        
        document.querySelectorAll('.delete-patient').forEach(button => {
            button.addEventListener('click', function() {
                const patientId = this.getAttribute('data-patient-id');
                deletePatient(patientId);
            });
        });
      })
      .catch((error) => {
        console.error("Error al buscar pacientes: ", error);
        patientsTableBody.innerHTML = `<tr><td colspan="5" class="text-center">Error al buscar pacientes: ${error.message}</td></tr>`;
      });
}

// Función para mostrar los archivos del paciente
function displayPatientFiles(files) {
    if (!files || files.length === 0) return '<p>No hay archivos adjuntos.</p>';
    
    let filesHTML = `
    <div class="table-responsive">
    <table class="table table-striped">
    <thead>
    <tr>
    <th>Nombre</th>
    <th>Tipo</th>
    <th>Fecha de carga</th>
    <th>Acciones</th>
    </tr>
    </thead>
    <tbody>
    `;
    
    files.forEach(file => {
    // Determinar el tipo de archivo
    let fileType = 'Documento';
    if (file.type && file.type.includes('pdf')) {
    fileType = 'PDF';
    } else if (file.type && file.type.includes('image')) {
    fileType = 'Imagen';
    }
    
    // Formatear la fecha de carga
    let uploadDate = 'Fecha desconocida';
    if (file.uploadedAt && file.uploadedAt.toDate) {
    uploadDate = file.uploadedAt.toDate().toLocaleDateString();
    } else if (file.uploadedAt) {
    uploadDate = new Date(file.uploadedAt).toLocaleDateString();
    }
    
    // Usar url o data (para compatibilidad)
    const fileUrl = file.url || file.data || '';
    
    filesHTML += `
    <tr>
    <td>${file.name || 'Archivo sin nombre'}</td>
    <td>${fileType}</td>
    <td>${uploadDate}</td>
    <td>
    <a href="${fileUrl}" target="_blank" class="btn btn-sm btn-primary me-2">
    <i class="fas fa-eye"></i> Ver
    </a>
    <a href="${fileUrl}" download="${file.name}" class="btn btn-sm btn-secondary">
    <i class="fas fa-download"></i> Descargar
    </a>
    </td>
    </tr>
    `;
    });
    
    filesHTML += `
    </tbody>
    </table>
    </div>
    `;
    
    return filesHTML;
}

// Función para mostrar detalles del paciente
function showPatientDetails(patientId) {
    // Obtener paciente de Firestore
    db.collection("patients").doc(patientId).get()
    .then((doc) => {
    if (doc.exists) {
    const patient = doc.data();
    patient.id = doc.id;
    
    const modal = new bootstrap.Modal(document.getElementById('patientDetailsModal'));
    const modalContent = document.getElementById('patientDetailsContent');
    
    // Formatear fecha de creación
    let createdDate = 'No disponible';
    if (patient.createdAt && patient.createdAt.toDate) {
    createdDate = patient.createdAt.toDate().toLocaleDateString();
    } else if (patient.createdAt) {
    createdDate = new Date(patient.createdAt).toLocaleDateString();
    }
    
    // Construir contenido del modal con todas las secciones
    modalContent.innerHTML = `
    <div class="container-fluid">
    <!-- Información Personal -->
    <div class="row mb-4">
    <div class="col-12">
    <h4 class="text-primary">Información Personal</h4>
    <hr>
    </div>
    <div class="col-md-6">
    <p><strong>Nombre:</strong> ${patient.name || 'No especificado'}</p>
    <p><strong>RUT:</strong> ${patient.rut || 'No especificado'}</p>
    <p><strong>Edad:</strong> ${patient.age || 'No especificada'} años</p>
    <p><strong>Fecha de nacimiento:</strong> ${patient.birthdate || 'No especificada'}</p>
    <p><strong>Teléfono:</strong> ${patient.contactNumber || 'No especificado'}</p>
    <p><strong>Email:</strong> ${patient.patientEmail || 'No especificado'}</p>
    </div>
    <div class="col-md-6">
    <p><strong>Nacionalidad:</strong> ${patient.nationality || 'No especificada'}</p>
    <p><strong>Estado civil:</strong> ${patient.civilStatus || 'No especificado'}</p>
    <p><strong>Nivel educacional:</strong> ${patient.education || 'No especificado'}</p>
    <p><strong>Dirección:</strong> ${patient.address || 'No especificada'}</p>
    <p><strong>Contacto emergencia:</strong> ${patient.emergencyContact || 'No especificado'}</p>
    <p><strong>Lateralidad:</strong> ${patient.laterality || 'No especificada'}</p>
    <p><strong>Ocupación:</strong> ${patient.occupation || 'No especificada'}</p>
    </div>
    </div>
    
    <!-- Información Clínica -->
    <div class="row mb-4">
    <div class="col-12">
    <h4 class="text-primary">Información Clínica</h4>
    <hr>
    </div>
    <div class="col-12">
    <p><strong>Motivo de consulta:</strong> ${patient.consultReason || 'No especificado'}</p>
    <p><strong>Diagnóstico:</strong> ${patient.diagnosis || 'No especificado'}</p>
    <p><strong>Expectativas y metas:</strong> ${patient.expectations || 'No especificadas'}</p>
    </div>
    </div>
    
    <!-- Anamnesis -->
    <div class="row mb-4">
    <div class="col-12">
    <h4 class="text-primary">Anamnesis</h4>
    <hr>
    </div>
    <div class="col-md-6">
    <p><strong>Anamnesis próxima:</strong> ${patient.proximateAnamnesis || 'No especificada'}</p>
    </div>
    <div class="col-md-6">
    <p><strong>Anamnesis remota:</strong> ${patient.remoteAnamnesis || 'No especificada'}</p>
    </div>
    </div>
    
    <!-- Hábitos y Entorno -->
    <div class="row mb-4">
    <div class="col-12">
    <h4 class="text-primary">Hábitos y Entorno</h4>
    <hr>
    </div>
    <div class="col-md-6">
    <p><strong>Hábitos y hobbies:</strong> ${patient.habitsHobbies || 'No especificados'}</p>
    </div>
    <div class="col-md-6">
    <p><strong>Hogar y red de apoyo:</strong> ${patient.homeSupport || 'No especificados'}</p>
    </div>
    </div>
    
    <!-- Cuestionarios PSFS -->
    <div class="row mb-4">
    <div class="col-12">
    <h4 class="text-primary">Cuestionarios PSFS</h4>
    <hr>
    </div>
    <div class="col-12">
    ${patient.psfs1 && patient.psfs1.activity ? 
    `<p><strong>PSFS 1:</strong> ${patient.psfs1.activity} - Puntuación: ${patient.psfs1.rating || 'No especificada'}</p>` : ''}
    ${patient.psfs2 && patient.psfs2.activity ? 
    `<p><strong>PSFS 2:</strong> ${patient.psfs2.activity} - Puntuación: ${patient.psfs2.rating || 'No especificada'}</p>` : ''}
    ${patient.psfs3 && patient.psfs3.activity ? 
    `<p><strong>PSFS 3:</strong> ${patient.psfs3.activity} - Puntuación: ${patient.psfs3.rating || 'No especificada'}</p>` : ''}
    <p><strong>Cuestionario adicional:</strong> ${patient.extraQuestionnaire || 'No especificado'}</p>
    </div>
    </div>
    
    <!-- Evaluación Física -->
    <div class="row mb-4">
    <div class="col-12">
    <h4 class="text-primary">Evaluación Física</h4>
    <hr>
    </div>
    <div class="col-md-4">
    <p><strong>Signos vitales:</strong> ${patient.vitalSigns || 'No especificados'}</p>
    </div>
    <div class="col-md-4">
    <p><strong>Antropometría:</strong> ${patient.anthropometry || 'No especificada'}</p>
    </div>
    <div class="col-md-4">
    <p><strong>Examen físico:</strong> ${patient.physicalExam || 'No especificado'}</p>
    </div>
    </div>
    
    <!-- Información del Evaluador -->
    <div class="row mb-4">
    <div class="col-12">
    <h4 class="text-primary">Información del Evaluador</h4>
    <hr>
    </div>
    <div class="col-md-6">
    <p><strong>Evaluador:</strong> ${patient.evaluator || 'No especificado'}</p>
    </div>
    <div class="col-md-6">
    <p><strong>Email del evaluador:</strong> ${patient.email || 'No especificado'}</p>
    </div>
    </div>
    
    <!-- Fecha de Creación -->
    <div class="row">
    <div class="col-12 text-end">
    <p class="text-muted"><small>Fecha de creación: ${createdDate}</small></p>
    </div>
    </div>
    
    <!-- Archivos / Exámenes Complementarios -->
    <div class="row mb-4">
    <div class="col-12">
    <h4 class="text-primary">Archivos / Exámenes Complementarios</h4>
    <hr>
    </div>
    <div class="col-12">
    ${patient.complementaryExams && patient.complementaryExams.length > 0 ? 
    displayPatientFiles(patient.complementaryExams) : 
    '<p>No hay archivos adjuntos.</p>'}
    </div>
    </div>
    </div>
    `;
    
    // Configurar el botón de exportar PDF
    const exportButton = document.getElementById('exportPatientButton');
    if (exportButton) {
    exportButton.onclick = function() {
    exportPatientToPDF(patient.id);
    };
    }
    
    modal.show();
    } else {
    showAlert('Paciente no encontrado', 'warning');
    }
    })
    .catch((error) => {
    console.error("Error al obtener detalles del paciente: ", error);
    showAlert('Error al obtener detalles del paciente: ' + error.message, 'danger');
    });
}

// Función para eliminar un paciente
function deletePatient(patientId) {
    if (confirm('¿Estás seguro de que deseas eliminar este paciente? Esta acción no se puede deshacer.')) {
    // Eliminar paciente de Firestore
    db.collection("patients").doc(patientId).delete()
    .then(() => {
    console.log("Paciente eliminado correctamente");
    showAlert('Paciente eliminado correctamente', 'success');
    loadPatients();
    })
    .catch((error) => {
    console.error("Error al eliminar paciente: ", error);
    showAlert('Error al eliminar paciente: ' + error.message, 'danger');
    });
    }
}
// Función para buscar pacientes
function searchPatients() {
    const searchTerm = document.getElementById('searchPatient').value.trim().toLowerCase();
    console.log("Buscando:", searchTerm);
    
    const patientsTableBody = document.getElementById('patientsTableBody');
    if (!patientsTableBody) {
        console.error("No se encontró el elemento patientsTableBody");
        return;
    }
    
    // Si el término de búsqueda está vacío, cargar todos los pacientes
    if (searchTerm === '') {
        loadPatients();
        return;
    }
    
    // Mostrar mensaje de carga
    patientsTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Buscando pacientes...</td></tr>';
    
    // Obtener todos los pacientes y filtrar en el cliente
    db.collection("patients")
      .get()
      .then((querySnapshot) => {
        // Convertir querySnapshot a array para filtrar y ordenar
        const patients = [];
        querySnapshot.forEach(doc => {
            const data = doc.data();
            data.id = doc.id;
            patients.push(data);
        });
        
        // Filtrar pacientes que coincidan con el término de búsqueda
        const filteredPatients = patients.filter(patient => {
            const name = (patient.name || '').toLowerCase();
            const rut = (patient.rut || '').toLowerCase();
            
            return name.includes(searchTerm) || rut.includes(searchTerm);
        });
        
        // Ordenar por fecha de creación (más reciente primero)
        filteredPatients.sort((a, b) => {
            const dateA = a.createdAt && a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const dateB = b.createdAt && b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            
            return dateB - dateA;
        });
        
        // Limpiar tabla
        patientsTableBody.innerHTML = '';
        
        // Si no hay resultados, mostrar mensaje
        if (filteredPatients.length === 0) {
            patientsTableBody.innerHTML = `<tr><td colspan="5" class="text-center">No se encontraron pacientes que coincidan con "${searchTerm}"</td></tr>`;
            return;
        }
        
        // Mostrar pacientes filtrados
        filteredPatients.forEach(patient => {
            // Formatear fecha y hora de creación
            let createdDate = 'No disponible';
            let createdTime = '';
            if (patient.createdAt && patient.createdAt.toDate) {
                const date = patient.createdAt.toDate();
                createdDate = date.toLocaleDateString();
                createdTime = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            } else if (patient.createdAt) {
                const date = new Date(patient.createdAt);
                createdDate = date.toLocaleDateString();
                createdTime = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${patient.name || 'Sin nombre'}</td>
                <td>${patient.rut || 'No especificado'}</td>
                <td>${patient.age || 'No especificada'}</td>
                <td>${createdDate}<br><small class="text-muted">${createdTime}</small></td>
                <td>
                    <button class="btn btn-primary btn-sm view-details" data-patient-id="${patient.id}">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    <button class="btn btn-danger btn-sm delete-patient" data-patient-id="${patient.id}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </td>
            `;
            patientsTableBody.appendChild(row);
        });
        
        // Agregar event listeners a los botones
        document.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', function() {
                const patientId = this.getAttribute('data-patient-id');
                showPatientDetails(patientId);
            });
        });
        
        document.querySelectorAll('.delete-patient').forEach(button => {
            button.addEventListener('click', function() {
                const patientId = this.getAttribute('data-patient-id');
                deletePatient(patientId);
            });
        });
      })
      .catch((error) => {
        console.error("Error al buscar pacientes: ", error);
        patientsTableBody.innerHTML = `<tr><td colspan="5" class="text-center">Error al buscar pacientes: ${error.message}</td></tr>`;
      });
}

// Inicializar los controles deslizantes y eventos cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM completamente cargado");
    
    // Inicializar los valores de los deslizadores
    updateRatingValue('psfs1Rating', 'psfs1Value');
    updateRatingValue('psfs2Rating', 'psfs2Value');
    updateRatingValue('psfs3Rating', 'psfs3Value');
    
    // Configurar el evento de envío del formulario
    const patientForm = document.getElementById('patientForm');
    console.log("Formulario encontrado:", patientForm);
    
    if (patientForm) {
        patientForm.addEventListener('submit', function(e) {
            console.log("Formulario enviado - Evento submit activado");
            e.preventDefault(); // Evitar que el formulario se envíe de forma tradicional
            savePatient(e);
        });
        console.log("Event listener para el formulario configurado");
    } else {
        console.error("No se encontró el formulario con ID 'patientForm'");
    }
    
    // Cargar la lista de pacientes
    loadPatients();
    
    // Configurar el botón de búsqueda
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        searchButton.addEventListener('click', searchPatients);
    }

    // Agregar event listener para búsqueda en tiempo real
    const searchInput = document.getElementById('searchPatient');
    if (searchInput) {
        // Usar el evento 'input' para detectar cambios en tiempo real
        searchInput.addEventListener('input', function() {
            // Esperar un poco antes de buscar para evitar muchas búsquedas mientras se escribe
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                searchPatients();
            }, 300); // 300ms de retraso
        });
        
        // También buscar al presionar Enter
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchPatients();
            }
        });
    }
    
    // Cargar pacientes en el selector
    loadPatientsIntoSelect();
    
    // Cargar evoluciones
    loadEvolutions();
    
    // Event listener para el selector de pacientes
    const patientSelect = document.getElementById('patientSelect');
    if (patientSelect) {
        patientSelect.addEventListener('change', loadPatientPSFS);
    }
    
    // Event listener para el formulario de evolución
    const evolutionForm = document.getElementById('evolutionForm');
    if (evolutionForm) {
        evolutionForm.addEventListener('submit', saveEvolution);
    }
});
