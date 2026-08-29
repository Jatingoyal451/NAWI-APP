"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, FileText, PlusCircle, LogOut, Settings, BarChart } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!session) return null;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md hidden md:flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-blue-600">NAWI System</h1>
          <p className="text-xs text-gray-500">OIML R-76 Dashboard</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 text-gray-700">
            <LayoutDashboard size={20} />
            <span>Overview</span>
          </Link>
          <Link href="/dashboard/instruments" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 text-gray-700">
            <PlusCircle size={20} />
            <span>New Test Report</span>
          </Link>
          <Link href="/dashboard/reports" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 text-gray-700">
            <FileText size={20} />
            <span>Test Repository</span>
          </Link>
          <Link href="/dashboard/analytics" className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 text-gray-700">
            <BarChart size={20} />
            <span>Analytics (SIH)</span>
          </Link>
        </nav>
        <div className="p-4 border-t">
          <div className="mb-4">
            <p className="text-sm font-medium">{session.user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{session.user?.role?.toLowerCase()}</p>
          </div>
          <button 
            onClick={() => signOut()}
            className="flex items-center space-x-2 w-full p-2 rounded text-red-600 hover:bg-red-50"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
