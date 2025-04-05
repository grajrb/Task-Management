import { useState } from "react";
import { Task } from "@shared/schema";
import TaskCard from "./task-card";
import { useDrop } from "react-dnd";
import { MoreHorizontal } from "lucide-react";

type TaskColumnProps = {
  title: string;
  status: Task["status"];
  count: number;
  tasks: Task[];
  colorClass: string;
  onStatusChange: (taskId: number, newStatus: Task["status"]) => void;
  onComplete: (taskId: number) => void;
};

export default function TaskColumn({
  title,
  status,
  count,
  tasks,
  colorClass,
  onStatusChange,
  onComplete,
}: TaskColumnProps) {
  const isCompletedColumn = status === "completed";
  
  // Handle dropping tasks into this column
  const handleDrop = (taskId: number) => {
    if (isCompletedColumn) {
      // When dropping into the completed column, mark as complete
      onComplete(taskId);
    } else {
      // Otherwise just change the status
      onStatusChange(taskId, status);
    }
  };

  return (
    <div className="md:w-80 flex-shrink-0">
      <div className="bg-neutral-100 rounded-xl p-4 h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-neutral-700 flex items-center">
            <div className={`h-2.5 w-2.5 rounded-full ${colorClass} mr-2`}></div>
            {title}
            <span className="ml-2 text-sm text-neutral-500">{count}</span>
          </h3>
          
          <button className="p-1 text-neutral-400 hover:text-neutral-700 rounded-md hover:bg-neutral-200">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
        
        {/* Tasks list */}
        <div className="space-y-3" onDragOver={(e) => e.preventDefault()}>
          {tasks.length === 0 ? (
            <div className="bg-white/60 rounded-lg p-4 border border-dashed border-neutral-300 text-center">
              <p className="text-sm text-neutral-500">
                {isCompletedColumn
                  ? "No completed tasks yet"
                  : "Drag tasks here"}
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("taskId", task.id.toString());
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const taskId = parseInt(e.dataTransfer.getData("taskId"));
                  if (taskId) handleDrop(taskId);
                }}
              >
                <TaskCard
                  task={task}
                  isCompleted={isCompletedColumn}
                  onStatusChange={onStatusChange}
                  onComplete={onComplete}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
