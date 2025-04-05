import { Button } from "@/components/ui/button";
import { Coins } from "lucide-react";

type RewardNotificationProps = {
  title: string;
  amount: number;
  onDismiss: () => void;
};

export default function RewardNotification({ title, amount, onDismiss }: RewardNotificationProps) {
  return (
    <div className="fixed bottom-20 right-5 md:bottom-5 bg-white rounded-lg shadow-lg border border-neutral-200 p-4 transform transition-all duration-300 ease-in-out reward-animation z-50">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500">
          <Coins className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-medium text-neutral-800">Task Completed!</h4>
          <p className="text-sm text-neutral-500 mb-2">
            You earned <span className="text-amber-500 font-medium">{amount} TT</span> for completing "{title}".
          </p>
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm" className="text-xs px-3 py-1 h-auto">
              View Balance
            </Button>
            <Button variant="outline" size="sm" className="text-xs px-3 py-1 h-auto" onClick={onDismiss}>
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
