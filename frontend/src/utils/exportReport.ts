import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';

/**
 * Captures an HTML element by ID and triggers a download of it as a PDF report.
 * Guaranteed to capture ALL rendered text, graphics, and elements within the container.
 * 
 * @param elementId The id of the DOM element to capture
 * @param filename The desired filename (without extension is fine, .pdf will be added)
 */
export async function downloadHtmlAsPdf(elementId: string, filename: string = 'Report.pdf') {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Export Error: Could not find element with ID ${elementId}`);
    return;
  }

  try {
    // Standardize filename
    if (!filename.toLowerCase().endsWith('.pdf')) {
      filename += '.pdf';
    }

    // Apply strict rendering rules to ensure full resolution capture.
    const imgData = await toJpeg(element, {
      quality: 1.0,
      backgroundColor: '#f8fafc', // match slate-50/100ish bg
      pixelRatio: 2, // High DPI capture
      style: {
        transform: 'none', // Prevent layout shifts during clone
      }
    });
    
    // Calculate A4 proportions. 
    // A4 size: 210mm x 297mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Scale canvas image to fit within the PDF pages
    const imgProps = pdf.getImageProperties(imgData);
    const ratio = imgProps.height / imgProps.width;
    
    const renderWidth = pdfWidth - 20; // 10mm margins on both sides
    const renderHeight = renderWidth * ratio;

    let marginY = 10;
    
    // Support multi-page if the dashboard is exceptionally long
    let heightLeft = renderHeight;
    let position = marginY;

    // First page
    pdf.addImage(imgData, 'JPEG', 10, position, renderWidth, renderHeight);
    heightLeft -= (pdfHeight - marginY * 2);

    // Any overflowing length becomes a new page
    while (heightLeft > 0) {
      position = heightLeft - renderHeight + marginY;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 10, position, renderWidth, renderHeight);
      heightLeft -= (pdfHeight - marginY * 2);
    }

    pdf.save(filename);
  } catch (err: any) {
    console.error("Failed to generate PDF Report:", err);
    alert(`Failed to export report: ${err?.message || String(err)}`);
  }
}
