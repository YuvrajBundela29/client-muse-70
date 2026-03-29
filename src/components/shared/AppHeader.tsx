import { Link, useLocation } from "react-router-dom";
import { Search, LayoutDashboard } from "lucide-react";
import { CreditCounter } from "@/components/finder/CreditCounter";
import logoWhite from "@/assets/logo-white.png";

const navItems = [
  { to: "/finder", label: "Finder", icon: Search },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

interface Props {
  showCredits?: boolean;
}

export function AppHeader({ showCredits }: Props) {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <Crosshair className="h-5 w-5 text-primary" />
          <span>Client Muse</span>
        </Link>
        <div className="flex items-center gap-4">
          {showCredits && <CreditCounter />}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
