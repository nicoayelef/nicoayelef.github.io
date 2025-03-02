// Configuración de Firebase
const firebaseConfig = {
   apiKey: "AIzaSyBYaNbZWHUS-Pvm49kmMtHw9LqqxUDySYA",
    authDomain: "base-de-datos-poli.firebaseapp.com",
    projectId: "base-de-datos-poli",
    storageBucket: "base-de-datos-poli.appspot.com",
    messagingSenderId: "954754202697",
    appId: "1:954754202697:web:e06171f6b0ade314259398"
};

// Variable global para rastrear el estado de inicialización de Firebase
let firebaseInitialized = false;

// Inicializar Firebase (con verificación mejorada)
function initializeFirebase() {
    return new Promise((resolve, reject) => {
        if (firebaseInitialized) {
            console.log("Firebase ya estaba inicializado.");
            resolve();
            return;
        }

        if (typeof firebase !== 'undefined') {
            try {
                if (!firebase.apps.length) {
                    firebase.initializeApp(firebaseConfig);
                }
                
                const db = firebase.firestore();
                
                // Verificar conexión con un timeout
                const connectionTimeout = setTimeout(() => {
                    reject(new Error("Tiempo de espera de conexión agotado"));
                }, 10000);
                
                db.collection("patients").limit(1).get()
                    .then(snapshot => {
                        clearTimeout(connectionTimeout);
                        firebaseInitialized = true;
                        console.log("Conexión a Firestore exitosa.");
                        showAlert("Conexión a la base de datos establecida", "success");
                        resolve(db);
                    })
                    .catch(error => {
                        clearTimeout(connectionTimeout);
                        console.error("Error al conectar con Firestore:", error);
                        showAlert("Error de conexión a la base de datos: " + error.message, "danger");
                        reject(error);
                    });
            } catch (error) {
                console.error("Error al inicializar Firebase:", error);
                showAlert("Error al inicializar Firebase: " + error.message, "danger");
                reject(error);
            }
        } else {
            console.error("Firebase no está definido. Asegúrate de incluir las bibliotecas de Firebase antes de tu script.");
            showAlert("Error: Firebase no está disponible. Por favor, verifica la consola para más detalles.", "danger");
            reject(new Error("Firebase no definido"));
        }
    });
}

// Variables globales
let currentPatientId = null; // ID del paciente seleccionado (para evoluciones)
let currentEvolutionId = null; //ID de la evolución (para editar, que aun no esta implementado)
let db = null; // Se inicializará después de la conexión
let darkMode = localStorage.getItem('darkMode') === 'true' || false; // Para el modo oscuro

// --- Funciones de utilidad ---

// Función para mostrar alertas con mejor manejo
function showAlert(message, type) {
    console.log(`Mostrando alerta: ${message} (${type})`);
    
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
    
    // Limpiar alertas previas
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);

    // Auto-cerrar alertas después de 5 segundos
    setTimeout(() => {
        if(alert.parentNode) {
            alert.remove();
        }
    }, 5000);
}

// ... [resto de las funciones del archivo original permanecen igual]

// Modificación en el event listener DOMContentLoaded
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Inicializar Firebase primero
        db = await initializeFirebase();
        
        // Resto de las inicializaciones
        loadPatients();
        loadPatientsIntoSelect();
        loadEvolutions();
        
        // Event listeners
        document.getElementById('patientForm')?.addEventListener('submit', savePatient);
        document.getElementById('evolutionForm')?.addEventListener('submit', saveEvolution);
        document.getElementById('patientSelect')?.addEventListener('change', loadPatientPSFS);
        
        // Configurar tabs
        document.querySelector('button[data-bs-target="#records-tab-pane"]')?.addEventListener('click', loadPatients);
        document.querySelector('button[data-bs-target="#evolutions-tab-pane"]')?.addEventListener('click', function() {
            loadPatientsIntoSelect();
            loadEvolutions();
        });
        
        // Inicializar búsquedas
        setupPatientSearch();
        setupEvolutionSearch();
        
        // Inicializar sliders PSFS
        updateRatingValue('psfs1Rating', 'psfs1Value');
        updateRatingValue('psfs2Rating', 'psfs2Value');
        updateRatingValue('psfs3Rating', 'psfs3Value');
        
        // Mensaje de conexión exitosa
        setTimeout(() => {
            showAlert("Conexión establecida con el servidor", "success");
        }, 1000);
    } catch (error) {
        console.error("Error durante la inicialización:", error);
        showAlert("Error al inicializar la aplicación", "danger");
    }
});

// Mejora en la función fileToBase64 para manejar errores
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            reject(new Error("No se proporcionó ningún archivo"));
            return;
        }
        
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Funciones adicionales para manejar errores
window.onerror = function(message, source, lineno, colno, error) {
    console.error("Error global:", { message, source, lineno, colno, error });
    showAlert(`Error inesperado: ${message}`, "danger");
};

