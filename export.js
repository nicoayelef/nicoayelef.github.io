// export.js - Funciones para exportar a PDF con mejoras de manejo de errores

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

// Función para exportar paciente a PDF con mejor manejo de errores
function exportPatientToPDF() {
    const patientContent = document.getElementById('patientDetailsContent');
    if (!patientContent) {
        showAlert("No se encontró contenido para exportar", "danger");
        return;
    }
    
    window.showLoadingModal();
    
    // Verificar disponibilidad de bibliotecas
    if (typeof jspdf === 'undefined' || typeof html2canvas === 'undefined') {
        window.hideLoadingModal();
        showAlert("Error: Bibliotecas PDF no cargadas", "danger");
        return;
    }
    
    const { jsPDF } = jspdf;
    
    try {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Obtener nombre del paciente de manera más robusta
        let patientName = 'paciente';
        try {
            const nameElements = patientContent.querySelectorAll('p');
            for (let el of nameElements) {
                const match = el.textContent.match(/Nombre:\s*(.+)/);
                if (match) {
                    patientName = match[1].trim().replace(/[^a-zA-Z0-9]/g, '_');
                    break;
                }
            }
        } catch (nameError) {
            console.warn("Error al extraer nombre:", nameError);
        }
        
        // Usar html2canvas con opciones más completas
        html2canvas(patientContent, {
            scale: 2,
            useCORS: true,
            logging: false,
            allowTaint: true,
            backgroundColor: null
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const imgWidth = 190; // A4 width minus margins
            const pageHeight = 280; // A4 height minus margins
            const imgHeight = canvas.height * imgWidth / canvas.width;
            
            let heightLeft = imgHeight;
            let position = 10;
            
            // Añadir primera página
            doc.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            
            // Añadir páginas adicionales si es necesario
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                doc.addPage();
                doc.addImage(imgData, 'JPEG', 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            
            // Nombre de archivo con fecha
            const filename = `Ficha_${patientName}_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`;
            
            // Guardar PDF
            doc.save(filename);
            
            window.hideLoadingModal();
            showAlert("PDF generado exitosamente", "success");
        }).catch(canvasError => {
            console.error("Error en html2canvas:", canvasError);
            window.hideLoadingModal();
            showAlert("Error al generar PDF: " + canvasError.message, "danger");
        });
    } catch (pdfError) {
        console.error("Error al crear PDF:", pdfError);
        window.hideLoadingModal();
        showAlert("Error al generar PDF: " + pdfError.message, "danger");
    }
}

// Función para exportar evolución a PDF
function exportEvolutionToPDF() {
    const evolutionContent = document.getElementById('evolutionDetailsContent');
    if (!evolutionContent) {
        showAlert("No se encontró contenido para exportar", "danger");
        return;
    }
    
    window.showLoadingModal();
    
    // Verificar disponibilidad de bibliotecas
    if (typeof jspdf === 'undefined' || typeof html2canvas === 'undefined') {
        window.hideLoadingModal();
        showAlert("Error: Bibliotecas PDF no cargadas", "danger");
        return;
    }
    
    const { jsPDF } = jspdf;
    
    try {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Obtener nombre del paciente de manera más robusta
        let patientName = 'evolucion';
        try {
            const headerElement = evolutionContent.querySelector('h5');
            if (headerElement) {
                const parts = headerElement.textContent.split('-');
                if (parts.length > 1) {
                    patientName = parts[1].trim().replace(/[^a-zA-Z0-9]/g, '_');
                }
            }
        } catch (nameError) {
            console.warn("Error al extraer nombre:", nameError);
        }
        
        // Usar html2canvas con opciones más completas
        html2canvas(evolutionContent, {
            scale: 2,
            useCORS: true,
            logging: false,
            allowTaint: true,
            backgroundColor: null
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const imgWidth = 190; // A4 width minus margins
            const pageHeight = 280; // A4 height minus margins
            const imgHeight = canvas.height * imgWidth / canvas.width;
            
            // Añadir imagen al PDF
            doc.addImage(imgData, 'JPEG', 10, 10, imgWidth, imgHeight);
            
            // Nombre de archivo con fecha
            const filename = `Evolucion_${patientName}_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`;
            
            // Guardar PDF
            doc.save(filename);
            
            window.hideLoadingModal();
            showAlert("PDF generado exitosamente", "success");
        }).catch(canvasError => {
            console.error("Error en html2canvas:", canvasError);
            window.hideLoadingModal();
            showAlert("Error al generar PDF: " + canvasError.message, "danger");
        });
    } catch (pdfError) {
        console.error("Error al crear PDF:", pdfError);
        window.hideLoadingModal();
        showAlert("Error al generar PDF: " + pdfError.message, "danger");
    }
}

// Función para exportar todos los pacientes a PDF
function exportAllPatientsToPDF() {
    window.showLoadingModal();
    
    // Verificar disponibilidad de bibliotecas
    if (typeof jspdf === 'undefined') {
        window.hideLoadingModal();
        showAlert("Error: Biblioteca jsPDF no cargada", "danger");
        return;
    }
    
    const { jsPDF } = jspdf;
    
    // Verificar si Firestore está disponible
    if (!db) {
        window.hideLoadingModal();
        showAlert("Error: Base de datos no inicializada", "danger");
        return;
    }
    
    try {
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        // Configuración inicial del documento
        doc.setFontSize(18);
        doc.text("Lista de Pacientes", 105, 20, { align: "center" });
        doc.setFontSize(12);
        doc.text(`Generado el ${new Date().toLocaleDateString()}`, 105, 30, { align: "center" });
        
        // Obtener pacientes
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
                doc.setFontSize(10);
                let y = 40;
                
                querySnapshot.forEach((docSnapshot, index) => {
                    const patient = docSnapshot.data();
                    
                    // Cambiar de página si no hay espacio
                    if (y > 270) {
                        doc.addPage();
                        currentPage++;
                        y = 20;
                    }
                    
                    // Información del paciente
                    doc.text(`Paciente: ${patient.name || 'Sin nombre'}`, 10, y);
                    y += 7;
                    
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
                    
                    // Línea separadora
                    doc.setDrawColor(200);
                    doc.line(10, y, 200, y);
                    y += 10;
                });
                
                // Guardar PDF
                doc.save(`Lista_Pacientes_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
                
                window.hideLoadingModal();
                showAlert("PDF con todos los pacientes generado exitosamente", "success");
            })
            .catch((error) => {
                console.error("Error al exportar pacientes:", error);
                window.hideLoadingModal();
                showAlert("Error al exportar pacientes: " + error.message, "danger");
            });
    } catch (pdfError) {
        console.error("Error al crear PDF:", pdfError);
        window.hideLoadingModal();
        showAlert("Error al generar PDF: " + pdfError.message, "danger");
    }
}

// Función auxiliar de alerta (en caso de que no esté definida globalmente)
function showAlert(message, type) {
    console.log(`Alerta: ${message} (${type})`);
    const alertContainer = document.getElementById('alertContainer');
    if (alertContainer) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.role = 'alert';
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        alertContainer.appendChild(alert);
        
        // Auto-cerrar después de 5 segundos
        setTimeout(() => {
            if(alert.parentNode) {
                alert.remove();
            }
        }, 5000);
    }
}
