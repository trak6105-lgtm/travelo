const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const { db, hashPassword, verifyPassword } = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Lưu trữ token phiên đăng nhập Admin
const adminSessions = new Map();

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
  methods: ['GET', 'POST', 'DELETE'],
}));

// Giới hạn request chống tấn công DoS / Brute-force
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 40,
  message: { error: 'Too many searches, please slow down.' }
});

// Giới hạn đăng nhập chặt chẽ: tối đa 10 lần thử / 15 phút
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Quá nhiều lần thử đăng nhập thất bại. Vui lòng đợi 15 phút.' }
});

app.use(generalLimiter);
app.use(express.json({ limit: '10kb' }));

// Middleware chống cache cứng
app.use((req, res, next) => {
  res.set('Clear-Site-Data', '"cache"');
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Phục vụ file tĩnh
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: 0,
  etag: false,
  lastModified: false
}));

// Middleware xác thực quyền quản trị Admin qua Header Authorization
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  
  if (!token || !adminSessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized. Vui lòng đăng nhập quyền quản trị.' });
  }

  req.adminUser = adminSessions.get(token);
  next();
}

/* ==========================================================================
   ADMIN AUTHENTICATION & DASHBOARD APIS
   ========================================================================== */

// API Đăng nhập Admin
app.post('/api/admin/login', loginLimiter, (req, res) => {
  const { username, password } = req.body || {};
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
  }

  db.get('SELECT * FROM admin_users WHERE username = ?', [username.trim()], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Lỗi máy chủ cơ sở dữ liệu.' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
    }

    const isValid = verifyPassword(password, user.salt, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
    }

    // Tạo token phiên đăng nhập ngẫu nhiên an toàn
    const token = crypto.randomBytes(32).toString('hex');
    adminSessions.set(token, {
      id: user.id,
      username: user.username,
      loginAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Đăng nhập thành công!',
      token,
      user: { username: user.username }
    });
  });
});

// API Kiểm tra trạng thái đăng nhập
app.get('/api/admin/me', requireAdminAuth, (req, res) => {
  res.json({ success: true, user: req.adminUser });
});

// API Đăng xuất Admin
app.post('/api/admin/logout', requireAdminAuth, (req, res) => {
  const token = req.headers['authorization'].substring(7);
  adminSessions.delete(token);
  res.json({ success: true, message: 'Đã đăng xuất an toàn.' });
});

// API Thống kê tổng quan (Dashboard Stats)
app.get('/api/admin/stats', requireAdminAuth, (req, res) => {
  db.get('SELECT COUNT(*) as totalTours FROM tours_and_destinations', (err, toursRow) => {
    db.get('SELECT COUNT(*) as totalSearches FROM search_queries', (err2, searchesRow) => {
      db.get('SELECT COUNT(*) as totalSections FROM explore_sections', (err3, sectionsRow) => {
        res.json({
          success: true,
          data: {
            toursCount: toursRow ? toursRow.totalTours : 0,
            searchesCount: searchesRow ? searchesRow.totalSearches : 0,
            sectionsCount: sectionsRow ? sectionsRow.totalSections : 0,
            uptime: Math.round(process.uptime())
          }
        });
      });
    });
  });
});

// API Lấy danh sách toàn bộ Tours
app.get('/api/admin/tours', requireAdminAuth, (req, res) => {
  db.all('SELECT * FROM tours_and_destinations ORDER BY id DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn danh sách tour' });
    res.json({ success: true, data: rows });
  });
});

// API Thêm Tour mới vào SQLite
app.post('/api/admin/tours', requireAdminAuth, (req, res) => {
  const { name, category, description, duration, price } = req.body || {};
  if (!name || !category) {
    return res.status(400).json({ error: 'Tên và phân loại tour là bắt buộc.' });
  }

  const stmt = db.prepare('INSERT INTO tours_and_destinations (name, category, description, duration, price) VALUES (?, ?, ?, ?, ?)');
  stmt.run(name.trim(), category.trim(), (description || '').trim(), (duration || '').trim(), Number(price) || 0, function(err) {
    if (err) return res.status(500).json({ error: 'Lỗi thêm tour vào cơ sở dữ liệu' });
    res.json({ success: true, message: 'Thêm tour thành công!', id: this.lastID });
  });
  stmt.finalize();
});

// API Xóa Tour khỏi SQLite
app.delete('/api/admin/tours/:id', requireAdminAuth, (req, res) => {
  const id = Number(req.params.id);
  db.run('DELETE FROM tours_and_destinations WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: 'Lỗi xóa tour' });
    res.json({ success: true, message: 'Đã xóa tour thành công!' });
  });
});

// API Xem 15 lượt tìm kiếm gần nhất từ khách hàng
app.get('/api/admin/search-logs', requireAdminAuth, (req, res) => {
  db.all('SELECT id, query, created_at FROM search_queries ORDER BY id DESC LIMIT 15', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn nhật ký tìm kiếm' });
    res.json({ success: true, data: rows });
  });
});

/* ==========================================================================
   PUBLIC APIS & PAGES
   ========================================================================== */

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

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const ipHash = crypto.createHash('sha256').update(ip).digest('hex').substring(0, 16);

  const logStmt = db.prepare('INSERT INTO search_queries (query, ip_hash) VALUES (?, ?)');
  logStmt.run(query.substring(0, 100), ipHash);
  logStmt.finalize();

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

// Điều hướng trang quản trị
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'login.html'));
});

// Điều hướng trang chính
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`Travelo Vietnam Server đang chạy mượt mà tại http://localhost:${PORT}`);
});
