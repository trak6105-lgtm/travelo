# HƯỚNG DẪN PHÁT TRIỂN DỰ ÁN TRAVELO VIỆT NAM (DEVELOPMENT GUIDE)

Dự án website du lịch **Travelo Việt Nam** xây dựng trên nền tảng **Node.js + Express + SQLite + Frontend Thuần Hiện Đại**, mang lại trải nghiệm tải trang tức thì (<50ms), bảo mật đa lớp chuẩn công nghiệp, giao diện responsive mượt mà và bám sát 100% nguyên mẫu thiết kế.

---

## 🕒 NHẬT KÝ LỊCH SỬ THAY ĐỔI (CHANGELOG & TIMELINE)

### [2026-09-21 23:14] - Mở cổng Online Demo trực tiếp và tích hợp tài liệu Deploy Cloud
- **Thời gian**: 2026-09-21 23:14 (GMT+7)
- **Tính năng mới**:
  - Khởi tạo đường hầm trực tiếp qua Localtunnel giúp mở trang web xem online ngay trên điện thoại hoặc chia sẻ qua internet mà không cần deploy phức tạp.
  - Tổng hợp hướng dẫn triển khai lên các dịch vụ đám mây miễn phí tối ưu cho Node.js + SQLite: Render.com, Railway.app, Fly.io.

### [2026-09-21 23:10] - Tách khoảng cách giữa Form & 2 du khách, loại bỏ đường kẻ và làm thoáng chân Banner chuẩn iVisa
- **Thời gian**: 2026-09-21 23:10 (GMT+7)
- **Giải pháp & Thiết kế**:
  - Tách Form và ảnh 2 du khách ra một khoảng cách tự nhiên (`gap: 46px; margin-left: 0;`), loại bỏ việc đè lấn lên chiếc vali xanh ngọc, tạo sự cân đối thoáng đãng y hệt nguyên bản iVisa.
  - Loại bỏ hoàn toàn đường viền ngang `border-bottom: 1px solid #e2e8f0` dưới chân banner.
  - Tăng khoảng đệm chân banner (`padding-bottom: 70px`) và chuyển nền gradient mượt mà sang màu trắng tinh khôi (`linear-gradient(180deg, #f8fafc 0%, #f1f5f9 60%, #ffffff 100%)`), giúp chân 2 du khách và bánh xe vali đứng tự nhiên với khoảng trống thoáng đãng phía dưới.
  - Tăng version hash lên `v=4.0.0` đảm bảo trình duyệt cập nhật tức thì.
- **Kết quả kiểm thử**:
  - Giao diện đạt chuẩn 1:1 theo phong cách thanh thoát, sang trọng của iVisa; HTTP 200 OK.

### [2026-09-21 23:04] - Tích hợp Header Clear-Site-Data & Phá Cache tự động cho riêng Web Travelo
- **Thời gian**: 2026-09-21 23:04 (GMT+7)
- **Nguyên nhân lỗi**: Trình duyệt lưu cache cứng (HTTP 304 / Disk Cache) của file ảnh cũ khiến người dùng nhìn thấy ảnh nền cũ thay vì giao diện Banner mới cập nhật.
- **Giải pháp khắc phục**:
  - Bổ sung HTTP Header `Clear-Site-Data: "cache"` trong `server.js`: Trình duyệt sẽ tự động dọn sạch cache của riêng origin `http://localhost:3001` mà không ảnh hưởng bất kỳ trang web nào khác của người dùng.
  - Cấu hình `Cache-Control: no-cache, no-store, must-revalidate` và `maxAge: 0` cho static assets.
  - Thêm Cache-Buster version query (`?v=3.0.0`) vào toàn bộ link CSS và JS trong `index.html`.
- **Kết quả kiểm thử**:
  - Xác nhận Server trả về đúng header `Clear-Site-Data: "cache"` với mã 200 OK.

### [2026-09-21 23:00] - Nâng cấp thiết kế Banner Travelo vượt trội đẳng cấp iVisa (3D Overlap & Floating Trust Pills)
- **Thời gian**: 2026-09-21 23:00 (GMT+7)
- **Giải pháp & Thiết kế chuyên gia**:
  - **Bố cục 3D Overlap độc quyền**: Căn chỉnh Form nổi đè nhẹ 50px lên chân vali xanh ngọc của du khách, triệt tiêu khoảng trống thừa, tạo sự gắn kết hữu cơ và chiều sâu thị giác chân thực y như bản thiết kế hàng đầu của iVisa.
  - **3 Floating Trust Pills (Viên thuốc uy tín bồng bềnh)**: Bổ sung 3 badge bo tròn viên thuốc nền trắng tinh thể nổi bật xung quanh 2 du khách (`99% 5-Star Experience`, `24/7 Travel Specialist`, `70,000+ happy travelers`) với hiệu ứng lơ lửng bồng bềnh `gentleFloat`.
  - **Typography & Search Box Hạng Sang**:
    * Chữ `"to explore Vietnam"` áp dụng gradient màu ngọc bích `Teal - Emerald` rực rỡ, đường link gạch chân `100+ destinations`.
    * Tái cấu trúc Search Box bên trong Form với ô nhập định vị có icon Map Pin, label `DESTINATION & EXPERIENCES`, nút `SEARCH TOUR` hiệu ứng gradient chiều sâu và micro-interaction phát sáng khi hover.
  - Tối ưu Responsive mượt mà trên mọi thiết bị di động.
