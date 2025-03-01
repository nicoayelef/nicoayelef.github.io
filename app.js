// Configuración de Firebase (¡Tus credenciales!)
const firebaseConfig = {
    apiKey: "AIzaSyBYaNbZWHUS-Pvm49kmMtHw9LqqxUDySYA",
    authDomain: "base-de-datos-poli.firebaseapp.com",
    projectId: "base-de-datos-poli",
    storageBucket: "base-de-datos-poli.appspot.com", // Cambia a .appspot.com
    messagingSenderId: "954754202697",
    appId: "1:954754202697:web:e06171f6b0ade314259398"
};

// Inicializar Firebase (con verificación)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase inicializado correctamente");
} else {
    console.log("Firebase ya estaba inicializado.");
}

const db = firebase.firestore();

// Verificar conexión (mejorado)
console.log("Verificando conexión a Firestore...");
db.collection("patients").limit(1).get()
    .then(snapshot => {
        if (snapshot.size >= 0) { // Puede estar vacía
            console.log("Conexión a Firestore exitosa.");
        }
    })
    .catch(error => {
        console.error("Error al conectar con Firestore:", error);
        showAlert("Error de conexión a la base de datos: " + error.message, "danger");
    });


// Variables globales
let currentPatientId = null; // ID del paciente seleccionado (para evoluciones)
let currentEvolutionId = null; //ID de la evolución (para editar, que aun no esta implementado)

// --- Funciones de utilidad ---

// Función para mostrar alertas.  Esta función la usarás en todo tu código.
function showAlert(message, type) {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) {
        console.error("Elemento alertContainer no encontrado"); // Esencial para debuggear.
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
      if(alert.parentNode) { //Verifica que aun exista antes de intentar eliminar
        alert.remove();
      }
    }, 5000);
}

