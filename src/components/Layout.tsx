import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Home, Search, User, FileText, LogOut, Menu, X, Tractor, FolderOpen
} from 'lucide-react';
import { useState } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: '홈', icon: Home },
    { path: '/policies', label: '정책 찾기', icon: Search },
    { path: '/my-info', label: '내 정보', icon: User },
    { path: '/my-documents', label: '서류 보관함', icon: FolderOpen },
    { path: '/my-applications', label: '신청서 관리', icon: FileText },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-green-50">
      {/* 헤더 */}
      <header className="bg-green-700 text-white shadow-lg sticky top-0 z-50 no-print">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 no-underline text-white">
              <Tractor size={32} />
              <div>
                <h1 className="text-xl font-bold m-0 leading-tight">농민 정책 도우미</h1>
                <p className="text-xs text-green-200 m-0">내가 받을 수 있는 정책을 한눈에</p>
              </div>
            </Link>

            {/* 데스크탑 네비게이션 */}
            <nav className="hidden md:flex items-center gap-1">
              {user && navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-base no-underline transition-colors ${
                    isActive(item.path)
                      ? 'bg-green-600 text-white font-bold'
                      : 'text-green-100 hover:bg-green-600'
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              ))}
              {user && (
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-green-100 hover:bg-green-600 bg-transparent border-0 cursor-pointer text-base"
                >
                  <LogOut size={20} />
                  로그아웃
                </button>
              )}
            </nav>

            {/* 모바일 메뉴 버튼 */}
            {user && (
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden bg-transparent border-0 text-white cursor-pointer p-2"
              >
                {menuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            )}
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {menuOpen && user && (
          <nav className="md:hidden bg-green-800 border-t border-green-600 px-4 pb-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-lg no-underline my-1 ${
                  isActive(item.path)
                    ? 'bg-green-600 text-white font-bold'
                    : 'text-green-100 hover:bg-green-700'
                }`}
              >
                <item.icon size={24} />
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => { signOut(); setMenuOpen(false); }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-green-100 hover:bg-green-700 bg-transparent border-0 cursor-pointer text-lg w-full my-1"
            >
              <LogOut size={24} />
              로그아웃
            </button>
          </nav>
        )}
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* 푸터 */}
      <footer className="bg-green-800 text-green-200 py-6 mt-12 no-print">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm m-0">
            농민 정책 도우미 | 공공데이터포털(data.go.kr) 활용
          </p>
          <p className="text-xs mt-1 text-green-300 m-0">
            본 서비스는 정책 안내 목적이며, 실제 신청은 해당 기관을 통해 진행해주세요.
          </p>
        </div>
      </footer>
    </div>
  );
}
