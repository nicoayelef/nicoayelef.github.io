function updateRatingValue(sliderId, valueId) {
    const slider = document.getElementById(sliderId);
    const valueDisplay = document.getElementById(valueId);
    
    if (slider && valueDisplay) {
        // Actualizar el valor inicial
        valueDisplay.textContent = slider.value;
        
        // Eliminar eventos anteriores para evitar duplicados
        const newSlider = slider.cloneNode(true);
        slider.parentNode.replaceChild(newSlider, slider);
        
        // Agregar evento para actualizar cuando cambia el deslizador
        newSlider.addEventListener('input', function() {
            document.getElementById(valueId).textContent = this.value;
        });
    } else {
        console.error(`Elementos no encontrados: slider=${sliderId}, value=${valueId}`);
    }
}

// Función para obtener pacientes del localStorage
function getPatients() {
    const patientsJSON = localStorage.getItem('patients');
    return patientsJSON ? JSON.parse(patientsJSON) : [];
}

// Función para guardar un nuevo paciente
function savePatient(e) {
    e.preventDefault();
    
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
        createdAt: new Date().toISOString()
    };
    
    // Guardar en Firestore
    db.collection("patients").add(patient)
        .then((docRef) => {
            alert('Paciente guardado correctamente');
            document.getElementById('patientForm').reset();
            // Actualizar la lista de pacientes si estamos en la pestaña de registros
            if (document.getElementById('records-tab').classList.contains('active')) {
                loadPatients();
            }
        })
        .catch((error) => {
            console.error("Error al guardar paciente: ", error);
            alert('Error al guardar paciente: ' + error.message);
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
        savePatient(e); // Pasando el evento como parámetro
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
// Funciones para manejar evoluciones

// Cargar pacientes en el selector
function loadPatientsIntoSelect() {
    const patientSelect = document.getElementById('patientSelect');
    if (!patientSelect) return;
    
    // Limpiar opciones existentes
    patientSelect.innerHTML = '<option value="">Seleccione un paciente</option>';
    
    // Obtener pacientes de Firestore
    db.collection("patients").get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const patient = doc.data();
                const option = document.createElement('option');
                option.value = doc.id;
                option.textContent = `${patient.name} (${patient.rut})`;
                patientSelect.appendChild(option);
            });
        })
        .catch((error) => {
            console.error("Error cargando pacientes: ", error);
            alert("Error al cargar la lista de pacientes");
        });
}

// Mostrar actividades PSFS del paciente seleccionado
function loadPatientPSFS() {
    const patientId = document.getElementById('patientSelect').value;
    const psfsUpdateContainer = document.getElementById('psfsUpdateContainer');
    
    if (!patientId || !psfsUpdateContainer) return;
    
    psfsUpdateContainer.innerHTML = '<p>Cargando actividades PSFS...</p>';
    
    db.collection("patients").doc(patientId).get()
        .then((doc) => {
            if (doc.exists) {
                const patient = doc.data();
                let psfsHtml = '';
                
                // Verificar si el paciente tiene actividades PSFS
                if (patient.psfs1 && patient.psfs1.activity) {
                    psfsHtml += createPSFSUpdateHtml('psfs1', patient.psfs1.activity, patient.psfs1.rating);
                }
                
                if (patient.psfs2 && patient.psfs2.activity) {
                    psfsHtml += createPSFSUpdateHtml('psfs2', patient.psfs2.activity, patient.psfs2.rating);
                }
                
                if (patient.psfs3 && patient.psfs3.activity) {
                    psfsHtml += createPSFSUpdateHtml('psfs3', patient.psfs3.activity, patient.psfs3.rating);
                }
                
                if (psfsHtml) {
                    psfsUpdateContainer.innerHTML = psfsHtml;
                    // Inicializar los sliders
                    document.querySelectorAll('.psfs-update-slider').forEach(slider => {
                        updateRatingValue(slider.id, slider.value);
                        slider.addEventListener('input', function() {
                            updateRatingValue(this.id, this.value);
                        });
                    });
                } else {
                    psfsUpdateContainer.innerHTML = '<p>Este paciente no tiene actividades PSFS registradas.</p>';
                }
            } else {
                psfsUpdateContainer.innerHTML = '<p>No se encontró información del paciente.</p>';
            }
        })
        .catch((error) => {
            console.error("Error cargando PSFS: ", error);
            psfsUpdateContainer.innerHTML = '<p>Error al cargar actividades PSFS.</p>';
        });
}

