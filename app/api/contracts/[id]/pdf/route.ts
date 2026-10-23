import { NextResponse, type NextRequest } from 'next/server';
import { getContractById } from '@/lib/departmentStore';
import { generateJustificationPdf } from '@/lib/services/pdfService';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await context.params;
    let targetId = rawId;

    if (rawId === 'demo') {
      targetId = 'CNT-2026-JAL-0881';
    }

    const pilot = getContractById(targetId);
    if (!pilot) {
      return NextResponse.json({ error: 'Contract record not found' }, { status: 404 });
    }

    const contractId = pilot.contract_id || targetId;
    const recordHash = pilot.record_hash || '7f9a2b8e3d4c1a5f6e8b0d2c4e6a8f0b2d4e6a8f0b2d4e6a8f0b2d4e6a8f0b2d';

    // Determine host URL for QR code
    const host = request.headers.get('host') || 'localhost:3000';
    const proto = request.headers.get('x-forwarded-proto') || 'http';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${proto}://${host}`;

    const pdfBytes = await generateJustificationPdf({
      pilot,
      contractId,
      recordHash,
      appUrl,
    });

    return new Response(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="NavSetu-Justification-${contractId}.pdf"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to generate PDF' }, { status: 500 });
  }
}
