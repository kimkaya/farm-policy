import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getPolicies, getCategories, matchPolicies } from '../services/policyService';
import PolicyCard from '../components/PolicyCard';
import type { Policy, PolicyCategory, PolicyMatch } from '../types';
import { Search, Filter, Loader2, X, Sparkles } from 'lucide-react';

export default function PolicyList() {
  const { profile } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [categories, setCategories] = useState<PolicyCategory[]>([]);
  const [matches, setMatches] = useState<Map<string, PolicyMatch>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showMatchOnly, setShowMatchOnly] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (profile && policies.length > 0) {
      const matched = matchPolicies(profile, policies);
      const matchMap = new Map<string, PolicyMatch>();
      matched.forEach((m) => matchMap.set(m.policy.id, m));
      setMatches(matchMap);
    }
  }, [profile, policies]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [cats, pols] = await Promise.all([getCategories(), getPolicies()]);
      setCategories(cats);
      setPolicies(pols);
    } catch (err) {
      setError('데이터를 불러오는 데 실패했습니다.');
      console.error(err);
    }
    setLoading(false);
  };

  // Filter logic
  const filteredPolicies = policies.filter((p) => {
    if (selectedCategory && p.category_id !== selectedCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !p.title.toLowerCase().includes(q) &&
        !p.summary.toLowerCase().includes(q) &&
        !(p.description || '').toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (showMatchOnly && !matches.has(p.id)) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={40} className="animate-spin text-green-600" />
        <span className="ml-3 text-xl text-gray-600">정책 정보를 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <Search size={32} className="text-green-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0">정책 찾기</h1>
          <p className="text-base text-gray-500 m-0">
            총 {policies.length}개의 정책이 등록되어 있습니다
          </p>
        </div>
      </div>

      {/* 검색 바 */}
      <div className="bg-white rounded-2xl shadow-md p-5 mb-6 border border-green-100">
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="정책명, 내용으로 검색하세요"
            className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer p-1"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* 카테고리 필터 */}
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-full text-base font-medium border-2 cursor-pointer transition-colors ${
              !selectedCategory
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
            }`}
          >
            전체
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
              className={`px-4 py-2 rounded-full text-base font-medium border-2 cursor-pointer transition-colors ${
                selectedCategory === cat.id
                  ? 'text-white border-transparent'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
              }`}
              style={selectedCategory === cat.id ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* 맞춤 필터 */}
        {profile && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showMatchOnly}
              onChange={(e) => setShowMatchOnly(e.target.checked)}
              className="w-5 h-5 accent-green-600"
            />
            <Sparkles size={18} className="text-yellow-500" />
            <span className="text-base font-medium text-gray-700">
              내 조건에 맞는 정책만 보기
            </span>
          </label>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-base">
          {error}
        </div>
      )}

      {/* 결과 */}
      {filteredPolicies.length > 0 ? (
        <>
          <p className="text-base text-gray-500 mb-4">
            {filteredPolicies.length}개의 정책이 검색되었습니다
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredPolicies.map((policy) => {
              const match = matches.get(policy.id);
              return (
                <PolicyCard
                  key={policy.id}
                  policy={policy}
                  matchScore={match?.match_score}
                  matchReasons={match?.match_reasons}
                />
              );
            })}
          </div>
        </>
      ) : (
        <div className="bg-gray-50 rounded-2xl p-10 text-center border border-gray-200">
          <Filter size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-600 mb-2">
            검색 결과가 없습니다
          </h2>
          <p className="text-base text-gray-500">
            검색어나 필터를 변경해보세요
          </p>
          {(search || selectedCategory || showMatchOnly) && (
            <button
              onClick={() => { setSearch(''); setSelectedCategory(''); setShowMatchOnly(false); }}
              className="mt-4 px-6 py-3 bg-green-600 text-white font-bold rounded-xl border-0 cursor-pointer hover:bg-green-700 transition-colors text-base"
            >
              필터 초기화
            </button>
          )}
        </div>
      )}
    </div>
  );
}
