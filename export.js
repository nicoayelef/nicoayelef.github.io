// export.js - Funciones para exportar a PDF
document.addEventListener('DOMContentLoaded', function() {
    // Para exportar paciente individual
    const exportPatientButton = document.getElementById('exportPatientButton');
    if (exportPatientButton) {
        exportPatientButton.addEventListener('click', exportPatientToPDF);
    }
    
    // Para exportar evolución
    const exportEvolutionBtn = document.getElementById('exportEvolutionBtn');
    if (exportEvolutionBtn) {
        exportEvolutionBtn.addEventListener('click', exportEvolutionToPDF);
    }
    
    // Para exportar todos los pacientes
    const exportAllPatientsBtn = document.getElementById('exportAllPatientsBtn');
    if (exportAllPatientsBtn) {
        exportAllPatientsBtn.addEventListener('click', exportAllPatientsToPDF);
    }
});

// Función para exportar paciente a PDF
function exportPatientToPDF() {
    const patientContent = document.getElementById('patientDetailsContent');
    if (!patientContent) {
        showAlert("No se encontró contenido para exportar", "danger");
        return;
    }
    
    window.showLoadingModal();
    
    // Configurar jsPDF
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        window.hideLoadingModal();
        showAlert("Error: La biblioteca jsPDF no está disponible", "danger");
        return;
    }
    
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    
    // Obtener el nombre del paciente para el nombre del archivo
    let patientName = 'paciente';
    try {
        const nameElement = patientContent.querySelector('p:first-child');
        if (nameElement) {
            const nameText = nameElement.textContent;
            const nameMatch = nameText.match(/Nombre:(.+)/);
            if (nameMatch && nameMatch[1]) {
                patientName = nameMatch[1].trim();
            }
        }
    } catch (e) {
        console.error("Error al obtener el nombre del paciente:", e);
    }
    
    // Usar html2canvas para convertir el contenido a una imagen
    html2canvas(patientContent, {
        scale: 2, // Mejor calidad
        useCORS: true,
        logging: false,
        allowTaint: true
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const imgWidth = 190; // A4 width minus margins (210 - 20)
        const pageHeight = 280; // A4 height minus margins
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 10; // Top margin
        
        // Añadir la primera página
        doc.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        // Añadir páginas adicionales si es necesario
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight + 10;
            doc.addPage();
            doc.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        
        // Guardar el PDF
        doc.save(`Ficha_${patientName}_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
        
        window.hideLoadingModal();
        showAlert("PDF generado exitosamente", "success");
    }).catch(error => {
        console.error("Error al generar PDF:", error);
        showAlert("Error al generar el PDF: " + error.message, "danger");
        window.hideLoadingModal();
    });
}

// Función para exportar evolución a PDF
function exportEvolutionToPDF() {
    const evolutionContent = document.getElementById('evolutionDetailsContent');
    if (!evolutionContent) {
        showAlert("No se encontró contenido para exportar", "danger");
        return;
    }
    
    window.showLoadingModal();
    
    // Configurar jsPDF
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        window.hideLoadingModal();
        showAlert("Error: La biblioteca jsPDF no está disponible", "danger");
        return;
    }
    
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    
    // Obtener el nombre del paciente para el nombre del archivo
    let pacienteName = 'evolucion';
    try {
        const headerElement = evolutionContent.querySelector('h5');
        if (headerElement) {
            const parts = headerElement.textContent.split('-');
            if (parts.length > 1) {
                pacienteName = parts[1].trim();
            }
        }
    } catch (e) {
        console.error("Error al obtener el nombre del paciente:", e);
    }
    
    // Usar html2canvas para convertir el contenido a una imagen
    html2canvas(evolutionContent, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const imgWidth = 190;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        // Añadir la imagen al PDF
        doc.addImage(imgData, 'JPEG', 10, 10, imgWidth, imgHeight);
        
        // Guardar el PDF
        doc.save(`Evolucion_${pacienteName}_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
        
        window.hideLoadingModal();
        showAlert("PDF generado exitosamente", "success");
    }).catch(error => {
        console.error("Error al generar PDF:", error);
        showAlert("Error al generar el PDF: " + error.message, "danger");
        window.hideLoadingModal();
    });
}

// Función para exportar todos los pacientes
function exportAllPatientsToPDF() {
    window.showLoadingModal();
    showAlert("Preparando exportación de todos los pacientes...", "info");
    
    // Configurar jsPDF
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
        window.hideLoadingModal();
        showAlert("Error: La biblioteca jsPDF no está disponible", "danger");
        return;
    }
    
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    
    // Obtener todos los pacientes
    db.collection("patients")
        .orderBy("createdAt", "desc")
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                window.hideLoadingModal();
                showAlert("No hay pacientes para exportar", "warning");
                return;
            }
            
            let currentPage = 1;
            const totalPatients = querySnapshot.size;
            
            doc.setFontSize(18);
            doc.text("Lista de Pacientes", 105, 20, { align: "center" });
            doc.setFontSize(12);
            doc.text(`Generado el ${new Date().toLocaleDateString()}`, 105, 30, { align: "center" });
            
            doc.setFontSize(10);
            let y = 40;
            
            querySnapshot.forEach((doc, index) => {
                const patient = doc.data();
                
                // Si no hay espacio en la página actual, crear una nueva
                if (y > 270) {
                    doc.addPage();
                    currentPage++;
                    y = 20;
                }
                
                // Información básica del paciente
                doc.setFontSize(12);
                doc.text(`Paciente: ${patient.name || 'Sin nombre'}`, 10, y);
                y += 7;
                
                doc.setFontSize(10);
                doc.text(`RUT: ${patient.rut || 'N/A'}`, 10, y);
                y += 5;
                
                doc.text(`Edad: ${patient.age || 'N/A'}`, 10, y);
                y += 5;
                
                doc.text(`Teléfono: ${patient.contactNumber || 'N/A'}`, 10, y);
                y += 5;
                
                doc.text(`Diagnóstico: ${patient.diagnosis || 'N/A'}`, 10, y);
                y += 5;
                
                doc.text(`Fecha de registro: ${formatDate(patient.createdAt) || 'N/A'}`, 10, y);
                y += 10;
                
                // Agregar línea separadora
                doc.setDrawColor(200);
                doc.line(10, y, 200, y);
                y += 10;
            });
            
            // Guardar el PDF
            doc.save(`Lista_Pacientes_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
            
            window.hideLoadingModal();
            showAlert("PDF con todos los pacientes generado exitosamente", "success");
        })
        .catch((error) => {
            console.error("Error al exportar pacientes:", error);
            showAlert("Error al exportar pacientes: " + error.message, "danger");
            window.hideLoadingModal();
        });
}
