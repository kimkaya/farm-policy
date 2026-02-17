-- ============================================================
-- 농민 정책 도우미 - 데이터베이스 스키마
-- Supabase (PostgreSQL)에서 실행
-- ============================================================

-- 1. 사용자 프로필 (농민 정보)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  birth_date DATE NOT NULL,
  phone VARCHAR(20),
  address_sido VARCHAR(20) NOT NULL,
  address_sigungu VARCHAR(30),
  address_detail TEXT,
  farm_area INTEGER DEFAULT 0, -- 평 단위
  crop_types TEXT[] DEFAULT '{}', -- 작물 종류 배열
  farming_type VARCHAR(30) DEFAULT '', -- 논농업, 밭농업, 과수, 축산, 복합 등
  farm_registration_no VARCHAR(30) DEFAULT '',
  household_members INTEGER DEFAULT 1,
  annual_income INTEGER DEFAULT 0, -- 만원 단위
  is_eco_certified BOOLEAN DEFAULT FALSE,
  is_successor_farmer BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 정책 카테고리
CREATE TABLE IF NOT EXISTS policy_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  description TEXT,
  color VARCHAR(20) DEFAULT '#16a34a',
  sort_order INTEGER DEFAULT 0
);

-- 3. 정책 정보
CREATE TABLE IF NOT EXISTS policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES policy_categories(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  summary TEXT NOT NULL,
  description TEXT NOT NULL,
  eligibility TEXT NOT NULL, -- 신청 자격
  benefits TEXT NOT NULL, -- 지원 내용
  required_documents TEXT[] DEFAULT '{}',
  apply_start_date DATE,
  apply_end_date DATE,
  apply_url TEXT DEFAULT '',
  apply_method TEXT DEFAULT '',
  contact_info TEXT DEFAULT '',
  department VARCHAR(100) DEFAULT '',
  api_source VARCHAR(200),
  -- 매칭 조건 필드
  min_age INTEGER,
  max_age INTEGER,
  min_income INTEGER, -- 만원
  max_income INTEGER, -- 만원
  required_farm_area INTEGER, -- 최소 농지면적 (평)
  required_farming_types TEXT[],
  required_region VARCHAR(20), -- 특정 지역 (NULL이면 전국)
  requires_eco_cert BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 신청서 양식 템플릿
CREATE TABLE IF NOT EXISTS policy_form_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_id UUID REFERENCES policies(id) ON DELETE CASCADE,
  form_name VARCHAR(200) NOT NULL,
  fields JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 신청서 작성 이력
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  policy_id UUID REFERENCES policies(id) ON DELETE CASCADE,
  form_data JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'draft', -- draft, completed, printed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_policies_category_id ON policies(category_id);
CREATE INDEX IF NOT EXISTS idx_policies_is_active ON policies(is_active);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);

-- RLS (Row Level Security) 정책
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- 사용자는 본인 프로필만 읽기/쓰기
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- 정책은 모든 인증된 사용자가 읽기 가능
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view policies" ON policies
  FOR SELECT USING (true);

ALTER TABLE policy_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories" ON policy_categories
  FOR SELECT USING (true);

ALTER TABLE policy_form_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view form templates" ON policy_form_templates
  FOR SELECT USING (true);

-- 사용자는 본인 신청서만 관리
CREATE POLICY "Users can view own applications" ON applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications" ON applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications" ON applications
  FOR UPDATE USING (auth.uid() = user_id);
