import { Link } from 'react-router-dom';
import { Heart, Users, Calendar, Award } from 'lucide-react';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 fade-in">
              Nhiệt huyết tình nguyện viên
            </h1>
            <p className="text-xl mb-8 opacity-90 fade-in">
              Tham gia các hoạt động tình nguyện ý nghĩa, kết nối cộng đồng và tạo nên sự thay đổi tích cực.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in">
              <Link
                to="/events"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Khám phá sự kiện
              </Link>
              <Link
                to="/register"
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition"
              >
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tại sao chọn VolunteerHub?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nền tảng kết nối tình nguyện viên với các tổ chức, giúp bạn dễ dàng tham gia và quản lý hoạt động tình nguyện.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 slide-up">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Nhiều hoạt động</h3>
              <p className="text-gray-600">
                Trồng cây, dọn rác, từ thiện, giáo dục và nhiều hoạt động khác.
              </p>
            </div>

            <div className="text-center p-6 slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Cộng đồng sôi động</h3>
              <p className="text-gray-600">
                Kết nối với hàng ngàn tình nguyện viên nhiệt huyết trên toàn quốc.
              </p>
            </div>

            <div className="text-center p-6 slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Quản lý dễ dàng</h3>
              <p className="text-gray-600">
                Đăng ký, theo dõi và quản lý lịch sự kiện một cách tiện lợi.
              </p>
            </div>

            <div className="text-center p-6 slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Thành tích rõ ràng</h3>
              <p className="text-gray-600">
                Theo dõi lịch sử tham gia và thành tích hoạt động tình nguyện.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Sẵn sàng tham gia?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Đăng ký ngay hôm nay để khám phá và tham gia các hoạt động tình nguyện ý nghĩa.
          </p>
          <Link
            to="/register"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            Bắt đầu ngay
          </Link>
        </div>
      </section>
    </div>
  );
}

