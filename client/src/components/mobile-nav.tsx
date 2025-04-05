import { Link, useLocation } from "wouter";
import { Home, CheckSquare2, PlusCircle, BarChart2, Coins } from "lucide-react";

export default function MobileNav() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 flex items-center justify-around px-2 py-3 z-10">
      <Link href="/">
        <a className={`flex flex-col items-center justify-center ${isActive('/') ? 'text-primary' : 'text-neutral-500'}`}>
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Home</span>
        </a>
      </Link>
      
      <Link href="/tasks">
        <a className={`flex flex-col items-center justify-center ${isActive('/tasks') ? 'text-primary' : 'text-neutral-500'}`}>
          <CheckSquare2 className="h-6 w-6" />
          <span className="text-xs mt-1">Tasks</span>
        </a>
      </Link>
      
      <div className="flex flex-col items-center justify-center text-neutral-500 relative">
        <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white -mt-6">
          <PlusCircle className="h-6 w-6" />
        </div>
        <span className="text-xs mt-1">New</span>
      </div>
      
      <Link href="/analytics">
        <a className={`flex flex-col items-center justify-center ${isActive('/analytics') ? 'text-primary' : 'text-neutral-500'}`}>
          <BarChart2 className="h-6 w-6" />
          <span className="text-xs mt-1">Stats</span>
        </a>
      </Link>
      
      <Link href="/rewards">
        <a className={`flex flex-col items-center justify-center ${isActive('/rewards') ? 'text-primary' : 'text-neutral-500'}`}>
          <Coins className="h-6 w-6" />
          <span className="text-xs mt-1">Rewards</span>
        </a>
      </Link>
    </nav>
  );
}
