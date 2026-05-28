import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-brand-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Topbar />
        <main className="flex-1 p-6 relative">
          {children}
        </main>
        {/* Confidential Footer overlaying bottom left of main content area if needed, or placed globally. But wait, it should be everywhere. */}
      </div>
    </div>
  );
}