// Función para cargar y mostrar la lista de pacientes
function loadPatients() {
    console.log("Cargando pacientes...");
    const patientsTableBody = document.getElementById('patientsTableBody');
    if (!patientsTableBody) {
        console.error("patientsTableBody no encontrado!");
        return;
    }
    patientsTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Cargando...</td></tr>'; // Mensaje de carga

    db.collection("patients")
        .orderBy("createdAt", "desc") // Ordenar por fecha de creación (descendente)
        .get()
        .then((querySnapshot) => {
            patientsTableBody.innerHTML = ""; // Limpiar la tabla

            if (querySnapshot.empty) {
                patientsTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay pacientes registrados.</td></tr>';
                return;
            }

            querySnapshot.forEach((doc) => {
                const patient = doc.data();
                patient.id = doc.id; // MUY IMPORTANTE: Asignar el ID del documento

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${patient.name || 'Sin nombre'}</td>
                    <td>${patient.rut || 'N/A'}</td>
                    <td>${patient.age || 'N/A'}</td>
                    <td>${formatDate(patient.createdAt)} ${formatTime(patient.createdAt)}</td>
                    <td>
                        <button class="btn btn-primary btn-sm view-details" data-patient-id="${patient.id}">Ver</button>
                        <button class="btn btn-danger btn-sm delete-patient" data-patient-id="${patient.id}">Eliminar</button>
                    </td>
                `;
                patientsTableBody.appendChild(row);
            });
            
            // Eliminar event listeners anteriores (para evitar duplicados)
            const oldPatientsTableBody = patientsTableBody;
            const newPatientsTableBody = oldPatientsTableBody.cloneNode(true);
            oldPatientsTableBody.parentNode.replaceChild(newPatientsTableBody, oldPatientsTableBody);
            
            // Delegación de eventos para los botones "Ver" y "Eliminar"
            newPatientsTableBody.addEventListener('click', (event) => {
                const target = event.target;
                if (target.classList.contains('view-details') || target.closest('.view-details')) {
                    const patientId = (target.dataset.patientId || target.closest('.view-details').dataset.patientId);
                    showPatientDetails(patientId);
                } else if (target.classList.contains('delete-patient') || target.closest('.delete-patient')) {
                    const patientId = (target.dataset.patientId || target.closest('.delete-patient').dataset.patientId);
                    deletePatient(patientId);
                }
            });
        })
        .catch((error) => {
            console.error("Error al cargar pacientes:", error);
            patientsTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error al cargar los pacientes: ${error.message}</td></tr>`;
            showAlert("Error al cargar la lista de pacientes", "danger");
        });
}

// Función para mostrar los detalles de un paciente en un modal
function showPatientDetails(patientId) {
    console.log("Mostrando detalles del paciente:", patientId);

    // Mostrar modal de carga
    window.showLoadingModal();

    db.collection("patients").doc(patientId).get()
        .then((doc) => {
            if (!doc.exists) {
                console.log("Paciente no encontrado:", patientId);
                showAlert("Paciente no encontrado", "warning");
                window.hideLoadingModal();
                return;
            }

            const patient = doc.data();
            patient.id = doc.id; // Asignar el ID del documento
            console.log("Datos del paciente recuperados:", patient);

            // --- Rellenar el modal de detalles ---
            const modalBody = document.getElementById('patientDetailsContent');
            if (!modalBody) {
                console.error("Elemento patientDetailsContent no encontrado.");
                window.hideLoadingModal();
                return;
            }

            // Formatear fecha de nacimiento
            let birthdateFormatted = 'No disponible';
            if(patient.birthdate){
                birthdateFormatted = new Date(patient.birthdate).toLocaleDateString();
            }

            // Formatear fecha de creacion.
            let createdDate = formatDate(patient.createdAt);
            let createdTime = formatTime(patient.createdAt);

            // Construir el contenido del modal (mucho más organizado y legible)
            modalBody.innerHTML = `
            <p><strong>Nombre:</strong> ${patient.name || 'Sin nombre'}</p>
            <p><strong>RUT:</strong> ${patient.rut || 'No especificado'}</p>
            <p><strong>Edad:</strong> ${patient.age || 'No especificada'}</p>
            <p><strong>Fecha de Nacimiento:</strong> ${birthdateFormatted}</p>
            <p><strong>Email Evaluador:</strong> ${patient.email || 'No especificado'}</p>
            <p><strong>Teléfono:</strong> ${patient.contactNumber || 'No especificado'}</p>
            <p><strong>Email Paciente:</strong> ${patient.patientEmail || 'No especificado'}</p>
            <p><strong>Nacionalidad:</strong> ${patient.nationality || 'No especificada'}</p>
            <p><strong>Estado Civil:</strong> ${patient.civilStatus || 'No especificado'}</p>
            <p><strong>Educación:</strong> ${patient.education || 'No especificada'}</p>
            <p><strong>Dirección:</strong> ${patient.address || 'No especificada'}</p>
            <p><strong>Contacto Emergencia:</strong> ${patient.emergencyContact || 'No especificado'}</p>
            <p><strong>Ocupación:</strong> ${patient.occupation || 'No especificado'}</p>
            <p><strong>Lateralidad:</strong> ${patient.laterality || 'No especificada'}</p>
            <p><strong>Motivo Consulta:</strong> ${patient.consultReason || 'No especificado'}</p>
            <p><strong>Diagnóstico:</strong> ${patient.diagnosis || 'No especificado'}</p>
            <p><strong>Expectativas:</strong> ${patient.expectations || 'No especificado'}</p>
            <p><strong>Anamnesis Próxima:</strong> ${patient.proximateAnamnesis || 'No especificado'}</p>
            <p><strong>Anamnesis Remota:</strong> ${patient.remoteAnamnesis || 'No especificado'}</p>
            <p><strong>Habitos/Hobbies:</strong> ${patient.habitsHobbies || 'No especificado'}</p>
            <p><strong>Hogar y red de apoyo:</strong> ${patient.homeSupport || 'No especificado'}</p>
            <p><strong>Cuestionario extra:</strong> ${patient.extraQuestionnaire || 'No especificado'}</p>
            <p><strong>Signos vitales:</strong> ${patient.vitalSigns || 'No especificado'}</p>
            <p><strong>Antropometria:</strong> ${patient.anthropometry || 'No especificado'}</p>
            <p><strong>Examen físico:</strong> ${patient.physicalExam || 'No especificado'}</p>
            <p><strong>Fecha Creación:</strong> ${createdDate} ${createdTime}</p>

            <hr>
            <h5>PSFS (Patient-Specific Functional Scale)</h5>
            <p><strong>Actividad 1:</strong> ${patient.psfs1?.activity || 'No especificada'} - <strong>Valoración:</strong> ${patient.psfs1?.rating || 'N/A'}</p>
            <p><strong>Actividad 2:</strong> ${patient.psfs2?.activity || 'No especificada'} - <strong>Valoración:</strong> ${patient.psfs2?.rating || 'N/A'}</p>
            <p><strong>Actividad 3:</strong> ${patient.psfs3?.activity || 'No especificada'} - <strong>Valoración:</strong> ${patient.psfs3?.rating || 'N/A'}</p>
            `;

            // Mostrar exámenes complementarios (si existen)
            if (patient.complementaryExams && patient.complementaryExams.length > 0) {
                const examsContainer = document.createElement('div');
                examsContainer.innerHTML = '<h5>Exámenes Complementarios</h5>';

                const examsList = document.createElement('ul');
                examsList.className = 'list-group'; //Clase de Bootstrap

                patient.complementaryExams.forEach(exam => {
                    const listItem = document.createElement('li');
                    listItem.className = 'list-group-item'; //Clase de Bootstrap
                    //Verifica que tipo de archivo es
                    if (exam.type.startsWith('image/')) {
                        listItem.innerHTML = `<a href="${exam.url}" target="_blank"><img src="${exam.url}" alt="${exam.name}" style="max-width: 100%; height: auto;"></a>`;
                    } else {
                        //Para archivos que no son imagenes, por ejemplo, PDFs
                        listItem.innerHTML = `<a href="${exam.url}" target="_blank">${exam.name}</a>`;
                    }
                    examsList.appendChild(listItem);
                });
                examsContainer.appendChild(examsList);
                modalBody.appendChild(examsContainer);
            } else {
                modalBody.innerHTML += `<p><strong>Exámenes Complementarios:</strong> No hay exámenes adjuntos.</p>`;
            }

            // --- Mostrar el modal de detalles ---
            const detailsModal = new bootstrap.Modal(document.getElementById('patientDetailsModal'));
            detailsModal.show();
            
            // Ocultar el modal de carga
            window.hideLoadingModal();
            
            // Asegurarnos que el botón de cerrar funcione correctamente
            document.querySelector('#patientDetailsModal .btn-close').addEventListener('click', function() {
                detailsModal.hide();
            });
            
            document.querySelector('#patientDetailsModal .btn-secondary').addEventListener('click', function() {
                detailsModal.hide();
            });
        })
        .catch((error) => {
            console.error("Error al obtener detalles del paciente:", error);
            showAlert("Error al cargar los detalles del paciente: " + error.message, "danger");
            window.hideLoadingModal(); // Asegurarse de ocultar el modal en caso de error
        });
}

// Función para eliminar un paciente
function deletePatient(patientId) {
    console.log("Eliminando paciente:", patientId);

    // Mostrar confirmación
    if (!confirm("¿Estás seguro de que quieres eliminar este paciente?\n\n¡Esta acción es irreversible!")) {
        return; // Salir si el usuario cancela
    }

    // Mostrar modal de carga
    window.showLoadingModal();

    db.collection("patients").doc(patientId).delete()
        .then(() => {
            console.log("Paciente eliminado exitosamente.");
            showAlert("Paciente eliminado exitosamente", "success");
            loadPatients(); // Recargar la lista de pacientes
        })
        .catch((error) => {
            console.error("Error al eliminar paciente:", error);
            showAlert("Error al eliminar el paciente: " + error.message, "danger");
        })
        .finally(() => {
            window.hideLoadingModal(); // Ocultar modal *siempre*
        });
}

// --- Funciones para la pestaña "Evoluciones" ---

// Cargar Pacientes en el Selector (para Evoluciones)
function loadPatientsIntoSelect() {
    const patientSelect = document.getElementById('patientSelect');
    if (!patientSelect) {
      console.error('patientSelect no encontrado.');
      return;
    }
    patientSelect.innerHTML = '<option value="">Seleccione un paciente</option>';

    db.collection("patients").orderBy("name", "asc").get() // Ordenar por nombre
        .then((querySnapshot) => {
            querySnapshot.forEach(doc => {
                const patient = doc.data();
                patient.id = doc.id;
                const option = document.createElement('option');
                option.value = patient.id;
                option.textContent = `${patient.name || 'Sin nombre'} (${patient.rut || 'N/A'})`;
                patientSelect.appendChild(option);
            });

        })
        .catch(error => {
            console.error("Error al cargar pacientes en el selector:", error);
            showAlert("Error al cargar pacientes: " + error.message, "danger");
        });
}

// Cargar los datos PSFS del paciente seleccionado para la evolución
function loadPatientPSFS() {
    const patientId = document.getElementById('patientSelect').value;
    if (!patientId) {
        //No mostrar alerta, porque primero se debe seleccionar un paciente.
        return;
    }

    // Mostrar modal de carga
    window.showLoadingModal();

    db.collection("patients").doc(patientId).get()
        .then(doc => {
            if (doc.exists) {
                const patient = doc.data();
                currentPatientId = patientId;  // Establecer el paciente actual

                const psfsContainer = document.getElementById('psfsUpdateContainer');
                if (!psfsContainer) {
                    console.error('psfsUpdateContainer no encontrado.');
                    window.hideLoadingModal();
                    return;
                }
                
                let psfsHTML = '';

                if (patient.psfs1 && patient.psfs1.activity) {
                    psfsHTML += `
                    <div class="mb-3">
                        <label class="form-label fw-bold">${patient.psfs1.activity}</label>
                        <input type="range" class="form-range" min="0" max="10" step="1" id="evolutionPsfs1Rating" value="${patient.psfs1.rating || 0}">
                        <div class="d-flex justify-content-between">
                            <span>0</span>
                            <span id="evolutionPsfs1Value">${patient.psfs1.rating || 0}</span>
                            <span>10</span>
                        </div>
                        <input type="hidden" id="evolutionPsfs1Activity" value="${patient.psfs1.activity}">
                    </div>`;
                }

                if (patient.psfs2 && patient.psfs2.activity) {
                    psfsHTML += `
                    <div class="mb-3">
                        <label class="form-label fw-bold">${patient.psfs2.activity}</label>
                        <input type="range" class="form-range" min="0" max="10" step="1" id="evolutionPsfs2Rating" value="${patient.psfs2.rating || 0}">
                         <div class="d-flex justify-content-between">
                            <span>0</span>
                            <span id="evolutionPsfs2Value">${patient.psfs2.rating || 0}</span>
                            <span>10</span>
                        </div>
                        <input type="hidden" id="evolutionPsfs2Activity" value="${patient.psfs2.activity}">
                    </div>`;
                }

                if (patient.psfs3 && patient.psfs3.activity) {
                    psfsHTML += `
                    <div class="mb-3">
                        <label class="form-label fw-bold">${patient.psfs3.activity}</label>
                        <input type="range" class="form-range" min="0" max="10" step="1" id="evolutionPsfs3Rating" value="${patient.psfs3.rating || 0}">
                         <div class="d-flex justify-content-between">
                            <span>0</span>
                            <span id="evolutionPsfs3Value">${patient.psfs3.rating || 0}</span>
                            <span>10</span>
                        </div>
                        <input type="hidden" id="evolutionPsfs3Activity" value="${patient.psfs3.activity}">
                    </div>`;
                }

                if (psfsHTML === '') {
                    psfsHTML = '<p>Este paciente no tiene actividades PSFS registradas.</p>';
                }

                psfsContainer.innerHTML = psfsHTML;

                // Inicializar sliders PSFS
                if (patient.psfs1 && patient.psfs1.activity) {
                    updateRatingValue('evolutionPsfs1Rating', 'evolutionPsfs1Value');
                }
                if (patient.psfs2 && patient.psfs2.activity) {
                    updateRatingValue('evolutionPsfs2Rating', 'evolutionPsfs2Value');
                }
                if (patient.psfs3 && patient.psfs3.activity) {
                    updateRatingValue('evolutionPsfs3Rating', 'evolutionPsfs3Value');
                }

                window.hideLoadingModal();
            } else {
                showAlert("Paciente no encontrado", "warning");
                window.hideLoadingModal();
            }
        })
        .catch(error => {
            console.error("Error al cargar datos PSFS:", error);
            showAlert("Error al cargar datos PSFS: " + error.message, "danger");
            window.hideLoadingModal();
        });
}

// Función para guardar la evolución de un paciente
function saveEvolution(event) {
    event.preventDefault();

    if (!currentPatientId) {
        showAlert("Selecciona un paciente primero", "warning");
        return;
    }
    const saveBtn = document.getElementById('saveEvolutionBtn');

    //Deshabilito el botón mientras se guarda.
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
    }

    // Obtener los nombres de las actividades de los campos ocultos
    const psfs1Activity = document.getElementById('evolutionPsfs1Activity')?.value;
    const psfs2Activity = document.getElementById('evolutionPsfs2Activity')?.value;
    const psfs3Activity = document.getElementById('evolutionPsfs3Activity')?.value;

    // Recopilar datos del formulario de evolución
    const evolutionData = {
        patientId: currentPatientId,
        date: document.getElementById('evolutionDate').value,
        subjective: document.getElementById('evolutionProgress').value,
        objective: document.getElementById('evolutionTreatment').value,
        assessment: document.getElementById('evolutionPlan').value,
        evaluator: document.getElementById('evolutionEvaluator').value,
        psfsValues: {
            psfs1: {
                activity: psfs1Activity,
                rating: document.getElementById('evolutionPsfs1Rating')?.value
            },
            psfs2: {
                activity: psfs2Activity,
                rating: document.getElementById('evolutionPsfs2Rating')?.value
            },
            psfs3: {
                activity: psfs3Activity,
                rating: document.getElementById('evolutionPsfs3Rating')?.value
            }
        },
        createdAt: firebase.firestore.Timestamp.now()
    };
    
    //Validaciones
    if (!evolutionData.date) {
        showAlert("Ingresa una fecha para la evolución", "warning");
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Guardar Evolución';
        }
        return;
    }

    // Guardar en Firestore
    db.collection("evolutions").add(evolutionData)
        .then((docRef) => {
            console.log("Evolución guardada con ID:", docRef.id);
            showAlert("Evolución guardada exitosamente", "success");
            document.getElementById('evolutionForm').reset();
            
            // Limpiar el contenedor PSFS
            document.getElementById('psfsUpdateContainer').innerHTML = '';
            
            // Actualizar la lista de evoluciones
            loadEvolutions();
        })
        .catch((error) => {
            console.error("Error al guardar la evolución:", error);
            showAlert("Error al guardar la evolución: " + error.message, "danger");
        })
        .finally(() => {
            // Restaurar botón
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.innerHTML = 'Guardar Evolución';
            }
        });
}

