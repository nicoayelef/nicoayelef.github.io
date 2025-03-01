// Configuración de Firebase (reemplaza con tus credenciales reales)
const firebaseConfig = {
  apiKey: "AIzaSyBYaNbZWHUS-Pvm49kmMtHw9LqqxUDySYA",
  authDomain: "base-de-datos-poli.firebaseapp.com",
  projectId: "base-de-datos-poli",
  storageBucket: "base-de-datos-poli.appspot.com",
  messagingSenderId: "954754202697",
  appId: "1:954754202697:web:e06171f6b0ade314259398"
};

// Inicializar Firebase (con verificación para evitar inicializaciones múltiples)
// La forma correcta de verificar si Firebase ya está inicializado es usando firebase.apps.length
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase inicializado correctamente");
} else {
  console.log("Firebase ya estaba inicializado."); // Mensaje más claro
}


// Inicializar Firestore
const db = firebase.firestore();

// Verificar conexión a Firestore (mejorado para ser más robusto)
console.log("Verificando conexión a Firestore...");
db.collection("patients")
  .limit(1) // Obtiene solo un documento para verificar la conexión
  .get()
  .then(snapshot => {
    // No es necesario verificar snapshot.exists, limit(1) garantiza que snapshot.size sea 0 o 1.
    if (snapshot.size > 0) {
      console.log("Conexión a Firestore exitosa.  Documentos encontrados (limitado a 1):", snapshot.size);
    } else {
      console.log("Conexión a Firestore exitosa, pero la colección 'patients' está vacía.");
    }
  })
  .catch(error => {
    console.error("Error al conectar con Firestore:", error);
    // Mostrar un alert más descriptivo, incluyendo el código de error si está disponible
    let errorMessage = "Error de conexión a la base de datos: " + error.message;
    if (error.code) {
      errorMessage += ` (Código: ${error.code})`;
    }
    alert(errorMessage);
  });


// Variables globales (explicación clara de su uso)
let currentPatientId = null; // Almacena el ID del paciente seleccionado actualmente (para evoluciones)
let currentEvolutionId = null; //  (No se usa en el código proporcionado, pero es buena práctica mantenerla si planeas editar evoluciones)

// Función para convertir archivos a Base64 (Promisificada para usar con async/await)
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);  // Resuelve con la URL Base64
    reader.onerror = error => reject(error);       // Rechaza si hay un error
  });
}


// Función para actualizar el valor mostrado de los sliders de valoración
function updateRatingValue(sliderId, valueId) {
  const slider = document.getElementById(sliderId);
  const valueDisplay = document.getElementById(valueId);

  if (slider && valueDisplay) {
    // Usar una función para evitar duplicación de código
    const updateValue = () => {
      valueDisplay.textContent = slider.value;
    }

    // Actualizar el valor inicial
    updateValue();

    // Agregar evento para actualizar cuando cambia el deslizador
    slider.oninput = updateValue; // Más conciso

  } else {
    console.error(`Elementos no encontrados: slider=${sliderId}, value=${valueId}`);
  }
}


// Función para procesar archivos (convertir a Base64 y manejar tamaño)
async function processFiles(files) {
  if (!files || files.length === 0) return [];

  const processedFiles = [];
  const largeFiles = [];
  const MAX_SIZE = 1 * 1024 * 1024; // 1MB máximo para Base64 (buena práctica definir constantes)

  // Mostrar indicador de progreso (mejorado para ser más claro y reutilizable)
  const progressContainer = document.createElement('div');
  progressContainer.innerHTML = `
    <div class="progress mt-2 mb-2">
      <div class="progress-bar progress-bar-striped progress-bar-animated"
           role="progressbar" style="width: 0%"
           id="uploadProgressBar">0%</div>
    </div>
  `;

  // Insertar la barra de progreso *antes* del formulario (más intuitivo visualmente)
  const formContainer = document.querySelector('.form-container');  //querySelector es mas moderno
  if (formContainer) {
    formContainer.prepend(progressContainer); // prepend es mas moderno que insertBefore( , formContainer.firstChild)
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

    // Verificar tamaño ANTES de intentar convertir a Base64
    if (file.size > MAX_SIZE) {
      largeFiles.push(file.name);
      continue; // Saltar archivos grandes
    }

    try {
      // Convertir a Base64
      const base64Data = await fileToBase64(file);

      processedFiles.push({
        name: file.name,
        type: file.type,
        url: base64Data, // Buena práctica usar 'url' para consistencia
        data: base64Data, //  (Opcional) Mantener 'data' si lo necesitas en otro lugar
        uploadedAt: firebase.firestore.FieldValue.serverTimestamp() // Usar serverTimestamp() para precisión
      });
    } catch (error) {
      console.error("Error al convertir archivo a Base64:", error);
      showAlert(`Error al procesar el archivo ${file.name}`, "danger");
    }
  }

  // Eliminar barra de progreso
  if (progressContainer.parentNode) {  //Verifica que aun exista antes de intentar eliminar
     progressContainer.remove(); //  .remove() es mas moderno
  }

  // Mostrar advertencia para archivos grandes
  if (largeFiles.length > 0) {
    showAlert(`Los siguientes archivos son demasiado grandes (>1MB) y no se guardarán: ${largeFiles.join(", ")}. Considere comprimir las imágenes antes de subirlas.`, "warning");
  }

  return processedFiles;
}



