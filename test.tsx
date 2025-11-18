import React, { useState } from 'react';
import { Icon } from 'zmp-ui';

export default function ZaloMiniApp() {
  const [activeTab, setActiveTab] = useState('home');

  const products = [
    {
      id: 1,
      name: 'Thẻ Cộng Đồng Bầu Hà Nội',
      price: '50.000 đ',
      image: '02 CHAI SỮA TẮM\nJOHNSON 50ML'
    },
    {
      id: 2,
      name: 'Thẻ Cộng Đồng Bầu Hồ Chí Minh',
      price: '50.000 đ',
      image: '02 CHAI SỮA TẮM\nJOHNSON 50ML'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header with Wave Effect */}
      <div className="relative">
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white pb-16">
          <div className="p-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <div className="text-sm opacity-90">Xin chào,</div>
                  <div className="text-lg font-semibold">Guest</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
                <button className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <div className="grid grid-cols-3 gap-4">
                <button className="flex flex-col items-center gap-2 p-3 hover:bg-pink-50 rounded-xl transition">
                  <div className="w-14 h-14 bg-pink-50 rounded-full flex items-center justify-center">
                    <Gift className="w-7 h-7 text-pink-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-800">Đổi thưởng</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-3 hover:bg-pink-50 rounded-xl transition">
                  <div className="w-14 h-14 bg-pink-50 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-7 h-7 text-pink-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-800">Bài viết</span>
                </button>
                <button className="flex flex-col items-center gap-2 p-3 hover:bg-pink-50 rounded-xl transition">
                  <div className="w-14 h-14 bg-pink-50 rounded-full flex items-center justify-center">
                    <Phone className="w-7 h-7 text-pink-500" />
                  </div>
                  <span className="text-sm font-medium text-gray-800">Liên hệ</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
          <svg className="relative block w-full h-12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path fill="#ffffff" d="M0,50 Q360,0 720,50 T1440,50 L1440,100 L0,100 Z"></path>
          </svg>
        </div>
      </div>

      {/* Notification Banner */}
      <div className="p-4">
        <div className="bg-pink-100 rounded-2xl p-4 border-2 border-pink-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center relative">
                <User className="w-5 h-5 text-white" />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center">
                  <span className="text-xs">✓</span>
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800 font-medium">Quan tâm OA để nhận các chương trình đặc quyền ưu đãi</p>
                <p className="text-xs text-gray-600 mt-1">Công ty TNHH Cộng Đồng Bầu</p>
              </div>
            </div>
            <button className="bg-pink-500 text-white px-6 py-2 rounded-full font-medium text-sm whitespace-nowrap ml-2">
              Quan tâm
            </button>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Thẻ Cộng Đồng Bầu</h2>
          <button className="text-pink-500 text-sm font-medium">Tất cả</button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-lg">
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-6 relative">
                <div className="absolute top-2 left-2 text-white text-xs">▶▶▶</div>
                <div className="absolute bottom-2 right-2 text-white text-xs">◀◀◀</div>
                <div className="text-center text-white">
                  <div className="text-xs font-semibold mb-3 whitespace-pre-line leading-relaxed">
                    {product.image}
                  </div>
                  <div className="flex justify-center gap-3 mt-4">
                    <div className="w-16 h-20 bg-white rounded-2xl shadow-md"></div>
                    <div className="w-16 h-20 bg-white rounded-2xl shadow-md"></div>
                  </div>
                </div>
                <div className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-pink-500 rounded-full"></div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 text-sm mb-2">{product.name}</h3>
                <p className="text-pink-600 font-bold text-lg">{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Promotions Section */}
      <div className="p-4 pb-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Ưu đãi</h2>
          <button className="text-pink-500 text-sm font-medium">Xem thêm</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl h-32 flex items-center justify-center text-white">
            <div className="text-center">
              <div className="text-yellow-400 text-2xl mb-1">👑</div>
              <div className="text-xs">VIP</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl h-32 flex items-center justify-center text-white">
            <div className="text-center">
              <div className="text-2xl mb-1">🎁</div>
              <div className="text-xs">Phiếu quà tặng</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-inset-bottom">
        <div className="grid grid-cols-4 gap-2">
          <button 
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 py-2 ${activeTab === 'home' ? 'text-pink-500' : 'text-gray-500'}`}
          >
            <Icon icon="zi-home" />
            <span className="text-xs font-medium">Trang chủ</span>
          </button>
          <button 
            onClick={() => setActiveTab('category')}
            className={`flex flex-col items-center gap-1 py-2 ${activeTab === 'category' ? 'text-pink-500' : 'text-gray-500'}`}
          >
            <Icon icon="zi-list-1" />
            <span className="text-xs font-medium">Danh mục</span>
          </button>
          <button 
            onClick={() => setActiveTab('messages')}
            className={`flex flex-col items-center gap-1 py-2 ${activeTab === 'messages' ? 'text-pink-500' : 'text-gray-500'}`}
          >
            <Icon icon="zi-chat" />
            <span className="text-xs font-medium">Tin nhắn</span>
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-1 py-2 ${activeTab === 'profile' ? 'text-pink-500' : 'text-gray-500'}`}
          >
            <Icon icon="zi-user" />
            <span className="text-xs font-medium">Cá nhân</span>
          </button>
        </div>
      </div>
    </div>
  );
}