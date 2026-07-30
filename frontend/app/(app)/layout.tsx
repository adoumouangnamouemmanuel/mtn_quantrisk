import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { AuthenticatedAppShell } from '@/components/shell/AuthenticatedAppShell';
import { createClient } from '@/utils/supabase/server';
import { isDevAuthBypassEnabled } from '@/utils/supabase/dev-auth';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const requestHeaders = await headers();
  if (isDevAuthBypassEnabled(requestHeaders.get('host'))) {
    return <AuthenticatedAppShell>{children}</AuthenticatedAppShell>;
  }

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