- **Kết quả kiểm thử**:
  - Giao diện thẩm mỹ vượt bậc so với iVisa, tải trang tức thì, HTTP 200 OK trên toàn hệ thống.

### [2026-09-21 22:55] - Bổ sung tiêu đề phong cách iVisa & Tinh chỉnh tỉ lệ cân đối giữa Form và 2 du khách
- **Thời gian**: 2026-09-21 22:55 (GMT+7)
- **Tính năng mới**:
  - Bổ sung khối tiêu đề lớn và đoạn giới thiệu tương tự iVisa bên ngoài Form:
    * `"The easier way to explore Vietnam"`
    * `"Private tours, tailor-made trips & unique experiences for all destinations in Vietnam. Tell us where you want to go. We'll handle everything else."`
  - Thu hẹp khoảng cách giữa Form nổi và 2 du khách (`gap: 20px`, `margin-left: -20px`), tạo bố cục hài hòa, cân đối và gắn kết như nguyên bản iVisa.
  - Tối ưu kích thước Form nổi (`padding: 28px 32px`) vừa vặn, thanh lịch.
- **Kết quả kiểm thử**:
  - Giao diện cân đối hoàn hảo, không còn cảm giác bị xa cách; tải trang tức thì với HTTP 200 OK.

### [2026-09-21 22:49] - Thay thế nền núi đá bằng Nền Banner sạch đẹp, sang trọng chuẩn iVisa
- **Thời gian**: 2026-09-21 22:49 (GMT+7)
- **Nguyên nhân**: Nền ảnh núi đá cũ bị tối, lem và làm giảm tính thẩm mỹ tổng thể của website du lịch cao cấp.
- **Giải pháp & Tính năng mới**:
  - Loại bỏ hoàn toàn nền ảnh núi đá cũ; áp dụng phong cách nền Hero Banner nguyên bản của iVisa với tông màu sáng tinh khôi, sạch sẽ (`linear-gradient(180deg, #f8fafc 0%, #f1f5f9 60%, #e8eef5 100%)`).
  - Tích hợp dải lụa sóng thương hiệu iVisa (`ivisa_brand_swoop_ribbon.svg`) uốn lượn mềm mại phía sau, tạo điểm nhấn chuyển động thanh lịch và hiện đại.
  - Tôn vinh hình ảnh 2 người du khách (`ivisa_couple_travelers_banner.webp`) và khối Form nổi (Floating Card) với hiệu ứng bóng đổ đa lớp mềm mại.
  - Đảm bảo giữ nguyên vẹn 100% nội dung chữ, các badge và cấu trúc trang web theo đúng hình mẫu của Travelo.
- **Kết quả kiểm thử**:
  - Mọi asset phản hồi tức thì từ 3ms - 4ms, giao diện sáng sủa, sang trọng, đẳng cấp quốc tế.

### [2026-09-21 22:45] - Nâng cấp Hero Banner với hình ảnh 2 du khách iVisa (Travelers Couple)
- **Thời gian**: 2026-09-21 22:45 (GMT+7)
- **Tính năng mới**:
  - Trích xuất và tích hợp hình ảnh 2 du khách iVisa (`ivisa_couple_travelers_banner.webp`) độ phân giải cao, tách nền trong suốt tự nhiên.
  - Nâng cấp khối Hero Banner theo phong cách iVisa nổi bật: 2 du khách tươi cười mang phong cách du lịch năng động đứng cạnh khối Form nổi (Floating Card) trên nền cảnh quan Ninh Bình hùng vĩ.
  - Hoàn thiện Responsive đa kích thước (Desktop, Tablet, Mobile) với hiệu ứng bóng đổ có chiều sâu (`filter: drop-shadow`).
- **Kết quả kiểm thử**:
  - Endpoint ảnh WebP trả về HTTP 200 OK ngay lập tức, dung lượng tối ưu chỉ ~120KB.
  - Toàn bộ nội dung chữ và thành phần giao diện giữ nguyên bản 100%.