// Cargar Evoluciones (todas, inicialmente)
function loadEvolutions() {
    const evolutionsTableBody = document.getElementById('evolutionsTableBody');
    if (!evolutionsTableBody) {
        console.error("evolutionsTableBody no encontrado");
        return;
    }
    evolutionsTableBody.innerHTML = '<tr><td colspan="4">Cargando...</td></tr>';

    db.collection("evolutions").orderBy("createdAt", "desc").get()
    .then((querySnapshot) => {
        evolutionsTableBody.innerHTML = '';

        if (querySnapshot.empty) {
            evolutionsTableBody.innerHTML = '<tr><td colspan="4">No hay evoluciones registradas.</td></tr>';
            return;
        }
        
        //Crear un mapa para los nombres de los pacientes.
        const patientIds = new Set(); //Evita duplicados.
        const patientNames = {};

        querySnapshot.forEach((doc) => {
            const evolution = doc.data();
            patientIds.add(evolution.patientId); //Agrego el ID al Set.
        });

        //Obtener los nombres de los pacientes, una sola vez por paciente.
        const getPatientNames = async () => {
            for (const patientId of patientIds) {
                try {
                    const patientDoc = await db.collection("patients").doc(patientId).get();
                    if (patientDoc.exists) {
                        patientNames[patientId] = patientDoc.data().name || 'Paciente sin nombre';
                    } else {
                        patientNames[patientId] = 'Paciente no encontrado';
                    }
                } catch (error) {
                    console.error(`Error al obtener paciente ${patientId}:`, error);
                    patientNames[patientId] = 'Error al cargar nombre';
                }
            }

            // Una vez que tenemos todos los nombres, mostrar las evoluciones
            querySnapshot.forEach((doc) => {
                const evolution = doc.data();
                evolution.id = doc.id;

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${patientNames[evolution.patientId] || 'Paciente Desconocido'}</td>
                    <td>${evolution.date || 'No especificada'}</td>
                    <td>${evolution.subjective ? (evolution.subjective.length > 50 ? evolution.subjective.substring(0, 50) + '...' : evolution.subjective) : 'No especificado'}</td>
                    <td>
                        <button class="btn btn-primary btn-sm view-evolution" data-evolution-id="${evolution.id}">Ver</button>
                        <button class="btn btn-danger btn-sm delete-evolution" data-evolution-id="${evolution.id}">Eliminar</button>
                    </td>
                `;
                evolutionsTableBody.appendChild(row);
            });
            
            //Eliminar event listeners anteriores para evitar duplicados
            const oldEvolutionsTableBody = evolutionsTableBody;
            const newEvolutionsTableBody = oldEvolutionsTableBody.cloneNode(true);
            oldEvolutionsTableBody.parentNode.replaceChild(newEvolutionsTableBody, oldEvolutionsTableBody);
            
            //Delegación de eventos para botones.
            newEvolutionsTableBody.addEventListener('click', (event) => {
                const target = event.target;

                if (target.classList.contains('view-evolution') || target.closest('.view-evolution')) {
                    const evolutionId = (target.dataset.evolutionId || target.closest('.view-evolution').dataset.evolutionId);
                    showEvolutionDetails(evolutionId);
                } else if (target.classList.contains('delete-evolution') || target.closest('.delete-evolution')) {
                    const evolutionId = (target.dataset.evolutionId || target.closest('.delete-evolution').dataset.evolutionId);
                    deleteEvolution(evolutionId);
                }
            });
        };
        
        //Inicia el proceso de obtener los nombres
        getPatientNames();
    })
    .catch((error) => {
        console.error("Error al cargar evoluciones:", error);
        evolutionsTableBody.innerHTML = '<tr><td colspan="4">Error al cargar evoluciones.</td></tr>';
    });
}

// --- Funciones para ver y eliminar evoluciones ---

function showEvolutionDetails(evolutionId) {
    console.log("Mostrando detalles de evolución:", evolutionId);

    // Mostrar modal de carga
    window.showLoadingModal();

    db.collection("evolutions").doc(evolutionId).get()
        .then(async (doc) => {
            if (!doc.exists) {
                window.hideLoadingModal();
                showAlert("Evolución no encontrada", "warning");
                return;
            }

            const evolution = doc.data();
            evolution.id = doc.id;  // Asignar ID

            // --- Obtener el nombre del paciente (usando await) ---
            let patientName = 'Paciente Desconocido';
            try {
                const patientDoc = await db.collection("patients").doc(evolution.patientId).get();
                if (patientDoc.exists) {
                    patientName = patientDoc.data().name || 'Paciente sin nombre';
                }
            } catch (error) {
                console.error("Error al obtener el nombre del paciente:", error);
                // No detenemos la ejecución, simplemente usamos el nombre por defecto
            }

            // --- Rellenar el modal de detalles de evolución ---
            const modalBody = document.getElementById('evolutionDetailsContent');
            if (!modalBody) {
                console.error("Elemento evolutionDetailsContent no encontrado.");
                window.hideLoadingModal();
                return;
            }

            //Formatear Fecha
            let evolutionDate = 'No disponible';
            if(evolution.date){
                evolutionDate = new Date(evolution.date).toLocaleDateString();
            }

            modalBody.innerHTML = `
                <h5>Evolución - ${patientName}</h5>
                <p><strong>Fecha:</strong> ${evolutionDate}</p>
                <p><strong>Evaluador:</strong> ${evolution.evaluator || 'No especificado'}</p>
                <p><strong>Subjetivo:</strong> ${evolution.subjective || 'No especificado'}</p>
                <p><strong>Objetivo:</strong> ${evolution.objective || 'No especificado'}</p>
                <p><strong>Evaluación:</strong> ${evolution.assessment || 'No especificado'}</p>
                <p><strong>Plan:</strong> ${evolution.plan || 'No especificado'}</p>
                <hr>
                <h5>Valores PSFS</h5>
            `;

            // Mostrar valores PSFS de forma mejorada
            if (evolution.psfsValues) {
                if (evolution.psfsValues.psfs1 && evolution.psfsValues.psfs1.activity) {
                    modalBody.innerHTML += `
                    <p><strong>${evolution.psfsValues.psfs1.activity}:</strong> ${evolution.psfsValues.psfs1.rating || 'N/A'}</p>
                    `;
                }
                
                if (evolution.psfsValues.psfs2 && evolution.psfsValues.psfs2.activity) {
                    modalBody.innerHTML += `
                    <p><strong>${evolution.psfsValues.psfs2.activity}:</strong> ${evolution.psfsValues.psfs2.rating || 'N/A'}</p>
                    `;
                }
                
                if (evolution.psfsValues.psfs3 && evolution.psfsValues.psfs3.activity) {
                    modalBody.innerHTML += `
                    <p><strong>${evolution.psfsValues.psfs3.activity}:</strong> ${evolution.psfsValues.psfs3.rating || 'N/A'}</p>
                    `;
                }
                
                if (!evolution.psfsValues.psfs1?.activity && !evolution.psfsValues.psfs2?.activity && !evolution.psfsValues.psfs3?.activity) {
                    modalBody.innerHTML += '<p>No hay valores PSFS registrados para esta evolución.</p>';
                }
            } else {
                modalBody.innerHTML += '<p>No hay valores PSFS registrados para esta evolución.</p>';
            }

            // --- Mostrar el modal de detalles ---
            const detailsModal = new bootstrap.Modal(document.getElementById('evolutionDetailsModal'));
            detailsModal.show();
            
            // Ocultar el modal de carga
            window.hideLoadingModal();
            
            // Asegurarnos que el botón de cerrar funcione correctamente
            document.querySelector('#evolutionDetailsModal .btn-close').addEventListener('click', function() {
                detailsModal.hide();
            });
            
            document.querySelector('#evolutionDetailsModal .btn-secondary').addEventListener('click', function() {
                detailsModal.hide();
            });
        })
        .catch((error) => {
            console.error("Error al obtener detalles de la evolución:", error);
            showAlert("Error al cargar los detalles de la evolución", "danger");
            window.hideLoadingModal(); // Ocultar modal *siempre*
        });
}

function deleteEvolution(evolutionId) {
    console.log("Eliminando evolución:", evolutionId);

    // Confirmación
    if (!confirm("¿Estás seguro de que quieres eliminar esta evolución?\n\n¡Esta acción es irreversible!")) {
        return;
    }
    
    // Mostrar modal de carga
    window.showLoadingModal();

    db.collection("evolutions").doc(evolutionId).delete()
        .then(() => {
            console.log("Evolución eliminada exitosamente.");
            showAlert("Evolución eliminada exitosamente", "success");
            loadEvolutions(); // Recargar lista
        })
        .catch((error) => {
            console.error("Error al eliminar evolución:", error);
            showAlert("Error al eliminar la evolución: " + error.message, "danger");
        }).finally(() => {
            window.hideLoadingModal();
        });
}

// Función para procesar archivos
async function processFiles(files) {
    console.log("Procesando archivos:", files);
    const processedFiles = [];
    const storage = firebase.storage();
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        try {
            console.log(`Procesando archivo ${i+1}/${files.length}: ${file.name}`);
            
            // Verificar tamaño del archivo (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error(`El archivo ${file.name} excede el tamaño máximo de 5MB`);
            }
            
            // Crear una referencia única para el archivo
            const storageRef = storage.ref(`medical_exams/${Date.now()}_${file.name}`);
            
            // Subir el archivo
            const snapshot = await storageRef.put(file);
            console.log(`Archivo ${file.name} subido correctamente`);
            
            // Obtener la URL de descarga
            const url = await snapshot.ref.getDownloadURL();
            console.log(`URL obtenida para ${file.name}: ${url}`);
            
            processedFiles.push({
                name: file.name,
                type: file.type,
                url: url,
                uploadedAt: firebase.firestore.Timestamp.now()
            });
        } catch (error) {
            console.error(`Error al procesar archivo ${file.name}:`, error);
            showAlert(`Error al procesar el archivo ${file.name}: ${error.message}`, "danger");
        }
    }
    
    console.log("Todos los archivos procesados:", processedFiles);
    return processedFiles;
}

// Función para actualizar el valor de los sliders (mejorada)
function updateRatingValue(sliderId, valueId) {
    const slider = document.getElementById(sliderId);
    const valueDisplay = document.getElementById(valueId);
    
    if (!slider || !valueDisplay) {
        console.error(`Elementos no encontrados: ${sliderId} o ${valueId}`);
        return;
    }
    
    // Establecer valor inicial
    valueDisplay.textContent = slider.value;
    
    // Eliminar event listeners anteriores para evitar duplicados
    const newSlider = slider.cloneNode(true);
    slider.parentNode.replaceChild(newSlider, slider);
    
    // Actualizar valor cuando cambie el slider
    newSlider.addEventListener('input', function() {
        document.getElementById(valueId).textContent = this.value;
    });
}

// Función de búsqueda dinámica para pacientes
function setupPatientSearch() {
    const searchInput = document.getElementById('searchPatient');
    const searchButton = document.getElementById('searchButton');
    
    if (!searchInput || !searchButton) {
        console.error("Elementos de búsqueda no encontrados");
        return;
    }
    
    // Función para realizar la búsqueda
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            loadPatients(); // Si no hay texto, mostrar todos los pacientes
            return;
        }
        
        const patientsTableBody = document.getElementById('patientsTableBody');
        if (!patientsTableBody) {
            console.error("patientsTableBody no encontrado!");
            return;
        }
        
        patientsTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Buscando...</td></tr>';
        
        db.collection("patients")
            .orderBy("createdAt", "desc")
            .get()
            .then((querySnapshot) => {
                patientsTableBody.innerHTML = "";
                
                let matchedPatients = [];
                
                querySnapshot.forEach((doc) => {
                    const patient = doc.data();
                    patient.id = doc.id;
                    
                    // Buscar en nombre y RUT
                    const nameMatch = (patient.name || '').toLowerCase().includes(searchTerm);
                    const rutMatch = (patient.rut || '').toLowerCase().includes(searchTerm);
                    
                    if (nameMatch || rutMatch) {
                        matchedPatients.push(patient);
                    }
                });
                
                if (matchedPatients.length === 0) {
                    patientsTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No se encontraron pacientes que coincidan con la búsqueda.</td></tr>';
                    return;
                }
                
                // Mostrar los pacientes que coinciden
                matchedPatients.forEach(patient => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                      <td>${patient.name || 'Sin nombre'}</td>
                      <td>${patient.rut || 'N/A'}</td>
                      <td>${patient.age || 'N/A'}</td>
                      <td>${formatDate(patient.createdAt)} ${formatTime(patient.createdAt)}</td>
                      <td>
                        <button class="btn btn-primary btn-sm view-details" data-patient-id="${patient.id}">Ver</button>
                        <button class="btn btn-danger btn-sm delete-patient" data-patient-id="${patient.id}">Eliminar</button>
                      </td>
                    `;
                    patientsTableBody.appendChild(row);
                });
                
                // Eliminar event listeners anteriores
                const oldPatientsTableBody = patientsTableBody;
                const newPatientsTableBody = oldPatientsTableBody.cloneNode(true);
                oldPatientsTableBody.parentNode.replaceChild(newPatientsTableBody, oldPatientsTableBody);
                
                // Agregar nuevos event listeners
                newPatientsTableBody.addEventListener('click', (event) => {
                    const target = event.target;
                    if (target.classList.contains('view-details') || target.closest('.view-details')) {
                        const patientId = (target.dataset.patientId || target.closest('.view-details').dataset.patientId);
                        showPatientDetails(patientId);
                    } else if (target.classList.contains('delete-patient') || target.closest('.delete-patient')) {
                        const patientId = (target.dataset.patientId || target.closest('.delete-patient').dataset.patientId);
                        deletePatient(patientId);
                    }
                });
            })
            .catch((error) => {
                console.error("Error al buscar pacientes:", error);
                patientsTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error al buscar pacientes: ${error.message}</td></tr>`;
            });
    }
    
    // Evento para el botón de búsqueda
    searchButton.addEventListener('click', performSearch);
    
    // Búsqueda dinámica mientras se escribe (después de 500ms de inactividad)
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(performSearch, 500);
    });
}
// Función de búsqueda dinámica para evoluciones
function setupEvolutionSearch() {
    const searchInput = document.getElementById('searchEvolution');
    
    if (!searchInput) {
        console.error("Elemento de búsqueda de evoluciones no encontrado");
        return;
    }
    
    // Función para realizar la búsqueda de evoluciones
    function performEvolutionSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const evolutionsTableBody = document.getElementById('evolutionsTableBody');
        
        if (!evolutionsTableBody) {
            console.error("evolutionsTableBody no encontrado");
            return;
        }
        
        evolutionsTableBody.innerHTML = '<tr><td colspan="4">Buscando...</td></tr>';
        
        // Si no hay término de búsqueda, mostrar todas las evoluciones
        if (searchTerm === '') {
            loadEvolutions();
            return;
        }
        
        // Primero obtener todos los pacientes para poder buscar por nombre
        db.collection("patients").get()
            .then(patientSnapshot => {
                const patientMap = {};
                
                // Mapear IDs a nombres de pacientes
                patientSnapshot.forEach(doc => {
                    const patient = doc.data();
                    patientMap[doc.id] = {
                        name: (patient.name || '').toLowerCase(),
                        rut: (patient.rut || '').toLowerCase()
                    };
                });
                
                // Ahora buscar evoluciones
                return db.collection("evolutions").orderBy("createdAt", "desc").get()
                    .then(evolutionSnapshot => {
                        evolutionsTableBody.innerHTML = "";
                        
                        let matchedEvolutions = [];
                        
                        evolutionSnapshot.forEach(doc => {
                            const evolution = doc.data();
                            evolution.id = doc.id;
                            
                            const patientInfo = patientMap[evolution.patientId] || {};
                            const patientName = patientInfo.name || '';
                            const patientRut = patientInfo.rut || '';
                            const evolutionDate = (evolution.date || '').toLowerCase();
                            const evaluator = (evolution.evaluator || '').toLowerCase();
                            
                            // Buscar en nombre del paciente, RUT, fecha o evaluador
                            if (
                                patientName.includes(searchTerm) || 
                                patientRut.includes(searchTerm) ||
                                evolutionDate.includes(searchTerm) ||
                                evaluator.includes(searchTerm)
                            ) {
                                matchedEvolutions.push({
                                    evolution: evolution,
                                    patientName: patientMap[evolution.patientId]?.name || 'Paciente desconocido'
                                });
                            }
                        });
                        
                        if (matchedEvolutions.length === 0) {
                            evolutionsTableBody.innerHTML = '<tr><td colspan="4">No se encontraron evoluciones que coincidan con la búsqueda.</td></tr>';
                            return;
                        }
                        
                        // Mostrar las evoluciones que coinciden
                        matchedEvolutions.forEach(item => {
                            const evolution = item.evolution;
                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td>${item.patientName || 'Paciente Desconocido'}</td>
                                <td>${evolution.date || 'No especificada'}</td>
                                <td>${evolution.subjective ? (evolution.subjective.length > 50 ? evolution.subjective.substring(0, 50) + '...' : evolution.subjective) : 'No especificado'}</td>
                                <td>
                                    <button class="btn btn-primary btn-sm view-evolution" data-evolution-id="${evolution.id}">Ver</button>
                                    <button class="btn btn-danger btn-sm delete-evolution" data-evolution-id="${evolution.id}">Eliminar</button>
                                </td>
                            `;
                            evolutionsTableBody.appendChild(row);
                        });
                        
                        // Eliminar event listeners anteriores
                        const oldEvolutionsTableBody = evolutionsTableBody;
                        const newEvolutionsTableBody = oldEvolutionsTableBody.cloneNode(true);
                        oldEvolutionsTableBody.parentNode.replaceChild(newEvolutionsTableBody, oldEvolutionsTableBody);
                        
                        // Agregar nuevos event listeners
                        newEvolutionsTableBody.addEventListener('click', (event) => {
                            const target = event.target;
                            if (target.classList.contains('view-evolution') || target.closest('.view-evolution')) {
                                const evolutionId = (target.dataset.evolutionId || target.closest('.view-evolution').dataset.evolutionId);
                                showEvolutionDetails(evolutionId);
                            } else if (target.classList.contains('delete-evolution') || target.closest('.delete-evolution')) {
                                const evolutionId = (target.dataset.evolutionId || target.closest('.delete-evolution').dataset.evolutionId);
                                deleteEvolution(evolutionId);
                            }
                        });
                    });
            })
            .catch(error => {
                console.error("Error al buscar evoluciones:", error);
                evolutionsTableBody.innerHTML = '<tr><td colspan="4">Error al buscar evoluciones.</td></tr>';
            });
    }
    
    // Búsqueda dinámica mientras se escribe (después de 500ms de inactividad)
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(performEvolutionSearch, 500);
    });
}

