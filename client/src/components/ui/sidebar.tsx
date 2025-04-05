import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Home, CheckSquare, BarChart2, Coins, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Sidebar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const { toast } = useToast();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Navigation items
  const navItems = [
    { 
      title: "Dashboard", 
      path: "/", 
      icon: <Home className="h-5 w-5 mr-3" /> 
    },
    { 
      title: "Tasks", 
      path: "/tasks", 
      icon: <CheckSquare className="h-5 w-5 mr-3" /> 
    },
    { 
      title: "Analytics", 
      path: "/analytics", 
      icon: <BarChart2 className="h-5 w-5 mr-3" /> 
    },
    { 
      title: "Rewards", 
      path: "/rewards", 
      icon: <Coins className="h-5 w-5 mr-3" /> 
    },
  ];

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 flex-col bg-white border-r border-neutral-200 p-5">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg">
          TT
        </div>
        <span className="text-xl font-bold text-neutral-800">TaskToken</span>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path}>
                <a 
                  className={`flex items-center px-3 py-2 text-sm rounded-lg ${
                    location === item.path 
                      ? "bg-primary text-white" 
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  {item.icon}
                  {item.title}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Profile section */}
      <div className="mt-auto pt-4 border-t border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
            {user?.initials || "??"}
          </div>
          <div>
            <p className="text-sm font-medium">{user?.displayName || user?.username || "User"}</p>
            <div className="flex items-center gap-1">
              <span className="text-xs text-neutral-500">Balance:</span>
              <div className="flex items-center text-xs font-medium text-amber-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                {user?.tokenBalance || 0} TT
              </div>
            </div>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-4 flex items-center justify-center gap-2"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="h-4 w-4" />
          {logoutMutation.isPending ? "Logging out..." : "Log out"}
        </Button>
      </div>
    </aside>
  );
}
