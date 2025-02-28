// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM cargado completamente");
    
    // Referencia al formulario
    const patientForm = document.getElementById('patientForm');
    const patientsList = document.getElementById('patientsList');
    
    // Cargar pacientes guardados al iniciar
    loadPatients();
    
    // Manejar el envío del formulario
    if (patientForm) {
        console.log("Formulario encontrado, agregando event listener");
        patientForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log("Formulario enviado");
            
            // Recopilar datos del formulario
            const patientData = {
                // Información Personal
                evaluator: document.getElementById('evaluator').value,
                name: document.getElementById('patientName').value,
                id: document.getElementById('patientId').value,
                phone: document.getElementById('patientPhone')?.value || '',
                email: document.getElementById('patientEmail')?.value || '',
                nationality: document.getElementById('patientNationality')?.value || '',
                age: document.getElementById('patientAge').value,
                birthdate: document.getElementById('patientBirthdate')?.value || '',
                maritalStatus: document.getElementById('patientMaritalStatus')?.value || '',
                education: document.getElementById('patientEducation')?.value || '',
                address: document.getElementById('patientAddress')?.value || '',
                emergencyContact: document.getElementById('patientEmergencyContact')?.value || '',
                occupation: document.getElementById('patientOccupation')?.value || '',
                laterality: document.getElementById('patientLaterality')?.value || '',
                
                // Motivo de Consulta
                consultReason: document.getElementById('consultReason').value,
                mainDiagnosis: document.getElementById('mainDiagnosis')?.value || '',
                expectations: document.getElementById('patientExpectations')?.value || '',
                
                // Anamnesis
                proximateAnamnesis: document.getElementById('proximateAnamnesis')?.value || '',
                remoteAnamnesis: document.getElementById('remoteAnamnesis')?.value || '',
                
                // Hábitos y Hobbies
                habitsHobbies: document.getElementById('habitsHobbies')?.value || '',
                homeDescription: document.getElementById('homeDescription')?.value || '',
                
                // Cuestionarios
                psfs1Activity: document.getElementById('psfs1Activity')?.value || '',
                psfs1Rating: getRadioValue('psfs1Rating'),
                psfs2Activity: document.getElementById('psfs2Activity')?.value || '',
                psfs2Rating: getRadioValue('psfs2Rating'),
                psfs3Activity: document.getElementById('psfs3Activity')?.value || '',
                psfs3Rating: getRadioValue('psfs3Rating'),
                extraQuestionnaire: document.getElementById('extraQuestionnaire')?.value || '',
                
                // Evaluación Física
                vitalSigns: document.getElementById('vitalSigns')?.value || '',
                anthropometry: document.getElementById('anthropometry')?.value || '',
                physicalExam: document.getElementById('physicalExam')?.value || '',
                
                // Metadatos
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            console.log("Datos del paciente recopilados:", patientData);
            
            // Guardar paciente
            savePatient(patientData);
            
            // Limpiar formulario
            patientForm.reset();
            
            // Mostrar mensaje de éxito
            alert('Paciente guardado correctamente');
            
            // Cambiar a la pestaña de registros
            const recordsTab = document.getElementById('records-tab');
            if (recordsTab) {
                recordsTab.click();
            }
        });
    } else {
        console.error("No se encontró el formulario de pacientes");
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
        try {
            // Obtener pacientes existentes
            let patients = [];
            const storedPatients = localStorage.getItem('patients');
            
            if (storedPatients) {
                patients = JSON.parse(storedPatients);
            }
            
            console.log("Pacientes existentes:", patients);
            
            // Generar un ID único
            patientData.id = Date.now().toString();
            
            // Añadir el nuevo paciente
            patients.push(patientData);
            
            // Guardar en localStorage
            localStorage.setItem('patients', JSON.stringify(patients));
            console.log("Paciente guardado en localStorage");
            
            // Actualizar la lista de pacientes
            loadPatients();
        } catch (error) {
            console.error("Error al guardar paciente:", error);
            alert("Error al guardar: " + error.message);
        }
    }
    
    // Función para cargar pacientes desde localStorage
    function loadPatients() {
        if (!patientsList) {
            console.error("No se encontró el elemento patientsList");
            return;
        }
        
        try {
            // Limpiar lista
            patientsList.innerHTML = '';
            
            // Obtener pacientes
            const storedPatients = localStorage.getItem('patients');
            let patients = [];
            
            if (storedPatients) {
                patients = JSON.parse(storedPatients);
            }
            
            console.log("Cargando pacientes:", patients);
            
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
                            <h5 class="card-title">${patient.name || 'Sin nombre'}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">RUT: ${patient.id || 'Sin RUT'}</h6>
                            <p class="card-text">
                                <strong>Edad:</strong> ${patient.age || 'N/A'} años<br>
                                <strong>Motivo de consulta:</strong> ${(patient.consultReason || 'Sin motivo').substring(0, 50)}...
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
        } catch (error) {
            console.error("Error al cargar pacientes:", error);
            patientsList.innerHTML = '<div class="col-12"><div class="alert alert-danger">Error al cargar pacientes: ' + error.message + '</div></div>';
        }
    }
    
    // Función para ver detalles de un paciente
    function viewPatient(patientId) {
        try {
            const storedPatients = localStorage.getItem('patients');
            if (!storedPatients) {
                alert('No se encontraron pacientes');
                return;
            }
            
            const patients = JSON.parse(storedPatients);
            const patient = patients.find(p => p.id === patientId);
            
            if (!patient) {
                alert('Paciente no encontrado');
                return;
            }
            
            // Aquí podrías mostrar un modal con los detalles del paciente
            // Por ahora, solo mostraremos un alert
            alert(`
                Nombre: ${patient.name || 'Sin nombre'}
                RUT: ${patient.id || 'Sin RUT'}
                Edad: ${patient.age || 'N/A'}
                Motivo de consulta: ${patient.consultReason || 'Sin motivo'}
            `);
        } catch (error) {
            console.error("Error al ver paciente:", error);
            alert("Error al ver paciente: " + error.message);
        }
    }
    
    // Función para eliminar un paciente
    function deletePatient(patientId) {
        try {
            if (!confirm('¿Estás seguro de que deseas eliminar este paciente?')) {
                return;
            }
            
            const storedPatients = localStorage.getItem('patients');
            if (!storedPatients) {
                alert('No se encontraron pacientes');
                return;
            }
            
            let patients = JSON.parse(storedPatients);
            patients = patients.filter(p => p.id !== patientId);
            localStorage.setItem('patients', JSON.stringify(patients));
            
            console.log("Paciente eliminado:", patientId);
            loadPatients();
        } catch (error) {
            console.error("Error al eliminar paciente:", error);
            alert("Error al eliminar paciente: " + error.message);
        }
    }
});