// Crear HTML para actualización de PSFS
function createPSFSUpdateHtml(psfsId, activity, currentRating) {
    return `
        <div class="mb-3 border p-3 rounded">
            <label class="form-label"><strong>${activity}</strong></label>
            <div class="d-flex align-items-center">
                <input type="range" class="form-range psfs-update-slider" id="${psfsId}UpdateSlider" name="${psfsId}Update" min="1" max="10" value="${currentRating || 1}">
                <span class="ms-2" id="${psfsId}UpdateValue">${currentRating || 1}</span>
            </div>
            <div class="d-flex justify-content-between">
                <small>No lo puede realizar</small>
                <small>Lo logra igual o mejor que antes</small>
            </div>
        </div>
    `;
}

// Guardar una nueva evolución
function saveEvolution(event) {
    event.preventDefault();
    
    const patientId = document.getElementById('patientSelect').value;
    const date = document.getElementById('evolutionDate').value;
    const progress = document.getElementById('evolutionProgress').value;
    const treatment = document.getElementById('evolutionTreatment').value;
    const plan = document.getElementById('evolutionPlan').value;
    const evaluator = document.getElementById('evolutionEvaluator').value;
    
    if (!patientId || !date || !progress || !treatment || !plan || !evaluator) {
        alert('Por favor complete todos los campos requeridos');
        return;
    }
    
    // Crear objeto de evolución
    const evolution = {
        patientId: patientId,
        date: date,
        progress: progress,
        treatment: treatment,
        plan: plan,
        evaluator: evaluator,
        createdAt: new Date().toISOString()
    };
    
    // Añadir actualizaciones de PSFS si existen
    const psfs1Slider = document.getElementById('psfs1UpdateSlider');
    if (psfs1Slider) {
        const activity = psfs1Slider.closest('.mb-3').querySelector('.form-label strong').textContent;
        evolution.psfs1Update = {
            activity: activity,
            rating: parseInt(psfs1Slider.value)
        };
    }
    
    const psfs2Slider = document.getElementById('psfs2UpdateSlider');
    if (psfs2Slider) {
        const activity = psfs2Slider.closest('.mb-3').querySelector('.form-label strong').textContent;
        evolution.psfs2Update = {
            activity: activity,
            rating: parseInt(psfs2Slider.value)
        };
    }
    
    const psfs3Slider = document.getElementById('psfs3UpdateSlider');
    if (psfs3Slider) {
        const activity = psfs3Slider.closest('.mb-3').querySelector('.form-label strong').textContent;
        evolution.psfs3Update = {
            activity: activity,
            rating: parseInt(psfs3Slider.value)
        };
    }
    
    // Guardar en Firestore
    db.collection("evolutions").add(evolution)
        .then((docRef) => {
            alert('Evolución guardada correctamente');
            document.getElementById('evolutionForm').reset();
            document.getElementById('psfsUpdateContainer').innerHTML = '';
            loadEvolutions();
        })
        .catch((error) => {
            console.error("Error al guardar evolución: ", error);
            alert('Error al guardar la evolución');
        });
}

