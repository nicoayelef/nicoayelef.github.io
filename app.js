// Función para actualizar el valor mostrado de los controles deslizantes
function updateRatingValue(sliderId, valueId) {
    const slider = document.getElementById(sliderId);
    const valueDisplay = document.getElementById(valueId);
    
    if (slider && valueDisplay) {
        // Actualizar el valor inicial
        valueDisplay.textContent = slider.value;
        
        // Agregar evento para actualizar cuando cambia el deslizador
        slider.addEventListener('input', function() {
            valueDisplay.textContent = this.value;
        });
    }
}

// Función para obtener pacientes del localStorage
function getPatients() {
    const patientsJSON = localStorage.getItem('patients');
    return patientsJSON ? JSON.parse(patientsJSON) : [];
}

// Función para guardar un nuevo paciente
function savePatient() {
    // Obtener valores del formulario (mantén tu código existente para obtener los valores)
    const evaluator = document.getElementById('evaluator').value;
    const email = document.getElementById('email').value;
    const name = document.getElementById('name').value;
    const rut = document.getElementById('rut').value;
    // ... (resto de campos)
    
    // Validar campos obligatorios
    if (!evaluator || !email) {
        alert('Por favor, completa los campos obligatorios (Evaluador y Correo).');
        return;
    }
    
    // Crear objeto paciente
    const patient = {
        evaluator,
        email,
        name,
        rut,
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
        createdAt: new Date().toISOString()
    };
    
    // Guardar en Firestore
    db.collection("patients").add(patient)
        .then((docRef) => {
            console.log("Paciente guardado con ID: ", docRef.id);
            alert('Paciente guardado correctamente');
            document.getElementById('patientForm').reset();
            
            // Reiniciar valores de los deslizadores
            document.getElementById('psfs1Value').textContent = '5';
            document.getElementById('psfs2Value').textContent = '5';
            document.getElementById('psfs3Value').textContent = '5';
            
            // Recargar lista de pacientes
            loadPatients();
        })
        .catch((error) => {
            console.error("Error al guardar el paciente: ", error);
            alert('Error al guardar el paciente: ' + error.message);
        });
}