// Función para convertir archivos a Base64 (Promisificada)
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Funcion para limpiar los formularios:
function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
      form.reset();
    }
}
// --- Función para guardar un nuevo paciente ---
async function savePatient(event) {
    event.preventDefault(); // Evitar el envío normal del formulario
    console.log("Función savePatient ejecutada");
    const saveBtn = document.getElementById('savePatientBtn');

    //Deshabilito el botón mientras se guarda.
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
    }


    try {
        // 1. Recopilar los datos del formulario (¡Usando los IDs correctos de tu HTML!)
        const patientData = {
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
            //Datos de los sliders PSFS
            psfs1: {
                activity: document.getElementById('psfs1Activity').value,
                rating: document.getElementById('psfs1Rating').value
            },
            psfs2: {
                activity: document.getElementById('psfs2Activity').value,
                rating: document.getElementById('psfs2Rating').value
            },
            psfs3: {
                activity: document.getElementById('psfs3Activity').value,
                rating: document.getElementById('psfs3Rating').value
            },
            extraQuestionnaire: document.getElementById('extraQuestionnaire').value,
            vitalSigns: document.getElementById('vitalSigns').value,
            anthropometry: document.getElementById('anthropometry').value,
            physicalExam: document.getElementById('physicalExam').value,
            createdAt: firebase.firestore.Timestamp.now(),  // Usar el timestamp del servidor
            complementaryExams: [] // Inicializar el array para los archivos
        };

// 2. Procesar archivos (si hay)
const fileInput = document.getElementById('medicalExams');
if (fileInput && fileInput.files && fileInput.files.length > 0) {
    try {
        const processedFiles = await processFiles(fileInput.files);
        patientData.complementaryExams = processedFiles;
        console.log("Archivos procesados correctamente:", processedFiles);
    } catch (error) {
        console.error("Error al procesar archivos:", error);
        showAlert("Error al procesar los archivos adjuntos. La ficha se guardará sin archivos.", "warning");
        patientData.complementaryExams = [];
    }
} else {
    patientData.complementaryExams = [];
}


        // 3. Guardar en Firestore
        const docRef = await db.collection("patients").add(patientData);
        console.log("Paciente guardado con ID:", docRef.id);
        showAlert("Paciente guardado exitosamente!", "success");

        // 4. Limpiar el formulario
        document.getElementById("patientForm").reset();
        //Recargar los sliders.
        updateRatingValue('psfs1Rating', 'psfs1Value');
        updateRatingValue('psfs2Rating', 'psfs2Value');
        updateRatingValue('psfs3Rating', 'psfs3Value');

    } catch (error) {
        console.error("Error al guardar el paciente:", error);
        showAlert("Error al guardar el paciente: " + error.message, "danger");

    } finally {
        // Restaurar botón (independientemente de si hubo éxito o error)
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Guardar Ficha';
        }
    }
}
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
        // Delegación de eventos para los botones "Ver" y "Eliminar"
        patientsTableBody.addEventListener('click', (event) => {
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
    const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModal.show();

  db.collection("patients").doc(patientId).get()
    .then((doc) => {
      if (!doc.exists) {
        console.log("Paciente no encontrado:", patientId);
        showAlert("Paciente no encontrado", "warning");
         loadingModal.hide(); // Ocultar modal de carga
        return;
      }

      const patient = doc.data();
      patient.id = doc.id; // Asignar el ID del documento
      console.log("Datos del paciente recuperados:", patient);



      // --- Rellenar el modal de detalles ---
      const modalBody = document.getElementById('patientDetailsContent');
      if (!modalBody) {
        console.error("Elemento patientDetailsModalBody no encontrado.");
        loadingModal.hide(); // Ocultar modal de carga
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
    })
    .catch((error) => {
      console.error("Error al obtener detalles del paciente:", error);
      showAlert("Error al cargar los detalles del paciente", "danger");
    })
    .finally(() => {
      loadingModal.hide(); // Ocultar modal de carga *siempre* (incluso en caso de error)
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
    const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModal.show();


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
          loadingModal.hide(); // Ocultar modal *siempre*
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
    const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModal.show();

    db.collection("patients").doc(patientId).get()
        .then(doc => {
            if (doc.exists) {
                const patient = doc.data();
                currentPatientId = patientId;  // Establecer el paciente actual

               const psfsContainer = document.getElementById('psfsUpdateContainer');
if (!psfsContainer) {
  console.error('psfsUpdateContainer no encontrado.');
  return;
}
                let psfsHTML = '';

                if (patient.psfs1 && patient.psfs1.activity) {
                    psfsHTML += `
                    <div class="mb-3">
                        <label class="form-label">${patient.psfs1.activity}</label>
                        <input type="range" class="form-range" min="0" max="10" step="1" id="evolutionPsfs1Rating" value="${patient.psfs1.rating || 0}">
                        <div class="d-flex justify-content-between">
                            <span>0</span>
                            <span id="evolutionPsfs1Value">${patient.psfs1.rating || 0}</span>
                            <span>10</span>
                        </div>
                    </div>`;
                }

                if (patient.psfs2 && patient.psfs2.activity) {
                    psfsHTML += `
                    <div class="mb-3">
                        <label class="form-label">${patient.psfs2.activity}</label>
                        <input type="range" class="form-range" min="0" max="10" step="1" id="evolutionPsfs2Rating" value="${patient.psfs2.rating || 0}">
                         <div class="d-flex justify-content-between">
                            <span>0</span>
                            <span id="evolutionPsfs2Value">${patient.psfs2.rating || 0}</span>
                            <span>10</span>
                        </div>
                    </div>`;
                }

                if (patient.psfs3 && patient.psfs3.activity) {
                    psfsHTML += `
                    <div class="mb-3">
                        <label class="form-label">${patient.psfs3.activity}</label>
                        <input type="range" class="form-range" min="0" max="10" step="1" id="evolutionPsfs3Rating" value="${patient.psfs3.rating || 0}">
                         <div class="d-flex justify-content-between">
                            <span>0</span>
                            <span id="evolutionPsfs3Value">${patient.psfs3.rating || 0}</span>
                            <span>10</span>
                        </div>
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


                 // Mostrar el formulario de evolución DESPUÉS de cargar los datos PSFS
                const evolutionFormContainer = document.getElementById('evolutionFormContainer');
                 if(!evolutionFormContainer){
                    console.error('evolutionFormContainer no encontrado')
                    return;
                 }
                evolutionFormContainer.style.display = 'block';


            } else {
                showAlert("Paciente no encontrado", "warning");
            }
        })
        .catch(error => {
            console.error("Error al cargar datos PSFS:", error);
            showAlert("Error al cargar datos PSFS: " + error.message, "danger");
        }).finally( () => {
             loadingModal.hide();
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

    // Recopilar datos del formulario de evolución
    const evolutionData = {
    patientId: currentPatientId,
    date: document.getElementById('evolutionDate').value,
    subjective: document.getElementById('evolutionProgress').value,
    objective: document.getElementById('evolutionTreatment').value,
    assessment: document.getElementById('evolutionPlan').value, // Cambia esto o añade un campo adicional
    evaluator: document.getElementById('evolutionEvaluator').value, // Añade el evaluador
    psfsValues: {
        psfs1: document.getElementById('evolutionPsfs1Rating')?.value,
        psfs2: document.getElementById('evolutionPsfs2Rating')?.value,
        psfs3: document.getElementById('evolutionPsfs3Rating')?.value,
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
            clearForm('evolutionForm'); //Limpia el formulario.
             // Actualizar la lista de evoluciones
            loadEvolutions();

            //Recargar los sliders.
            updateRatingValue('evolutionPsfs1Rating', 'evolutionPsfs1Value');
            updateRatingValue('evolutionPsfs2Rating', 'evolutionPsfs2Value');
            updateRatingValue('evolutionPsfs3Rating', 'evolutionPsfs3Value');


        })
        .catch((error) => {
            console.error("Error al guardar la evolución:", error);
            showAlert("Error al guardar la evolución: " + error.message, "danger");
        })
        .finally( () => {
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
        return
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
            //Delegación de eventos para botones.
             evolutionsTableBody.addEventListener('click', (event) => {
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
    const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModal.show();

    db.collection("evolutions").doc(evolutionId).get()
        .then(async (doc) => { // Usamos async para poder usar await dentro
            if (!doc.exists) {
                showAlert("Evolución no encontrada", "warning");
                loadingModal.hide(); // Ocultamos el loading
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
                console.error("Elemento evolutionDetailsModalBody no encontrado.");
                 loadingModal.hide(); // Ocultar modal de carga
                return;
            }

            //Formatear Fecha
            let evolutionDate = 'No disponible';
            if(evolution.date){
                evolutionDate = new Date(evolution.date).toLocaleDateString()
            }

            modalBody.innerHTML = `
                <h5>Evolución - ${patientName}</h5>
                <p><strong>Fecha:</strong> ${evolutionDate}</p>
                <p><strong>Subjetivo:</strong> ${evolution.subjective || 'No especificado'}</p>
                <p><strong>Objetivo:</strong> ${evolution.objective || 'No especificado'}</p>
                <p><strong>Evaluación:</strong> ${evolution.assessment || 'No especificado'}</p>
                <p><strong>Plan:</strong> ${evolution.plan || 'No especificado'}</p>
                <hr>
                <h5>Valores PSFS</h5>
                ${evolution.psfsValues ? `
                    <p><strong>PSFS 1:</strong> ${evolution.psfsValues.psfs1 || 'N/A'}</p>
                    <p><strong>PSFS 2:</strong> ${evolution.psfsValues.psfs2 || 'N/A'}</p>
                    <p><strong>PSFS 3:</strong> ${evolution.psfsValues.psfs3 || 'N/A'}</p>
                ` : '<p>No hay valores PSFS registrados para esta evolución.</p>'}
            `;

            // --- Mostrar el modal de detalles ---
            const detailsModal = new bootstrap.Modal(document.getElementById('evolutionDetailsModal'));
            detailsModal.show();
        })
        .catch((error) => {
            console.error("Error al obtener detalles de la evolución:", error);
            showAlert("Error al cargar los detalles de la evolución", "danger");
        })
        .finally(() => {
             loadingModal.hide(); // Ocultar modal *siempre*
        });
}


function deleteEvolution(evolutionId) {
    console.log("Eliminando evolución:", evolutionId);

    // Confirmación
    if (!confirm("¿Estás seguro de que quieres eliminar esta evolución?\n\n¡Esta acción es irreversible!")) {
        return;
    }
     // Mostrar modal de carga
    const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModal.show();

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
             loadingModal.hide();
        });
}

// Función para procesar archivos
async function processFiles(files) {
  const processedFiles = [];
  const storage = firebase.storage();
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      // Crear una referencia única para el archivo
      const storageRef = storage.ref(`medical_exams/${Date.now()}_${file.name}`);
      
      // Subir el archivo
      const snapshot = await storageRef.put(file);
      
      // Obtener la URL de descarga
      const url = await snapshot.ref.getDownloadURL();
      
      processedFiles.push({
        name: file.name,
        type: file.type,
        url: url,
        uploadedAt: firebase.firestore.Timestamp.now()
      });
    } catch (error) {
      console.error("Error al procesar archivo:", error);
      showAlert(`Error al procesar el archivo ${file.name}: ${error.message}`, "danger");
    }
  }
  
  return processedFiles;
}

// Función para formatear fecha
function formatDate(timestamp) {
  if (!timestamp) return 'Fecha no disponible';
  
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  } catch (e) {
    console.error("Error al formatear fecha:", e);
    return 'Fecha inválida';
  }
}

// Función para formatear hora
function formatTime(timestamp) {
  if (!timestamp) return '';
  
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString();
  } catch (e) {
    console.error("Error al formatear hora:", e);
    return '';
  }
}

// Función para actualizar el valor de los sliders
function updateRatingValue(sliderId, valueId) {
  const slider = document.getElementById(sliderId);
  const valueDisplay = document.getElementById(valueId);
  
  if (!slider || !valueDisplay) {
    console.error(`Elementos no encontrados: ${sliderId} o ${valueId}`);
    return;
  }
  
  // Establecer valor inicial
  valueDisplay.textContent = slider.value;
  
  // Actualizar valor cuando cambie el slider
  slider.addEventListener('input', function() {
    valueDisplay.textContent = this.value;
  });
}

// --- Event Listeners (al final del script) ---

// Event listener para el formulario de pacientes
const patientForm = document.getElementById('patientForm');
if (patientForm) {
    console.log("Formulario de paciente encontrado, añadiendo event listener");
    patientForm.addEventListener('submit', savePatient);
} else {
    console.error("Formulario de paciente no encontrado");
}

// Event listener para el selector de pacientes (en la pestaña de evoluciones)
document.getElementById('patientSelect')?.addEventListener('change', () => {
    loadPatientPSFS(); // Cargar PSFS y mostrar formulario
    //loadEvolutionsForPatient(currentPatientId); //No cargar evoluciones al inicio.
});

//Event listener para cargar los datos iniciales de los sliders PSFS
document.addEventListener('DOMContentLoaded', function() {
    updateRatingValue('psfs1Rating', 'psfs1Value');
    updateRatingValue('psfs2Rating', 'psfs2Value');
    updateRatingValue('psfs3Rating', 'psfs3Value');
    loadPatients();      // Cargar la lista de pacientes al inicio.
    loadEvolutions(); // Cargar *todas* las evoluciones al inicio.
    loadPatientsIntoSelect(); // Cargar pacientes en el selector

});

// Event listener para el formulario de evolución
document.getElementById('evolutionForm')?.addEventListener('submit', saveEvolution);

