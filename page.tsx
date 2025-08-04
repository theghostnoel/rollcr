
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import NotificationButton from '../components/NotificationButton';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [siteInfo, setSiteInfo] = useState({
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    tiktok: 'https://tiktok.com',
    threads: 'https://threads.net',
    phone: '+84123456789'
  });

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setIsLoggedIn(true);
      setCurrentUser(JSON.parse(user));
    }
    
    // Load site info
    const savedSiteInfo = localStorage.getItem('siteInfo');
    if (savedSiteInfo) {
      setSiteInfo(JSON.parse(savedSiteInfo));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setIsLoggedIn(false);
    setCurrentUser(null);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-pink-600" style={{fontFamily: "Pacifico, serif"}}>
              Love Corner
            </h1>
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <div className="flex items-center space-x-4">
                  <NotificationButton currentUser={currentUser} />
                  <Link href="/profile" className="flex items-center text-pink-600 hover:text-pink-700">
                    <i className="ri-user-line w-5 h-5 flex items-center justify-center mr-2"></i>
                    <span>Tài khoản của tôi</span>
                  </Link>
                  <span className="text-gray-700">Xin chào, {currentUser?.displayName || 'User'}</span>
                  <button 
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 whitespace-nowrap"
                  >
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Link href="/login" className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 whitespace-nowrap">
                    Đăng nhập
                  </Link>
                  <Link href="/register" className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 whitespace-nowrap">
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-pink-400 to-purple-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6">Love Corner</h2>
          <p className="text-xl mb-8">Nơi tổng hợp những câu thả thính ngọt ngào và gợi ý món quà ý nghĩa</p>
          <div className="flex justify-center space-x-4">
            <Link href="/pickup-lines" className="bg-white text-pink-500 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition whitespace-nowrap">
              Câu thả thính
            </Link>
            <Link href="/gifts" className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-pink-500 transition whitespace-nowrap">
              Món quà
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Pickup Lines Section */}
          <Link href="/pickup-lines" className="block">
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow cursor-pointer">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-chat-heart-line text-3xl text-pink-500 w-8 h-8 flex items-center justify-center"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Câu thả thính</h3>
                <p className="text-gray-600 mb-6">Khám phá những câu thả thính ngọt ngào, dễ thương nhất</p>
              </div>
              
              <div className="w-full bg-pink-500 text-white text-center py-3 rounded-lg hover:bg-pink-600 transition whitespace-nowrap">
                Xem tất cả câu thả thính
              </div>
            </div>
          </Link>

          {/* Gifts Section */}
          <Link href="/gifts" className="block">
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow cursor-pointer">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-gift-line text-3xl text-purple-500 w-8 h-8 flex items-center justify-center"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Món quà</h3>
                <p className="text-gray-600 mb-4">Gợi ý những món quà ý nghĩa cho người thân yêu</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-3 rounded-lg text-center">
                  <i className="ri-user-line text-2xl text-blue-500 mb-2 w-6 h-6 flex items-center justify-center mx-auto"></i>
                  <p className="text-sm text-gray-700">Cho nam giới</p>
                </div>
                <div className="bg-pink-50 p-3 rounded-lg text-center">
                  <i className="ri-user-2-line text-2xl text-pink-500 mb-2 w-6 h-6 flex items-center justify-center mx-auto"></i>
                  <p className="text-sm text-gray-700">Cho nữ giới</p>
                </div>
              </div>
              
              <div className="w-full bg-purple-500 text-white text-center py-3 rounded-lg hover:bg-purple-600 transition whitespace-nowrap">
                Khám phá món quà
              </div>
            </div>
          </Link>

          {/* Restaurants Section */}
          <Link href="/restaurants" className="block">
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow cursor-pointer">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-restaurant-line text-3xl text-orange-500 w-8 h-8 flex items-center justify-center"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Quán ăn đáng thử</h3>
                <p className="text-gray-600 mb-6">Khám phá những quán ăn ngon tại các tỉnh thành</p>
              </div>
              
              <div className="w-full bg-orange-500 text-white text-center py-3 rounded-lg hover:bg-orange-600 transition whitespace-nowrap">
                Tìm quán ăn ngon
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">Tính năng nổi bật</h3>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-heart-line text-2xl text-pink-500 w-6 h-6 flex items-center justify-center"></i>
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Câu thả thính đa dạng</h4>
              <p className="text-gray-600">Hàng trăm câu thả thính từ ngọt ngào đến hài hước</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-gift-2-line text-2xl text-purple-500 w-6 h-6 flex items-center justify-center"></i>
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Gợi ý quà tặng</h4>
              <p className="text-gray-600">Phân loại theo giới tính và dịp đặc biệt</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-restaurant-line text-2xl text-orange-500 w-6 h-6 flex items-center justify-center"></i>
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Quán ăn đặc sắc</h4>
              <p className="text-gray-600">Gợi ý quán ăn ngon theo từng tỉnh thành</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-chat-3-line text-2xl text-blue-500 w-6 h-6 flex items-center justify-center"></i>
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Tương tác cộng đồng</h4>
              <p className="text-gray-600">Bình luận và chia sẻ cảm nghĩ của bạn</p>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-gray-50 py-16" id="about">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-gray-800 mb-8">Về chúng tôi</h3>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Love Corner là nơi tập hợp những câu thả thính ngọt ngào nhất và gợi ý những món quà ý nghĩa. 
            Chúng tôi mong muốn giúp bạn thể hiện tình cảm một cách tuyệt vời nhất.
          </p>
          
          <div className="flex justify-center space-x-6">
            <a href={siteInfo.facebook} target="_blank" rel="noopener noreferrer" className="text-2xl text-blue-600 hover:text-blue-700 w-8 h-8 flex items-center justify-center">
              <i className="ri-facebook-fill"></i>
            </a>
            <a href={siteInfo.instagram} target="_blank" rel="noopener noreferrer" className="text-2xl text-pink-600 hover:text-pink-700 w-8 h-8 flex items-center justify-center">
              <i className="ri-instagram-line"></i>
            </a>
            <a href={siteInfo.tiktok} target="_blank" rel="noopener noreferrer" className="text-2xl text-gray-900 hover:text-gray-700 w-8 h-8 flex items-center justify-center">
              <i className="ri-tiktok-line"></i>
            </a>
            <a href={siteInfo.threads} target="_blank" rel="noopener noreferrer" className="text-2xl text-gray-800 hover:text-gray-600 w-8 h-8 flex items-center justify-center">
              <i className="ri-chat-3-line"></i>
            </a>
            <a href={`tel:${siteInfo.phone}`} className="text-2xl text-green-600 hover:text-green-700 w-8 h-8 flex items-center justify-center">
              <i className="ri-phone-line"></i>
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Love Corner. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  );
}
