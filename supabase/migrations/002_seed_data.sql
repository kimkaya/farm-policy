-- ============================================================
-- 농민 정책 도우미 - 초기 데이터 (카테고리 + 정책 + 신청서양식)
-- ============================================================

-- 1. 정책 카테고리
INSERT INTO policy_categories (id, name, icon, description, color, sort_order) VALUES
  ('a0000001-0000-0000-0000-000000000001', '농업 지원', 'Tractor', '직불제, 영농자금, 농기계 등 농업 활동 지원 정책', '#16a34a', 1),
  ('a0000001-0000-0000-0000-000000000002', '연금/기초연금', 'Landmark', '국민연금, 기초연금, 농지연금 등 노후 보장 정책', '#2563eb', 2),
  ('a0000001-0000-0000-0000-000000000003', '건강/의료', 'Heart', '건강보험 감면, 건강검진, 농업인 안전보험 등', '#dc2626', 3),
  ('a0000001-0000-0000-0000-000000000004', '생활 복지', 'Home', '기초생활보장, 주거지원, 에너지바우처 등 생활 지원', '#9333ea', 4),
  ('a0000001-0000-0000-0000-000000000005', '지자체 지원', 'MapPin', '시도/시군구별 자체 지원 사업', '#ca8a04', 5),
  ('a0000001-0000-0000-0000-000000000006', '교육/컨설팅', 'GraduationCap', '영농교육, 컨설팅, 후계농 육성 등', '#0891b2', 6);

-- 2. 농업 지원 정책
INSERT INTO policies (id, category_id, title, summary, description, eligibility, benefits, required_documents, apply_url, apply_method, contact_info, department, min_age, max_age, min_income, max_income, required_farm_area, required_farming_types, required_region, requires_eco_cert, is_active) VALUES

-- 공익직접지불제 (기본형)
('b0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001',
 '공익직접지불제 (기본형 직불금)',
 '농업의 공익적 기능 증진을 위해 농업인에게 직접 지급하는 직불금',
 '공익직접지불제는 농업·농촌의 공익 기능 증진과 농업인의 소득 안정을 위해 시행되는 제도입니다. 기본형 직불금은 소농직불금과 면적직불금으로 구분되며, 소농직불금은 일정 조건을 충족하는 소규모 농가에 연 120만원을 정액 지급합니다. 면적직불금은 농지 면적에 따라 차등 지급됩니다.',
 '농업경영체 등록 농업인, 일정 규모 이상 경작, 의무교육 이수자',
 '소농직불금: 연 120만원 정액 / 면적직불금: 논 ha당 205만원, 밭 ha당 178만원 (상한 있음)',
 ARRAY['농업경영체 등록확인서', '신분증', '통장사본', '경작사실확인서'],
 'https://www.mafra.go.kr',
 '읍면동 주민센터 방문 신청 또는 온라인 신청',
 '농림축산식품부 직불제과 044-201-1532',
 '농림축산식품부',
 NULL, NULL, NULL, NULL, 100, NULL, NULL, FALSE, TRUE),

-- 친환경농업직접직불제
('b0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001',
 '친환경농업 직접직불제',
 '친환경 인증 농산물을 생산하는 농업인에게 추가 직불금 지급',
 '친환경농업을 실천하는 농가의 소득을 보전하고 친환경농업 확산을 위한 정책입니다. 유기농업, 무농약 농산물 인증을 받은 농가에 면적 기준으로 직불금을 지급합니다.',
 '친환경 인증(유기, 무농약) 농산물 재배 농업인, 농업경영체 등록자',
 '유기: ha당 50~100만원 / 무농약: ha당 40~70만원 (작물별 상이)',
 ARRAY['친환경인증서', '농업경영체 등록확인서', '경작사실확인서', '통장사본'],
 'https://www.mafra.go.kr',
 '읍면동 주민센터 방문 신청',
 '농림축산식품부 친환경농업과 044-201-2062',
 '농림축산식품부',
 NULL, NULL, NULL, NULL, 100, NULL, NULL, TRUE, TRUE),

