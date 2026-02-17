import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { upsertProfile } from '../services/policyService';
import type { UserProfile } from '../types';
import { Save, User, MapPin, Tractor, Wallet, CheckCircle } from 'lucide-react';

const SIDO_LIST = [
  '서울특별시','부산광역시','대구광역시','인천광역시','광주광역시','대전광역시','울산광역시',
  '세종특별자치시','경기도','강원도','충청북도','충청남도','전라북도','전라남도',
  '경상북도','경상남도','제주특별자치도'
];

const FARMING_TYPES = ['논농업','밭농업','과수','축산','복합영농','시설원예','특용작물','기타'];

const CROP_OPTIONS = [
  '벼','콩','고추','마늘','양파','감자','고구마','배추','무','토마토',
  '딸기','사과','배','포도','감귤','복숭아','인삼','버섯','기타'
];

export default function MyInfo() {
  const { user, profile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<Partial<UserProfile>>({
    name: '',
    birth_date: '',
    phone: '',
    address_sido: '',
    address_sigungu: '',
    address_detail: '',
    farm_area: 0,
    crop_types: [],
    farming_type: '',
    farm_registration_no: '',
    household_members: 1,
    annual_income: 0,
    is_eco_certified: false,
    is_successor_farmer: false,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || '',
        birth_date: profile.birth_date || '',
        phone: profile.phone || '',
        address_sido: profile.address_sido || '',
        address_sigungu: profile.address_sigungu || '',
        address_detail: profile.address_detail || '',
        farm_area: profile.farm_area || 0,
        crop_types: profile.crop_types || [],
        farming_type: profile.farming_type || '',
        farm_registration_no: profile.farm_registration_no || '',
        household_members: profile.household_members || 1,
        annual_income: profile.annual_income || 0,
        is_eco_certified: profile.is_eco_certified || false,
        is_successor_farmer: profile.is_successor_farmer || false,
      });
    }
  }, [profile]);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const toggleCrop = (crop: string) => {
    const crops = form.crop_types || [];
    if (crops.includes(crop)) {
      handleChange('crop_types', crops.filter((c) => c !== crop));
    } else {
      handleChange('crop_types', [...crops, crop]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await upsertProfile({ ...form, user_id: user.id } as UserProfile & { user_id: string });
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('저장 중 오류가 발생했습니다.');
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <User size={32} className="text-green-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0">내 정보 관리</h1>
          <p className="text-base text-gray-500 m-0">입력한 정보로 맞춤 정책을 추천하고, 신청서를 자동으로 채워드립니다</p>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-xl mb-6 text-lg">
          <CheckCircle size={22} />
          정보가 저장되었습니다!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 기본 정보 */}
        <section className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-green-800 mb-5 pb-3 border-b-2 border-green-200">
            <User size={24} />
            기본 정보
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-1">성명 *</label>
              <input
                type="text" value={form.name} onChange={(e) => handleChange('name', e.target.value)}
                required placeholder="홍길동"
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-1">생년월일 *</label>
              <input
                type="date" value={form.birth_date} onChange={(e) => handleChange('birth_date', e.target.value)}
                required
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-1">연락처</label>
              <input
                type="tel" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="010-1234-5678"
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-1">가구원 수</label>
              <input
                type="number" value={form.household_members} onChange={(e) => handleChange('household_members', parseInt(e.target.value) || 1)}
                min={1}
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* 주소 */}
        <section className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-green-800 mb-5 pb-3 border-b-2 border-green-200">
            <MapPin size={24} />
            주소
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-1">시/도 *</label>
              <select
                value={form.address_sido} onChange={(e) => handleChange('address_sido', e.target.value)}
                required
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none bg-white"
              >
                <option value="">선택하세요</option>
                {SIDO_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-1">시/군/구</label>
              <input
                type="text" value={form.address_sigungu} onChange={(e) => handleChange('address_sigungu', e.target.value)}
                placeholder="예: 여주시"
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-base font-semibold text-gray-700 mb-1">상세 주소</label>
              <input
                type="text" value={form.address_detail} onChange={(e) => handleChange('address_detail', e.target.value)}
                placeholder="나머지 주소"
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* 농업 정보 */}
        <section className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-green-800 mb-5 pb-3 border-b-2 border-green-200">
            <Tractor size={24} />
            농업 정보
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-1">영농 형태</label>
              <select
                value={form.farming_type} onChange={(e) => handleChange('farming_type', e.target.value)}
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none bg-white"
              >
                <option value="">선택하세요</option>
                {FARMING_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-1">농지 면적 (평)</label>
              <input
                type="number" value={form.farm_area} onChange={(e) => handleChange('farm_area', parseInt(e.target.value) || 0)}
                min={0} placeholder="0"
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-base font-semibold text-gray-700 mb-1">농업경영체 등록번호</label>
              <input
                type="text" value={form.farm_registration_no} onChange={(e) => handleChange('farm_registration_no', e.target.value)}
                placeholder="농업경영체 등록번호 입력"
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-base font-semibold text-gray-700 mb-2">재배 작물 (해당하는 것 모두 선택)</label>
              <div className="flex flex-wrap gap-2">
                {CROP_OPTIONS.map((crop) => (
                  <button
                    key={crop} type="button"
                    onClick={() => toggleCrop(crop)}
                    className={`px-4 py-2 rounded-full text-base font-medium border-2 cursor-pointer transition-colors ${
                      (form.crop_types || []).includes(crop)
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {crop}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox" checked={form.is_eco_certified}
                  onChange={(e) => handleChange('is_eco_certified', e.target.checked)}
                  className="w-6 h-6 accent-green-600"
                />
                <span className="text-base font-medium text-gray-700">친환경 인증 보유</span>
              </label>
            </div>
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox" checked={form.is_successor_farmer}
                  onChange={(e) => handleChange('is_successor_farmer', e.target.checked)}
                  className="w-6 h-6 accent-green-600"
                />
                <span className="text-base font-medium text-gray-700">후계농업인 해당</span>
              </label>
            </div>
          </div>
        </section>

        {/* 소득 정보 */}
        <section className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="flex items-center gap-2 text-xl font-bold text-green-800 mb-5 pb-3 border-b-2 border-green-200">
            <Wallet size={24} />
            소득 정보
          </h2>
          <div>
            <label className="block text-base font-semibold text-gray-700 mb-1">
              연간 소득 (만원)
            </label>
            <input
              type="number" value={form.annual_income} onChange={(e) => handleChange('annual_income', parseInt(e.target.value) || 0)}
              min={0} placeholder="0"
              className="w-full max-w-md px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
            />
            <p className="text-sm text-gray-500 mt-1">정확하지 않아도 됩니다. 대략적인 금액을 입력하세요.</p>
          </div>
        </section>

        {/* 저장 버튼 */}
        <div className="flex justify-center">
          <button
            type="submit" disabled={saving}
            className="flex items-center gap-3 px-12 py-4 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded-xl transition-colors disabled:bg-gray-400 border-0 cursor-pointer shadow-lg"
          >
            <Save size={24} />
            {saving ? '저장 중...' : '정보 저장하기'}
          </button>
        </div>
      </form>
    </div>
  );
}
