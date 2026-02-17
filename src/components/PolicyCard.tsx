import { Link } from 'react-router-dom';
import type { Policy, PolicyCategory } from '../types';
import { ChevronRight, Calendar, Building2, Star } from 'lucide-react';

interface PolicyCardProps {
  policy: Policy;
  matchScore?: number;
  matchReasons?: string[];
}

export default function PolicyCard({ policy, matchScore, matchReasons }: PolicyCardProps) {
  const category = policy.category as PolicyCategory | undefined;

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
    <Link
      to={`/policies/${policy.id}`}
      className="block bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 border border-green-100 hover:border-green-300 no-underline text-inherit overflow-hidden"
    >
      {/* 매칭 점수 배너 */}
      {matchScore !== undefined && (
        <div className={`${getScoreColor(matchScore)} text-white px-4 py-2 flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <Star size={18} fill="white" />
            <span className="font-bold text-base">
              매칭도 {matchScore}% - {getScoreLabel(matchScore)}
            </span>
          </div>
        </div>
      )}

      <div className="p-5">
        {/* 카테고리 뱃지 */}
        {category && (
          <span
            className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white mb-3"
            style={{ backgroundColor: category.color }}
          >
            {category.name}
          </span>
        )}

        {/* 제목 */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 leading-snug">
          {policy.title}
        </h3>

        {/* 요약 */}
        <p className="text-base text-gray-600 mb-3 leading-relaxed">
          {policy.summary}
        </p>

        {/* 매칭 이유 */}
        {matchReasons && matchReasons.length > 0 && (
          <div className="mb-3 space-y-1">
            {matchReasons.slice(0, 3).map((reason, i) => (
              <div key={i} className="flex items-center gap-2 text-green-700 text-sm">
                <span className="text-green-500">&#10003;</span>
                {reason}
              </div>
            ))}
          </div>
        )}

        {/* 하단 정보 */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Building2 size={14} />
              {policy.department}
            </span>
            {policy.apply_end_date && (
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                ~{policy.apply_end_date}
              </span>
            )}
          </div>
          <ChevronRight size={20} className="text-green-500" />
        </div>
      </div>
    </Link>
  );
}