-- 밭농업직불제
('b0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000001',
 '밭농업 직접직불제',
 '밭작물 재배 농가의 소득 안정을 위한 직불금',
 '쌀 중심의 농업 구조에서 밭작물 자급률을 높이고, 밭작물 재배 농가의 소득을 보전하기 위한 정책입니다. 콩, 팥, 옥수수 등 밭작물 재배 농가에 면적 기준으로 직불금을 지급합니다.',
 '밭작물 재배 농업인, 농업경영체 등록자',
 'ha당 40~50만원 (작물별 상이)',
 ARRAY['농업경영체 등록확인서', '경작사실확인서', '통장사본', '신분증'],
 'https://www.mafra.go.kr',
 '읍면동 주민센터 방문 신청',
 '농림축산식품부 식량정책과 044-201-1824',
 '농림축산식품부',
 NULL, NULL, NULL, NULL, 100, ARRAY['밭농업'], NULL, FALSE, TRUE),

-- 후계농업경영인 지원
('b0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000001',
 '후계농업경영인 육성 지원사업',
 '젊은 농업인의 영농 정착을 위한 자금 지원',
 '농업에 뜻을 둔 청년 및 후계 농업인이 안정적으로 영농에 정착할 수 있도록 영농 정착 자금과 교육을 지원하는 사업입니다.',
 '만 18세 이상 50세 미만, 독립 영농 경력 없거나 10년 이내, 영농의지가 있는 자',
 '영농정착금 월 최대 110만원 (최대 3년) / 영농자금 최대 3억원 융자',
 ARRAY['영농계획서', '신분증', '농업경영체 등록확인서', '졸업증명서', '통장사본'],
 'https://www.mafra.go.kr',
 '시군구 농업기술센터 신청',
 '농림축산식품부 경영인력과 044-201-1554',
 '농림축산식품부',
 18, 50, NULL, NULL, NULL, NULL, NULL, FALSE, TRUE),

-- 농기계 임대사업
('b0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000001',
 '농업기계 임대사업',
 '고가의 농기계를 저렴하게 임대하여 농가 경영비 절감',
 '농가가 개별적으로 구입하기 어려운 고가의 농기계를 시군 농업기술센터에서 저렴한 비용으로 임대해주는 사업입니다.',
 '해당 시군 거주 농업인, 농업경영체 등록자',
 '트랙터, 콤바인, 이앙기 등 농기계 저렴한 임대 (시가의 10~30% 수준)',
 ARRAY['농업경영체 등록확인서', '신분증'],
 '',
 '시군 농업기술센터 방문 또는 전화 신청',
 '각 시군 농업기술센터',
 '농림축산식품부 / 각 지자체',
 NULL, NULL, NULL, NULL, 100, NULL, NULL, FALSE, TRUE),

-- 조건불리지역직접지불제
('b0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000001',
 '조건불리지역 직접지불제',
 '경지 조건이 불리한 지역 농업인에게 보조금 지급',
 '경사도가 높거나 수원이 먼 등 영농 조건이 불리한 지역에서 농업에 종사하는 농업인의 소득을 보전하기 위한 제도입니다.',
 '조건불리지역으로 지정된 읍면 소재 농지 경작 농업인',
 '논·밭 ha당 55만원 (상한 있음)',
 ARRAY['농업경영체 등록확인서', '경작사실확인서', '통장사본'],
 'https://www.mafra.go.kr',
 '읍면동 주민센터 방문 신청',
 '농림축산식품부 직불제과 044-201-1532',
 '농림축산식품부',
 NULL, NULL, NULL, NULL, 100, NULL, NULL, FALSE, TRUE);

-- 3. 연금/기초연금 정책
INSERT INTO policies (id, category_id, title, summary, description, eligibility, benefits, required_documents, apply_url, apply_method, contact_info, department, min_age, max_age, min_income, max_income, required_farm_area, required_farming_types, required_region, requires_eco_cert, is_active) VALUES