// Función para mostrar alertas (mejorada para ser más reutilizable y con auto-cierre)
function showAlert(message, type) {
  const alertContainer = document.getElementById('alertContainer');
  if (!alertContainer) {
    console.error("Elemento alertContainer no encontrado");
    return;
  }

  const alert = document.createElement('div');
  alert.className = `alert alert-${type} alert-dismissible fade show`; // Clases de Bootstrap
  alert.role = 'alert';
  alert.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  alertContainer.appendChild(alert);

  // Auto-cerrar alertas después de 5 segundos (mejor experiencia de usuario)
  setTimeout(() => {
     if(alert.parentNode) { //Verifica que aun exista antes de intentar eliminar
       alert.remove();
     }
  }, 5000);
}

// Función para guardar un nuevo paciente (refactorizada para mayor claridad)
async function savePatient(e) {
  e.preventDefault(); // Prevenir el envío por defecto del formulario
  console.log("Función savePatient() ejecutada");

  const saveBtn = document.getElementById('savePatientBtn'); // Obtener botón al inicio

  try {
    // 1. Recopilar datos del formulario (organizado para mayor legibilidad)

    // Datos PSFS (Patient-Specific Functional Scale)
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

    // Datos del paciente (objeto principal)
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
      psfs1: psfs1,  // Incluir datos PSFS
      psfs2: psfs2,
      psfs3: psfs3,
      extraQuestionnaire: document.getElementById('extraQuestionnaire').value,
      vitalSigns: document.getElementById('vitalSigns').value,
      anthropometry: document.getElementById('anthropometry').value,
      physicalExam: document.getElementById('physicalExam').value,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(), // Usar serverTimestamp()
      complementaryExams: [] // Inicializar array para exámenes complementarios
    };

    console.log("Datos del paciente a guardar:", patient);

    // 2. Deshabilitar botón y mostrar spinner (mejora UX)
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
    }

    // 3. Procesar archivos (si hay)
    const fileInput = document.getElementById('medicalExams');
    let processedFiles = [];
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      try {
        console.log(`Procesando ${fileInput.files.length} archivos...`);
        processedFiles = await processFiles(fileInput.files); // Usar la función processFiles
        console.log(`${processedFiles.length} archivos procesados correctamente`);
      } catch (error) {
        console.error("Error al procesar archivos:", error);
        showAlert("Error al procesar archivos: " + error.message, "warning");
        // No detener la ejecución si falla el procesamiento de archivos
      }
    }

    // 4. Añadir archivos procesados al objeto paciente
    patient.complementaryExams = processedFiles; // Siempre asignar (incluso si está vacío)



    // 5. Guardar en Firestore
    console.log("Intentando guardar en Firestore...");
    const docRef = await db.collection("patients").add(patient); // Usar async/await
    console.log("Paciente guardado con ID:", docRef.id);

    // 6. Restaurar botón (independientemente del éxito o error)
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = 'Guardar Ficha';
    }

    // 7. Mostrar mensaje de éxito y limpiar
    showAlert("Paciente guardado correctamente", "success");
    document.getElementById('patientForm').reset();
    loadPatients(); // Recargar la lista de pacientes (si estamos en la vista correcta)

  } catch (error) {
    console.error("Error en la función savePatient:", error);

    // Restaurar botón en caso de error
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = 'Guardar Ficha';
    }

    // Mostrar mensaje de error detallado
    let errorMessage = "Error al guardar paciente: " + error.message;
    if (error.code) {
      errorMessage += ` (Código: ${error.code})`;
    }
    showAlert(errorMessage, "danger");

  }
}
// Función para cargar pacientes en la lista (optimizada y con manejo de errores)
function loadPatients() {
  console.log("Cargando pacientes...");
  const patientsTableBody = document.getElementById('patientsTableBody');
  if (!patientsTableBody) {
    console.error("No se encontró el elemento patientsTableBody");
    return;
  }

  // Mostrar mensaje de carga
  patientsTableBody.innerHTML = '<tr><td colspan="5" class="text-center">Cargando pacientes...</td></tr>';

  db.collection("patients")
    .get()
    .then((querySnapshot) => {
      const patients = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        data.id = doc.id; // Guardar el ID del documento
        patients.push(data);
      });

      // Ordenar por fecha de creación (más reciente primero) -  firestore no ordena por serverTimestamp
        patients.sort((a, b) => {
        const dateA = a.createdAt && a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const dateB = b.createdAt && b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);

        return dateB - dateA;
        });


      // Limpiar mensaje de carga, ahora se mostrara la lista de pacientes.
      patientsTableBody.innerHTML = '';

      if (patients.length === 0) {
        patientsTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay pacientes registrados</td></tr>';
        return;
      }

      // Construir la tabla de pacientes
      patients.forEach((patient) => {
        // Formatear fecha y hora de creación (manejo de casos null/undefined)
        let createdDate = 'No disponible';
        let createdTime = '';
        if (patient.createdAt && patient.createdAt.toDate) {
          const date = patient.createdAt.toDate();
          createdDate = date.toLocaleDateString();
          createdTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (patient.createdAt) {
          //Si no es un TimeStamp, intentar analizar una fecha/hora
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

      // Agregar event listeners a los botones (usando delegación de eventos)
      patientsTableBody.addEventListener('click', (event) => {
          if (event.target.closest('.view-details')) {
            const patientId = event.target.closest('.view-details').getAttribute('data-patient-id');
            showPatientDetails(patientId);
          } else if (event.target.closest('.delete-patient')) {
            const patientId = event.target.closest('.delete-patient').getAttribute('data-patient-id');
            deletePatient(patientId); // Llama a la función para eliminar
          }
      });

    })
    .catch((error) => {
      console.error("Error al cargar pacientes:", error);
      patientsTableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error al cargar los pacientes: ${error.message}</td></tr>`;
       //Mostrar alerta
       let errorMessage = "Error al cargar la lista de pacientes: " + error.message;
        if (error.code) {
            errorMessage += ` (Código: ${error.code})`;
        }
        showAlert(errorMessage, "danger");
    });
}
// Función para mostrar los detalles de un paciente (refactorizada y mejorada)
function showPatientDetails(patientId) {
  console.log("Mostrando detalles del paciente con ID:", patientId);

  // Mostrar modal de carga (mejorado)
  const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
  loadingModal.show();

  db.collection("patients").doc(patientId).get()
    .then((doc) => {
      if (!doc.exists) {
        console.log("No se encontró el paciente con ID:", patientId);
        showAlert("No se encontró el paciente", "warning");
        loadingModal.hide(); // Ocultar modal de carga
        return;
      }

      const patient = doc.data();
      patient.id = doc.id; //  MUY IMPORTANTE: Incluir el ID
      console.log("Datos del paciente recuperados:", patient);


      // --- Rellenar el modal de detalles ---
      const modalBody = document.getElementById('patientDetailsModalBody');
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
    let createdDate = 'No disponible';
    let createdTime = '';
    if (patient.createdAt && patient.createdAt.toDate) {
        const date = patient.createdAt.toDate();
        createdDate = date.toLocaleDateString();
        createdTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (patient.createdAt) {
      //Si no es un TimeStamp, intentar analizar una fecha/hora
        const date = new Date(patient.createdAt);
        createdDate = date.toLocaleDateString();
        createdTime = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    // Construir el contenido del modal (mucho más organizado y legible)
      modalBody.innerHTML = `
        <p><strong>Nombre:</strong> ${patient.name || 'Sin nombre'}</p>
        <p><strong>RUT:</strong> ${patient.rut || 'No especificado'}</p>
        <p><strong>Edad:</strong> ${patient.age || 'No especificada'}</p>
        <p><strong>Fecha de Nacimiento:</strong> ${birthdateFormatted}</p>
        <p><strong>Email:</strong> ${patient.email || 'No especificado'}</p>
        <p><strong>Teléfono:</strong> ${patient.contactNumber || 'No especificado'}</p>
        <p><strong>Nacionalidad:</strong> ${patient.nationality || 'No especificada'}</p>
        <p><strong>Estado Civil:</strong> ${patient.civilStatus || 'No especificado'}</p>
        <p><strong>Educación:</strong> ${patient.education || 'No especificada'}</p>
        <p><strong>Dirección:</strong> ${patient.address || 'No especificada'}</p>
        <p><strong>Contacto de Emergencia:</strong> ${patient.emergencyContact || 'No especificado'}</p>
        <p><strong>Ocupación:</strong> ${patient.occupation || 'No especificado'}</p>
        <p><strong>Lateralidad:</strong> ${patient.laterality || 'No especificada'}</p>
        <p><strong>Motivo de Consulta:</strong> ${patient.consultReason || 'No especificado'}</p>
        <p><strong>Diagnóstico:</strong> ${patient.diagnosis || 'No especificado'}</p>
        <p><strong>Expectativas:</strong> ${patient.expectations || 'No especificado'}</p>
        <p><strong>Anamnesis Próxima:</strong> ${patient.proximateAnamnesis || 'No especificada'}</p>
        <p><strong>Anamnesis Remota:</strong> ${patient.remoteAnamnesis || 'No especificada'}</p>
        <p><strong>Hábitos y Hobbies:</strong> ${patient.habitsHobbies || 'No especificado'}</p>
        <p><strong>Red de Apoyo:</strong> ${patient.homeSupport || 'No especificado'}</p>
        <p><strong>Fecha Creación:</strong> ${createdDate} ${createdTime}</p>

        <hr>
        <h5>PSFS (Patient-Specific Functional Scale)</h5>
        <p><strong>Actividad 1:</strong> ${patient.psfs1?.activity || 'No especificada'} - <strong>Valoración:</strong> ${patient.psfs1?.rating || 'N/A'}</p>
        <p><strong>Actividad 2:</strong> ${patient.psfs2?.activity || 'No especificada'} - <strong>Valoración:</strong> ${patient.psfs2?.rating || 'N/A'}</p>
        <p><strong>Actividad 3:</strong> ${patient.psfs3?.activity || 'No especificada'} - <strong>Valoración:</strong> ${patient.psfs3?.rating || 'N/A'}</p>
        
        <hr>
        <h5>Cuestionario Extra</h5>
        <p>${patient.extraQuestionnaire || 'No especificado'}</p>

        <hr>
        <h5>Signos Vitales</h5>
        <p>${patient.vitalSigns || 'No especificado'}</p>

        <hr>
        <h5>Antropometría</h5>
        <p>${patient.anthropometry || 'No especificado'}</p>

        <hr>
        <h5>Examen Físico</h5>
        <p>${patient.physicalExam || 'No especificado'}</p>
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

// Función para eliminar un paciente (con confirmación y manejo de errores)
function deletePatient(patientId) {
  console.log("Eliminando paciente con ID:", patientId);

  // Mostrar confirmación antes de eliminar (MUY importante)
  if (!confirm("¿Está seguro de que desea eliminar este paciente? Esta acción es irreversible.")) {
    return; // Cancelar si el usuario no confirma
  }

  // Mostrar modal de carga (opcional, pero buena práctica)
  const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
  loadingModal.show();

  db.collection("patients").doc(patientId).delete()
    .then(() => {
      console.log("Paciente eliminado correctamente");
      showAlert("Paciente eliminado correctamente", "success");
      loadPatients(); // Recargar la lista
    })
    .catch((error) => {
      console.error("Error al eliminar paciente:", error);
      showAlert("Error al eliminar el paciente", "danger");
    })
    .finally(() => {
      loadingModal.hide(); // Ocultar modal de carga
    });
}

// --- Funciones para Evoluciones ---

// Cargar evoluciones de un paciente específico
function loadEvolutionsForPatient(patientId) {
    console.log("Cargando evoluciones para el paciente ID:", patientId);
    currentPatientId = patientId; // Importante:  Guardar el ID del paciente actual.
    const evolutionsTableBody = document.getElementById('evolutionsTableBody');

    if (!evolutionsTableBody) {
        console.error("No se encontró el elemento evolutionsTableBody");
        return;
    }

    // Limpiar y mostrar mensaje de carga
    evolutionsTableBody.innerHTML = '<tr><td colspan="4">Cargando evoluciones...</td></tr>';

    db.collection("patients").doc(patientId).collection("evolutions")
        .get()
        .then((querySnapshot) => {
            const evolutions = [];
            querySnapshot.forEach(doc => {
                const data = doc.data();
                data.id = doc.id;
                evolutions.push(data);
            });

             // Ordenar por fecha de creación (más reciente primero) -  firestore no ordena por serverTimestamp
            evolutions.sort((a, b) => {
            const dateA = a.createdAt && a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const dateB = b.createdAt && b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);

            return dateB - dateA;
            });

            evolutionsTableBody.innerHTML = ''; // Limpiar mensaje de carga

            if (evolutions.length === 0) {
                evolutionsTableBody.innerHTML = '<tr><td colspan="4">No hay evoluciones registradas para este paciente.</td></tr>';
                return;
            }

            evolutions.forEach(evolution => {
                 // Formatear fecha y hora de creación (manejo de casos null/undefined)
                let createdDate = 'No disponible';
                let createdTime = '';
                if (evolution.createdAt && evolution.createdAt.toDate) {
                const date = evolution.createdAt.toDate();
                createdDate = date.toLocaleDateString();
                createdTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                } else if (evolution.createdAt) {
                //Si no es un TimeStamp, intentar analizar una fecha/hora
                const date = new Date(evolution.createdAt);
                    createdDate = date.toLocaleDateString();
                    createdTime = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                }

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${createdDate} <br><small class="text-muted">${createdTime}</small></td>
                    <td>${evolution.subjective || 'No especificado'}</td>
                    <td>${evolution.objective || 'No especificado'}</td>
                    <td>
                        <button class="btn btn-primary btn-sm view-evolution" data-evolution-id="${evolution.id}"><i class="fas fa-eye"></i> Ver</button>
                        <button class="btn btn-danger btn-sm delete-evolution" data-evolution-id="${evolution.id}"><i class="fas fa-trash"></i> Eliminar</button>
                    </td>
                `;
                evolutionsTableBody.appendChild(row);
            });

            // Delegación de eventos para los botones de evoluciones
            evolutionsTableBody.addEventListener('click', (event) => {
                if (event.target.closest('.view-evolution')) {
                    const evolutionId = event.target.closest('.view-evolution').getAttribute('data-evolution-id');
                    showEvolutionDetails(patientId, evolutionId); // Pasar patientId
                } else if (event.target.closest('.delete-evolution')) {
                    const evolutionId = event.target.closest('.delete-evolution').getAttribute('data-evolution-id');
                    deleteEvolution(patientId, evolutionId); // Pasar patientId
                }
            });
        })
        .catch(error => {
            console.error("Error al cargar evoluciones:", error);
            evolutionsTableBody.innerHTML = `<tr><td colspan="4">Error al cargar evoluciones: ${error.message}</td></tr>`;
            //Mostrar alerta
            let errorMessage = "Error al cargar la lista de evoluciones: " + error.message;
            if (error.code) {
                errorMessage += ` (Código: ${error.code})`;
            }
            showAlert(errorMessage, "danger");
        });
}

// Mostrar detalles de una evolución
function showEvolutionDetails(patientId, evolutionId) {
    console.log("Mostrando detalles de la evolución ID:", evolutionId, "del paciente ID:", patientId);
    currentEvolutionId = evolutionId; // Opcional: Guardar el ID de la evolución actual (si necesitas editar)

     // Mostrar modal de carga
    const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModal.show();

    db.collection("patients").doc(patientId).collection("evolutions").doc(evolutionId).get()
    .then((doc) => {
        if (!doc.exists) {
            console.log("No se encontró la evolución con ID:", evolutionId);
            showAlert("No se encontró la evolución", "warning");
             loadingModal.hide();
            return;
        }

        const evolution = doc.data();
        console.log("Datos de la evolución recuperados:", evolution);

        // Rellenar el modal de detalles de la evolución
        const evolutionModalBody = document.getElementById('evolutionDetailsModalBody');
        if (!evolutionModalBody) {
            console.error("Elemento evolutionDetailsModalBody no encontrado");
             loadingModal.hide();
            return;
        }
         // Formatear fecha de creacion.
        let createdDate = 'No disponible';
        let createdTime = '';
        if (evolution.createdAt && evolution.createdAt.toDate) {
            const date = evolution.createdAt.toDate();
            createdDate = date.toLocaleDateString();
            createdTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (evolution.createdAt) {
        //Si no es un TimeStamp, intentar analizar una fecha/hora
            const date = new Date(evolution.createdAt);
            createdDate = date.toLocaleDateString();
            createdTime = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }

        evolutionModalBody.innerHTML = `
            <p><strong>Fecha:</strong> ${createdDate} ${createdTime}</p>
            <p><strong>Subjetivo:</strong> ${evolution.subjective || 'No especificado'}</p>
            <p><strong>Objetivo:</strong> ${evolution.objective || 'No especificado'}</p>
            <p><strong>Evaluación:</strong> ${evolution.assessment || 'No especificado'}</p>
            <p><strong>Plan:</strong> ${evolution.plan || 'No especificado'}</p>
            <p><strong>Comentarios Adicionales:</strong> ${evolution.comments || 'No especificado'}</p>
            
            <hr>
            <h5>PSFS (Patient-Specific Functional Scale)</h5>
            <p><strong>Actividad 1:</strong> ${evolution.psfs1?.activity || 'No especificada'} - <strong>Valoración:</strong> ${evolution.psfs1?.rating || 'N/A'}</p>
            <p><strong>Actividad 2:</strong> ${evolution.psfs2?.activity || 'No especificada'} - <strong>Valoración:</strong> ${evolution.psfs2?.rating || 'N/A'}</p>
            <p><strong>Actividad 3:</strong> ${evolution.psfs3?.activity || 'No especificada'} - <strong>Valoración:</strong> ${evolution.psfs3?.rating || 'N/A'}</p>
        `;
         // Mostrar el modal
        const evolutionDetailsModal = new bootstrap.Modal(document.getElementById('evolutionDetailsModal'));
        evolutionDetailsModal.show();
    })
    .catch((error) => {
        console.error("Error al obtener detalles de la evolución:", error);
        showAlert("Error al cargar los detalles de la evolución", "danger");
    })
    .finally(() => {
        loadingModal.hide();
    });
}

// Eliminar una evolución
function deleteEvolution(patientId, evolutionId) {
    console.log("Eliminando evolución ID:", evolutionId, "del paciente ID:", patientId);

    if (!confirm("¿Está seguro de que desea eliminar esta evolución?  Esta acción es irreversible.")) {
        return;
    }
    //Mostrar modal de carga
    const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModal.show();

    db.collection("patients").doc(patientId).collection("evolutions").doc(evolutionId).delete()
        .then(() => {
            console.log("Evolución eliminada correctamente");
            showAlert("Evolución eliminada correctamente", "success");
            loadEvolutionsForPatient(patientId); // Recargar la lista de evoluciones
        })
        .catch((error) => {
            console.error("Error al eliminar evolución:", error);
            showAlert("Error al eliminar la evolución", "danger");
        }).finally(() => {
            loadingModal.hide();
        });
}

// Guardar una nueva evolución (o actualizar una existente, si currentEvolutionId está definido)
async function saveEvolution(e) {
    e.preventDefault();
    console.log("Función saveEvolution() ejecutada.  currentPatientId:", currentPatientId);

    if (!currentPatientId) {
        showAlert("Error: No se ha seleccionado un paciente.", "danger");
        return;
    }
    const saveBtn =  document.getElementById('saveEvolutionBtn');
    //Deshabilitar botón y agregar spinner
    if(saveBtn){
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
    }

    // Recopilar datos del formulario de evolución
    const evolutionData = {
        subjective: document.getElementById('subjective').value,
        objective: document.getElementById('objective').value,
        assessment: document.getElementById('assessment').value,
        plan: document.getElementById('plan').value,
        comments: document.getElementById('comments').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(), // Usar serverTimestamp()
        psfs1: {
            activity: document.getElementById('psfs1ActivityEvo').value,
            rating: document.getElementById('psfs1RatingEvo').value
        },
        psfs2: {
            activity: document.getElementById('psfs2ActivityEvo').value,
            rating: document.getElementById('psfs2RatingEvo').value
        },
        psfs3: {
            activity: document.getElementById('psfs3ActivityEvo').value,
            rating: document.getElementById('psfs3RatingEvo').value
        }
    };
    console.log("Datos de evolución a guardar:", evolutionData);

    try {
        // Guardar o actualizar la evolución
        let docRef;
        if (currentEvolutionId) {
             // Actualizar evolución existente
            console.log("Actualizando evolución existente con ID:", currentEvolutionId);
            docRef = await db.collection("patients").doc(currentPatientId).collection("evolutions").doc(currentEvolutionId).set(evolutionData, { merge: true });
            showAlert("Evolución actualizada correctamente", "success");
        } else {
            // Guardar nueva evolución
            console.log("Guardando nueva evolución...");
            docRef = await db.collection("patients").doc(currentPatientId).collection("evolutions").add(evolutionData);
            console.log("Nueva evolución guardada con ID:", docRef.id);
            showAlert("Evolución guardada correctamente", "success");
        }

        // Limpiar el formulario y recargar la lista
        document.getElementById('evolutionForm').reset();
        loadEvolutionsForPatient(currentPatientId); // Recargar la lista de evoluciones

    } catch (error) {
        console.error("Error al guardar/actualizar evolución:", error);
        let errorMessage = "Error al guardar la evolución: " + error.message;
        if(error.code){
            errorMessage += ` (Código: ${error.code})`;
        }
        showAlert(errorMessage, "danger");
    } finally {
        //Restaurar botón.
        if(saveBtn){
            saveBtn.disabled = false;
            saveBtn.innerHTML = 'Guardar Evolución';
        }
    }
}

// Parte 8: Event Listeners y Funciones de Inicialización

// Event listener para el DOMContentLoaded (se ejecuta cuando el HTML está completamente cargado)
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM completamente cargado y analizado");

  // Inicializar tooltips de Bootstrap (si los estás usando)
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

    // --- Event Listeners para Formularios ---

    // Formulario de Paciente
    const patientForm = document.getElementById('patientForm');
    if (patientForm) {
        patientForm.addEventListener('submit', savePatient);
    } else {
        console.error("Elemento patientForm no encontrado");
    }

    // Formulario de Evolución
    const evolutionForm = document.getElementById('evolutionForm');
    if (evolutionForm) {
        evolutionForm.addEventListener('submit', saveEvolution);
    } else {
        console.error("Elemento evolutionForm no encontrado");
    }


  // --- Event Listeners para la Navegación (Pestañas) ---
    // Usar delegación de eventos para las pestañas, es mas eficiente
    const navTabs = document.querySelector('.nav-tabs'); //Asume que solo hay un elemento con la clase nav-tabs
    if(navTabs){
        navTabs.addEventListener('click', (event) => {
            if (event.target.classList.contains('nav-link')) {
                const tabId = event.target.getAttribute('href'); // Obtener el ID de la pestaña

                if (tabId === '#patientsList') {
                    loadPatients();
                } else if (tabId === '#evolutions' && currentPatientId) {
                    loadEvolutionsForPatient(currentPatientId);
                }
              // Puedes agregar más lógica para otras pestañas aquí
            }
        });
    } else {
         console.error("Elemento .nav-tabs no encontrado");
    }


    // --- Inicialización de los Sliders y sus valores ---
    updateRatingValue('psfs1Rating', 'psfs1Value');
    updateRatingValue('psfs2Rating', 'psfs2Value');
    updateRatingValue('psfs3Rating', 'psfs3Value');
    updateRatingValue('psfs1RatingEvo', 'psfs1ValueEvo');
    updateRatingValue('psfs2RatingEvo', 'psfs2ValueEvo');
    updateRatingValue('psfs3RatingEvo', 'psfs3ValueEvo');


    // --- Cargar Pacientes al Inicio (solo si estamos en la página correcta) ---
    // Verificar si estamos en la página que debe mostrar la lista de pacientes
    if (document.getElementById('patientsTableBody')) { //Verificamos si el elemento existe
        loadPatients();
    }

    // --- Otras inicializaciones (si las necesitas) ---

});

