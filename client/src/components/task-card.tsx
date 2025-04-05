import { useState } from 'react';
import { Task } from '@shared/schema';
import { useDrag } from 'react-dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type TaskCardProps = {
  task: Task;
  isCompleted?: boolean;
  onStatusChange?: (taskId: number, newStatus: Task['status']) => void;
  onComplete?: (taskId: number) => void;
};

export default function TaskCard({ task, isCompleted = false, onStatusChange, onComplete }: TaskCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  // Format due date
  const formatDueDate = () => {
    if (!task.dueDate) return 'No due date';
    
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    
    // Check if the due date is today
    if (
      dueDate.getDate() === today.getDate() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear()
    ) {
      return 'Today';
    }
    
    // Check if the due date is tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (
      dueDate.getDate() === tomorrow.getDate() &&
      dueDate.getMonth() === tomorrow.getMonth() &&
      dueDate.getFullYear() === tomorrow.getFullYear()
    ) {
      return 'Tomorrow';
    }
    
    // Check if the due date is in the past
    if (dueDate < today) {
      return 'Overdue';
    }
    
    // Calculate days remaining
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return '1 day left';
    } else if (diffDays <= 7) {
      return `${diffDays} days left`;
    } else {
      // Format to DD/MM/YYYY for dates further away
      return dueDate.toLocaleDateString();
    }
  };

  // Get category styling
  const getCategoryClasses = () => {
    switch (task.category) {
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
  };

  const formatCategory = () => {
    return task.category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const isDueDateOverdue = () => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date();
  };

  // Handle mouse events for drag animation
  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  return (
    <Card 
      className={`bg-white rounded-lg p-4 shadow-sm border border-neutral-200 cursor-grab ${
        isDragging ? 'opacity-50 transform scale-98' : ''
      } ${isCompleted ? 'opacity-80' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      draggable
      onDragStart={() => {}}
    >
      <CardContent className="p-0">
        <div className="flex justify-between mb-2">
          <span className={`px-2 py-0.5 text-xs font-medium rounded ${getCategoryClasses()}`}>
            {formatCategory()}
          </span>
          <span className={`text-xs ${isDueDateOverdue() ? 'text-red-500 font-medium' : 'text-neutral-400'}`}>
            {isDueDateOverdue() ? 'Overdue' : formatDueDate()}
          </span>
        </div>
        
        <h4 className={`font-medium mb-2 ${isCompleted ? 'line-through text-neutral-500' : ''}`}>
          {task.title}
        </h4>
        
        <p className={`text-sm ${isCompleted ? 'text-neutral-400 line-through' : 'text-neutral-500'} mb-3 line-clamp-2`}>
          {task.description || 'No description provided'}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-amber-500 text-xs font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
            {task.tokenReward} TT
          </div>
          
          {isCompleted ? (
            <div className="flex items-center text-green-500 text-xs font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Earned
            </div>
          ) : (
            <div className="flex items-center">
              {task.assigneeId && (
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                  {task.assigneeId ? 'JD' : ''}
                </div>
              )}
            </div>
          )}
        </div>
        
        {task.status === 'in_progress' && !isCompleted && task.progress !== undefined && (
          <div className="w-full mt-3">
            <Progress value={task.progress} className="h-1.5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
