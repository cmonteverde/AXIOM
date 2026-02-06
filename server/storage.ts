import { type User, type InsertUser, type Manuscript, type InsertManuscript, users, manuscripts } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  deleteUser(id: string): Promise<void>;
  updateUserXP(id: string, xp: number, level: number): Promise<User | undefined>;
  updateUserStreak(id: string, streak: number, lastActiveDate: string): Promise<User | undefined>;
  getManuscriptsByUserId(userId: string): Promise<Manuscript[]>;
  getManuscript(id: string): Promise<Manuscript | undefined>;
  createManuscript(manuscript: InsertManuscript): Promise<Manuscript>;
  deleteManuscriptsByUserId(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(manuscripts).where(eq(manuscripts.userId, id));
    await db.delete(users).where(eq(users.id, id));
  }

  async updateUserXP(id: string, xp: number, level: number): Promise<User | undefined> {
    const [user] = await db.update(users).set({ xp, level }).where(eq(users.id, id)).returning();
    return user;
  }

  async updateUserStreak(id: string, streak: number, lastActiveDate: string): Promise<User | undefined> {
    const [user] = await db.update(users).set({ streak, lastActiveDate }).where(eq(users.id, id)).returning();
    return user;
  }

  async getManuscriptsByUserId(userId: string): Promise<Manuscript[]> {
    return db.select().from(manuscripts).where(eq(manuscripts.userId, userId));
  }

  async getManuscript(id: string): Promise<Manuscript | undefined> {
    const [manuscript] = await db.select().from(manuscripts).where(eq(manuscripts.id, id));
    return manuscript;
  }

  async createManuscript(insertManuscript: InsertManuscript): Promise<Manuscript> {
    const [manuscript] = await db.insert(manuscripts).values(insertManuscript).returning();
    return manuscript;
  }

  async deleteManuscriptsByUserId(userId: string): Promise<void> {
    await db.delete(manuscripts).where(eq(manuscripts.userId, userId));
  }
}

export const storage = new DatabaseStorage();
