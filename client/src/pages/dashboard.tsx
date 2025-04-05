import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Task, Reward } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Sidebar from "@/components/ui/sidebar";
import StatCard from "@/components/stat-card";
import TaskColumn from "@/components/task-column";
import TaskForm from "@/components/task-form";
import RewardNotification from "@/components/reward-notification";
import MobileNav from "@/components/mobile-nav";
import { Loader2, Plus, Search, Settings, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<"today" | "week" | "month">("today");
  const [showRewardNotification, setShowRewardNotification] = useState(false);
  const [completedTaskData, setCompletedTaskData] = useState<{
    title: string;
    reward: number;
  } | null>(null);

  // Task data
  const {
    data: tasks = [],
    isLoading: isLoadingTasks,
    error: tasksError,
  } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Rewards data
  const {
    data: rewards = [],
    isLoading: isLoadingRewards,
  } = useQuery<Reward[]>({
    queryKey: ["/api/rewards"],
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: number; updates: Partial<Task> }) => {
      const res = await apiRequest("PATCH", `/api/tasks/${taskId}`, updates);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const res = await apiRequest("POST", `/api/tasks/${taskId}/complete`, {});
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rewards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      setCompletedTaskData({
        title: data.task.title,
        reward: data.reward.amount,
      });
      setShowRewardNotification(true);

      // Hide the notification after 5 seconds
      setTimeout(() => {
        setShowRewardNotification(false);
      }, 5000);
    },
    onError: (error) => {
      toast({
        title: "Failed to complete task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter tasks based on search query
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group tasks by status
  const todoTasks = filteredTasks.filter(task => task.status === "todo");
  const inProgressTasks = filteredTasks.filter(task => task.status === "in_progress");
  const reviewTasks = filteredTasks.filter(task => task.status === "review");
  const completedTasks = filteredTasks.filter(task => task.status === "completed");

  // Compute statistics
  const pendingTasksCount = todoTasks.length;
  const completedTasksCount = completedTasks.length;
  const productivityScore = tasks.length > 0 
    ? Math.round((completedTasksCount / tasks.length) * 100) 
    : 0;
  const tokensEarnedToday = rewards
    .filter(reward => {
      const today = new Date();
      const rewardDate = new Date(reward.createdAt);
      return (
        rewardDate.getDate() === today.getDate() &&
        rewardDate.getMonth() === today.getMonth() &&
        rewardDate.getFullYear() === today.getFullYear()
      );
    })
    .reduce((sum, reward) => sum + reward.amount, 0);

  // Handle task status change using drag and drop
  const handleTaskStatusChange = (taskId: number, newStatus: Task["status"]) => {
    updateTaskMutation.mutate({ 
      taskId, 
      updates: { status: newStatus }
    });
  };

  // Handle task completion
  const handleCompleteTask = (taskId: number) => {
    completeTaskMutation.mutate(taskId);
  };

  if (isLoadingTasks || isLoadingRewards) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (tasksError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-red-500 mb-2">Error Loading Tasks</h1>
        <p className="text-gray-600 mb-4">Please try refreshing the page</p>
        <Button onClick={() => window.location.reload()}>Refresh</Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Hidden on mobile */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Top header */}
        <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 md:px-6">
          {/* Mobile menu button and title */}
          <div className="flex items-center gap-3">
            <button type="button" className="md:hidden -ml-1 text-neutral-500 p-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-neutral-800 md:hidden">Dashboard</h1>
            <h1 className="text-xl font-semibold text-neutral-800 hidden md:block">Dashboard</h1>
          </div>
          
          {/* Search and actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden md:block">
              <Input
                type="text"
                placeholder="Search tasks..."
                className="h-9 w-64 pl-9 pr-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="h-4 w-4 text-neutral-400 absolute left-3 top-2.5" />
            </div>
            
            {/* Settings */}
            <button type="button" className="p-1.5 text-neutral-500 hover:text-neutral-700 rounded-full hover:bg-neutral-100">
              <Settings className="h-5 w-5" />
            </button>
            
            {/* Notifications */}
            <button type="button" className="p-1.5 text-neutral-500 hover:text-neutral-700 rounded-full hover:bg-neutral-100 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
          </div>
        </header>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6 bg-neutral-50 scrollbar-hide">
          {/* Dashboard Overview */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-neutral-800">Welcome back, {user?.displayName || user?.username}!</h2>
                <p className="text-neutral-500 text-sm mt-1">Here's your productivity overview for today</p>
              </div>
              
              <div className="mt-3 md:mt-0">
                <div className="flex items-center gap-1 bg-white border border-neutral-200 rounded-lg p-1.5 text-sm shadow-sm">
                  <Button 
                    variant={selectedDate === "today" ? "default" : "ghost"} 
                    className="px-3 py-1 h-auto font-medium"
                    onClick={() => setSelectedDate("today")}
                  >
                    Today
                  </Button>
                  <Button 
                    variant={selectedDate === "week" ? "default" : "ghost"} 
                    className="px-3 py-1 h-auto font-medium"
                    onClick={() => setSelectedDate("week")}
                  >
                    Week
                  </Button>
                  <Button 
                    variant={selectedDate === "month" ? "default" : "ghost"} 
                    className="px-3 py-1 h-auto font-medium"
                    onClick={() => setSelectedDate("month")}
                  >
                    Month
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                title="Completed Tasks"
                value={completedTasksCount.toString()}
                icon="check"
                trend={{
                  value: "+42%",
                  label: "vs. yesterday",
                  positive: true
                }}
              />
              
              <StatCard 
                title="Pending Tasks"
                value={pendingTasksCount.toString()}
                icon="pending"
                trend={{
                  value: "+12%",
                  label: "vs. yesterday",
                  positive: false
                }}
              />
              
              <StatCard 
                title="Productivity Score"
                value={`${productivityScore}%`}
                icon="productivity"
                trend={{
                  value: "+5%",
                  label: "from last week",
                  positive: true
                }}
              />
              
              <StatCard 
                title="Token Rewards"
                value={tokensEarnedToday.toString()}
                icon="token"
                trend={{
                  value: `+${tokensEarnedToday}`,
                  label: "earned today",
                  positive: true
                }}
              />
            </div>
          </div>
          
          {/* Task Management Board */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-neutral-800">Task Management</h2>
              
              <Button onClick={() => setIsCreateTaskOpen(true)} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium">
                <Plus className="h-4 w-4" />
                New Task
              </Button>
            </div>
            
            {/* Task filter */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <div className="relative flex-grow max-w-xs">
                <Input 
                  type="text" 
                  placeholder="Filter tasks..." 
                  className="w-full h-9 pl-9 pr-4"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="h-4 w-4 text-neutral-400 absolute left-3 top-2.5" />
              </div>
            </div>
            
            {/* Kanban board */}
            <div className="flex flex-col md:flex-row gap-5 overflow-x-auto pb-4">
              <TaskColumn 
                title="To Do" 
                status="todo"
                count={todoTasks.length}
                tasks={todoTasks}
                onStatusChange={handleTaskStatusChange}
                onComplete={handleCompleteTask}
                colorClass="bg-neutral-400"
              />
              
              <TaskColumn 
                title="In Progress" 
                status="in_progress"
                count={inProgressTasks.length}
                tasks={inProgressTasks}
                onStatusChange={handleTaskStatusChange}
                onComplete={handleCompleteTask}
                colorClass="bg-blue-500"
              />
              
              <TaskColumn 
                title="Review" 
                status="review"
                count={reviewTasks.length}
                tasks={reviewTasks}
                onStatusChange={handleTaskStatusChange}
                onComplete={handleCompleteTask}
                colorClass="bg-yellow-500"
              />
              
              <TaskColumn 
                title="Completed" 
                status="completed"
                count={completedTasks.length}
                tasks={completedTasks}
                onStatusChange={handleTaskStatusChange}
                onComplete={handleCompleteTask}
                colorClass="bg-green-500"
              />
            </div>
          </div>
          
          {/* Recent Rewards */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-neutral-800">Recent Rewards</h2>
              <Button variant="link" className="text-sm">View all rewards</Button>
            </div>
            
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Task</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Category</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Tokens</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-200">
                    {rewards.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                          No rewards earned yet. Complete tasks to earn tokens!
                        </td>
                      </tr>
                    ) : (
                      rewards.slice(0, 4).map((reward) => {
                        const task = tasks.find(t => t.id === reward.taskId);
                        const createdDate = new Date(reward.createdAt);
                        const today = new Date();
                        
                        let dateString = '';
                        if (
                          createdDate.getDate() === today.getDate() &&
                          createdDate.getMonth() === today.getMonth() &&
                          createdDate.getFullYear() === today.getFullYear()
                        ) {
                          dateString = 'Today';
                        } else if (
                          createdDate.getDate() === today.getDate() - 1 &&
                          createdDate.getMonth() === today.getMonth() &&
                          createdDate.getFullYear() === today.getFullYear()
                        ) {
                          dateString = '1 day ago';
                        } else if (
                          createdDate.getDate() === today.getDate() - 2 &&
                          createdDate.getMonth() === today.getMonth() &&
                          createdDate.getFullYear() === today.getFullYear()
                        ) {
                          dateString = '2 days ago';
                        } else {
                          dateString = `${createdDate.getDate()}/${createdDate.getMonth() + 1}/${createdDate.getFullYear()}`;
                        }
                        
                        return (
                          <tr key={reward.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-neutral-900">{task?.title || 'Unknown Task'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded ${getCategoryClasses(task?.category || 'development')}`}>
                                {formatCategory(task?.category || 'development')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                              {dateString}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-amber-500 font-medium">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                                </svg>
                                {reward.amount} TT
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                                reward.status === 'confirmed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {reward.status === 'confirmed' ? 'Confirmed' : 'Processing'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <MobileNav />

      {/* Task Creation Dialog */}
      <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <TaskForm 
            onTaskCreated={() => {
              setIsCreateTaskOpen(false);
              queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
              toast({ 
                title: "Task created successfully", 
                description: "Your new task has been added to the board."
              });
            }}
            onCancel={() => setIsCreateTaskOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Task Completion Reward Notification */}
      {showRewardNotification && completedTaskData && (
        <RewardNotification
          title={completedTaskData.title}
          amount={completedTaskData.reward}
          onDismiss={() => setShowRewardNotification(false)}
        />
      )}
    </div>
  );
}

// Helper functions
function getCategoryClasses(category: string): string {
  switch (category) {
    case 'design':
      return 'bg-purple-100 text-purple-800';
    case 'development':
      return 'bg-blue-100 text-blue-800';
    case 'research':
      return 'bg-green-100 text-green-800';
    case 'testing':
      return 'bg-indigo-100 text-indigo-800';
    case 'integration':
      return 'bg-yellow-100 text-yellow-800';
    case 'high_priority':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function formatCategory(category: string): string {
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
