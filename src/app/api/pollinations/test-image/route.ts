import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const apiKey = process.env.POLLINATIONS_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'POLLINATIONS_API_KEY is not configured on the server.' },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const prompt = body.prompt || 'A premium professional healthcare education poster, sophisticated editorial art direction, clean composition, realistic lighting, elegant medical-scientific aesthetic, no logos, no fake text.';
    const model = body.model || process.env.POLLINATIONS_IMAGE_MODEL || 'tongyi-mai/z-image-turbo';
    const size = body.size || '1024x1024';

    const startTime = Date.now();

    const upstreamRes = await fetch('https://gen.pollinations.ai/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'GIMA-AI-Studio/1.0',
      },
      body: JSON.stringify({
        model,
        prompt,
        n: 1,
        size,
        response_format: 'b64_json',
      }),
    });

    const latencyMs = Date.now() - startTime;

    if (!upstreamRes.ok) {
      const errText = await upstreamRes.text();
      let parsedErr: any = null;
      try {
        parsedErr = JSON.parse(errText);
      } catch {}

      const errMessage = parsedErr?.error?.message || parsedErr?.message || errText || 'Image generation failed';
      return NextResponse.json(
        {
          success: false,
          error: errMessage,
          statusCode: upstreamRes.status,
          latencyMs,
          model,
        },
        { status: upstreamRes.status }
      );
    }

    const data = await upstreamRes.json();
    const item = data.data?.[0];

    let imageDataUrl: string | null = null;
    if (item?.b64_json) {
      imageDataUrl = `data:image/png;base64,${item.b64_json}`;
    } else if (item?.url) {
      imageDataUrl = item.url;
    }

    if (!imageDataUrl) {
      return NextResponse.json(
        { success: false, error: 'No image data returned from upstream.', latencyMs },
        { status: 502 }
      );
    }

    // Check updated balance
    let updatedBalance: number | undefined;
    try {
      const balRes = await fetch('https://gen.pollinations.ai/account/balance', {
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: 'no-store',
      });
      if (balRes.ok) {
        const balData = await balRes.json();
        updatedBalance = balData.balance;
      }
    } catch {}

    return NextResponse.json({
      success: true,
      imageDataUrl,
      model,
      latencyMs,
      updatedBalance,
      prompt,
    });
  } catch (err: any) {
    console.error('[Pollinations Test Image Error]:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal error' },
      { status: 500 }
    );
  }
}