-- 국민연금
('b0000001-0000-0000-0000-000000000101', 'a0000001-0000-0000-0000-000000000002',
 '국민연금',
 '만 60세(출생연도별 상이)부터 수령 가능한 노후 소득 보장 제도',
 '국민연금은 가입자가 일정 기간 보험료를 납부한 후, 노령·장애·사망 등으로 소득능력이 감소할 때 연금을 지급하는 사회보장 제도입니다. 농업인도 지역가입자로 가입하며, 농어민 연금보험료 지원을 받을 수 있습니다.',
 '만 18세 이상 60세 미만 국민 (농업인은 지역가입자), 최소 10년(120개월) 이상 가입',
 '납부 기간·금액에 따라 월 30만원~200만원 이상 수령 가능 / 농어민 보험료 50% 국고지원 (월 최대 46,350원)',
 ARRAY['신분증', '통장사본', '소득증빙서류'],
 'https://www.nps.or.kr',
 '국민연금공단 지사 방문 또는 온라인(내연금 앱)',
 '국민연금공단 1355',
 '보건복지부 / 국민연금공단',
 18, NULL, NULL, NULL, NULL, NULL, NULL, FALSE, TRUE),

-- 기초연금
('b0000001-0000-0000-0000-000000000102', 'a0000001-0000-0000-0000-000000000002',
 '기초연금',
 '만 65세 이상 소득 하위 70% 어르신에게 매월 지급되는 연금',
 '기초연금은 노인의 생활 안정을 위해 만 65세 이상 소득인정액이 선정기준액 이하인 어르신에게 매월 일정액을 지급하는 제도입니다. 국민연금과 별도로 지급됩니다.',
 '만 65세 이상, 대한민국 국적, 국내 거주, 소득인정액 기준 하위 70%',
 '단독가구 월 최대 334,810원 / 부부가구 월 최대 535,680원 (2024년 기준)',
 ARRAY['신분증', '통장사본', '소득·재산 관련 서류', '임대차계약서(해당시)'],
 'https://basicpension.mohw.go.kr',
 '주소지 읍면동 주민센터, 국민연금공단 지사, 복지로 온라인 신청',
 '보건복지 상담센터 129 / 국민연금공단 1355',
 '보건복지부',
 65, NULL, NULL, 2130, NULL, NULL, NULL, FALSE, TRUE),

-- 농지연금
('b0000001-0000-0000-0000-000000000103', 'a0000001-0000-0000-0000-000000000002',
 '농지연금',
 '소유 농지를 담보로 매월 연금을 수령하는 제도',
 '만 65세 이상 농업인이 소유한 농지를 담보로 매월 연금을 수령하는 제도입니다. 농지를 팔지 않고도 노후 생활자금을 마련할 수 있습니다. 사망 시 배우자 승계 가능합니다.',
 '만 65세 이상, 영농경력 5년 이상, 소유 농지 가격 기준 적합자',
 '농지 가액과 가입 나이에 따라 월 수십만원~수백만원 수령',
 ARRAY['신분증', '농지 등기부등본', '농업경영체 등록확인서', '통장사본'],
 'https://www.fbo.or.kr',
 '한국농어촌공사 지사 방문 신청',
 '한국농어촌공사 1577-7770',
 '농림축산식품부 / 한국농어촌공사',
 65, NULL, NULL, NULL, 300, NULL, NULL, FALSE, TRUE);

-- 4. 건강/의료 정책
INSERT INTO policies (id, category_id, title, summary, description, eligibility, benefits, required_documents, apply_url, apply_method, contact_info, department, min_age, max_age, min_income, max_income, required_farm_area, required_farming_types, required_region, requires_eco_cert, is_active) VALUES

-- 농업인 건강안전보험
('b0000001-0000-0000-0000-000000000201', 'a0000001-0000-0000-0000-000000000003',
 '농업인 안전보험 (농작업 재해보험)',
 '농작업 중 발생하는 재해에 대한 보험료 지원',
 '농업인이 농작업 중 사고나 질병으로 피해를 입었을 때 보상받을 수 있는 보험입니다. 보험료의 50%를 정부가 지원합니다.',
 '농업경영체 등록 농업인',
 '보험료 50% 국고 지원 / 사망·후유장해·치료비 보장',
 ARRAY['농업경영체 등록확인서', '신분증', '통장사본'],
 'https://www.mafra.go.kr',
 'NH농협 등 보험사 통해 가입',
 '농림축산식품부 농업보험정책과 044-201-1794',
 '농림축산식품부',
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, FALSE, TRUE),

