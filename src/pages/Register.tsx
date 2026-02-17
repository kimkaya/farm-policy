import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Tractor, Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react';

export default function Register() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password);
    if (error) {
      setError(error.message || '회원가입 중 오류가 발생했습니다.');
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <UserPlus size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-4">회원가입 완료!</h2>
          <p className="text-lg text-gray-600 mb-6">
            이메일 인증 후 로그인할 수 있습니다.<br />
            이메일을 확인해 주세요.
          </p>
          <Link
            to="/login"
            className="inline-block px-8 py-4 bg-green-600 text-white text-xl font-bold rounded-xl no-underline hover:bg-green-700 transition-colors"
          >
            로그인하러 가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600 rounded-full mb-4">
            <Tractor size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-green-800">회원가입</h1>
          <p className="text-lg text-gray-600 mt-2">
            간단한 가입으로 맞춤 정책을 받아보세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-base">
              {error}
            </div>
          )}

          <div className="mb-5">
            <label className="block text-lg font-semibold text-gray-700 mb-2">이메일</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-lg font-semibold text-gray-700 mb-2">비밀번호</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6자 이상 입력"
                required
                className="w-full pl-12 pr-14 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 bg-transparent border-0 cursor-pointer p-0"
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-700 mb-2">비밀번호 확인</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호를 다시 입력"
                required
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded-xl transition-colors disabled:bg-gray-400 border-0 cursor-pointer"
          >
            {loading ? '가입 중...' : '회원가입'}
          </button>

          <div className="text-center mt-6">
            <p className="text-base text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="text-green-600 font-bold hover:underline no-underline">
                로그인
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
