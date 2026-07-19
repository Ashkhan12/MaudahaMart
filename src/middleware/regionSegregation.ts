import { Response, NextFunction } from 'express';
import { adminAuth } from '../lib/firebase-admin.ts';
import { getUser } from '../db/queries.ts';
import { AuthRequest } from './auth.ts';

export interface RegionalAuthRequest extends AuthRequest {
  serviceAreaId?: string;
}

export const regionSegregationMiddleware = async (
  req: RegionalAuthRequest,
  res: Response,
  next: NextFunction
) => {
  let uid: string | undefined = req.user?.uid;

  // 1. If not authenticated yet (e.g., on public routes like /api/stores), 
  // try to extract token from Authorization header if present
  if (!uid) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        req.user = decodedToken;
        uid = decodedToken.uid;
      } catch (error) {
        // Silently fail for optional auth on public routes
        console.warn('Optional auth token verification failed in regionSegregation:', error);
      }
    }
  }

  let userAreaId = 'area-maudaha'; // Default fallback area ID

  // 2. Fetch user's serviceAreaId from DB if we have a valid uid
  if (uid) {
    try {
      const dbUser = await getUser(uid);
      if (dbUser && dbUser.serviceAreaId) {
        userAreaId = dbUser.serviceAreaId;
      }
    } catch (dbErr) {
      console.error('Error fetching user serviceAreaId in middleware:', dbErr);
    }
  }

  // Store serviceAreaId on request object for downstream use
  req.serviceAreaId = userAreaId;

  // 3. Intercept res.json to automatically filter response data based on serviceAreaId
  const originalJson = res.json;
  res.json = function (body: any) {
    if (!body) {
      return originalJson.call(this, body);
    }

    const filterItem = (item: any): boolean => {
      if (!item || typeof item !== 'object') return true;

      // Segregate by serviceAreaId if it exists on the item
      const itemAreaId = item.serviceAreaId;
      if (itemAreaId !== undefined && itemAreaId !== null) {
        // Ensure user can only view data matching their serviceAreaId
        return itemAreaId === userAreaId;
      }

      // Check nested objects (e.g., store or product inside order items)
      if (item.product && item.product.serviceAreaId) {
        return item.product.serviceAreaId === userAreaId;
      }

      return true;
    };

    // If body is an array, filter its items
    if (Array.isArray(body)) {
      const filteredArray = body.filter(filterItem);
      return originalJson.call(this, filteredArray);
    }

    // If body is a single object, verify it matches the user's serviceAreaId
    if (typeof body === 'object') {
      // Allow user to view their own profile/request info even if serviceAreaId is being loaded/modified
      const isUserProfileRequest = body.uid === uid || (body.userId && body.userId === uid && !body.storeId);
      
      if (!isUserProfileRequest && body.serviceAreaId !== undefined && body.serviceAreaId !== null) {
        if (body.serviceAreaId !== userAreaId) {
          // If it's a request for a single item belonging to another region, return an empty object or error
          return res.status(403).json({ error: 'Access forbidden: region data segregation' } as any);
        }
      }
    }

    return originalJson.call(this, body);
  };

  next();
};
