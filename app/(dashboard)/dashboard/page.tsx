import { getUser } from '@/lib/db/queries';
import { Settings } from './settings';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  return <Settings user={user} />;
}
