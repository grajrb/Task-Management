import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name"),
  initials: text("initials"),
  tokenBalance: integer("token_balance").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const taskCategoryEnum = pgEnum("task_category", [
  "design",
  "development",
  "research",
  "testing",
  "integration",
  "high_priority"
]);

export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "review",
  "completed"
]);

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: taskCategoryEnum("category").notNull(),
  status: taskStatusEnum("status").notNull().default("todo"),
  dueDate: timestamp("due_date"),
  tokenReward: integer("token_reward").notNull().default(10),
  progress: integer("progress").default(0),
  assigneeId: integer("assignee_id").references(() => users.id),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  amount: integer("amount").notNull(),
  status: text("status").notNull(), // "confirmed", "processing"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  displayName: true,
  initials: true,
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  category: true,
  status: true,
  dueDate: true,
  tokenReward: true,
  assigneeId: true,
  createdById: true,
});

export const insertRewardSchema = createInsertSchema(rewards).pick({
  userId: true,
  taskId: true,
  amount: true,
  status: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;
export type Reward = typeof rewards.$inferSelect;
