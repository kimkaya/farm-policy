import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPolicies, matchPolicies } from '../services/policyService';
import PolicyCard from '../components/PolicyCard';
import type { Policy, PolicyMatch } from '../types';
import {
  Sparkles, Search, User, FileText, AlertCircle, ArrowRight, Loader2
} from 'lucide-react';

export default function Home() {
  const { profile } = useAuth();
  const [matches, setMatches] = useState<PolicyMatch[]>([]);
  const [recentPolicies, setRecentPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [profile]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const policies = await getPolicies();
      setRecentPolicies(policies.slice(0, 4));

      if (profile) {
        const matched = matchPolicies(profile, policies);
        setMatches(matched);
      }
    } catch (err) {
      setError('정책 정보를 불러오는 데 실패했습니다.');
      console.error(err);
    }
    setLoading(false);
  };

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
      {/* 환영 배너 */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-8 border border-green-100">
        <h1 className="text-2xl font-bold text-green-800 mb-2">
          {profile?.name ? `${profile.name}님, 안녕하세요!` : '환영합니다!'}
        </h1>
        <p className="text-lg text-gray-600 m-0">
          내가 받을 수 있는 정책을 확인하고, 간편하게 신청서를 작성해보세요.
        </p>
      </div>

      {/* 프로필 미입력 안내 */}
      {!profile && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <AlertCircle size={32} className="text-yellow-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-yellow-800 mb-2">
                내 정보를 먼저 입력해주세요!
              </h2>
              <p className="text-lg text-yellow-700 mb-4">
                나이, 소득, 농지 면적 등 기본 정보를 입력하면<br />
                받을 수 있는 정책을 <strong>자동으로 추천</strong>해드립니다.
              </p>
              <Link
                to="/my-info"
                className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white text-lg font-bold rounded-xl no-underline transition-colors"
              >
                <User size={22} />
                내 정보 입력하기
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 빠른 메뉴 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link
          to="/policies"
          className="flex flex-col items-center gap-3 bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition-shadow no-underline text-inherit border border-green-100 hover:border-green-300"
        >
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
            <Search size={28} className="text-green-600" />
          </div>
          <span className="text-lg font-bold text-gray-800 text-center">정책 찾기</span>
        </Link>
        <Link
          to="/my-info"
          className="flex flex-col items-center gap-3 bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition-shadow no-underline text-inherit border border-green-100 hover:border-green-300"
        >
          <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
            <User size={28} className="text-blue-600" />
          </div>
          <span className="text-lg font-bold text-gray-800 text-center">내 정보</span>
        </Link>
        <Link
          to="/my-applications"
          className="flex flex-col items-center gap-3 bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition-shadow no-underline text-inherit border border-green-100 hover:border-green-300"
        >
          <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
            <FileText size={28} className="text-purple-600" />
          </div>
          <span className="text-lg font-bold text-gray-800 text-center">신청서 관리</span>
        </Link>
        <Link
          to="/policies"
          className="flex flex-col items-center gap-3 bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition-shadow no-underline text-inherit border border-green-100 hover:border-green-300"
        >
          <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center">
            <Sparkles size={28} className="text-yellow-600" />
          </div>
          <span className="text-lg font-bold text-gray-800 text-center">전체 정책</span>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-base">
          {error}
        </div>
      )}

      {/* 맞춤 정책 추천 */}
      {profile && matches.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="flex items-center gap-2 text-xl font-bold text-green-800 m-0">
              <Sparkles size={26} className="text-yellow-500" />
              {profile.name}님에게 맞는 정책
            </h2>
            <Link
              to="/policies"
              className="text-green-600 font-bold no-underline hover:underline text-base flex items-center gap-1"
            >
              전체보기 <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {matches.slice(0, 4).map((match) => (
              <PolicyCard
                key={match.policy.id}
                policy={match.policy}
                matchScore={match.match_score}
                matchReasons={match.match_reasons}
              />
            ))}
          </div>
          {matches.length > 4 && (
            <div className="text-center mt-4">
              <Link
                to="/policies"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-xl no-underline transition-colors"
              >
                나머지 {matches.length - 4}개 정책 더 보기
                <ArrowRight size={20} />
              </Link>
            </div>
          )}
        </section>
      )}

      {/* 프로필은 있지만 매칭 없는 경우 */}
      {profile && matches.length === 0 && (
        <section className="mb-10">
          <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-200">
            <Sparkles size={40} className="text-gray-400 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              현재 조건에 맞는 정책이 없습니다
            </h2>
            <p className="text-base text-gray-500 mb-4">
              내 정보를 다시 확인하거나, 전체 정책 목록을 둘러보세요.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                to="/my-info"
                className="inline-flex items-center gap-2 px-5 py-3 bg-green-600 text-white font-bold rounded-xl no-underline hover:bg-green-700 transition-colors"
              >
                <User size={20} />
                내 정보 수정
              </Link>
              <Link
                to="/policies"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white text-green-700 font-bold rounded-xl no-underline border-2 border-green-300 hover:bg-green-50 transition-colors"
              >
                <Search size={20} />
                전체 정책 보기
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 최근 등록 정책 */}
      {recentPolicies.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-800 m-0">
              등록된 정책
            </h2>
            <Link
              to="/policies"
              className="text-green-600 font-bold no-underline hover:underline text-base flex items-center gap-1"
            >
              전체보기 <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {recentPolicies.map((policy) => (
              <PolicyCard key={policy.id} policy={policy} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