// Función para cargar pacientes en la lista
function loadPatients() {
    const patientsList = document.getElementById('patientsList');
    if (!patientsList) return;
    
    // Limpiar lista actual
    patientsList.innerHTML = '';
    
    // Mostrar mensaje de carga
    patientsList.innerHTML = '<div class="alert alert-info">Cargando pacientes...</div>';
    
    // Obtener pacientes de Firestore
    db.collection("patients").get()
        .then((querySnapshot) => {
            // Limpiar mensaje de carga
            patientsList.innerHTML = '';
            
            // Si no hay pacientes, mostrar mensaje
            if (querySnapshot.empty) {
                patientsList.innerHTML = '<div class="alert alert-info">No hay pacientes registrados. Complete el formulario para agregar un nuevo paciente.</div>';
                return;
            }
            
            // Agregar cada paciente a la lista
            querySnapshot.forEach((doc) => {
                const patient = doc.data();
                patient.id = doc.id; // Guardar el ID del documento
                
                const patientCard = document.createElement('div');
                patientCard.className = 'card patient-card mb-3';
                patientCard.innerHTML = `
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-9">
                                <h5 class="card-title">${patient.name || 'Sin nombre'}</h5>
                                <p class="card-text">
                                    <strong>RUT:</strong> ${patient.rut || 'No especificado'}<br>
                                    <strong>Edad:</strong> ${patient.age || 'No especificada'} años<br>
                                    <strong>Motivo de consulta:</strong> ${patient.consultReason ? (patient.consultReason.length > 50 ? patient.consultReason.substring(0, 50) + '...' : patient.consultReason) : 'No especificado'}
                                </p>
                            </div>
                            <div class="col-md-3 d-flex flex-column justify-content-center">
                                <button class="btn btn-primary btn-sm mb-2 view-details" data-patient-id="${patient.id}">
                                    <i class="fas fa-eye"></i> Ver detalles
                                </button>
                                <button class="btn btn-danger btn-sm delete-patient" data-patient-id="${patient.id}">
                                    <i class="fas fa-trash"></i> Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                patientsList.appendChild(patientCard);
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
            patientsList.innerHTML = `<div class="alert alert-danger">Error al cargar pacientes: ${error.message}</div>`;
        });
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
                const createdDate = patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'No disponible';
                
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
                alert('Paciente no encontrado');
            }
        })
        .catch((error) => {
            console.error("Error al obtener detalles del paciente: ", error);
            alert('Error al obtener detalles del paciente: ' + error.message);
        });
}
// Función para eliminar un paciente
function deletePatient(patientId) {
    if (confirm('¿Estás seguro de que deseas eliminar este paciente? Esta acción no se puede deshacer.')) {
        // Eliminar paciente de Firestore
        db.collection("patients").doc(patientId).delete()
            .then(() => {
                console.log("Paciente eliminado correctamente");
                alert('Paciente eliminado correctamente');
                loadPatients();
            })
            .catch((error) => {
                console.error("Error al eliminar paciente: ", error);
                alert('Error al eliminar paciente: ' + error.message);
            });
    }
}

// Función para buscar pacientes
function searchPatients() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const patientsList = document.getElementById('patientsList');
    
    if (!patientsList) return;
    
    // Limpiar lista actual
    patientsList.innerHTML = '';
    
    // Mostrar mensaje de carga
    patientsList.innerHTML = '<div class="alert alert-info">Buscando pacientes...</div>';
    
    // Buscar en Firestore
    // Nota: Firestore no permite búsquedas de texto completo, así que debemos obtener todos los documentos y filtrar en el cliente
    db.collection("patients").get()
        .then((querySnapshot) => {
            // Limpiar mensaje de carga
            patientsList.innerHTML = '';
            
            const filteredPatients = [];
            
            querySnapshot.forEach((doc) => {
                const patient = doc.data();
                patient.id = doc.id;
                
                // Filtrar por nombre o RUT
                if ((patient.name && patient.name.toLowerCase().includes(searchInput)) || 
                    (patient.rut && patient.rut.toLowerCase().includes(searchInput))) {
                    filteredPatients.push(patient);
                }
            });
            
            // Si no hay resultados, mostrar mensaje
            if (filteredPatients.length === 0) {
                patientsList.innerHTML = '<div class="alert alert-info">No se encontraron pacientes que coincidan con la búsqueda.</div>';
                return;
            }
            
            // Mostrar pacientes filtrados
            filteredPatients.forEach(patient => {
                const patientCard = document.createElement('div');
                patientCard.className = 'card patient-card mb-3';
                patientCard.innerHTML = `
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-9">
                                <h5 class="card-title">${patient.name || 'Sin nombre'}</h5>
                                <p class="card-text">
                                    <strong>RUT:</strong> ${patient.rut || 'No especificado'}<br>
                                    <strong>Edad:</strong> ${patient.age || 'No especificada'} años<br>
                                    <strong>Motivo de consulta:</strong> ${patient.consultReason ? (patient.consultReason.length > 50 ? patient.consultReason.substring(0, 50) + '...' : patient.consultReason) : 'No especificado'}
                                </p>
                            </div>
                            <div class="col-md-3 d-flex flex-column justify-content-center">
                                <button class="btn btn-primary btn-sm mb-2 view-details" data-patient-id="${patient.id}">
                                    <i class="fas fa-eye"></i> Ver detalles
                                </button>
                                <button class="btn btn-danger btn-sm delete-patient" data-patient-id="${patient.id}">
                                    <i class="fas fa-trash"></i> Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                patientsList.appendChild(patientCard);
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
            patientsList.innerHTML = `<div class="alert alert-danger">Error al buscar pacientes: ${error.message}</div>`;
        });
}
function exportPatientToPDF(patientId) {
    // Verificar que jsPDF esté disponible
    if (typeof jspdf === 'undefined') {
        alert('La biblioteca jsPDF no está cargada correctamente. No se puede exportar a PDF.');
        return;
    }
    
    // Obtener paciente de Firestore
    db.collection("patients").doc(patientId).get()
        .then((doc) => {
            if (doc.exists) {
                const patient = doc.data();
                patient.id = doc.id;
                
                try {
                    // Crear nuevo documento PDF
                    const pdf = new jspdf.jsPDF();
                    
                    // Variables para controlar la posición
                    let y = 20;
                    const pageWidth = pdf.internal.pageSize.width;
                    const margin = 20;
                    const contentWidth = pageWidth - 2 * margin;
                    
                    // Función para agregar texto con saltos de línea automáticos
                    function addWrappedText(text, x, y, maxWidth, lineHeight) {
                        if (!text) return y;
                        
                        const lines = pdf.splitTextToSize(text, maxWidth);
                        pdf.text(lines, x, y);
                        return y + (lines.length * lineHeight);
                    }
                    
                    // Encabezado del documento
                    pdf.setFontSize(18);
                    pdf.setFont(undefined, 'bold');
                    pdf.text('FICHA CLÍNICA KINESIOLÓGICA', pageWidth / 2, y, { align: 'center' });
                    y += 10;
                    
                    // Información personal
                    pdf.setFontSize(14);
                    pdf.text('INFORMACIÓN PERSONAL', margin, y);
                    y += 10;
                    
                    pdf.setFontSize(11);
                    pdf.setFont(undefined, 'normal');
                    
                    // Información personal
                    y = addWrappedText(`Nombre: ${patient.name || 'No especificado'}`, margin, y, contentWidth, 7);
                    y = addWrappedText(`RUT: ${patient.rut || 'No especificado'}`, margin, y, contentWidth, 7);
                    y = addWrappedText(`Edad: ${patient.age || 'No especificada'} años`, margin, y, contentWidth, 7);
                    y = addWrappedText(`Fecha de nacimiento: ${patient.birthdate || 'No especificada'}`, margin, y, contentWidth, 7);
                    y = addWrappedText(`Teléfono: ${patient.contactNumber || 'No especificado'}`, margin, y, contentWidth, 7);
                    y = addWrappedText(`Email: ${patient.patientEmail || 'No especificado'}`, margin, y, contentWidth, 7);
                    y = addWrappedText(`Nacionalidad: ${patient.nationality || 'No especificada'}`, margin, y, contentWidth, 7);
                    y = addWrappedText(`Estado civil: ${patient.civilStatus || 'No especificado'}`, margin, y, contentWidth, 7);
                    y = addWrappedText(`Nivel educacional: ${patient.education || 'No especificado'}`, margin, y, contentWidth, 7);
                    y = addWrappedText(`Dirección: ${patient.address || 'No especificada'}`, margin, y, contentWidth, 7);
                    y = addWrappedText(`Contacto emergencia: ${patient.emergencyContact || 'No especificado'}`, margin, y, contentWidth, 7);
                    y = addWrappedText(`Lateralidad: ${patient.laterality || 'No especificada'}`, margin, y, contentWidth, 7);
                    y = addWrappedText(`Ocupación: ${patient.occupation || 'No especificada'}`, margin, y, contentWidth, 7);
                    
                    y += 10;
                    
                    // Verificar si necesitamos una nueva página
                    if (y > 250) {
                        pdf.addPage();
                        y = 20;
                    }
                    
                    // Información clínica
                    pdf.setFontSize(14);
                    pdf.setFont(undefined, 'bold');
                    pdf.text('INFORMACIÓN CLÍNICA', margin, y);
                    y += 10;
                    
                    pdf.setFontSize(11);
                    pdf.setFont(undefined, 'normal');
                    
                    y = addWrappedText(`Motivo de consulta: ${patient.consultReason || 'No especificado'}`, margin, y, contentWidth, 7);
                    y = addWrappedText(`Diagnóstico: ${patient.diagnosis || 'No especificado'}`, margin, y, contentWidth, 7);
                    y = addWrappedText(`Expectativas y metas: ${patient.expectations || 'No especificadas'}`, margin, y, contentWidth, 7);
                    
                    y += 10;
                    
                    // Verificar si necesitamos una nueva página
                    if (y > 250) {
                        pdf.addPage();
                        y = 20;
                    }
                    
                    // Anamnesis
                    pdf.setFontSize(14);
                    pdf.setFont(undefined, 'bold');
                    pdf.text('ANAMNESIS', margin, y);
                    y += 10;
                    
                    pdf.setFontSize(11);
                    pdf.setFont(undefined, 'normal');
                    
                    y = addWrappedText(`Anamnesis próxima: ${patient.proximateAnamnesis || 'No especificada'}`, margin, y, contentWidth, 7);
                    y = addWrappedText(`Anamnesis remota: ${patient.remoteAnamnesis || 'No especificada'}`, margin, y, contentWidth, 7);
                    
                    y += 10;
                    
                    // Verificar si necesitamos una nueva página
                    if (y > 250) {
                        pdf.addPage();
                        y = 20;
                    }
                    
                    // Hábitos y entorno
                    pdf.setFontSize(14);
                    pdf.setFont(undefined, 'bold');
                    pdf.text('HÁBITOS Y ENTORNO', margin, y);
                    y += 10;
                    
                    pdf.setFontSize(11);
                    pdf.setFont(undefined, 'normal');
                    
                    y = addWrappedText(`Hábitos y hobbies: ${patient.habitsHobbies || 'No especificados'}`, margin, y, contentWidth, 7);
                    y = addWrappedText(`Hogar y red de apoyo: ${patient.homeSupport || 'No especificados'}`, margin, y, contentWidth, 7);
                    
                    y += 10;
                    
                    // Verificar si necesitamos una nueva página
                    if (y > 250) {
                        pdf.addPage();
                        y = 20;
                    }
                    
                    // Cuestionarios PSFS
                    pdf.setFontSize(14);
                    pdf.setFont(undefined, 'bold');
                    pdf.text('CUESTIONARIOS PSFS', margin, y);
                    y += 10;
                    
                    pdf.setFontSize(11);
                    pdf.setFont(undefined, 'normal');
                    
                    if (patient.psfs1 && patient.psfs1.activity) {
                        y = addWrappedText(`PSFS 1: ${patient.psfs1.activity} - Puntuación: ${patient.psfs1.rating || 'No especificada'}`, margin, y, contentWidth, 7);
                    }
                    
                    if (patient.psfs2 && patient.psfs2.activity) {
                        y = addWrappedText(`PSFS 2: ${patient.psfs2.activity} - Puntuación: ${patient.psfs2.rating || 'No especificada'}`, margin, y, contentWidth, 7);
                    }
                    
                    if (patient.psfs3 && patient.psfs3.activity) {
                        y = addWrappedText(`PSFS 3: ${patient.psfs3.activity} - Puntuación: ${patient.psfs3.rating || 'No especificada'}`, margin, y, contentWidth, 7);
                    }
                    
                    y = addWrappedText(`Cuestionario adicional: ${patient.extraQuestionnaire || 'No especificado'}`, margin, y, contentWidth, 7);
                    
                    y += 10;
                    
                    // Verificar si necesitamos una nueva página
                    if (y > 250) {
                        pdf.addPage();
                        y = 20;
                    }
                    
                    // Evaluación física
                    pdf.setFontSize(14);
                    pdf.setFont(undefined, 'bold');
                    pdf.text('EVALUACIÓN FÍSICA', margin, y);
                    y += 10;
                    
                    pdf.setFontSize(11);
                    pdf.setFont(undefined, 'normal');
                    
                    y = addWrappedText(`Signos vitales: ${patient.vitalSigns || 'No especificados'}`, margin, y, contentWidth, 7);
                    y = addWrappedText(`Antropometría: ${patient.anthropometry || 'No especificada'}`, margin, y, contentWidth, 7);
                    y = addWrappedText(`Examen físico: ${patient.physicalExam || 'No especificado'}`, margin, y, contentWidth, 7);
                    
                    // Guardar el PDF
                    pdf.save(`Ficha_${patient.name || 'Paciente'}_${patient.rut || ''}.pdf`);
                    
                } catch (error) {
                    console.error("Error al generar PDF:", error);
                    alert("Error al generar PDF: " + error.message);
                }
            } else {
                alert('Paciente no encontrado');
            }
        })
        .catch((error) => {
            console.error("Error al obtener datos del paciente: ", error);
            alert('Error al generar PDF: ' + error.message);
        });
} 
// Inicializar los controles deslizantes y eventos cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar los valores de los deslizadores
    updateRatingValue('psfs1Rating', 'psfs1Value');
    updateRatingValue('psfs2Rating', 'psfs2Value');
    updateRatingValue('psfs3Rating', 'psfs3Value');
    
    // Cargar la lista de pacientes
    loadPatients();
    
    // Configurar el evento de envío del formulario
    const patientForm = document.getElementById('patientForm');
    if (patientForm) {
        patientForm.addEventListener('submit', function(e) {
            e.preventDefault();
            savePatient();
        });
    }
    
    // Configurar el botón de búsqueda
    const searchButton = document.getElementById('searchButton');
    if (searchButton) {
        searchButton.addEventListener('click', searchPatients);
    }
    
    // Configurar el campo de búsqueda para buscar al presionar Enter
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchPatients();
            }
        });
    }
    
    // Configurar el botón de exportar todos
    const exportAllButton = document.getElementById('exportAllButton');
    if (exportAllButton) {
        exportAllButton.addEventListener('click', function() {
            const patients = getPatients();
            if (patients.length === 0) {
                alert('No hay pacientes para exportar.');
                return;
            }
            alert('Funcionalidad de exportar todos los pacientes en desarrollo.');
        });
    }
});
