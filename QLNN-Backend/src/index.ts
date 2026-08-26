import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import healthRoutes from './routes/health.routes';
import villageRoutes from './routes/village.routes';
import householdRoutes from './routes/household.routes';
import excelRoutes from './routes/excel.routes';
import auditRoutes from './routes/audit.routes';
import analyticsRoutes from './routes/analytics.routes';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import { authenticateToken, authorizeVillageScope, AuthRequest } from './middlewares/auth.middleware';

const app = express();
const PORT = process.env.PORT || 5001;

// Bảo mật HTTP Headers
app.use(helmet());

// Cấu hình CORS
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5174', 'http://localhost:5173'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép requests không có origin (Electron / Mobile / Postman) hoặc nằm trong danh sách
      if (!origin || corsOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check Endpoint (Bắt buộc theo quy chuẩn hệ sinh thái Đăk Hà)
app.use('/api/health', healthRoutes);

// Test Authenticated Route (Verify Shared SSO Auth)
app.get('/api/auth-test', authenticateToken, authorizeVillageScope, (req: AuthRequest, res: express.Response) => {
  res.json({
    status: 'ok',
    message: 'Xác thực SSO thành công!',
    user: req.user,
  });
});

// API Routes
app.use('/api/villages', villageRoutes);
app.use('/api/households', householdRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Root route
app.get('/', (_req, expressRes) => {
  expressRes.json({
    message: 'Hệ thống Quản Lý Nông Nghiệp & Nông Thôn Mới - Xã Đăk Hà (QLNN API)',
    health: '/api/health',
    version: '1.0.0',
  });
});

// Error handling middleware

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Lỗi máy chủ nội bộ',
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[QLNN-Backend] Server running on http://localhost:${PORT}`);
    console.log(`[QLNN-Backend] Health check available at http://localhost:${PORT}/api/health`);
  });
}

export default app;