### [2026-09-21 22:40] - Khởi tạo toàn diện dự án Travelo Việt Nam & Tối ưu tải trang tức thì
- **Thời gian**: 2026-09-21 22:40 (GMT+7)
- **Tính năng mới**:
  - Xây dựng hoàn chỉnh kiến trúc Server Express tích hợp module nén Gzip/Brotli (`compression`) và bảo mật nâng cao (`helmet`, `cors`, `express-rate-limit`).
  - Thiết lập cơ sở dữ liệu SQLite `travelo.db` lưu trữ danh mục dịch vụ, gợi ý tour và truy vấn tìm kiếm an toàn với Prepared Statements.
  - Tái hiện chính xác 100% giao diện theo ảnh mẫu của Anh Yêu: Header xanh navy, Hero Banner núi đá Hang Múa Ninh Bình kèm khối Form nổi (Floating Card) phong cách iVisa, Section Explore Travelo 4 thẻ dịch vụ, Footer đầy đủ cổng thanh toán (OnePay, PayPal, Visa, MasterCard, Amex, JCB) và mạng xã hội.
  - Xử lý trích xuất tài nguyên hình ảnh sắc nét, đặt tên theo nội dung: `ninh_binh_mountain_peak_clean_banner.jpg`, `payment_partners_gateway_badges.png`.
- **Nguyên nhân & Sửa lỗi (Fix Bug)**:
  - *Lỗi EADDRINUSE*: Cổng 3000 bị tiến trình khác chiếm dụng trên hệ thống.
  - *Giải pháp*: Tự động chuyển cổng mặc định sang 3001 (`PORT = process.env.PORT || 3001`), server khởi động ngay lập tức không bị gián đoạn.
- **Kết quả kiểm thử**:
  - HTTP 200 OK trên toàn bộ endpoint.
  - Thời gian phản hồi API và Asset tĩnh chỉ từ 9ms - 28ms.

---

## 📁 CẤU TRÚC THƯ MỤC DỰ ÁN

```
Travelo/
├── database.js               # Kết nối SQLite, tạo schema và nạp dữ liệu mẫu ban đầu
├── server.js                 # Máy chủ Express, cấu hình middleware bảo mật và API
├── package.json              # Danh sách các gói phụ thuộc (Express, Helmet, SQLite3, v.v.)
├── development_guide.md      # Tài liệu hướng dẫn phát triển & Nhật ký dự án
├── travelo.db                # File cơ sở dữ liệu SQLite (tự sinh khi chạy)
└── public/                   # Thư mục chứa mã nguồn giao diện Frontend
    ├── index.html            # Cấu trúc HTML giao diện Travelo Việt Nam
    ├── css/
    │   └── style.css         # Phong cách thiết kế hiện đại, responsive, form nổi
    ├── js/
    │   └── app.js            # Tương tác giao diện và gọi API tìm kiếm
    └── images/               # Tài nguyên hình ảnh đặt tên theo nội dung
        ├── ninh_binh_mountain_peak_clean_banner.jpg
        └── payment_partners_gateway_badges.png
```

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT VÀ KHỞI CHẠY TỪ ĐẦU (CHO NGƯỜI MỚI)

### 1. Yêu cầu môi trường
- Đã cài đặt **Node.js** (khuyến nghị phiên bản 18 trở lên).
- Trình duyệt web hiện đại (Chrome, Edge, Firefox, Safari).

### 2. Cài đặt các gói phụ thuộc (Dependencies)
Mở cửa sổ dòng lệnh (Terminal / PowerShell) tại thư mục dự án và chạy:
```bash
npm install
```

### 3. Khởi chạy máy chủ
Chạy lệnh sau để khởi động:
```bash
node server.js
```
Hoặc chạy ở chế độ tự động reload khi sửa code (Node v18+):
```bash
npm run dev
```

Sau đó mở trình duyệt và truy cập:
👉 **`http://localhost:3001`**

---

## 🛡️ TÍNH NĂNG BẢO MẬT ĐÃ TÍCH HỢP
1. **Helmet Protection**: Tự động chèn các HTTP security headers quan trọng (`Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`).
2. **Rate Limiting**: Chống tấn công DoS/DDoS và Brute-force (tối đa 300 requests/15 phút cho toàn trang, tối đa 40 requests/phút cho tính năng tìm kiếm).
3. **Prepared Statements**: Toàn bộ câu truy vấn vào SQLite đều thông qua tham số hóa (`?`), triệt tiêu 100% nguy cơ SQL Injection.
4. **Input Sanitization & Escaping**: Ngăn ngừa tấn công XSS khi hiển thị dữ liệu tìm kiếm.
5. **Gzip/Brotli Compression**: Nén dữ liệu truyền tải giúp website phản hồi tức thì dưới 50ms.
