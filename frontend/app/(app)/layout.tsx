import { redirect } from 'next/navigation';
import { AuthenticatedAppShell } from '@/components/shell/AuthenticatedAppShell';
import { createClient } from '@/utils/supabase/server';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let user = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    redirect('/login?error=configuration');
  }

  if (!user) {
    redirect('/login');
  }

  return <AuthenticatedAppShell>{children}</AuthenticatedAppShell>;
}