-- 농업인 건강보험료 지원
('b0000001-0000-0000-0000-000000000202', 'a0000001-0000-0000-0000-000000000003',
 '농어업인 건강보험료 경감',
 '농어업인 건강보험료 22% 경감 지원',
 '농어업에 종사하는 가입자의 건강보험료 부담을 줄여주는 제도입니다. 지역가입자 중 농어업인으로 확인된 세대에 건강보험료를 22% 경감해줍니다.',
 '농어업에 종사하는 지역 건강보험 가입자',
 '건강보험료 22% 경감',
 ARRAY['농업경영체 등록확인서', '건강보험자격확인서'],
 'https://www.nhis.or.kr',
 '국민건강보험공단 지사 방문 또는 전화 신청',
 '국민건강보험공단 1577-1000',
 '보건복지부 / 국민건강보험공단',
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, FALSE, TRUE),

-- 어르신 건강검진
('b0000001-0000-0000-0000-000000000203', 'a0000001-0000-0000-0000-000000000003',
 '국가 건강검진 (66세 이상 생애전환기)',
 '66세 이상 어르신 대상 맞춤형 건강검진 무료 제공',
 '만 66세 이상 의료급여 수급권자 및 건강보험 가입자를 대상으로 정신건강검사, 생활습관평가, 노인신체기능검사 등을 포함한 건강검진을 무료로 제공합니다.',
 '만 66세 이상 건강보험 가입자 및 의료급여 수급권자',
 '무료 건강검진 (골밀도 검사, 인지기능장애 검사, 정신건강검사 등 포함)',
 ARRAY['신분증', '건강보험증'],
 'https://www.nhis.or.kr',
 '가까운 검진기관 방문',
 '국민건강보험공단 1577-1000',
 '보건복지부',
 66, NULL, NULL, NULL, NULL, NULL, NULL, FALSE, TRUE);

-- 5. 생활 복지 정책
INSERT INTO policies (id, category_id, title, summary, description, eligibility, benefits, required_documents, apply_url, apply_method, contact_info, department, min_age, max_age, min_income, max_income, required_farm_area, required_farming_types, required_region, requires_eco_cert, is_active) VALUES

-- 기초생활보장
('b0000001-0000-0000-0000-000000000301', 'a0000001-0000-0000-0000-000000000004',
 '국민기초생활보장제도 (생계급여)',
 '소득이 기준 중위소득 30% 이하인 가구에 생계급여 지급',
 '가구의 소득인정액이 기준 중위소득의 30% 이하인 경우 생계급여를 지급하여 최저생활을 보장하는 제도입니다.',
 '소득인정액이 기준 중위소득 30% 이하 가구',
 '1인가구 월 약 71만원, 2인가구 월 약 118만원 (2024년, 소득인정액 차감)',
 ARRAY['신분증', '소득·재산 증빙서류', '임대차계약서', '통장사본', '가족관계증명서'],
 'https://www.bokjiro.go.kr',
 '주소지 읍면동 주민센터 방문 신청',
 '보건복지 상담센터 129',
 '보건복지부',
 NULL, NULL, NULL, 713, NULL, NULL, NULL, FALSE, TRUE),

-- 에너지 바우처
('b0000001-0000-0000-0000-000000000302', 'a0000001-0000-0000-0000-000000000004',
 '에너지 바우처',
 '에너지 취약계층에게 냉난방비를 지원하는 바우처',
 '소득이 낮고 에너지 사용에 어려움이 있는 취약계층 가구에 냉·난방 에너지 비용을 지원합니다. 여름철(7~9월) 냉방, 겨울철(11~3월) 난방 비용을 바우처로 지급합니다.',
 '기초생활수급자 또는 차상위계층 중 노인, 장애인, 영유아, 임산부 등이 포함된 가구',
 '1인가구 연간 약 12만원 ~ 4인가구 약 19만원 (하절기/동절기 차등)',
 ARRAY['신분증', '수급자증명서', '통장사본'],
 'https://www.energy.or.kr',
 '주소지 읍면동 주민센터 방문 신청',
 '한국에너지공단 1600-3190',
 '산업통상자원부',
 NULL, NULL, NULL, 713, NULL, NULL, NULL, FALSE, TRUE),

