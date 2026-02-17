import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors, handleOptions, fetchPublicApi } from './_utils';

/**
 * 국민연금공단 공공API 프록시
 *
 * GET /api/nps?type=pensionInfo&page=1&perPage=10
 *
 * type 파라미터:
 * - pensionInfo: 국민연금 가입/수령 안내 정보
 * - farmerSupport: 농어민 연금보험료 지원 정보
 * - basicPension: 기초연금 안내 정보
 */

const NPS_BASE = 'https://api.odcloud.kr/api';

const API_ENDPOINTS: Record<string, string> = {
  pensionInfo: '/15100742/v1/uddi:pension-info',
  farmerSupport: '/15100743/v1/uddi:farmer-pension-support',
  basicPension: '/15100744/v1/uddi:basic-pension-info',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  cors(res);

  try {
    const { type = 'pensionInfo', page = '1', perPage = '10' } = req.query as Record<string, string>;
    const serviceKey = process.env.DATA_GO_KR_API_KEY;

    if (!serviceKey) {
      // API 키 없으면 안내 정보 반환
      return res.status(200).json({
        success: true,
        data: getSampleData(type),
        total_count: 1,
        message: 'API 키가 설정되지 않았습니다. 안내 정보를 표시합니다.',
        source: 'fallback',
      });
    }

    const endpoint = API_ENDPOINTS[type];
    if (!endpoint) {
      return res.status(400).json({
        success: false,
        error: `지원하지 않는 type: ${type}`,
      });
    }

    const data = await fetchPublicApi(`${NPS_BASE}${endpoint}`, {
      serviceKey,
      page,
      perPage,
      returnType: 'JSON',
    });

    return res.status(200).json({
      success: true,
      data: data?.data || data?.body?.items || [],
      total_count: data?.totalCount || data?.body?.totalCount || 0,
      source: 'nps_api',
    });
  } catch (error: any) {
    console.error('국민연금 API 에러:', error.message);
    return res.status(200).json({
      success: true,
      data: getSampleData('pensionInfo'),
      total_count: 1,
      message: '공공API 연동 오류. 안내 정보를 표시합니다.',
      source: 'fallback',
      error: error.message,
    });
  }
}

function getSampleData(type: string) {
  const samples: Record<string, any[]> = {
    pensionInfo: [
      {
        title: '국민연금 안내',
        description: '국민연금은 만 18세 이상 60세 미만 국민이 가입 대상입니다.',
        contact: '국민연금공단 1355',
        url: 'https://www.nps.or.kr',
      },
    ],
    farmerSupport: [
      {
        title: '농어민 연금보험료 지원',
        description: '농어민 국민연금 보험료의 50%를 국고에서 지원합니다 (월 최대 46,350원).',
        contact: '국민연금공단 1355',
        url: 'https://www.nps.or.kr',
      },
    ],
    basicPension: [
      {
        title: '기초연금 안내',
        description: '만 65세 이상, 소득 하위 70% 어르신에게 월 최대 334,810원 지급.',
        contact: '보건복지 상담센터 129',
        url: 'https://basicpension.mohw.go.kr',
      },
    ],
  };
  return samples[type] || [];
}
