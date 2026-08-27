import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../config/jwt';
import { trackActivity } from '../services/userActivity.service';

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

/**
 * authenticateToken: Parse JWT từ Authorization header và gán user vào req.
 */
export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      res.status(401).json({ error: 'Token không được cung cấp' });
      return;
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    trackActivity(decoded.id);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

/**
 * authorizeVillageScope: Thực thi giới hạn phạm vi truy cập theo Thôn (RBAC).
 * - Admin (village_id = null): Truy cập toàn bộ dữ liệu tất cả các thôn.
 * - Trưởng thôn (role = 'user', village_id = 'xxx'): Chỉ truy cập dữ liệu thôn của mình.
 */
export const authorizeVillageScope = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Chưa xác thực' });
      return;
    }

    // Admin có quyền truy cập toàn bộ
    if (req.user.role === 'admin' || !req.user.village_id) {
      next();
      return;
    }

    const userVillageId = req.user.village_id;

    // Chặn nếu client cố tình gửi villageId của thôn khác trong query
    if (req.query.villageId && req.query.villageId !== userVillageId) {
      res.status(403).json({ error: 'Không có quyền truy cập thôn khác' });
      return;
    }

    // Chặn nếu client cố tình gửi village_id của thôn khác trong body
    if (req.body && req.body.village_id && req.body.village_id !== userVillageId) {
      res.status(403).json({ error: 'Không có quyền truy cập thôn khác' });
      return;
    }

    // Tự động gán village_id của trưởng thôn vào query đối với GET
    if (req.method === 'GET') {
      req.query.villageId = userVillageId;
    }

    // Tự động gán village_id của trưởng thôn vào body đối với POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      if (req.body && typeof req.body === 'object') {
        req.body.village_id = userVillageId;
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Lỗi phân quyền dữ liệu' });
  }
};
