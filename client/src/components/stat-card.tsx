import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, BarChart2, Coins } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  icon: "check" | "pending" | "productivity" | "token";
  trend?: {
    value: string;
    label: string;
    positive: boolean;
  };
};

export default function StatCard({ title, value, icon, trend }: StatCardProps) {
  const renderIcon = () => {
    switch (icon) {
      case "check":
        return (
          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <CheckCircle className="h-5 w-5" />
          </div>
        );
      case "pending":
        return (
          <div className="h-10 w-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500">
            <Clock className="h-5 w-5" />
          </div>
        );
      case "productivity":
        return (
          <div className="h-10 w-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-500">
            <BarChart2 className="h-5 w-5" />
          </div>
        );
      case "token":
        return (
          <div className="h-10 w-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500">
            <Coins className="h-5 w-5" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm">
      <CardContent className="p-0">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-neutral-500 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
          </div>
          {renderIcon()}
        </div>
        
        {trend && (
          <div className="mt-3 flex items-center text-xs">
            <span className={`${trend.positive ? 'text-green-500' : 'text-red-500'} font-medium flex items-center`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-0.5" viewBox="0 0 20 20" fill="currentColor">
                {trend.positive ? (
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                )}
              </svg>
              {trend.value}
            </span>
            <span className="text-neutral-500 ml-1">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
