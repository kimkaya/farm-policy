import type { VercelRequest, VercelResponse } from '@vercel/node';
import { cors, handleOptions, fetchPublicApi } from './_utils.js';

/**
 * 복지로(한국사회보장정보원) 공공API 프록시
 *
 * GET /api/bokjiro?type=welfare&page=1&perPage=10&keyword=농업
 *
 * type 파라미터:
 * - welfare: 지자체 복지서비스 정보
 * - lifeSupport: 기초생활보장 정보
 * - energyVoucher: 에너지 바우처 정보
 */

const BOKJIRO_BASE = 'https://api.odcloud.kr/api';

const API_ENDPOINTS: Record<string, string> = {
  welfare: '/15083323/v1/uddi:local-welfare-service',
  lifeSupport: '/15083324/v1/uddi:life-support-info',
  energyVoucher: '/15083325/v1/uddi:energy-voucher-info',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleOptions(req, res)) return;
  cors(res);

  try {
    const {
      type = 'welfare',
      page = '1',
      perPage = '10',
      keyword = '',
    } = req.query as Record<string, string>;
    const serviceKey = process.env.DATA_GO_KR_API_KEY;

    if (!serviceKey) {
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

    const params: Record<string, string> = {
      serviceKey,
      page,
      perPage,
      returnType: 'JSON',
    };
    if (keyword) params['cond[서비스명::LIKE]'] = keyword;

    const data = await fetchPublicApi(`${BOKJIRO_BASE}${endpoint}`, params);

    return res.status(200).json({
      success: true,
      data: data?.data || data?.body?.items || [],
      total_count: data?.totalCount || data?.body?.totalCount || 0,
      source: 'bokjiro_api',
    });
  } catch (error: any) {
    console.error('복지로 API 에러:', error.message);
    return res.status(200).json({
      success: true,
      data: getSampleData('welfare'),
      total_count: 1,
      message: '공공API 연동 오류. 안내 정보를 표시합니다.',
      source: 'fallback',
      error: error.message,
    });
  }
}

function getSampleData(type: string) {
  const samples: Record<string, any[]> = {
    welfare: [
      {
        title: '지자체 복지서비스',
        description: '각 시도/시군구에서 자체적으로 운영하는 복지 사업입니다.',
        contact: '각 지자체 복지과',
        url: 'https://www.bokjiro.go.kr',
      },
    ],
    lifeSupport: [
      {
        title: '기초생활보장 안내',
        description: '소득인정액이 기준 중위소득 30% 이하 가구에 생계급여를 지급합니다.',
        contact: '보건복지 상담센터 129',
        url: 'https://www.bokjiro.go.kr',
      },
    ],
    energyVoucher: [
      {
        title: '에너지 바우처 안내',
        description: '에너지 취약계층에게 냉난방비를 지원합니다.',
        contact: '한국에너지공단 1600-3190',
        url: 'https://www.energy.or.kr',
      },
    ],
  };
  return samples[type] || [];
}
