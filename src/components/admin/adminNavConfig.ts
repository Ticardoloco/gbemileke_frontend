import {
  LayoutDashboard,
  Users,
  CreditCard,
  Calendar,
  ShoppingBag,
  PackageCheck,
  ShieldCheck,
  Settings,
  HeartHandshake,
} from "lucide-react";

export const adminNavItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Manage Users", href: "/admin/users", icon: Users },
  { label: "Patient Cards", href: "/admin/patient-cards", icon: CreditCard },
  { label: "Appointments", href: "/admin/appointments", icon: Calendar },
  { label: "Manage Products", href: "/admin/products", icon: ShoppingBag },
  { label: "Products Ordered", href: "/admin/orders", icon: PackageCheck },
  {label: "Manage Stories", href: "/admin/stories", icon: HeartHandshake },
  { label: "Role Management", href: "/admin/roles", icon: ShieldCheck },
  { label: "System Settings", href: "/admin/settings", icon: Settings },
];