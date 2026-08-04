import { redirect } from 'next/navigation';
import { AuthenticatedAppShell } from '@/components/shell/AuthenticatedAppShell';
import { isAuthenticated } from '@/utils/auth/server';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/login');
  }

  return <AuthenticatedAppShell>{children}</AuthenticatedAppShell>;
}