// Event listeners para la carga inicial y eventos de pestaña
document.addEventListener('DOMContentLoaded', function() {
    // Cargar pacientes al iniciar la página
    loadPatients();
    
    // Cargar pacientes en el selector para evoluciones
    loadPatientsIntoSelect();
    
    // Cargar evoluciones
    loadEvolutions();
    
    // Event listener para el formulario de pacientes
    document.getElementById('patientForm')?.addEventListener('submit', savePatient);
    
    // Event listener para el formulario de evolución
    document.getElementById('evolutionForm')?.addEventListener('submit', saveEvolution);
    
    // Event listener para cargar PSFS al seleccionar un paciente
    document.getElementById('patientSelect')?.addEventListener('change', loadPatientPSFS);
    
    // Configurar tabs para que carguen datos al hacer clic
    document.querySelector('button[data-bs-target="#records-tab-pane"]')?.addEventListener('click', loadPatients);
    document.querySelector('button[data-bs-target="#evolutions-tab-pane"]')?.addEventListener('click', function() {
        loadPatientsIntoSelect();
        loadEvolutions();
    });
    
    // Inicializar búsqueda de pacientes
    setupPatientSearch();
    
    // Inicializar búsqueda de evoluciones
    setupEvolutionSearch();
    
    // Inicializar todos los sliders PSFS en el formulario de ingreso
    updateRatingValue('psfs1Rating', 'psfs1Value');
    updateRatingValue('psfs2Rating', 'psfs2Value');
    updateRatingValue('psfs3Rating', 'psfs3Value');
    
    // Mensaje de conexión exitosa
    setTimeout(() => {
        showAlert("Conexión establecida con el servidor", "success");
    }, 1000);
});
