import { supabase } from './supabase';
import type { Policy, PolicyCategory, PolicyFormTemplate, PolicyMatch, UserProfile } from '../types';

// ============================================================
// 정책 서비스
// ============================================================

export async function getCategories(): Promise<PolicyCategory[]> {
  const { data, error } = await supabase
    .from('policy_categories')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return data || [];
}

export async function getPolicies(filters?: {
  category_id?: string;
  search?: string;
  is_active?: boolean;
}): Promise<Policy[]> {
  let query = supabase
    .from('policies')
    .select('*, category:policy_categories(*)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (filters?.category_id) {
    query = query.eq('category_id', filters.category_id);
  }
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,summary.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getPolicyById(id: string): Promise<Policy | null> {
  const { data, error } = await supabase
    .from('policies')
    .select('*, category:policy_categories(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function getFormTemplate(policyId: string): Promise<PolicyFormTemplate | null> {
  const { data, error } = await supabase
    .from('policy_form_templates')
    .select('*')
    .eq('policy_id', policyId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// ============================================================
// 조건 매칭 엔진 - 내 정보 기반 맞춤 정책 추천
// ============================================================

export function matchPolicies(profile: UserProfile, policies: Policy[]): PolicyMatch[] {
  const today = new Date();
  const birthDate = new Date(profile.birth_date);
  const age = today.getFullYear() - birthDate.getFullYear();

  return policies
    .map((policy) => {
      let score = 0;
      const reasons: string[] = [];
      const missing: string[] = [];

      // 1. 나이 조건
      if (policy.min_age !== null && policy.max_age !== null) {
        if (age >= policy.min_age && age <= policy.max_age) {
          score += 25;
          reasons.push(`나이 조건 충족 (${policy.min_age}~${policy.max_age}세)`);
        } else {
          missing.push(`나이 ${policy.min_age}~${policy.max_age}세 필요 (현재 ${age}세)`);
        }
      } else if (policy.min_age !== null) {
        if (age >= policy.min_age) {
          score += 25;
          reasons.push(`나이 조건 충족 (만 ${policy.min_age}세 이상)`);
        } else {
          missing.push(`만 ${policy.min_age}세 이상 필요 (현재 ${age}세)`);
        }
      } else if (policy.max_age !== null) {
        if (age <= policy.max_age) {
          score += 25;
          reasons.push(`나이 조건 충족 (만 ${policy.max_age}세 이하)`);
        } else {
          missing.push(`만 ${policy.max_age}세 이하 필요 (현재 ${age}세)`);
        }
      } else {
        score += 25; // 나이 제한 없음
        reasons.push('나이 제한 없음');
      }

      // 2. 소득 조건
      if (policy.max_income !== null) {
        const monthlyIncome = Math.round(profile.annual_income / 12);
        if (monthlyIncome <= policy.max_income) {
          score += 25;
          reasons.push('소득 조건 충족');
        } else {
          missing.push(`월 소득 ${policy.max_income}만원 이하 필요`);
        }
      } else {
        score += 25;
      }

      // 3. 농지 면적 조건
      if (policy.required_farm_area !== null) {
        if (profile.farm_area >= policy.required_farm_area) {
          score += 25;
          reasons.push(`농지 면적 조건 충족 (${profile.farm_area}평)`);
        } else {
          missing.push(`농지 ${policy.required_farm_area}평 이상 필요 (현재 ${profile.farm_area}평)`);
        }
      } else {
        score += 25;
      }

      // 4. 친환경 인증
      if (policy.requires_eco_cert) {
        if (profile.is_eco_certified) {
          score += 15;
          reasons.push('친환경 인증 보유');
        } else {
          score -= 10;
          missing.push('친환경 인증 필요');
        }
      } else {
        score += 10;
      }

      // 5. 영농 형태
      if (policy.required_farming_types && policy.required_farming_types.length > 0) {
        if (policy.required_farming_types.includes(profile.farming_type)) {
          score += 10;
          reasons.push(`영농 형태 일치 (${profile.farming_type})`);
        } else {
          missing.push(`영농 형태: ${policy.required_farming_types.join(', ')} 필요`);
        }
      }

      // 6. 지역
      if (policy.required_region) {
        if (profile.address_sido === policy.required_region || profile.address_sigungu === policy.required_region) {
          score += 10;
          reasons.push('해당 지역 거주');
        } else {
          missing.push(`${policy.required_region} 지역 거주 필요`);
        }
      }

      // 점수 정규화 (0-100)
      score = Math.max(0, Math.min(100, score));

      return { policy, match_score: score, match_reasons: reasons, missing_conditions: missing };
    })
    .filter((m) => m.match_score > 30) // 30점 이상만 추천
    .sort((a, b) => b.match_score - a.match_score);
}

// ============================================================
// 프로필 서비스
// ============================================================

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function upsertProfile(profile: Partial<UserProfile> & { user_id: string }): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert(
      { ...profile, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ============================================================
// 신청서 서비스
// ============================================================

export async function saveApplication(app: {
  user_id: string;
  policy_id: string;
  form_data: Record<string, any>;
  status: string;
}) {
  const { data, error } = await supabase
    .from('applications')
    .insert(app)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getMyApplications(userId: string) {
  const { data, error } = await supabase
    .from('applications')
    .select('*, policy:policies(title, department)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}
