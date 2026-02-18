import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getPolicyById, getFormTemplate, saveApplication
} from '../services/policyService';
import {
  getMyDocuments, checkDocuments, getSignedUrl, getMultipleSignedUrls,
} from '../services/documentService';
import { generatePDF, printElement } from '../utils/pdfGenerator';
import type { Policy, PolicyFormTemplate, FormField, UserDocument } from '../types';
import {
  ArrowLeft, FileText, Save, Download, Printer,
  CheckCircle, Loader2, AlertCircle, Check, X as XIcon,
  Eye, FolderOpen, Package
} from 'lucide-react';

export default function ApplicationForm() {
  const { policyId } = useParams<{ policyId: string }>();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [policy, setPolicy] = useState<Policy | null>(null);
  const [template, setTemplate] = useState<PolicyFormTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState('');
  const [myDocs, setMyDocs] = useState<UserDocument[]>([]);
  const [docCheck, setDocCheck] = useState<{ doc_name: string; has_document: boolean; user_document?: UserDocument }[]>([]);
  const [downloadingAll, setDownloadingAll] = useState(false);

  useEffect(() => {
    if (policyId) loadData(policyId);
  }, [policyId]);

  useEffect(() => {
    if (user) {
      getMyDocuments(user.id).then(setMyDocs).catch(console.error);
    }
  }, [user]);

  useEffect(() => {
    if (policy && myDocs.length >= 0) {
      const checks = checkDocuments(policy.required_documents, myDocs);
      setDocCheck(checks);
    }
  }, [policy, myDocs]);

  const loadData = async (id: string) => {
    setLoading(true);
    try {
      const [pol, tmpl] = await Promise.all([
        getPolicyById(id),
        getFormTemplate(id),
      ]);
      if (!pol || !tmpl) {
        setError('신청서 양식을 찾을 수 없습니다.');
        setLoading(false);
        return;
      }
      setPolicy(pol);
      setTemplate(tmpl);

      // Auto-fill from profile
      if (profile && tmpl.fields) {
        const initial: Record<string, string> = {};
        tmpl.fields.forEach((field: FormField) => {
          if (field.profile_key && profile) {
            const value = profile[field.profile_key];
            if (value !== undefined && value !== null) {
              if (Array.isArray(value)) {
                initial[field.id] = value.join(', ');
              } else {
                initial[field.id] = String(value);
              }
            }
          }
        });
        setFormData(initial);
      }
    } catch (err) {
      setError('데이터를 불러오는 데 실패했습니다.');
      console.error(err);
    }
    setLoading(false);
  };

  const handleChange = (fieldId: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    setSaved(false);
  };

  const handleSave = async (status: 'draft' | 'completed') => {
    if (!user || !policyId) return;
    setSaving(true);
    try {
      await saveApplication({
        user_id: user.id,
        policy_id: policyId,
        form_data: formData,
        status,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('저장 중 오류가 발생했습니다.');
      console.error(err);
    }
    setSaving(false);
  };

  const handlePDF = async () => {
    setPdfLoading(true);
    try {
      const filename = `${policy?.title || '신청서'}_${new Date().toISOString().slice(0, 10)}.pdf`;
      await generatePDF('application-form-print', filename);
    } catch (err) {
      alert('PDF 생성 중 오류가 발생했습니다.');
      console.error(err);
    }
    setPdfLoading(false);
  };

  const handlePrint = () => {
    printElement('application-form-print');
  };

  const handleDownloadAllDocs = async () => {
    const availableDocs = docCheck.filter((d) => d.has_document && d.user_document);
    if (availableDocs.length === 0) {
      alert('다운로드할 서류가 없습니다.');
      return;
    }
    setDownloadingAll(true);
    try {
      const urls = await getMultipleSignedUrls(
        availableDocs.map((d) => d.user_document!)
      );
      // 각각 새 탭으로 열기
      for (const { url } of urls) {
        window.open(url, '_blank');
      }
    } catch (err) {
      alert('서류 다운로드 중 오류가 발생했습니다.');
      console.error(err);
    }
    setDownloadingAll(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={40} className="animate-spin text-green-600" />
        <span className="ml-3 text-xl text-gray-600">신청서를 불러오는 중...</span>
      </div>
    );
  }

  if (error || !policy || !template) {
    return (
      <div className="text-center py-20">
        <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
        <p className="text-xl text-red-600 mb-4">{error || '신청서를 찾을 수 없습니다.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl border-0 cursor-pointer hover:bg-green-700 transition-colors text-base"
        >
          뒤로가기
        </button>
      </div>
    );
  }

  const fields: FormField[] = template.fields;

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

      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-6">
        <FileText size={32} className="text-green-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0">{template.form_name}</h1>
          <p className="text-base text-gray-500 m-0">{policy.title}</p>
        </div>
      </div>

      {/* 자동 채움 안내 */}
      {profile && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl mb-6 text-base">
          <CheckCircle size={20} />
          내 정보에서 자동으로 채워진 항목이 있습니다. 확인 후 수정해주세요.
        </div>
      )}

      {saved && (
        <div className="flex items-center gap-2 bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-xl mb-6 text-lg">
          <CheckCircle size={22} />
          신청서가 저장되었습니다!
        </div>
      )}

      {/* 신청서 폼 */}
      <div id="application-form-print" className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-green-100">
        {/* 프린트 전용 헤더 */}
        <div className="print-only mb-6">
          <h1 className="text-center text-2xl font-bold mb-2">{template.form_name}</h1>
          <p className="text-center text-base text-gray-500">
            {policy.department} | {new Date().toLocaleDateString('ko-KR')}
          </p>
          <hr className="my-4" />
        </div>

        <div className="space-y-5">
          {fields.map((field) => (
            <div key={field.id}>
              <label className="block text-base font-semibold text-gray-700 mb-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>

              {field.type === 'select' && field.options ? (
                <select
                  value={formData[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  required={field.required}
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none bg-white"
                >
                  <option value="">선택하세요</option>
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  value={formData[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  required={field.required}
                  placeholder={field.placeholder}
                  rows={4}
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none resize-y"
                />
              ) : field.type === 'checkbox' ? (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData[field.id] === 'true'}
                    onChange={(e) => handleChange(field.id, String(e.target.checked))}
                    className="w-6 h-6 accent-green-600"
                  />
                  <span className="text-base text-gray-700">{field.placeholder || '예'}</span>
                </label>
              ) : (
                <input
                  type={field.type}
                  value={formData[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  required={field.required}
                  placeholder={field.placeholder}
                  className={`w-full px-4 py-3 text-lg border-2 rounded-xl focus:border-green-500 focus:outline-none transition-colors ${
                    field.profile_key && formData[field.id]
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                />
              )}

              {field.profile_key && formData[field.id] && (
                <p className="text-sm text-blue-500 mt-1 m-0">
                  내 정보에서 자동 입력됨
                </p>
              )}
            </div>
          ))}
        </div>

        {/* 프린트 전용 서명란 */}
        <div className="print-only mt-10">
          <div className="text-center mt-12">
            <p className="text-base mb-8">
              위와 같이 신청합니다.
            </p>
            <p className="text-base mb-4">
              {new Date().getFullYear()}년 {new Date().getMonth() + 1}월 {new Date().getDate()}일
            </p>
            <p className="text-lg mt-8">
              신청인: _________________ (서명 또는 날인)
            </p>
          </div>
        </div>
      </div>

      {/* 첨부 서류 체크리스트 */}
      {policy.required_documents.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-green-100">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-xl font-bold text-green-800 m-0 flex items-center gap-2">
              <FolderOpen size={24} />
              첨부 서류 확인
            </h2>
            <span className="text-base text-gray-500">
              {docCheck.filter((d) => d.has_document).length}/{docCheck.length}개 준비됨
            </span>
          </div>

          <div className="space-y-2 mb-4">
            {docCheck.map((item, i) => (
              <div
                key={i}
                className={`flex items-center justify-between gap-3 p-3 rounded-xl ${
                  item.has_document
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {item.has_document ? (
                    <Check size={22} className="text-green-600 flex-shrink-0" />
                  ) : (
                    <XIcon size={22} className="text-red-500 flex-shrink-0" />
                  )}
                  <span className={`text-base font-medium ${
                    item.has_document ? 'text-green-800' : 'text-red-700'
                  }`}>
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
              </div>
            ))}
          </div>

          {/* 일괄 다운로드/출력 버튼 */}
          {docCheck.some((d) => d.has_document) && (
            <button
              onClick={handleDownloadAllDocs}
              disabled={downloadingAll}
              className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl transition-colors disabled:bg-gray-400 border-0 cursor-pointer"
            >
              {downloadingAll ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  서류 열기 중...
                </>
              ) : (
                <>
                  <Package size={20} />
                  준비된 서류 한번에 열기 ({docCheck.filter((d) => d.has_document).length}개)
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* 버튼들 */}
      <div className="flex flex-wrap gap-3 justify-center no-print">
        <button
          onClick={() => handleSave('draft')}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-4 bg-gray-500 hover:bg-gray-600 text-white text-lg font-bold rounded-xl transition-colors disabled:bg-gray-400 border-0 cursor-pointer"
        >
          <Save size={22} />
          {saving ? '저장 중...' : '임시 저장'}
        </button>
        <button
          onClick={() => handleSave('completed')}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-4 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-xl transition-colors disabled:bg-gray-400 border-0 cursor-pointer"
        >
          <CheckCircle size={22} />
          {saving ? '저장 중...' : '작성 완료'}
        </button>
        <button
          onClick={handlePDF}
          disabled={pdfLoading}
          className="flex items-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl transition-colors disabled:bg-gray-400 border-0 cursor-pointer"
        >
          <Download size={22} />
          {pdfLoading ? 'PDF 생성 중...' : 'PDF 다운로드'}
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white text-lg font-bold rounded-xl transition-colors border-0 cursor-pointer"
        >
          <Printer size={22} />
          프린트
        </button>
      </div>
    </div>
  );
}
