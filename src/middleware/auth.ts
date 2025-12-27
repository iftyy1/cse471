import { NextRequest } from 'next/server';
import { verifyToken, User } from '@/lib/auth';

export function getAuthUser(request: NextRequest): User | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const user = verifyToken(token);
  
  return user;
}

export function requireAuth(request: NextRequest): User {
  const user = getAuthUser(request);
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

