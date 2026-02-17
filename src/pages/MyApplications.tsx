import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getMyApplications } from '../services/policyService';
import type { Application } from '../types';
import {
  FileText, Calendar, Eye, Loader2, ClipboardList
} from 'lucide-react';

export default function MyApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) loadApplications();
  }, [user]);

  const loadApplications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getMyApplications(user.id);
      setApplications(data as Application[]);
    } catch (err) {
      setError('신청서 목록을 불러오는 데 실패했습니다.');
      console.error(err);
    }
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
            임시저장
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
            작성완료
          </span>
        );
      case 'printed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
            출력완료
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={40} className="animate-spin text-green-600" />
        <span className="ml-3 text-xl text-gray-600">신청서 목록을 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <FileText size={32} className="text-green-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0">신청서 관리</h1>
          <p className="text-base text-gray-500 m-0">
            작성한 신청서를 확인하고 관리할 수 있습니다
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-base">
          {error}
        </div>
      )}

      {applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-2xl shadow-md p-5 border border-green-100 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-bold text-gray-900 m-0">
                      {(app.policy as any)?.title || '정책명 없음'}
                    </h3>
                    {getStatusBadge(app.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(app.created_at).toLocaleDateString('ko-KR')}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClipboardList size={14} />
                      {(app.policy as any)?.department || ''}
                    </span>
                  </div>
                </div>
                <Link
                  to={`/apply/${app.policy_id}`}
                  className="flex items-center gap-1 px-4 py-2 bg-green-100 text-green-700 font-bold rounded-xl no-underline hover:bg-green-200 transition-colors text-sm"
                >
                  <Eye size={16} />
                  다시 작성
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-2xl p-10 text-center border border-gray-200">
          <FileText size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-600 mb-2">
            작성한 신청서가 없습니다
          </h2>
          <p className="text-base text-gray-500 mb-6">
            정책을 찾아보고 신청서를 작성해보세요!
          </p>
          <Link
            to="/policies"
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-xl no-underline transition-colors"
          >
            정책 찾아보기
          </Link>
        </div>
      )}
    </div>
  );
}
