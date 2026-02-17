import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors, handleOptions } from './_utils.js';

/**
 * 헬스체크 엔드포인트
 * GET /api/health
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  cors(res);

  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    apis: {
      mafra: '/api/mafra - 농림축산식품부 API',
      nps: '/api/nps - 국민연금 API',
      bokjiro: '/api/bokjiro - 복지로 API',
    },
  });
}
