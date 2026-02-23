import AdminLayoutClient from "@/components/AdminLayoutClient";

export const metadata = {
  title: "MC Content — Admin Dashboard",
  description: "Admin panel untuk mengelola konten Minecraft.",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
