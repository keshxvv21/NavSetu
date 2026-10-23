import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import { Pilot, Milestone } from '@/lib/mockData';

export interface GeneratePdfParams {
  pilot: Pilot;
  contractId: string;
  recordHash: string;
  appUrl?: string;
}

export async function generateJustificationPdf({
  pilot,
  contractId,
  recordHash,
  appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
}: GeneratePdfParams): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 in points
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontMono = await pdfDoc.embedFont(StandardFonts.Courier);

  // Generate QR code pointing to verification page
  const verifyUrl = `${appUrl}/verify/${contractId}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    width: 200,
    margin: 1,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  });
  const qrBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, '');
  const qrBytes = Uint8Array.from(Buffer.from(qrBase64, 'base64'));
  const qrImage = await pdfDoc.embedPng(qrBytes);

  // Color palette
  const darkNavy = rgb(0.06, 0.09, 0.16); // #0f172a
  const govBlue = rgb(0.12, 0.35, 0.72); // #1e5ab8
  const mutedText = rgb(0.39, 0.45, 0.55); // #64748b
  const slateBorder = rgb(0.85, 0.88, 0.92); // #cbd5e1
  const bgLight = rgb(0.96, 0.97, 0.99); // #f8fafc
  const emeraldGreen = rgb(0.08, 0.6, 0.35); // #159a59
  const rubyRed = rgb(0.85, 0.2, 0.2); // #d93333

  // Header Bar
  page.drawRectangle({
    x: 0,
    y: height - 100,
    width,
    height: 100,
    color: govBlue,
  });

  // Top National Emblem / Header text
  page.drawText('GOVERNMENT OF INDIA • PROCUREMENT JUSTIFICATION RECORD', {
    x: 40,
    y: height - 42,
    size: 11,
    font: fontBold,
    color: rgb(0.9, 0.95, 1),
  });

  page.drawText('NAVSETU STATUTORY PILOT CONVERSION CERTIFICATE', {
    x: 40,
    y: height - 68,
    size: 18,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText('Under GFR Rule 149(viii) & GeM Startup Runway Direct Procurement Framework', {
    x: 40,
    y: height - 86,
    size: 9,
    font: fontRegular,
    color: rgb(0.8, 0.9, 1),
  });

  let currentY = height - 130;

  // Metadata Card Background
  page.drawRectangle({
    x: 40,
    y: currentY - 110,
    width: width - 80,
    height: 120,
    color: bgLight,
    borderColor: slateBorder,
    borderWidth: 1,
  });

  // Contract Details (Left Column)
  page.drawText(`Contract Reference:`, { x: 55, y: currentY - 15, size: 9, font: fontBold, color: mutedText });
  page.drawText(contractId, { x: 170, y: currentY - 15, size: 10, font: fontBold, color: darkNavy });

  page.drawText(`Procuring Dept:`, { x: 55, y: currentY - 32, size: 9, font: fontBold, color: mutedText });
  const deptName = (pilot.department_name || 'Department of Drinking Water & Sanitation').slice(0, 52);
  page.drawText(deptName, { x: 170, y: currentY - 32, size: 9, font: fontRegular, color: darkNavy });

  page.drawText(`Awardee Startup:`, { x: 55, y: currentY - 49, size: 9, font: fontBold, color: mutedText });
  page.drawText(`${pilot.startup_name || 'AquaSense Analytics Pvt Ltd'} (${pilot.startup_dpiit || 'DIPP-89211'})`, {
    x: 170,
    y: currentY - 49,
    size: 9,
    font: fontRegular,
    color: darkNavy,
  });

  page.drawText(`Problem Challenge:`, { x: 55, y: currentY - 66, size: 9, font: fontBold, color: mutedText });
  const probTitle = (pilot.problem_title || 'AI Acoustic Pipeline Leakage Detection').slice(0, 52);
  page.drawText(probTitle, { x: 170, y: currentY - 66, size: 9, font: fontRegular, color: darkNavy });

  page.drawText(`Statutory Authority:`, { x: 55, y: currentY - 83, size: 9, font: fontBold, color: mutedText });
  page.drawText(pilot.rule_reference || 'Rule 149(viii) GFR 2017 / GeM Direct Mandate', {
    x: 170,
    y: currentY - 83,
    size: 9,
    font: fontBold,
    color: govBlue,
  });

  page.drawText(`Pilot Period:`, { x: 55, y: currentY - 100, size: 9, font: fontBold, color: mutedText });
  page.drawText(`${pilot.start_date} to ${pilot.end_date}`, {
    x: 170,
    y: currentY - 100,
    size: 9,
    font: fontRegular,
    color: darkNavy,
  });

  page.drawText(`Contract Value:`, { x: 380, y: currentY - 15, size: 9, font: fontBold, color: mutedText });
  const formattedVal = `INR ${(pilot.contract_value || pilot.budget || 1420000).toLocaleString('en-IN')}`;
  page.drawText(formattedVal, { x: 460, y: currentY - 15, size: 10, font: fontBold, color: darkNavy });

  // Milestone performance calculation
  const totalM = pilot.milestones?.length || 0;
  const metM = (pilot.milestones || []).filter((m) => m.status === 'met').length;
  const successPct = totalM > 0 ? Math.round((metM / totalM) * 100) : 100;

  page.drawText(`Pilot Success Rate:`, { x: 380, y: currentY - 32, size: 9, font: fontBold, color: mutedText });
  page.drawText(`${successPct}% (${metM}/${totalM} Met)`, {
    x: 480,
    y: currentY - 32,
    size: 10,
    font: fontBold,
    color: emeraldGreen,
  });

  currentY -= 135;

  // Section Header: Milestone Verification Table
  page.drawText('VERIFIED PILOT MILESTONES & PERFORMANCE EVIDENCE', {
    x: 40,
    y: currentY,
    size: 11,
    font: fontBold,
    color: darkNavy,
  });

  currentY -= 15;

  // Table Header
  page.drawRectangle({
    x: 40,
    y: currentY - 18,
    width: width - 80,
    height: 22,
    color: rgb(0.9, 0.93, 0.97),
  });

  page.drawText('ID / Title', { x: 50, y: currentY - 12, size: 8, font: fontBold, color: darkNavy });
  page.drawText('Target Performance Benchmark', { x: 190, y: currentY - 12, size: 8, font: fontBold, color: darkNavy });
  page.drawText('Outcome', { x: 420, y: currentY - 12, size: 8, font: fontBold, color: darkNavy });
  page.drawText('Auditable Evidence', { x: 475, y: currentY - 12, size: 8, font: fontBold, color: darkNavy });

  currentY -= 25;

  // Milestone Rows
  (pilot.milestones || []).slice(0, 6).forEach((m: Milestone, idx: number) => {
    const isMet = m.status === 'met';
    const rowBg = idx % 2 === 0 ? rgb(1, 1, 1) : bgLight;

    page.drawRectangle({
      x: 40,
      y: currentY - 32,
      width: width - 80,
      height: 34,
      color: rowBg,
      borderColor: slateBorder,
      borderWidth: 0.5,
    });

    // Milestone ID & Title
    page.drawText(`M${idx + 1}: ${(m.title || '').slice(0, 24)}`, {
      x: 48,
      y: currentY - 14,
      size: 8,
      font: fontBold,
      color: darkNavy,
    });

    // Target benchmark (truncated to fit)
    const targetSnippet = (m.target || '').slice(0, 48);
    page.drawText(targetSnippet, {
      x: 190,
      y: currentY - 14,
      size: 7.5,
      font: fontRegular,
      color: mutedText,
    });

    // Outcome Badge
    page.drawText(isMet ? 'MET' : 'MISSED', {
      x: 425,
      y: currentY - 14,
      size: 8,
      font: fontBold,
      color: isMet ? emeraldGreen : rubyRed,
    });

    // Evidence
    const evidenceText = m.evidence_url ? 'Validated' : 'On Record';
    page.drawText(evidenceText, {
      x: 480,
      y: currentY - 14,
      size: 7.5,
      font: fontRegular,
      color: govBlue,
    });

    currentY -= 36;
  });

  currentY -= 20;

  // Cryptographic Proof Box (Sha-256 + QR Code)
  page.drawRectangle({
    x: 40,
    y: currentY - 145,
    width: width - 80,
    height: 155,
    color: rgb(0.97, 0.98, 1),
    borderColor: rgb(0.7, 0.8, 0.95),
    borderWidth: 1.5,
  });

  // Embed QR Image
  page.drawImage(qrImage, {
    x: 55,
    y: currentY - 130,
    width: 110,
    height: 110,
  });

  page.drawText('TAMPER-EVIDENT CRYPTOGRAPHIC ANCHOR', {
    x: 180,
    y: currentY - 20,
    size: 11,
    font: fontBold,
    color: darkNavy,
  });

  page.drawText(
    'This document is bound to the pilot milestone execution record via SHA-256 canonical hashing.',
    {
      x: 180,
      y: currentY - 35,
      size: 8,
      font: fontRegular,
      color: mutedText,
    }
  );

  page.drawText('SHA-256 Pilot Record Hash:', {
    x: 180,
    y: currentY - 55,
    size: 8,
    font: fontBold,
    color: darkNavy,
  });

  // Short hash for human readability + full hash below
  const shortHash = `${recordHash.slice(0, 16)}...${recordHash.slice(-16)}`;
  page.drawText(shortHash, {
    x: 180,
    y: currentY - 70,
    size: 10,
    font: fontMono,
    color: govBlue,
  });

  page.drawText(`Full Hash: ${recordHash}`, {
    x: 180,
    y: currentY - 86,
    size: 6.5,
    font: fontMono,
    color: mutedText,
  });

  page.drawText(`Public Audit URL: ${verifyUrl}`, {
    x: 180,
    y: currentY - 104,
    size: 7.5,
    font: fontRegular,
    color: darkNavy,
  });

  page.drawText('Scan the QR code with any mobile device or browser to verify data integrity in real-time.', {
    x: 180,
    y: currentY - 120,
    size: 7,
    font: fontRegular,
    color: mutedText,
  });

  // Footer
  page.drawText(
    'NavSetu Government Procurement Verification Gateway • GFR 2017 Regulatory Compliance • Automated Audit Seal',
    {
      x: 40,
      y: 35,
      size: 7.5,
      font: fontRegular,
      color: mutedText,
    }
  );

  return await pdfDoc.save();
}
