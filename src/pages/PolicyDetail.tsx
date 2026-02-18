import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getPolicyById, getFormTemplate, matchPolicies } from '../services/policyService';
import { getMyDocuments, checkDocuments, getSignedUrl } from '../services/documentService';
import type { Policy, PolicyFormTemplate, PolicyMatch, UserDocument } from '../types';
import {
  ArrowLeft, Calendar, Building2, Phone, Globe, FileText,
  Star, CheckCircle, XCircle, ClipboardList, Loader2, ExternalLink,
  Check, X as XIcon, Download, Eye, FolderOpen
} from 'lucide-react';

export default function PolicyDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [template, setTemplate] = useState<PolicyFormTemplate | null>(null);
  const [match, setMatch] = useState<PolicyMatch | null>(null);
  const [myDocs, setMyDocs] = useState<UserDocument[]>([]);
  const [docCheck, setDocCheck] = useState<{ doc_name: string; has_document: boolean; user_document?: UserDocument }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) loadPolicy(id);
  }, [id]);

  useEffect(() => {
    if (user) {
      getMyDocuments(user.id).then(setMyDocs).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    if (profile && policy) {
      const matches = matchPolicies(profile, [policy]);
      setMatch(matches.length > 0 ? matches[0] : null);
    }
  }, [profile, policy]);

  useEffect(() => {
    if (policy && myDocs) {
      const checks = checkDocuments(policy.required_documents, myDocs);
      setDocCheck(checks);
    }
  }, [policy, myDocs]);

  const loadPolicy = async (policyId: string) => {
    setLoading(true);
    setError('');
    try {
      const [pol, tmpl] = await Promise.all([
        getPolicyById(policyId),
        getFormTemplate(policyId),
      ]);
      if (!pol) {
        setError('정책을 찾을 수 없습니다.');
      } else {
        setPolicy(pol);
        setTemplate(tmpl);
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

  if (error || !policy) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-red-600 mb-4">{error || '정책을 찾을 수 없습니다.'}</p>
        <button
          onClick={() => navigate('/policies')}
          className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl border-0 cursor-pointer hover:bg-green-700 transition-colors text-base"
        >
          정책 목록으로 돌아가기
        </button>
      </div>
    );
  }

  const category = policy.category;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return '매우 적합';
    if (score >= 60) return '적합';
    return '확인 필요';
  };

  return (
    <div>
      {/* 뒤로가기 */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-green-600 font-bold mb-4 bg-transparent border-0 cursor-pointer text-base hover:underline p-0"
      >
        <ArrowLeft size={20} />
        뒤로가기
      </button>

      {/* 매칭 점수 */}
      {match && (
        <div className={`${getScoreColor(match.match_score)} text-white rounded-2xl p-5 mb-6`}>
          <div className="flex items-center gap-3 mb-3">
            <Star size={28} fill="white" />
            <span className="text-2xl font-bold">
              매칭도 {match.match_score}% - {getScoreLabel(match.match_score)}
            </span>
          </div>
          {match.match_reasons.length > 0 && (
            <div className="space-y-1 mb-3">
              {match.match_reasons.map((reason, i) => (
                <div key={i} className="flex items-center gap-2 text-base">
                  <CheckCircle size={18} />
                  {reason}
                </div>
              ))}
            </div>
          )}
          {match.missing_conditions.length > 0 && (
            <div className="space-y-1 mt-3 pt-3 border-t border-white/30">
              <p className="text-sm font-bold mb-1">충족하지 않는 조건:</p>
              {match.missing_conditions.map((cond, i) => (
                <div key={i} className="flex items-center gap-2 text-base opacity-90">
                  <XCircle size={18} />
                  {cond}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 정책 헤더 */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-green-100">
        {category && (
          <span
            className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white mb-3"
            style={{ backgroundColor: category.color }}
          >
            {category.name}
          </span>
        )}
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{policy.title}</h1>
        <p className="text-lg text-gray-600 leading-relaxed">{policy.summary}</p>

        <div className="flex flex-wrap gap-4 mt-4 text-base text-gray-500">
          <span className="flex items-center gap-1">
            <Building2 size={18} />
            {policy.department}
          </span>
          {policy.apply_start_date && (
            <span className="flex items-center gap-1">
              <Calendar size={18} />
              {policy.apply_start_date} ~ {policy.apply_end_date || '상시'}
            </span>
          )}
          {!policy.apply_start_date && !policy.apply_end_date && (
            <span className="flex items-center gap-1">
              <Calendar size={18} />
              상시 접수
            </span>
          )}
        </div>
      </div>

      {/* 상세 정보 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* 상세 설명 */}
          <section className="bg-white rounded-2xl shadow-md p-6 border border-green-100">
            <h2 className="text-xl font-bold text-green-800 mb-4 pb-3 border-b-2 border-green-200">
              상세 설명
            </h2>
            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
              {policy.description}
            </p>
          </section>

          {/* 신청 자격 */}
          <section className="bg-white rounded-2xl shadow-md p-6 border border-green-100">
            <h2 className="text-xl font-bold text-green-800 mb-4 pb-3 border-b-2 border-green-200">
              신청 자격
            </h2>
            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
              {policy.eligibility}
            </p>
          </section>

          {/* 지원 내용 */}
          <section className="bg-white rounded-2xl shadow-md p-6 border border-green-100">
            <h2 className="text-xl font-bold text-green-800 mb-4 pb-3 border-b-2 border-green-200">
              지원 내용 / 혜택
            </h2>
            <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
              {policy.benefits}
            </p>
          </section>
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 신청 방법 */}
          <section className="bg-white rounded-2xl shadow-md p-6 border border-green-100">
            <h2 className="text-xl font-bold text-green-800 mb-4 pb-3 border-b-2 border-green-200">
              신청 방법
            </h2>
            <p className="text-base text-gray-700 mb-4">{policy.apply_method}</p>

            {policy.apply_url && (
              <a
                href={policy.apply_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-green-600 font-bold no-underline hover:underline text-base"
              >
                <Globe size={18} />
                온라인 신청 바로가기
                <ExternalLink size={16} />
              </a>
            )}
          </section>

          {/* 필요 서류 - 체크리스트 */}
          <section className="bg-white rounded-2xl shadow-md p-6 border border-green-100">
            <h2 className="text-xl font-bold text-green-800 mb-2 pb-3 border-b-2 border-green-200">
              필요 서류
            </h2>
            {docCheck.length > 0 && (
              <p className="text-sm text-gray-500 mb-4 m-0">
                {docCheck.filter((d) => d.has_document).length}/{docCheck.length}개 준비 완료
              </p>
            )}
            <ul className="space-y-3 list-none p-0 m-0">
              {docCheck.length > 0 ? docCheck.map((item, i) => (
                <li key={i} className={`flex items-center justify-between gap-3 p-3 rounded-xl text-base ${
                  item.has_document ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {item.has_document ? (
                      <Check size={22} className="text-green-600 flex-shrink-0" />
                    ) : (
                      <XIcon size={22} className="text-red-500 flex-shrink-0" />
                    )}
                    <span className={`${item.has_document ? 'text-green-800' : 'text-red-700'} font-medium`}>
                      {item.doc_name}
                    </span>
                  </div>
                  {item.has_document && item.user_document && (
                    <button
                      onClick={async () => {
                        try {
                          const url = await getSignedUrl(item.user_document!.file_path);
                          window.open(url, '_blank');
                        } catch { /* ignore */ }
                      }}
                      className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-lg hover:bg-green-200 transition-colors border-0 cursor-pointer flex-shrink-0"
                    >
                      <Eye size={14} />
                      보기
                    </button>
                  )}
                  {!item.has_document && (
                    <Link
                      to="/my-documents"
                      className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-600 text-sm font-medium rounded-lg hover:bg-red-200 transition-colors no-underline flex-shrink-0"
                    >
                      <FolderOpen size={14} />
                      올리기
                    </Link>
                  )}
                </li>
              )) : policy.required_documents.map((doc, i) => (
                <li key={i} className="flex items-start gap-2 text-base text-gray-700">
                  <ClipboardList size={18} className="text-green-500 flex-shrink-0 mt-1" />
                  {doc}
                </li>
              ))}
            </ul>
            {docCheck.length > 0 && docCheck.some((d) => !d.has_document) && (
              <Link
                to="/my-documents"
                className="flex items-center justify-center gap-2 w-full mt-4 px-4 py-3 bg-orange-50 border border-orange-200 text-orange-700 font-bold rounded-xl no-underline hover:bg-orange-100 transition-colors text-base"
              >
                <FolderOpen size={18} />
                부족한 서류 올리러 가기
              </Link>
            )}
            {docCheck.length > 0 && docCheck.every((d) => d.has_document) && (
              <div className="flex items-center gap-2 mt-4 px-4 py-3 bg-green-100 border border-green-300 text-green-800 font-bold rounded-xl text-base">
                <CheckCircle size={20} />
                모든 서류가 준비되었습니다!
              </div>
            )}
          </section>

          {/* 문의처 */}
          <section className="bg-white rounded-2xl shadow-md p-6 border border-green-100">
            <h2 className="text-xl font-bold text-green-800 mb-4 pb-3 border-b-2 border-green-200">
              문의처
            </h2>
            <p className="flex items-start gap-2 text-base text-gray-700 m-0">
              <Phone size={18} className="text-green-500 flex-shrink-0 mt-1" />
              {policy.contact_info}
            </p>
          </section>

          {/* 신청서 작성 버튼 */}
          {template && (
            <Link
              to={`/apply/${policy.id}`}
              className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded-2xl no-underline transition-colors shadow-lg"
            >
              <FileText size={24} />
              신청서 작성하기
            </Link>
          )}

          {!template && (
            <div className="bg-gray-50 rounded-2xl p-5 text-center border border-gray-200">
              <FileText size={32} className="text-gray-400 mx-auto mb-2" />
              <p className="text-base text-gray-500 m-0">
                이 정책은 온라인 신청서 양식이<br />아직 준비되지 않았습니다.
              </p>
              <p className="text-sm text-gray-400 mt-2 m-0">
                위의 신청 방법을 참고하여 직접 신청해주세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