-- 주거급여
('b0000001-0000-0000-0000-000000000303', 'a0000001-0000-0000-0000-000000000004',
 '주거급여',
 '소득 하위계층의 주거비(임차료·수선비) 지원',
 '소득인정액이 기준 중위소득 48% 이하인 가구에 임차료 보조 또는 자가 주택 수선비를 지원합니다.',
 '소득인정액이 기준 중위소득 48% 이하 가구',
 '임차가구: 지역·가구원수에 따라 월 17~51만원 / 자가가구: 457~1,241만원 수선비',
 ARRAY['신분증', '임대차계약서', '소득·재산 증빙서류', '통장사본'],
 'https://www.bokjiro.go.kr',
 '주소지 읍면동 주민센터 방문 신청',
 '주거급여 콜센터 1600-0777',
 '국토교통부',
 NULL, NULL, NULL, 1140, NULL, NULL, NULL, FALSE, TRUE);

-- 6. 교육/컨설팅 정책
INSERT INTO policies (id, category_id, title, summary, description, eligibility, benefits, required_documents, apply_url, apply_method, contact_info, department, min_age, max_age, min_income, max_income, required_farm_area, required_farming_types, required_region, requires_eco_cert, is_active) VALUES

-- 농업인 교육
('b0000001-0000-0000-0000-000000000401', 'a0000001-0000-0000-0000-000000000006',
 '농업인 역량강화 교육',
 '농업기술, 경영, 마케팅 등 무료 교육 프로그램',
 '농촌진흥청과 각 시도 농업기술원에서 제공하는 무료 교육 프로그램입니다. 스마트팜, 유기농법, 농산물 마케팅, 6차산업 등 다양한 교육을 받을 수 있습니다.',
 '농업경영체 등록 농업인 또는 예비 농업인',
 '무료 교육 / 일부 과정 교통비·식비 지원',
 ARRAY['농업경영체 등록확인서', '신분증'],
 'https://www.rda.go.kr',
 '농촌진흥청 또는 시도 농업기술원 홈페이지에서 신청',
 '농촌진흥청 1544-8572',
 '농촌진흥청',
 NULL, NULL, NULL, NULL, NULL, NULL, NULL, FALSE, TRUE),

-- 농업경영 컨설팅
('b0000001-0000-0000-0000-000000000402', 'a0000001-0000-0000-0000-000000000006',
 '농업경영 컨설팅 지원',
 '전문가가 직접 농가를 방문하여 경영 컨설팅 제공',
 '농업 경영에 어려움을 겪는 농가를 대상으로 전문 컨설턴트가 방문하여 경영진단, 재무관리, 판로 개척 등을 지원합니다.',
 '농업경영체 등록 농업인, 특히 경영 어려움을 겪고 있는 농가',
 '무료 경영 컨설팅 (연 최대 5회)',
 ARRAY['농업경영체 등록확인서', '신분증', '경영관련 자료'],
 'https://www.mafra.go.kr',
 '시군 농업기술센터 또는 농업경영컨설팅센터 신청',
 '농업경영컨설팅센터 1644-8778',
 '농림축산식품부',
 NULL, NULL, NULL, NULL, 100, NULL, NULL, FALSE, TRUE);

-- 7. 신청서 양식 템플릿 (주요 정책)
INSERT INTO policy_form_templates (id, policy_id, form_name, fields) VALUES

