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
    
    const patients = getPatients();
    
    // Limpiar lista actual
    patientsList.innerHTML = '';
    
    // Si no hay pacientes, mostrar mensaje
    if (patients.length === 0) {
        patientsList.innerHTML = '<div class="alert alert-info">No hay pacientes registrados. Complete el formulario para agregar un nuevo paciente.</div>';
        return;
    }
    
    // Agregar cada paciente a la lista
    patients.forEach(patient => {
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
}
// Función para mostrar detalles del paciente
function showPatientDetails(patientId) {
    const patients = getPatients();
    const patient = patients.find(p => p.id === patientId);
    
    if (!patient) {
        alert('Paciente no encontrado');
        return;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('patientDetailsModal'));
    const modalContent = document.getElementById('patientDetailsContent');
    
    // Formatear fecha de creación
    const createdDate = patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'No disponible';
    
    // Construir contenido del modal con todos los detalles del paciente
    modalContent.innerHTML = `
        <div class="container-fluid">
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
                </div>
            </div>

            <div class="row mb-4">
                <div class="col-12">
                    <h4 class="text-primary">Información Clínica</h4>
                    <hr>
                </div>
                <div class="col-md-12">
                    <p><strong>Evaluador:</strong> ${patient.evaluator || 'No especificado'}</p>
                    <p><strong>Fecha de evaluación:</strong> ${createdDate}</p>
                    <p><strong>Ocupación:</strong> ${patient.occupation || 'No especificada'}</p>
                    <p><strong>Motivo de consulta:</strong> ${patient.consultReason || 'No especificado'}</p>
                    <p><strong>Diagnóstico:</strong> ${patient.diagnosis || 'No especificado'}</p>
                    <p><strong>Expectativas:</strong> ${patient.expectations || 'No especificadas'}</p>
                </div>
            </div>

            <div class="row mb-4">
                <div class="col-12">
                    <h4 class="text-primary">Anamnesis</h4>
                    <hr>
                </div>
                <div class="col-md-6">
                    <h5>Anamnesis próxima</h5>
                    <p>${patient.proximateAnamnesis || 'No especificada'}</p>
                </div>
                <div class="col-md-6">
                    <h5>Anamnesis remota</h5>
                    <p>${patient.remoteAnamnesis || 'No especificada'}</p>
                </div>
            </div>

            <div class="row mb-4">
                <div class="col-12">
                    <h4 class="text-primary">Hábitos y Entorno</h4>
                    <hr>
                </div>
                <div class="col-md-6">
                    <h5>Hábitos y hobbies</h5>
                    <p>${patient.habitsHobbies || 'No especificados'}</p>
                </div>
                <div class="col-md-6">
                    <h5>Hogar y red de apoyo</h5>
                    <p>${patient.homeSupport || 'No especificados'}</p>
                </div>
            </div>

            <div class="row mb-4">
                <div class="col-12">
                    <h4 class="text-primary">Cuestionarios</h4>
                    <hr>
                </div>
                <div class="col-md-12">
                    ${patient.psfs1 && patient.psfs1.activity ? 
                        `<p><strong>PSFS 1:</strong> ${patient.psfs1.activity} - Valoración: ${patient.psfs1.rating}/10</p>` : 
                        '<p><strong>PSFS 1:</strong> No especificado</p>'
                    }
                    ${patient.psfs2 && patient.psfs2.activity ? 
                        `<p><strong>PSFS 2:</strong> ${patient.psfs2.activity} - Valoración: ${patient.psfs2.rating}/10</p>` : 
                        '<p><strong>PSFS 2:</strong> No especificado</p>'
                    }
                    ${patient.psfs3 && patient.psfs3.activity ? 
                        `<p><strong>PSFS 3:</strong> ${patient.psfs3.activity} - Valoración: ${patient.psfs3.rating}/10</p>` : 
                        '<p><strong>PSFS 3:</strong> No especificado</p>'
                    }
                    <h5>Cuestionarios adicionales</h5>
                    <p>${patient.extraQuestionnaire || 'No especificados'}</p>
                </div>
            </div>

            <div class="row mb-4">
                <div class="col-12">
                    <h4 class="text-primary">Evaluación Física</h4>
                    <hr>
                </div>
                <div class="col-md-4">
                    <h5>Signos vitales</h5>
                    <p>${patient.vitalSigns || 'No especificados'}</p>
                </div>
                <div class="col-md-4">
                    <h5>Antropometría</h5>
                    <p>${patient.anthropometry || 'No especificada'}</p>
                </div>
                <div class="col-md-4">
                    <h5>Examen físico</h5>
                    <p>${patient.physicalExam || 'No especificado'}</p>
                </div>
            </div>
        </div>
    `;
    
    // Configurar el botón de exportar PDF
    const exportButton = document.getElementById('exportPatientButton');
    if (exportButton) {
        exportButton.onclick = function() {
            exportPatientToPDF(patientId);
        };
    }
    
    modal.show();
}

// Función para eliminar un paciente
function deletePatient(patientId) {
    if (confirm('¿Estás seguro de que deseas eliminar este paciente? Esta acción no se puede deshacer.')) {
        const patients = getPatients();
        const updatedPatients = patients.filter(p => p.id !== patientId);
        localStorage.setItem('patients', JSON.stringify(updatedPatients));
        loadPatients();
    }
}

// Función para buscar pacientes
function searchPatients() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const patients = getPatients();
    const patientsList = document.getElementById('patientsList');
    
    if (!patientsList) return;
    
    // Limpiar lista actual
    patientsList.innerHTML = '';
    
    // Filtrar pacientes según el término de búsqueda
    const filteredPatients = patients.filter(patient => 
        (patient.name && patient.name.toLowerCase().includes(searchInput)) || 
        (patient.rut && patient.rut.toLowerCase().includes(searchInput))
    );
    
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
}

