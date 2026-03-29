import jsPDF from 'jspdf';

export function generatePdfReport({ results, addressData, propertyConfig }) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFillColor(143, 166, 47); // filey green
  doc.rect(0, 0, pageWidth, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Filey Properties', 15, 18);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Property Licensing Compliance Report', 15, 28);
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 15, 35);

  y = 50;

  // Property Details
  doc.setTextColor(45, 45, 45);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Property Details', 15, y);
  y += 8;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const details = [
    ['Postcode', addressData.postcode],
    ['Borough', results.boroughFullName || results.borough],
    ['Ward', results.ward],
    ['Occupants', String(propertyConfig.num_occupants)],
    ['Households', String(propertyConfig.num_households)],
    ['Shares Facilities', propertyConfig.shares_facilities ? 'Yes' : 'No'],
  ];

  for (const [label, value] of details) {
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 60, y);
    y += 6;
  }

  y += 5;

  // Verdict
  const verdictColors = {
    red: [220, 38, 38],
    amber: [217, 119, 6],
    green: [22, 163, 74],
    blue: [59, 130, 246],
  };
  const color = verdictColors[results.verdictColor] || [0, 0, 0];

  doc.setFillColor(...color);
  doc.rect(15, y, pageWidth - 30, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(results.verdictText, pageWidth / 2, y + 8, { align: 'center' });

  y += 20;

  // Licence Details
  if (results.licences.length > 0) {
    doc.setTextColor(45, 45, 45);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Licence Requirements', 15, y);
    y += 8;

    for (const licence of results.licences) {
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${licence.type} Licence`, 15, y);
      y += 6;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Status: ${licence.statusLabel}`, 20, y);
      y += 5;
      doc.text(`Scope: ${licence.scope}`, 20, y);
      y += 5;

      if (licence.fee.baseFee !== null) {
        doc.text(`Fee: £${licence.fee.baseFee.toLocaleString()}`, 20, y);
        if (licence.fee.discountAmount > 0) {
          doc.text(
            `  (Discounted: £${licence.fee.finalFee.toLocaleString()})`,
            65,
            y
          );
        }
        y += 5;
      } else {
        doc.text('Fee: Contact council', 20, y);
        y += 5;
      }

      if (licence.application_url) {
        doc.text(`Apply: ${licence.application_url}`, 20, y);
        y += 5;
      }

      y += 3;

      if (y > 260) {
        doc.addPage();
        y = 20;
      }
    }
  }

  // Advisory Notes
  if (results.advisoryNotes.length > 0 || results.upcomingChanges.length > 0) {
    y += 5;
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setTextColor(45, 45, 45);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes & Upcoming Changes', 15, y);
    y += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    for (const note of results.advisoryNotes) {
      const lines = doc.splitTextToSize(`• ${note.text}`, pageWidth - 35);
      doc.text(lines, 20, y);
      y += lines.length * 4.5;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    }

    for (const change of results.upcomingChanges) {
      const lines = doc.splitTextToSize(`• ${change.description}`, pageWidth - 35);
      doc.text(lines, 20, y);
      y += lines.length * 4.5;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    }
  }

  // Disclaimer
  y = Math.max(y + 10, 260);
  if (y > 275) {
    doc.addPage();
    y = 260;
  }
  doc.setFontSize(7);
  doc.setTextColor(128, 128, 128);
  const disclaimer =
    'Disclaimer: This report provides guidance based on publicly available council licensing data. It does not constitute legal advice. Always verify directly with the relevant council.';
  const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 30);
  doc.text(disclaimerLines, 15, y);

  doc.save(`licensing-check-${addressData.postcode.replace(/\s/g, '')}-${new Date().toISOString().split('T')[0]}.pdf`);
}

export function generatePlainTextReport({ results, addressData, propertyConfig }) {
  const lines = [
    'FILEY PROPERTIES — LICENSING CHECK REPORT',
    `Date: ${new Date().toLocaleDateString('en-GB')}`,
    '',
    'PROPERTY DETAILS',
    `Postcode: ${addressData.postcode}`,
    `Borough: ${results.boroughFullName || results.borough}`,
    `Ward: ${results.ward}`,
    `Occupants: ${propertyConfig.num_occupants}`,
    `Households: ${propertyConfig.num_households}`,
    `Shares Facilities: ${propertyConfig.shares_facilities ? 'Yes' : 'No'}`,
    '',
    `VERDICT: ${results.verdictText}`,
    '',
  ];

  if (results.licences.length > 0) {
    lines.push('LICENCE REQUIREMENTS');
    for (const licence of results.licences) {
      lines.push(`  ${licence.type} Licence`);
      lines.push(`    Status: ${licence.statusLabel}`);
      lines.push(`    Scope: ${licence.scope}`);
      if (licence.fee.baseFee !== null) {
        let feeStr = `    Fee: £${licence.fee.baseFee.toLocaleString()}`;
        if (licence.fee.discountAmount > 0) {
          feeStr += ` (Discounted: £${licence.fee.finalFee.toLocaleString()})`;
        }
        lines.push(feeStr);
      } else {
        lines.push('    Fee: Contact council');
      }
      if (licence.application_url) {
        lines.push(`    Apply: ${licence.application_url}`);
      }
      lines.push('');
    }
  }

  if (results.advisoryNotes.length > 0) {
    lines.push('NOTES');
    for (const note of results.advisoryNotes) {
      lines.push(`  • ${note.text}`);
    }
    lines.push('');
  }

  lines.push(
    'Disclaimer: This report provides guidance based on publicly available council licensing data. Always verify directly with the relevant council.'
  );

  return lines.join('\n');
}
