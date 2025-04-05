import { 
  users, type User, type InsertUser,
  tasks, type Task, type InsertTask,
  rewards, type Reward, type InsertReward
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserTokenBalance(userId: number, amount: number): Promise<User | undefined>;

  // Task operations
  createTask(task: InsertTask): Promise<Task>;
  getTask(id: number): Promise<Task | undefined>;
  getUserTasks(userId: number): Promise<Task[]>;
  getAllTasks(): Promise<Task[]>;
  updateTask(id: number, updates: Partial<Omit<InsertTask, "createdById">>): Promise<Task | undefined>;
  updateTaskStatus(id: number, status: Task["status"]): Promise<Task | undefined>;
  updateTaskProgress(id: number, progress: number): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;

  // Reward operations
  createReward(reward: InsertReward): Promise<Reward>;
  getUserRewards(userId: number): Promise<Reward[]>;
  getAllRewards(): Promise<Reward[]>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private rewards: Map<number, Reward>;
  private userIdCounter: number;
  private taskIdCounter: number;
  private rewardIdCounter: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.rewards = new Map();
    this.userIdCounter = 1;
    this.taskIdCounter = 1;
    this.rewardIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = {
      id,
      username: userData.username,
      password: userData.password,
      displayName: userData.displayName || userData.username,
      initials: userData.initials || userData.username.substring(0, 2).toUpperCase(),
      tokenBalance: 0,
      createdAt: now,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserTokenBalance(userId: number, amount: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      tokenBalance: user.tokenBalance + amount
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Task operations
  async createTask(taskData: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const now = new Date();
    const task: Task = {
      id,
      title: taskData.title,
      description: taskData.description || "",
      category: taskData.category,
      status: taskData.status || "todo",
      dueDate: taskData.dueDate,
      tokenReward: taskData.tokenReward || 10,
      progress: 0,
      assigneeId: taskData.assigneeId,
      createdById: taskData.createdById,
      createdAt: now,
      updatedAt: now,
    };
    this.tasks.set(id, task);
    return task;
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getUserTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.assigneeId === userId || task.createdById === userId
    );
  }

  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async updateTask(id: number, updates: Partial<Omit<InsertTask, "createdById">>): Promise<Task | undefined> {
    const task = await this.getTask(id);
    if (!task) return undefined;
    
    const updatedTask: Task = {
      ...task,
      ...updates,
      updatedAt: new Date(),
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async updateTaskStatus(id: number, status: Task["status"]): Promise<Task | undefined> {
    return this.updateTask(id, { status });
  }

  async updateTaskProgress(id: number, progress: number): Promise<Task | undefined> {
    return this.updateTask(id, { progress });
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Reward operations
  async createReward(rewardData: InsertReward): Promise<Reward> {
    const id = this.rewardIdCounter++;
    const now = new Date();
    const reward: Reward = {
      id,
      userId: rewardData.userId,
      taskId: rewardData.taskId,
      amount: rewardData.amount,
      status: rewardData.status,
      createdAt: now,
    };
    this.rewards.set(id, reward);
    
    // Update user token balance
    await this.updateUserTokenBalance(rewardData.userId, rewardData.amount);
    
    return reward;
  }

  async getUserRewards(userId: number): Promise<Reward[]> {
    return Array.from(this.rewards.values()).filter(
      (reward) => reward.userId === userId
    );
  }

  async getAllRewards(): Promise<Reward[]> {
    return Array.from(this.rewards.values());
  }
}

export const storage = new MemStorage();
