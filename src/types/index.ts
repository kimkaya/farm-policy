// ============================================================
// 농민 정책 도우미 - 타입 정의
// ============================================================

// 사용자 프로필 (농민 정보)
export interface UserProfile {
  id?: string;
  user_id: string;
  name: string;
  birth_date: string;
  phone: string;
  address_sido: string;
  address_sigungu: string;
  address_detail: string;
  farm_area: number; // 평 단위
  crop_types: string[]; // 작물 종류
  farming_type: string; // 영농 형태 (논농업, 밭농업, 과수, 축산 등)
  farm_registration_no: string; // 농업경영체 등록번호
  household_members: number; // 가구원 수
  annual_income: number; // 연소득 (만원)
  is_eco_certified: boolean; // 친환경 인증 여부
  is_successor_farmer: boolean; // 후계농업인 여부
  created_at?: string;
  updated_at?: string;
}

// 정책 카테고리
export interface PolicyCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  sort_order: number;
}

// 정책 정보
export interface Policy {
  id: string;
  category_id: string;
  category?: PolicyCategory;
  title: string;
  summary: string;
  description: string;
  eligibility: string; // 신청 자격
  benefits: string; // 지원 내용
  required_documents: string[]; // 필요 서류
  apply_start_date: string | null;
  apply_end_date: string | null;
  apply_url: string;
  apply_method: string; // 신청 방법
  contact_info: string; // 문의처
  department: string; // 담당 부서
  api_source: string | null; // 공공API 출처
  min_age: number | null;
  max_age: number | null;
  min_income: number | null;
  max_income: number | null;
  required_farm_area: number | null;
  required_farming_types: string[] | null;
  required_region: string | null;
  requires_eco_cert: boolean;
  is_active: boolean;
  created_at?: string;
}

// 정책 매칭 결과
export interface PolicyMatch {
  policy: Policy;
  match_score: number; // 0-100
  match_reasons: string[];
  missing_conditions: string[];
}

// 신청서 양식 필드
export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
  profile_key?: keyof UserProfile; // 자동 채움 매핑
  required: boolean;
  options?: string[];
  placeholder?: string;
  value?: string;
}

// 신청서 양식 템플릿
export interface PolicyFormTemplate {
  id: string;
  policy_id: string;
  form_name: string;
  fields: FormField[];
}

// 신청서 작성 이력
export interface Application {
  id: string;
  user_id: string;
  policy_id: string;
  policy?: Policy;
  form_data: Record<string, any>;
  status: 'draft' | 'completed' | 'printed';
  created_at: string;
  updated_at: string;
}

// 공공 API 응답
export interface PublicApiResponse<T> {
  success: boolean;
  data: T;
  total_count: number;
  error?: string;
}

// 사용자 서류 (업로드된 문서)
export interface UserDocument {
  id: string;
  user_id: string;
  doc_name: string;      // 서류 이름 (예: "주민등록등본")
  doc_type: string;       // 서류 유형 키 (매칭용, 예: "주민등록등본")
  file_path: string;      // Supabase Storage 경로
  file_size: number;
  mime_type: string;
  created_at: string;
  updated_at: string;
}

// 서류 체크리스트 항목 (정책 필요서류 vs 내가 가진 서류)
export interface DocumentCheckItem {
  doc_name: string;       // 필요서류 이름
  has_document: boolean;  // 내가 가지고 있는지
  user_document?: UserDocument; // 매칭된 내 서류
}