// Función para exportar un paciente a PDF
function exportPatientToPDF(patientId) {
    const patients = getPatients();
    const patient = patients.find(p => p.id === patientId);

    if (!patient) {
        alert('Paciente no encontrado');
        return;
    }

    // Verificar que jsPDF esté disponible
    if (typeof window.jspdf === 'undefined') {
        alert('La biblioteca jsPDF no está cargada correctamente. No se puede exportar a PDF.');
        return;
    }

    // Inicializar jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Configurar el documento
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(13, 110, 253); // Color azul primario
    doc.text('Ficha Clínica Kinesiológica', 105, 15, { align: 'center' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Color negro
    
    // Fecha de creación
    const createdDate = patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'No disponible';
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100); // Color gris
    doc.text(`Fecha de evaluación: ${createdDate}`, 195, 10, { align: 'right' });
    doc.setTextColor(0, 0, 0); // Volver a color negro
    doc.setFontSize(12);
    
    // Información personal
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(240, 240, 240);
    doc.rect(14, 22, 182, 8, 'F');
    doc.text('Información Personal', 14, 28);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`Nombre: ${patient.name || 'No especificado'}`, 14, 38);
    doc.text(`RUT: ${patient.rut || 'No especificado'}`, 14, 45);
    doc.text(`Edad: ${patient.age || 'No especificada'} años`, 14, 52);
    doc.text(`Teléfono: ${patient.contactNumber || 'No especificado'}`, 14, 59);
    doc.text(`Email: ${patient.patientEmail || 'No especificado'}`, 14, 66);
    
    doc.text(`Nacionalidad: ${patient.nationality || 'No especificada'}`, 105, 38);
    doc.text(`Estado civil: ${patient.civilStatus || 'No especificado'}`, 105, 45);
    doc.text(`Nivel educacional: ${patient.education || 'No especificado'}`, 105, 52);
    doc.text(`Dirección: ${patient.address || 'No especificada'}`, 105, 59);
    doc.text(`Contacto emergencia: ${patient.emergencyContact || 'No especificado'}`, 105, 66);
    
    // Información clínica
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(240, 240, 240);
    doc.rect(14, 73, 182, 8, 'F');
    doc.text('Información Clínica', 14, 79);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`Evaluador: ${patient.evaluator || 'No especificado'}`, 14, 89);
    doc.text(`Lateralidad: ${patient.laterality || 'No especificada'}`, 105, 89);
    
    // Función para agregar texto largo con saltos de línea
    function addWrappedText(text, x, y, maxWidth, lineHeight) {
        if (!text) return y;
        
        const lines = doc.splitTextToSize(text, maxWidth);
        doc.text(lines, x, y);
        return y + (lines.length * lineHeight);
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text('Motivo de consulta:', 14, 99);
    doc.setFont('helvetica', 'normal');
    let yPos = addWrappedText(patient.consultReason || 'No especificado', 14, 106, 180, 7);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Diagnóstico:', 14, yPos + 7);
    doc.setFont('helvetica', 'normal');
    yPos = addWrappedText(patient.diagnosis || 'No especificado', 14, yPos + 14, 180, 7);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Expectativas:', 14, yPos + 7);
    doc.setFont('helvetica', 'normal');
    yPos = addWrappedText(patient.expectations || 'No especificadas', 14, yPos + 14, 180, 7);
    
    // Si el contenido es demasiado largo, agregar nueva página
    if (yPos > 250) {
        doc.addPage();
        yPos = 20;
    }
    
    // Anamnesis
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(240, 240, 240);
    doc.rect(14, yPos + 7, 182, 8, 'F');
    doc.text('Anamnesis', 14, yPos + 13);
    doc.setFont('helvetica', 'normal');
    yPos += 20;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Anamnesis próxima:', 14, yPos);
    doc.setFont('helvetica', 'normal');
    yPos = addWrappedText(patient.proximateAnamnesis || 'No especificada', 14, yPos + 7, 180, 7) + 5;
    
    // Si el contenido es demasiado largo, agregar nueva página
    if (yPos > 250) {
        doc.addPage();
        yPos = 20;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text('Anamnesis remota:', 14, yPos);
    doc.setFont('helvetica', 'normal');
    yPos = addWrappedText(patient.remoteAnamnesis || 'No especificada', 14, yPos + 7, 180, 7) + 5;
    
    // Si el contenido es demasiado largo, agregar nueva página
    if (yPos > 250) {
        doc.addPage();
        yPos = 20;
    }
    
    // Hábitos y entorno
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(240, 240, 240);
    doc.rect(14, yPos, 182, 8, 'F');
    doc.text('Hábitos y Entorno', 14, yPos + 6);
    doc.setFont('helvetica', 'normal');
    yPos += 13;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Hábitos y hobbies:', 14, yPos);
    doc.setFont('helvetica', 'normal');
    yPos = addWrappedText(patient.habitsHobbies || 'No especificados', 14, yPos + 7, 180, 7) + 5;
    
    // Si el contenido es demasiado largo, agregar nueva página
    if (yPos > 250) {
        doc.addPage();
        yPos = 20;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text('Hogar y red de apoyo:', 14, yPos);
    doc.setFont('helvetica', 'normal');
    yPos = addWrappedText(patient.homeSupport || 'No especificados', 14, yPos + 7, 180, 7) + 5;
    
    // Si el contenido es demasiado largo, agregar nueva página
    if (yPos > 250) {
        doc.addPage();
        yPos = 20;
    }
    
    // Cuestionarios
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(240, 240, 240);
    doc.rect(14, yPos, 182, 8, 'F');
    doc.text('Cuestionarios', 14, yPos + 6);
    doc.setFont('helvetica', 'normal');
    yPos += 13;
    
    if (patient.psfs1 && patient.psfs1.activity) {
        doc.text(`PSFS 1: ${patient.psfs1.activity} - Valoración: ${patient.psfs1.rating}/10`, 14, yPos);
        yPos += 7;
    }
    
    if (patient.psfs2 && patient.psfs2.activity) {
        doc.text(`PSFS 2: ${patient.psfs2.activity} - Valoración: ${patient.psfs2.rating}/10`, 14, yPos);
        yPos += 7;
    }
    
    if (patient.psfs3 && patient.psfs3.activity) {
        doc.text(`PSFS 3: ${patient.psfs3.activity} - Valoración: ${patient.psfs3.rating}/10`, 14, yPos);
        yPos += 7;
    }
    
    if (patient.extraQuestionnaire) {
        doc.setFont('helvetica', 'bold');
        doc.text('Cuestionarios adicionales:', 14, yPos + 5);
        doc.setFont('helvetica', 'normal');
        yPos = addWrappedText(patient.extraQuestionnaire, 14, yPos + 12, 180, 7) + 5;
    }
    
    // Si el contenido es demasiado largo, agregar nueva página
    if (yPos > 250) {
        doc.addPage();
        yPos = 20;
    }
    
    // Evaluación física
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(240, 240, 240);
    doc.rect(14, yPos, 182, 8, 'F');
    doc.text('Evaluación Física', 14, yPos + 6);
    doc.setFont('helvetica', 'normal');
    yPos += 13;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Signos vitales:', 14, yPos);
    doc.setFont('helvetica', 'normal');
    yPos = addWrappedText(patient.vitalSigns || 'No especificados', 14, yPos + 7, 180, 7) + 5;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Antropometría:', 14, yPos);
    doc.setFont('helvetica', 'normal');
    yPos = addWrappedText(patient.anthropometry || 'No especificada', 14, yPos + 7, 180, 7) + 5;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Examen físico:', 14, yPos);
    doc.setFont('helvetica', 'normal');
    yPos = addWrappedText(patient.physicalExam || 'No especificado', 14, yPos + 7, 180, 7) + 5;
    
    // Pie de página
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`Página ${i} de ${totalPages}`, 105, 290, { align: 'center' });
        doc.text('Sistema de Fichas Clínicas Kinesiológicas', 105, 280, { align: 'center' });
    }
    
    // Guardar el PDF
    doc.save(`Ficha_${patient.name || 'Paciente'}_${patient.rut || ''}.pdf`);
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
