import { getUser } from '@/lib/db/queries';
import { ClientUserProvider } from '@/lib/auth/client';
import { redirect } from 'next/navigation';

export default async function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  return <ClientUserProvider user={user}>{children}</ClientUserProvider>;
} 