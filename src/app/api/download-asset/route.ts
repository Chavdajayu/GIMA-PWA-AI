import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Validates and sanitizes asset URLs to prevent SSRF
 */
function isApprovedAssetUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  if (
    url.startsWith('data:image/png;base64,') ||
    url.startsWith('data:image/jpeg;base64,') ||
    url.startsWith('data:image/jpg;base64,') ||
    url.startsWith('data:image/webp;base64,')
  ) {
    return true;
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    // Block local/internal networks
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      host.startsWith('172.16.') ||
      host.endsWith('.internal') ||
      host.endsWith('.local')
    ) {
      return false;
    }
    // Allow authoritative GIMA domain and Pollinations media CDN
    return (
      host === 'gim-academy.com' ||
      host.endsWith('.gim-academy.com') ||
      host === 'pollinations.ai' ||
      host.endsWith('.pollinations.ai')
    );
  } catch {
    return false;
  }
}

/**
 * Sanitizes download filenames to prevent directory traversal or unsafe headers
 */
function sanitizeFilename(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9._-]/g, '-');
  return clean.endsWith('.png') || clean.endsWith('.jpg') || clean.endsWith('.webp')
    ? clean
    : `${clean}.png`;
}

/**
 * GET /api/download-asset?url=...&filename=...
 * Streams approved GIMA reference images as clean attachments
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');
  const filename = sanitizeFilename(searchParams.get('filename') || 'GIMA-Reference.png');

  if (!targetUrl || !isApprovedAssetUrl(targetUrl)) {
    return NextResponse.json({ error: 'Unapproved or invalid asset URL.' }, { status: 400 });
  }

  try {
    if (targetUrl.startsWith('data:')) {
      const matches = targetUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return NextResponse.json({ error: 'Invalid data URL format.' }, { status: 400 });
      }
      const mime = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': mime,
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'GIMA-AI-Studio/1.0',
        Accept: 'image/png,image/jpeg,image/webp,image/*,*/*',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to retrieve asset from origin.' }, { status: 502 });
    }

    const contentType = res.headers.get('content-type') || 'image/png';
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err: any) {
    console.error('[Download Asset Route Error]:', err);
    return NextResponse.json({ error: 'Download failed.' }, { status: 500 });
  }
}
