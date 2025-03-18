import { ReactNode } from 'react';
import { getUser } from '@/lib/db/queries';
import { ClientUserProvider } from './client';

interface UserProviderProps {
  children: ReactNode;
}

export async function UserProvider({ children }: UserProviderProps) {
  const user = await getUser();

  return <ClientUserProvider user={user}>{children}</ClientUserProvider>;
}

export { useUser } from './client';