// Cargar y mostrar evoluciones
function loadEvolutions() {
    const evolutionsTableBody = document.getElementById('evolutionsTableBody');
    if (!evolutionsTableBody) return;
    
    evolutionsTableBody.innerHTML = '<tr><td colspan="4" class="text-center">Cargando evoluciones...</td></tr>';
    
    db.collection("evolutions").orderBy("date", "desc").get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                evolutionsTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No hay evoluciones registradas</td></tr>';
                return;
            }
            
            evolutionsTableBody.innerHTML = '';
            const patientPromises = [];
            
            querySnapshot.forEach((doc) => {
                const evolution = doc.data();
                const patientPromise = db.collection("patients").doc(evolution.patientId).get();
                patientPromises.push({ evolution, doc, patientPromise });
            });
            
            // Resolver todas las promesas de pacientes
            Promise.all(patientPromises.map(item => item.patientPromise))
                .then(patientDocs => {
                    patientPromises.forEach((item, index) => {
                        const patientDoc = patientDocs[index];
                        const evolution = item.evolution;
                        const doc = item.doc;
                        
                        let patientName = "Paciente desconocido";
                        let patientRut = "";
                        
                        if (patientDoc.exists) {
                            const patientData = patientDoc.data();
                            patientName = patientData.name || "Sin nombre";
                            patientRut = patientData.rut || "";
                        }
                        
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${patientName} ${patientRut ? `(${patientRut})` : ''}</td>
                            <td>${formatDate(evolution.date)}</td>
                            <td>${evolution.evaluator}</td>
                            <td>
                                <button class="btn btn-sm btn-primary view-evolution" data-id="${doc.id}">
                                    <i class="fas fa-eye"></i> Ver
                                </button>
                            </td>
                        `;
                        
                        evolutionsTableBody.appendChild(row);
                    });
                    
                    // Añadir event listeners a los botones de ver
                    document.querySelectorAll('.view-evolution').forEach(button => {
                        button.addEventListener('click', function() {
                            const evolutionId = this.getAttribute('data-id');
                            showEvolutionDetails(evolutionId);
                        });
                    });
                })
                .catch(error => {
                    console.error("Error cargando datos de pacientes: ", error);
                    evolutionsTableBody.innerHTML = '<tr><td colspan="4" class="text-center">Error al cargar evoluciones</td></tr>';
                });
        })
        .catch((error) => {
            console.error("Error cargando evoluciones: ", error);
            evolutionsTableBody.innerHTML = '<tr><td colspan="4" class="text-center">Error al cargar evoluciones</td></tr>';
        });
}

// Formatear fecha para mostrar
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', options);
}

// Mostrar detalles de una evolución
function showEvolutionDetails(evolutionId) {
    const evolutionDetailsContent = document.getElementById('evolutionDetailsContent');
    const deleteEvolutionBtn = document.getElementById('deleteEvolutionBtn');
    const exportEvolutionBtn = document.getElementById('exportEvolutionBtn');
    
    evolutionDetailsContent.innerHTML = '<p class="text-center">Cargando detalles...</p>';
    
    // Obtener datos de la evolución
    db.collection("evolutions").doc(evolutionId).get()
        .then((doc) => {
            if (doc.exists) {
                const evolution = doc.data();
                
                // Obtener datos del paciente
                db.collection("patients").doc(evolution.patientId).get()
                    .then((patientDoc) => {
                        let patientName = "Paciente desconocido";
                        let patientRut = "";
                        
                        if (patientDoc.exists) {
                            const patientData = patientDoc.data();
                            patientName = patientData.name || "Sin nombre";
                            patientRut = patientData.rut || "";
                        }
                        
                        // Construir HTML de detalles
                        let detailsHtml = `
                            <div class="row mb-3">
                                <div class="col-md-6">
                                    <h5>Paciente:</h5>
                                    <p>${patientName} ${patientRut ? `(${patientRut})` : ''}</p>
                                </div>
                                <div class="col-md-6">
                                    <h5>Fecha:</h5>
                                    <p>${formatDate(evolution.date)}</p>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <h5>Progreso del Paciente:</h5>
                                <p>${evolution.progress}</p>
                            </div>
                            
                            <div class="mb-3">
                                <h5>Tratamiento Realizado:</h5>
                                <p>${evolution.treatment}</p>
                            </div>
                            
                            <div class="mb-3">
                                <h5>Plan y Recomendaciones:</h5>
                                <p>${evolution.plan}</p>
                            </div>
                            
                            <div class="mb-3">
                                <h5>Kinesiólogo Evaluador:</h5>
                                <p>${evolution.evaluator}</p>
                            </div>
                        `;
                        
                        // Añadir actualizaciones de PSFS si existen
                        if (evolution.psfs1Update || evolution.psfs2Update || evolution.psfs3Update) {
                            detailsHtml += `<div class="mb-3"><h5>Actualización de PSFS:</h5><div class="row">`;
                            
                            if (evolution.psfs1Update) {
                                detailsHtml += createPSFSDetailHtml(evolution.psfs1Update);
                            }
                            
                            if (evolution.psfs2Update) {
                                detailsHtml += createPSFSDetailHtml(evolution.psfs2Update);
                            }
                            
                            if (evolution.psfs3Update) {
                                detailsHtml += createPSFSDetailHtml(evolution.psfs3Update);
                            }
                            
                            detailsHtml += `</div></div>`;
                        }
                        
                        evolutionDetailsContent.innerHTML = detailsHtml;
                        
                        // Configurar botones
                        deleteEvolutionBtn.onclick = function() {
                            if (confirm('¿Está seguro de que desea eliminar esta evolución?')) {
                                deleteEvolution(evolutionId);
                            }
                        };
                        
                        exportEvolutionBtn.onclick = function() {
                            exportEvolutionToPDF(evolutionId);
                        };
                        
                        // Mostrar modal
                        const evolutionDetailsModal = new bootstrap.Modal(document.getElementById('evolutionDetailsModal'));
                        evolutionDetailsModal.show();
                    })
                    .catch((error) => {
                        console.error("Error obteniendo datos del paciente: ", error);
                        evolutionDetailsContent.innerHTML = '<p class="text-center">Error al cargar detalles del paciente</p>';
                    });
            } else {
                evolutionDetailsContent.innerHTML = '<p class="text-center">No se encontró la evolución</p>';
            }
        })
        .catch((error) => {
            console.error("Error obteniendo evolución: ", error);
            evolutionDetailsContent.innerHTML = '<p class="text-center">Error al cargar detalles</p>';
        });
}

// Crear HTML para mostrar PSFS en detalles
function createPSFSDetailHtml(psfsUpdate) {
    return `
        <div class="col-md-4 mb-2">
            <div class="card">
                <div class="card-body">
                    <h6 class="card-title">${psfsUpdate.activity}</h6>
                    <div class="progress">
                        <div class="progress-bar" role="progressbar" style="width: ${psfsUpdate.rating * 10}%;" 
                            aria-valuenow="${psfsUpdate.rating}" aria-valuemin="1" aria-valuemax="10">
                            ${psfsUpdate.rating}/10
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Eliminar una evolución
function deleteEvolution(evolutionId) {
    db.collection("evolutions").doc(evolutionId).delete()
        .then(() => {
            alert('Evolución eliminada correctamente');
            // Cerrar modal
            const evolutionDetailsModal = bootstrap.Modal.getInstance(document.getElementById('evolutionDetailsModal'));
            evolutionDetailsModal.hide();
            // Recargar evoluciones
            loadEvolutions();
        })
        .catch((error) => {
            console.error("Error eliminando evolución: ", error);
            alert('Error al eliminar la evolución');
        });
}

// Exportar evolución a PDF
function exportEvolutionToPDF(evolutionId) {
    // Verificar si jsPDF está disponible
    if (typeof jspdf === 'undefined') {
        alert('Error: La biblioteca jsPDF no está disponible');
        return;
    }
    
    // Obtener datos de la evolución
    db.collection("evolutions").doc(evolutionId).get()
        .then((doc) => {
            if (doc.exists) {
                const evolution = doc.data();
                
                // Obtener datos del paciente
                db.collection("patients").doc(evolution.patientId).get()
                    .then((patientDoc) => {
                        let patientName = "Paciente desconocido";
                        let patientRut = "";
                        
                        if (patientDoc.exists) {
                            const patientData = patientDoc.data();
                            patientName = patientData.name || "Sin nombre";
                            patientRut = patientData.rut || "";
                        }
                        
                        // Crear PDF
                        const pdf = new jspdf.jsPDF();
                        
                        // Configuración de página
                        pdf.setFont("helvetica", "bold");
                        pdf.setFontSize(16);
                        pdf.text("Evolución Kinesiológica", 105, 20, { align: "center" });
                        
                        pdf.setFont("helvetica", "normal");
                        pdf.setFontSize(12);
                        
                        // Información del paciente
                        pdf.setFont("helvetica", "bold");
                        pdf.text("Información del Paciente:", 20, 35);
                        pdf.setFont("helvetica", "normal");
                        pdf.text(`Nombre: ${patientName}`, 20, 45);
                        if (patientRut) {
                            pdf.text(`RUT: ${patientRut}`, 20, 52);
                        }
                        
                        // Información de la evolución
                        pdf.setFont("helvetica", "bold");
                        pdf.text("Detalles de la Evolución:", 20, 65);
                        pdf.setFont("helvetica", "normal");
                        pdf.text(`Fecha: ${formatDate(evolution.date)}`, 20, 75);
                        pdf.text(`Kinesiólogo Evaluador: ${evolution.evaluator}`, 20, 82);
                        
                        // Progreso
                        pdf.setFont("helvetica", "bold");
                        pdf.text("Progreso del Paciente:", 20, 95);
                        pdf.setFont("helvetica", "normal");
                        
                        // Manejar texto largo con saltos de línea automáticos
                        const splitProgress = pdf.splitTextToSize(evolution.progress, 170);
                        pdf.text(splitProgress, 20, 105);
                        
                        // Tratamiento
                        let yPos = 105 + (splitProgress.length * 7);
                        pdf.setFont("helvetica", "bold");
                        pdf.text("Tratamiento Realizado:", 20, yPos);
                        pdf.setFont("helvetica", "normal");
                        
                        const splitTreatment = pdf.splitTextToSize(evolution.treatment, 170);
                        yPos += 10;
                        pdf.text(splitTreatment, 20, yPos);
                        
                        // Plan
                        yPos += (splitTreatment.length * 7);
                        pdf.setFont("helvetica", "bold");
                        pdf.text("Plan y Recomendaciones:", 20, yPos);
                        pdf.setFont("helvetica", "normal");
                        
                        const splitPlan = pdf.splitTextToSize(evolution.plan, 170);
                        yPos += 10;
                        pdf.text(splitPlan, 20, yPos);
                        
                        // PSFS
                        if (evolution.psfs1Update || evolution.psfs2Update || evolution.psfs3Update) {
                            yPos += (splitPlan.length * 7) + 10;
                            
                            // Verificar si necesitamos una nueva página
                            if (yPos > 250) {
                                pdf.addPage();
                                yPos = 20;
                            }
                            
                            pdf.setFont("helvetica", "bold");
                            pdf.text("Actualización de PSFS:", 20, yPos);
                            pdf.setFont("helvetica", "normal");
                            yPos += 10;
                            
                            if (evolution.psfs1Update) {
                                pdf.text(`• ${evolution.psfs1Update.activity}: ${evolution.psfs1Update.rating}/10`, 20, yPos);
                                yPos += 7;
                            }
                            
                            if (evolution.psfs2Update) {
                                pdf.text(`• ${evolution.psfs2Update.activity}: ${evolution.psfs2Update.rating}/10`, 20, yPos);
                                yPos += 7;
                            }
                            
                            if (evolution.psfs3Update) {
                                pdf.text(`• ${evolution.psfs3Update.activity}: ${evolution.psfs3Update.rating}/10`, 20, yPos);
                            }
                        }
                        
                        // Guardar PDF
                        pdf.save(`Evolucion_${patientName.replace(/\s+/g, '_')}_${evolution.date}.pdf`);
                    })
                    .catch((error) => {
                        console.error("Error obteniendo datos del paciente: ", error);
                        alert('Error al exportar a PDF: No se pudieron obtener los datos del paciente');
                    });
            } else {
                alert('Error al exportar a PDF: No se encontró la evolución');
            }
        })
        .catch((error) => {
            console.error("Error obteniendo evolución: ", error);
            alert('Error al exportar a PDF');
        });
}

// Buscar evoluciones
function searchEvolutions() {
    const searchTerm = document.getElementById('searchEvolution').value.toLowerCase();
    
    if (!searchTerm) {
        loadEvolutions();
        return;
    }
    
    const evolutionsTableBody = document.getElementById('evolutionsTableBody');
    evolutionsTableBody.innerHTML = '<tr><td colspan="4" class="text-center">Buscando...</td></tr>';
    
    // Primero buscar pacientes que coincidan con el término de búsqueda
    db.collection("patients").get()
        .then((patientsSnapshot) => {
            const matchingPatientIds = [];
            
            patientsSnapshot.forEach((doc) => {
                const patient = doc.data();
                if (
                    (patient.name && patient.name.toLowerCase().includes(searchTerm)) ||
                    (patient.rut && patient.rut.toLowerCase().includes(searchTerm))
                ) {
                    matchingPatientIds.push(doc.id);
                }
            });
            
            // Si no hay pacientes coincidentes y el término no parece ser un nombre o RUT
            if (matchingPatientIds.length === 0) {
                evolutionsTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No se encontraron resultados</td></tr>';
                return;
            }
            
            // Buscar evoluciones para los pacientes coincidentes
            db.collection("evolutions").get()
                .then((evolutionsSnapshot) => {
                    const matchingEvolutions = [];
                    
                    evolutionsSnapshot.forEach((doc) => {
                        const evolution = doc.data();
                        if (matchingPatientIds.includes(evolution.patientId)) {
                            matchingEvolutions.push({ doc, evolution });
                        }
                    });
                    
                    if (matchingEvolutions.length === 0) {
                        evolutionsTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No se encontraron evoluciones para los pacientes buscados</td></tr>';
                        return;
                    }
                    
                    // Mostrar evoluciones coincidentes
                    evolutionsTableBody.innerHTML = '';
                    
                    // Crear un mapa de pacientes para evitar múltiples consultas
                    const patientMap = {};
                    patientsSnapshot.forEach(doc => {
                        patientMap[doc.id] = doc.data();
                    });
                    
                    matchingEvolutions.forEach((item) => {
                        const evolution = item.evolution;
                        const doc = item.doc;
                        const patient = patientMap[evolution.patientId] || {};
                        
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${patient.name || 'Paciente desconocido'} ${patient.rut ? `(${patient.rut})` : ''}</td>
                            <td>${formatDate(evolution.date)}</td>
                            <td>${evolution.evaluator}</td>
                            <td>
                                <button class="btn btn-sm btn-primary view-evolution" data-id="${doc.id}">
                                    <i class="fas fa-eye"></i> Ver
                                </button>
                            </td>
                        `;
                        
                        evolutionsTableBody.appendChild(row);
                    });
                    
                    // Añadir event listeners a los botones de ver
                    document.querySelectorAll('.view-evolution').forEach(button => {
                        button.addEventListener('click', function() {
                            const evolutionId = this.getAttribute('data-id');
                            showEvolutionDetails(evolutionId);
                        });
                    });
                })
                .catch((error) => {
                    console.error("Error buscando evoluciones: ", error);
                    evolutionsTableBody.innerHTML = '<tr><td colspan="4" class="text-center">Error al buscar evoluciones</td></tr>';
                });
        })
        .catch((error) => {
            console.error("Error buscando pacientes: ", error);
            evolutionsTableBody.innerHTML = '<tr><td colspan="4" class="text-center">Error al buscar pacientes</td></tr>';
        });
}

// Inicializar eventos cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
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
    
    // Event listener para la búsqueda de evoluciones
    const searchEvolutionInput = document.getElementById('searchEvolution');
    if (searchEvolutionInput) {
        searchEvolutionInput.addEventListener('input', function() {
            // Debounce para evitar muchas búsquedas
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(searchEvolutions, 500);
        });
    }    
});
