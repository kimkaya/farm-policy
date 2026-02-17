import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors, handleOptions, fetchPublicApi } from './_utils.js';

/**
 * 농림축산식품부 공공API 프록시
 *
 * GET /api/mafra?type=directPayment&page=1&perPage=10
 *
 * type 파라미터:
 * - directPayment: 직불제 정보
 * - farmSupport: 농업경영 지원 정보
 * - farmMachine: 농기계 임대 정보
 */

const MAFRA_BASE = 'https://api.odcloud.kr/api';

// 공공데이터포털 API 엔드포인트 매핑
const API_ENDPOINTS: Record<string, string> = {
  directPayment: '/15064148/v1/uddi:5601c1ce-ad07-4815-a9c3-837a2f41b105',
  farmSupport: '/15064149/v1/uddi:232e0e84-2fbe-4413-a5e5-1be3b tried-4210',
  farmMachine: '/15064150/v1/uddi:ae3c58ef-d767-4a9e-a29f-15d2a57e0c34',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  cors(res);

  try {
    const { type = 'directPayment', page = '1', perPage = '10' } = req.query as Record<string, string>;
    const serviceKey = process.env.DATA_GO_KR_API_KEY;

    if (!serviceKey) {
      return res.status(200).json({
        success: true,
        data: [],
        total_count: 0,
        message: 'API 키가 설정되지 않았습니다. 샘플 데이터를 사용합니다.',
        source: 'fallback',
      });
    }

    const endpoint = API_ENDPOINTS[type];
    if (!endpoint) {
      return res.status(400).json({
        success: false,
        error: `지원하지 않는 type: ${type}. 가능한 값: ${Object.keys(API_ENDPOINTS).join(', ')}`,
      });
    }

    const data = await fetchPublicApi(`${MAFRA_BASE}${endpoint}`, {
      serviceKey,
      page,
      perPage,
      returnType: 'JSON',
    });

    return res.status(200).json({
      success: true,
      data: data?.data || data?.body?.items || [],
      total_count: data?.totalCount || data?.body?.totalCount || 0,
      source: 'mafra_api',
    });
  } catch (error: any) {
    console.error('농림축산식품부 API 에러:', error.message);
    return res.status(200).json({
      success: true,
      data: [],
      total_count: 0,
      message: '공공API 연동 오류. 저장된 데이터를 사용합니다.',
      source: 'fallback',
      error: error.message,
    });
  }
}
