import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function getAuthUser(request: NextRequest): { id: number; email: string; role: string } | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const user = verifyToken(token);
  
  return user;
}

export function requireAuth(request: NextRequest): { id: number; email: string; role: string } {
  const user = getAuthUser(request);
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

