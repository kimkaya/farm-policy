import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getMyDocuments, uploadDocument, deleteDocument, getSignedUrl,
  COMMON_DOC_TYPES,
} from '../services/documentService';
import type { UserDocument } from '../types';
import {
  FolderOpen, Upload, Trash2, FileText, Loader2,
  Plus, X, Eye,
} from 'lucide-react';

export default function MyDocuments() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // 업로드 폼
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('');
  const [customType, setCustomType] = useState('');

  useEffect(() => {
    if (user) loadDocuments();
  }, [user]);

  const loadDocuments = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getMyDocuments(user.id);
      setDocuments(data);
    } catch (err) {
      setError('서류 목록을 불러오는 데 실패했습니다.');
      console.error(err);
    }
    setLoading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!docName) {
        setDocName(file.name.replace(/\.[^.]+$/, ''));
      }
    }
  };

  const handleUpload = async () => {
    if (!user || !selectedFile) return;

    const finalDocType = docType === '기타' ? customType : docType;
    if (!finalDocType) {
      setError('서류 유형을 선택해주세요.');
      return;
    }

    setUploading(true);
    setError('');
    try {
      await uploadDocument(user.id, selectedFile, docName || finalDocType, finalDocType);
      await loadDocuments();
      resetUploadForm();
      setShowUploadModal(false);
    } catch (err: any) {
      setError(err.message || '업로드 중 오류가 발생했습니다.');
      console.error(err);
    }
    setUploading(false);
  };

  const handleDelete = async (doc: UserDocument) => {
    if (!confirm(`"${doc.doc_name}" 서류를 삭제하시겠습니까?`)) return;
    try {
      await deleteDocument(doc);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err) {
      alert('삭제 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  const handleDownload = async (doc: UserDocument) => {
    try {
      const url = await getSignedUrl(doc.file_path);
      window.open(url, '_blank');
    } catch (err) {
      alert('다운로드 URL 생성에 실패했습니다.');
      console.error(err);
    }
  };

  const resetUploadForm = () => {
    setSelectedFile(null);
    setDocName('');
    setDocType('');
    setCustomType('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    return '📎';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={40} className="animate-spin text-green-600" />
        <span className="ml-3 text-xl text-gray-600">서류 목록을 불러오는 중...</span>
      </div>
    );
  }

  return (
    <div>
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <FolderOpen size={32} className="text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 m-0">내 서류 보관함</h1>
            <p className="text-base text-gray-500 m-0">
              서류를 미리 올려두면 신청할 때 바로 사용할 수 있습니다
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-xl transition-colors border-0 cursor-pointer"
        >
          <Plus size={22} />
          서류 올리기
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-base">
          {error}
          <button onClick={() => setError('')} className="float-right bg-transparent border-0 text-red-500 cursor-pointer font-bold">X</button>
        </div>
      )}

      {/* 서류 목록 */}
      {documents.length > 0 ? (
        <div className="space-y-3">
          {/* 요약 */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
            <p className="text-base text-green-800 m-0 font-medium">
              총 <strong>{documents.length}개</strong>의 서류가 보관되어 있습니다
            </p>
          </div>

          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl flex-shrink-0">{getFileIcon(doc.mime_type)}</span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 m-0 truncate">{doc.doc_name}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1 flex-wrap">
                      <span className="px-2 py-0.5 bg-gray-100 rounded-full">{doc.doc_type}</span>
                      <span>{formatFileSize(doc.file_size)}</span>
                      <span>{new Date(doc.created_at).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleDownload(doc)}
                    className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 font-medium rounded-lg hover:bg-blue-100 transition-colors border-0 cursor-pointer text-sm"
                    title="보기/다운로드"
                  >
                    <Eye size={16} />
                    보기
                  </button>
                  <button
                    onClick={() => handleDelete(doc)}
                    className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors border-0 cursor-pointer text-sm"
                    title="삭제"
                  >
                    <Trash2 size={16} />
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-2xl p-10 text-center border border-gray-200">
          <FolderOpen size={48} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-600 mb-2">보관된 서류가 없습니다</h2>
          <p className="text-base text-gray-500 mb-6">
            자주 쓰는 서류를 미리 올려두세요.<br />
            정책 신청 시 필요한 서류를 바로 확인하고 출력할 수 있습니다.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-xl transition-colors border-0 cursor-pointer"
          >
            <Upload size={20} />
            첫 서류 올리기
          </button>
        </div>
      )}

      {/* 업로드 모달 */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 m-0 flex items-center gap-2">
                <Upload size={24} className="text-green-600" />
                서류 올리기
              </h2>
              <button
                onClick={() => { setShowUploadModal(false); resetUploadForm(); }}
                className="bg-transparent border-0 cursor-pointer text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={24} />
              </button>
            </div>

            {/* 서류 유형 선택 */}
            <div className="mb-4">
              <label className="block text-base font-semibold text-gray-700 mb-2">서류 유형</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none bg-white"
              >
                <option value="">선택하세요</option>
                {COMMON_DOC_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {docType === '기타' && (
                <input
                  type="text"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  placeholder="서류 유형을 직접 입력하세요"
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none mt-2"
                />
              )}
            </div>

            {/* 서류 이름 */}
            <div className="mb-4">
              <label className="block text-base font-semibold text-gray-700 mb-2">서류 이름 (선택)</label>
              <input
                type="text"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                placeholder="예: 2025년 주민등록등본"
                className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
              />
            </div>

            {/* 파일 선택 */}
            <div className="mb-6">
              <label className="block text-base font-semibold text-gray-700 mb-2">파일 선택</label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                className="w-full text-base file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-green-100 file:text-green-700 file:font-bold file:cursor-pointer hover:file:bg-green-200"
              />
              <p className="text-sm text-gray-400 mt-2 m-0">
                PDF, JPG, PNG 파일 (최대 10MB)
              </p>
              {selectedFile && (
                <div className="flex items-center gap-2 mt-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                  <FileText size={16} />
                  {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </div>
              )}
            </div>

            {/* 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowUploadModal(false); resetUploadForm(); }}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-lg font-bold rounded-xl transition-colors border-0 cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile || !docType || (docType === '기타' && !customType)}
                className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-xl transition-colors disabled:bg-gray-400 border-0 cursor-pointer flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    업로드 중...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    올리기
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
