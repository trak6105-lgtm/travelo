const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Cấu hình nén Gzip/Brotli giúp tải trang tức thì (< 50ms)
app.use(compression());

// Thiết lập bảo mật nâng cao với Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Bật CORS an toàn
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
}));

// Giới hạn request chống tấn công DoS / Brute-force
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 300, // Tối đa 300 requests mỗi IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 phút
  max: 40, // Tối đa 40 lượt tìm kiếm mỗi phút
  message: { error: 'Too many searches, please slow down.' }
});

app.use(generalLimiter);
app.use(express.json({ limit: '10kb' })); // Ngăn chặn JSON payload quá lớn

// Middleware tự động xóa sạch cache của riêng trang web Travelo trên trình duyệt
app.use((req, res, next) => {
  res.set('Clear-Site-Data', '"cache"');
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Phục vụ file tĩnh không lưu cache cũ
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: 0,
  etag: false,
  lastModified: false
}));

// API lấy danh sách Explore Travelo từ SQLite
app.get('/api/explore', (req, res) => {
  db.all('SELECT id, title, subtitle, link FROM explore_sections ORDER BY sort_order ASC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database query error' });
    }
    res.json({ success: true, data: rows });
  });
});

// API tìm kiếm tour / điểm đến an toàn với SQLite Prepared Statements
app.get('/api/search', searchLimiter, (req, res) => {
  const query = (req.query.q || '').trim();
  
  if (!query) {
    return res.json({ success: true, data: [] });
  }

  // Hash IP ẩn danh để lưu log bảo mật
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const ipHash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);

  // Lưu lịch sử tìm kiếm
  const logStmt = db.prepare('INSERT INTO search_queries (query, ip_hash) VALUES (?, ?)');
  logStmt.run(query.substring(0, 100), ipHash);
  logStmt.finalize();

  // Truy vấn tìm kiếm an toàn với LIKE
  const searchPattern = `%${query}%`;
  const searchSql = `
    SELECT id, name, category, description, duration, price 
    FROM tours_and_destinations 
    WHERE name LIKE ? OR description LIKE ? OR category LIKE ?
    LIMIT 10
  `;

  db.all(searchSql, [searchPattern, searchPattern, searchPattern], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Search failed' });
    }
    res.json({ success: true, count: rows.length, data: rows });
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Điều hướng trang chính
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Travelo Vietnam Server đang chạy mượt mà tại http://localhost:${PORT}`);
});
