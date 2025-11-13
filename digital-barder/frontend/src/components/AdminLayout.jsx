import Sidebar from "./Sidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
