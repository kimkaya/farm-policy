import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * 공공API 호출 공통 헬퍼
 * - CORS 헤더 자동 처리
 * - 에러 핸들링
 */
export function cors(res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
}

export function handleOptions(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method === 'OPTIONS') {
    cors(res);
    res.status(200).end();
    return true;
  }
  return false;
}

export async function fetchPublicApi(
  url: string,
  params: Record<string, string>
): Promise<any> {
  const searchParams = new URLSearchParams(params);
  const fullUrl = `${url}?${searchParams.toString()}`;

  const response = await fetch(fullUrl, {
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`공공API 호출 실패: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || '';

  // JSON 응답
  if (contentType.includes('application/json')) {
    return response.json();
  }

  // XML 응답 (공공데이터포털 일부 API)
  const text = await response.text();
  return { raw: text, format: 'xml' };
}
