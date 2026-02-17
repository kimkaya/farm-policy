import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * HTML 요소를 PDF로 변환하여 다운로드
 */
export async function generatePDF(
  elementId: string,
  filename: string = '신청서.pdf'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('PDF 생성 대상 요소를 찾을 수 없습니다.');
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const imgX = (pdfWidth - imgWidth * ratio) / 2;
  const imgY = 10;

  // 여러 페이지 처리
  const pageHeight = pdfHeight - 20; // 상하 마진
  const scaledHeight = imgHeight * ratio;

  if (scaledHeight <= pageHeight) {
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, scaledHeight);
  } else {
    let remainingHeight = scaledHeight;
    let position = 0;
    let page = 0;

    while (remainingHeight > 0) {
      if (page > 0) pdf.addPage();

      pdf.addImage(
        imgData, 'PNG',
        imgX, imgY - position,
        imgWidth * ratio, scaledHeight
      );

      remainingHeight -= pageHeight;
      position += pageHeight;
      page++;
    }
  }

  pdf.save(filename);
}

/**
 * 웹 프린트 (브라우저 인쇄 기능 호출)
 */
export function printElement(elementId: string): void {
  const element = document.getElementById(elementId);
  if (!element) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>신청서 인쇄</title>
      <style>
        body {
          font-family: 'Malgun Gothic', '맑은 고딕', sans-serif;
          padding: 20mm;
          font-size: 12pt;
          line-height: 1.6;
          color: #000;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
        }
        th, td {
          border: 1px solid #333;
          padding: 8px 12px;
          text-align: left;
        }
        th {
          background-color: #f0f0f0;
          font-weight: bold;
          width: 30%;
        }
        h1 { font-size: 20pt; text-align: center; margin-bottom: 24px; }
        h2 { font-size: 14pt; margin-top: 20px; border-bottom: 2px solid #333; padding-bottom: 4px; }
        .signature-area { margin-top: 40px; text-align: center; }
        @media print {
          body { padding: 15mm; }
        }
      </style>
    </head>
    <body>
      ${element.innerHTML}
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
}
