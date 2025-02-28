// Código básico para el formulario
document.addEventListener('DOMContentLoaded', function() {
    const patientForm = document.getElementById('patientForm');
    
    if (patientForm) {
        patientForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const evaluator = document.getElementById('evaluator').value;
            const patientName = document.getElementById('patientName').value;
            const patientId = document.getElementById('patientId').value;
            
            // Por ahora, solo mostraremos un mensaje
            alert(`Formulario enviado:\nEvaluador: ${evaluator}\nPaciente: ${patientName}\nRUT: ${patientId}`);
            
            // Aquí más adelante conectaremos con Firebase
        });
    }
});
