import { NextResponse } from 'next/server';
import { PollinationsStatusResponse } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse<PollinationsStatusResponse>> {
  const apiKey = process.env.POLLINATIONS_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json({
      provider: 'Pollinations AI',
      configured: false,
      keyType: 'none',
      baseUrl: 'https://gen.pollinations.ai',
      modelConfigured: process.env.POLLINATIONS_IMAGE_MODEL || 'tongyi-mai/z-image-turbo',
      accountBalanceAvailable: false,
      imageGenerationReachable: false,
      message: 'POLLINATIONS_API_KEY is not configured on the server. Set in .env.local.'
    });
  }

  const keyType: 'secret' | 'app' | 'none' = apiKey.startsWith('sk_')
    ? 'secret'
    : apiKey.startsWith('pk_')
    ? 'app'
    : 'secret';

  try {
    // 1. Check account balance
    const balanceRes = await fetch('https://gen.pollinations.ai/account/balance', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'User-Agent': 'GIMA-AI-Studio/1.0'
      },
      cache: 'no-store'
    });

    let balance: number | undefined;
    let balanceAvailable = false;

    if (balanceRes.ok) {
      const balanceData = await balanceRes.json();
      balance = typeof balanceData.balance === 'number' ? balanceData.balance : balanceData.accountBalance?.total;
      balanceAvailable = typeof balance === 'number';
    }

    // 2. Check profile
    let githubUsername: string | undefined;
    try {
      const profileRes = await fetch('https://gen.pollinations.ai/account/profile', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'User-Agent': 'GIMA-AI-Studio/1.0'
        },
        cache: 'no-store'
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        githubUsername = profileData.githubUsername;
      }
    } catch {}

    const configuredModel = process.env.POLLINATIONS_IMAGE_MODEL || 'tongyi-mai/z-image-turbo';

    return NextResponse.json({
      provider: 'Pollinations AI',
      configured: true,
      keyType,
      baseUrl: 'https://gen.pollinations.ai',
      modelConfigured: configuredModel,
      accountBalanceAvailable: balanceAvailable,
      balance,
      balanceText: balanceAvailable && balance !== undefined ? `Pollen: ${balance.toFixed(4)}` : undefined,
      githubUsername,
      imageGenerationReachable: true,
      message: balanceAvailable
        ? `Connected to Pollinations AI (${keyType} key, balance: ${balance} Pollen). Real image generation active.`
        : 'Connected to Pollinations AI API.'
    });
  } catch (err: any) {
    console.error('[Pollinations Status Error]:', err);
    return NextResponse.json({
      provider: 'Pollinations AI',
      configured: true,
      keyType,
      baseUrl: 'https://gen.pollinations.ai',
      modelConfigured: process.env.POLLINATIONS_IMAGE_MODEL || 'tongyi-mai/z-image-turbo',
      accountBalanceAvailable: false,
      imageGenerationReachable: false,
      message: `Failed to contact Pollinations API: ${err.message || 'Network error'}`
    });
  }
}
