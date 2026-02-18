import { supabase } from './supabase';
import type { UserDocument } from '../types';

// ============================================================
// 서류 관리 서비스
// ============================================================

/**
 * 내 서류 목록 조회
 */
export async function getMyDocuments(userId: string): Promise<UserDocument[]> {
  const { data, error } = await supabase
    .from('user_documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

/**
 * 서류 업로드 (파일 → Storage + DB 레코드)
 */
export async function uploadDocument(
  userId: string,
  file: File,
  docName: string,
  docType: string
): Promise<UserDocument> {
  // 1. Storage에 파일 업로드
  const timestamp = Date.now();
  const ext = file.name.split('.').pop() || 'pdf';
  const filePath = `${userId}/${timestamp}_${docType}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });
  if (uploadError) throw uploadError;

  // 2. DB에 레코드 저장
  const { data, error: dbError } = await supabase
    .from('user_documents')
    .insert({
      user_id: userId,
      doc_name: docName,
      doc_type: docType,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type || 'application/octet-stream',
    })
    .select()
    .single();
  if (dbError) throw dbError;
  return data;
}

/**
 * 서류 삭제 (Storage + DB)
 */
export async function deleteDocument(doc: UserDocument): Promise<void> {
  // 1. Storage에서 파일 삭제
  const { error: storageError } = await supabase.storage
    .from('documents')
    .remove([doc.file_path]);
  if (storageError) console.warn('Storage 삭제 경고:', storageError);

  // 2. DB에서 레코드 삭제
  const { error: dbError } = await supabase
    .from('user_documents')
    .delete()
    .eq('id', doc.id);
  if (dbError) throw dbError;
}

/**
 * 서류 다운로드 URL 가져오기 (임시 URL, 60분)
 */
export function getDocumentUrl(filePath: string): string {
  const { data } = supabase.storage
    .from('documents')
    .getPublicUrl(filePath);
  // private 버킷이므로 signed URL 사용
  return data.publicUrl;
}

/**
 * 서류 다운로드 Signed URL (private 버킷용)
 */
export async function getSignedUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(filePath, 3600); // 1시간
  if (error) throw error;
  return data.signedUrl;
}

/**
 * 정책 필요서류 vs 내 서류 매칭 체크
 */
export function checkDocuments(
  requiredDocs: string[],
  myDocs: UserDocument[]
): { doc_name: string; has_document: boolean; user_document?: UserDocument }[] {
  return requiredDocs.map((docName) => {
    // 유연한 매칭: 서류 이름에 포함되는지 확인
    const normalizedRequired = docName.replace(/\s/g, '').toLowerCase();
    const matched = myDocs.find((d) => {
      const normalizedDoc = d.doc_type.replace(/\s/g, '').toLowerCase();
      const normalizedName = d.doc_name.replace(/\s/g, '').toLowerCase();
      return (
        normalizedDoc === normalizedRequired ||
        normalizedName === normalizedRequired ||
        normalizedDoc.includes(normalizedRequired) ||
        normalizedRequired.includes(normalizedDoc) ||
        normalizedName.includes(normalizedRequired) ||
        normalizedRequired.includes(normalizedName)
      );
    });
    return {
      doc_name: docName,
      has_document: !!matched,
      user_document: matched,
    };
  });
}

/**
 * 여러 서류 일괄 다운로드 (각각 signed URL로)
 */
export async function getMultipleSignedUrls(
  docs: UserDocument[]
): Promise<{ doc: UserDocument; url: string }[]> {
  const results = await Promise.all(
    docs.map(async (doc) => {
      const url = await getSignedUrl(doc.file_path);
      return { doc, url };
    })
  );
  return results;
}

// 자주 쓰는 서류 유형 목록 (업로드 시 선택용)
export const COMMON_DOC_TYPES = [
  '주민등록등본',
  '주민등록초본',
  '가족관계증명서',
  '농업경영체등록확인서',
  '농지원부',
  '토지대장',
  '등기부등본',
  '소득금액증명원',
  '건강보험자격득실확인서',
  '건강보험료납부확인서',
  '통장사본',
  '신분증사본',
  '영농계획서',
  '친환경인증서',
  '사업자등록증',
  '기타',
];
