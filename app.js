// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // Referencia al formulario
    const patientForm = document.getElementById('patientForm');
    const patientsList = document.getElementById('patientsList');
    
    // Cargar pacientes guardados al iniciar
    loadPatients();
    
    // Manejar el envío del formulario
    if (patientForm) {
        patientForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Recopilar datos del formulario
            const patientData = {
                // Información Personal
                evaluator: document.getElementById('evaluator').value,
                name: document.getElementById('patientName').value,
                id: document.getElementById('patientId').value,
                phone: document.getElementById('patientPhone').value,
                email: document.getElementById('patientEmail').value,
                nationality: document.getElementById('patientNationality').value,
                age: document.getElementById('patientAge').value,
                birthdate: document.getElementById('patientBirthdate').value,
                maritalStatus: document.getElementById('patientMaritalStatus').value,
                education: document.getElementById('patientEducation').value,
                address: document.getElementById('patientAddress').value,
                emergencyContact: document.getElementById('patientEmergencyContact').value,
                occupation: document.getElementById('patientOccupation').value,
                laterality: document.getElementById('patientLaterality').value,
                
                // Motivo de Consulta
                consultReason: document.getElementById('consultReason').value,
                mainDiagnosis: document.getElementById('mainDiagnosis').value,
                expectations: document.getElementById('patientExpectations').value,
                
                // Anamnesis
                proximateAnamnesis: document.getElementById('proximateAnamnesis').value,
                remoteAnamnesis: document.getElementById('remoteAnamnesis').value,
                
                // Hábitos y Hobbies
                habitsHobbies: document.getElementById('habitsHobbies').value,
                homeDescription: document.getElementById('homeDescription').value,
                
                // Cuestionarios
                psfs1Activity: document.getElementById('psfs1Activity').value,
                psfs1Rating: getRadioValue('psfs1Rating'),
                psfs2Activity: document.getElementById('psfs2Activity').value,
                psfs2Rating: getRadioValue('psfs2Rating'),
                psfs3Activity: document.getElementById('psfs3Activity').value,
                psfs3Rating: getRadioValue('psfs3Rating'),
                extraQuestionnaire: document.getElementById('extraQuestionnaire').value,
                
                // Evaluación Física
                vitalSigns: document.getElementById('vitalSigns').value,
                anthropometry: document.getElementById('anthropometry').value,
                physicalExam: document.getElementById('physicalExam').value,
                
                // Metadatos
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            // Guardar paciente
            savePatient(patientData);
            
            // Limpiar formulario
            patientForm.reset();
            
            // Mostrar mensaje de éxito
            alert('Paciente guardado correctamente');
            
            // Cambiar a la pestaña de registros
            document.getElementById('records-tab').click();
        });
    }
    
    // Función para obtener el valor seleccionado de un grupo de radio buttons
    function getRadioValue(name) {
        const radios = document.getElementsByName(name);
        for (let i = 0; i < radios.length; i++) {
            if (radios[i].checked) {
                return radios[i].value;
            }
        }
        return '';
    }
    
    // Función para guardar un paciente en localStorage
    function savePatient(patientData) {
        // Obtener pacientes existentes
        let patients = JSON.parse(localStorage.getItem('patients')) || [];
        
        // Generar un ID único
        patientData.id = Date.now().toString();
        
        // Añadir el nuevo paciente
        patients.push(patientData);
        
        // Guardar en localStorage
        localStorage.setItem('patients', JSON.stringify(patients));
        
        // Actualizar la lista de pacientes
        loadPatients();
    }
    
    // Función para cargar pacientes desde localStorage
    function loadPatients() {
        if (!patientsList) return;
        
        // Limpiar lista
        patientsList.innerHTML = '';
        
        // Obtener pacientes
        const patients = JSON.parse(localStorage.getItem('patients')) || [];
        
        if (patients.length === 0) {
            patientsList.innerHTML = '<div class="col-12"><div class="alert alert-info">No hay pacientes registrados.</div></div>';
            return;
        }
        
        // Mostrar cada paciente
        patients.forEach(patient => {
            const patientCard = document.createElement('div');
            patientCard.className = 'col-md-4 mb-3';
            patientCard.innerHTML = `
                <div class="card patient-card">
                    <div class="card-body">
                        <h5 class="card-title">${patient.name}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">RUT: ${patient.id}</h6>
                        <p class="card-text">
                            <strong>Edad:</strong> ${patient.age} años<br>
                            <strong>Motivo de consulta:</strong> ${patient.consultReason.substring(0, 50)}...
                        </p>
                        <div class="d-flex justify-content-between">
                            <button class="btn btn-sm btn-primary view-patient" data-id="${patient.id}">Ver detalles</button>
                            <button class="btn btn-sm btn-danger delete-patient" data-id="${patient.id}">Eliminar</button>
                        </div>
                    </div>
                </div>
            `;
            patientsList.appendChild(patientCard);
        });
        
        // Añadir event listeners para los botones
        document.querySelectorAll('.view-patient').forEach(button => {
            button.addEventListener('click', function() {
                const patientId = this.getAttribute('data-id');
                viewPatient(patientId);
            });
        });
        
        document.querySelectorAll('.delete-patient').forEach(button => {
            button.addEventListener('click', function() {
                const patientId = this.getAttribute('data-id');
                deletePatient(patientId);
            });
        });
    }
    
    // Función para ver detalles de un paciente
    function viewPatient(patientId) {
        const patients = JSON.parse(localStorage.getItem('patients')) || [];
        const patient = patients.find(p => p.id === patientId);
        
        if (!patient) {
            alert('Paciente no encontrado');
            return;
        }
        
        // Aquí podrías mostrar un modal con los detalles del paciente
        // Por ahora, solo mostraremos un alert
        alert(`
            Nombre: ${patient.name}
            RUT: ${patient.id}
            Edad: ${patient.age}
            Motivo de consulta: ${patient.consultReason}
        `);
    }
    
    // Función para eliminar un paciente
    function deletePatient(patientId) {
        if (!confirm('¿Estás seguro de que deseas eliminar este paciente?')) {
            return;
        }
        
        let patients = JSON.parse(localStorage.getItem('patients')) || [];
        patients = patients.filter(p => p.id !== patientId);
        localStorage.setItem('patients', JSON.stringify(patients));
        
        loadPatients();
    }
});