-- 공익직접지불제 신청서
('c0000001-0000-0000-0000-000000000001', 'b0000001-0000-0000-0000-000000000001', '공익직접지불제 신청서', '[
  {"id":"name","label":"성명","type":"text","profile_key":"name","required":true},
  {"id":"birth_date","label":"생년월일","type":"date","profile_key":"birth_date","required":true},
  {"id":"phone","label":"연락처","type":"text","profile_key":"phone","required":true},
  {"id":"address","label":"주소","type":"text","profile_key":"address_detail","required":true},
  {"id":"farm_reg_no","label":"농업경영체 등록번호","type":"text","profile_key":"farm_registration_no","required":true},
  {"id":"farm_area","label":"경작 면적 (평)","type":"number","profile_key":"farm_area","required":true},
  {"id":"crop_type","label":"재배 작물","type":"text","profile_key":"crop_types","required":true},
  {"id":"farming_type","label":"영농 형태","type":"select","profile_key":"farming_type","required":true,"options":["논농업","밭농업","과수","축산","복합영농"]},
  {"id":"bank_name","label":"입금 은행","type":"text","required":true},
  {"id":"account_no","label":"계좌번호","type":"text","required":true},
  {"id":"account_holder","label":"예금주","type":"text","profile_key":"name","required":true}
]'),

-- 기초연금 신청서
('c0000001-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000102', '기초연금 신청서', '[
  {"id":"name","label":"성명","type":"text","profile_key":"name","required":true},
  {"id":"birth_date","label":"생년월일","type":"date","profile_key":"birth_date","required":true},
  {"id":"phone","label":"연락처","type":"text","profile_key":"phone","required":true},
  {"id":"address","label":"주소","type":"text","profile_key":"address_detail","required":true},
  {"id":"household_members","label":"가구원 수","type":"number","profile_key":"household_members","required":true},
  {"id":"income","label":"월 소득 (만원)","type":"number","required":true},
  {"id":"property","label":"재산 총액 (만원)","type":"number","required":true},
  {"id":"pension_status","label":"국민연금 수령 여부","type":"select","required":true,"options":["미수령","수령중"]},
  {"id":"bank_name","label":"입금 은행","type":"text","required":true},
  {"id":"account_no","label":"계좌번호","type":"text","required":true},
  {"id":"account_holder","label":"예금주","type":"text","profile_key":"name","required":true}
]'),

-- 농업인 안전보험 신청서
('c0000001-0000-0000-0000-000000000003', 'b0000001-0000-0000-0000-000000000201', '농업인 안전보험 가입 신청서', '[
  {"id":"name","label":"성명","type":"text","profile_key":"name","required":true},
  {"id":"birth_date","label":"생년월일","type":"date","profile_key":"birth_date","required":true},
  {"id":"phone","label":"연락처","type":"text","profile_key":"phone","required":true},
  {"id":"address","label":"주소","type":"text","profile_key":"address_detail","required":true},
  {"id":"farm_reg_no","label":"농업경영체 등록번호","type":"text","profile_key":"farm_registration_no","required":true},
  {"id":"farming_type","label":"영농 형태","type":"select","profile_key":"farming_type","required":true,"options":["논농업","밭농업","과수","축산","복합영농","시설원예"]},
  {"id":"farm_area","label":"경작 면적 (평)","type":"number","profile_key":"farm_area","required":true},
  {"id":"insurance_type","label":"보험 유형","type":"select","required":true,"options":["농작업재해보험","농기계종합보험"]},
  {"id":"bank_name","label":"보험금 수령 은행","type":"text","required":true},
  {"id":"account_no","label":"계좌번호","type":"text","required":true}
]'),

-- 국민연금 신청서
('c0000001-0000-0000-0000-000000000004', 'b0000001-0000-0000-0000-000000000101', '국민연금 가입/변경 신청서', '[
  {"id":"name","label":"성명","type":"text","profile_key":"name","required":true},
  {"id":"birth_date","label":"생년월일","type":"date","profile_key":"birth_date","required":true},
  {"id":"phone","label":"연락처","type":"text","profile_key":"phone","required":true},
  {"id":"address","label":"주소","type":"text","profile_key":"address_detail","required":true},
  {"id":"income","label":"월평균 소득 (만원)","type":"number","required":true},
  {"id":"farm_reg_no","label":"농업경영체 등록번호 (농어민 보험료 지원용)","type":"text","profile_key":"farm_registration_no","required":false},
  {"id":"apply_type","label":"신청 유형","type":"select","required":true,"options":["신규가입","납부재개","보험료 변경","농어민 보험료 지원 신청"]},
  {"id":"bank_name","label":"은행","type":"text","required":true},
  {"id":"account_no","label":"계좌번호","type":"text","required":true}
]');
