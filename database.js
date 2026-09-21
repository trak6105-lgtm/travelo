const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'travelo.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Lỗi kết nối SQLite database:', err.message);
  } else {
    console.log('Đã kết nối thành công tới cơ sở dữ liệu SQLite: travelo.db');
  }
});

// Khởi tạo bảng và nạp dữ liệu mặc định
db.serialize(() => {
  // Bảng khám phá dịch vụ
  db.run(`CREATE TABLE IF NOT EXISTS explore_sections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    link TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
  )`);

  // Bảng gợi ý tìm kiếm & tour
  db.run(`CREATE TABLE IF NOT EXISTS tours_and_destinations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    duration TEXT,
    price REAL
  )`);

  // Bảng lưu trữ lượt tìm kiếm an toàn (chống spam)
  db.run(`CREATE TABLE IF NOT EXISTS search_queries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT NOT NULL,
    ip_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Kiểm tra và seed dữ liệu ban đầu cho explore_sections
  db.get('SELECT COUNT(*) as count FROM explore_sections', (err, row) => {
    if (!err && row.count === 0) {
      const stmt = db.prepare('INSERT INTO explore_sections (title, subtitle, link, sort_order) VALUES (?, ?, ?, ?)');
      stmt.run('Vietnam Tour Packages', 'Explore our curated tour packages', '#packages', 1);
      stmt.run('Tailor-Made Tours', 'Tell us what you want', '#tailor-made', 2);
      stmt.run('Travel Guide', 'Useful information for your trip', '#guide', 3);
      stmt.run('About Us', 'Who we are, what we do', '#about', 4);
      stmt.finalize();
    }
  });

  // Kiểm tra và seed dữ liệu mẫu cho tours_and_destinations
  db.get('SELECT COUNT(*) as count FROM tours_and_destinations', (err, row) => {
    if (!err && row.count === 0) {
      const stmt = db.prepare('INSERT INTO tours_and_destinations (name, category, description, duration, price) VALUES (?, ?, ?, ?, ?)');
      stmt.run('Ninh Binh Heritage & Trang An Boat Tour', 'Tour', 'Experience ancient temples and dramatic karst peaks in Ninh Binh', '2 Days 1 Night', 180);
      stmt.run('Halong Bay Luxury Cruise Expedition', 'Tour', 'Sail through emerald waters and limestone islets with 5-star service', '3 Days 2 Nights', 350);
      stmt.run('Hanoi Old Quarter & Street Food Story', 'Experience', 'Immerse in culinary secrets and French colonial architecture', 'Full Day', 65);
      stmt.run('Hoi An Ancient Town & Lantern Making', 'Experience', 'Customized cultural journey along the Thu Bon River', 'Full Day', 80);
      stmt.run('Sapa Terraces & Hill Tribe Discovery', 'Tour', 'Private trek through breathtaking rice terraces and remote villages', '3 Days 2 Nights', 240);
      stmt.finalize();
    }
  });
});

module.exports = db;
