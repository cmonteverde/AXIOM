import { type User, type Manuscript, type InsertManuscript, type ProfileSetup, users, manuscripts } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  updateUserProfile(id: string, profile: ProfileSetup): Promise<User | undefined>;
  updateUserXP(id: string, xp: number, level: number): Promise<User | undefined>;
  updateUserStreak(id: string, streak: number, lastActiveDate: string): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  getManuscriptsByUserId(userId: string): Promise<Manuscript[]>;
  getManuscript(id: string): Promise<Manuscript | undefined>;
  createManuscript(manuscript: InsertManuscript): Promise<Manuscript>;
  updateManuscriptExtraction(id: string, previewText: string, extractionStatus: string, fullText?: string): Promise<Manuscript | undefined>;
  updateManuscriptAnalysis(id: string, analysisJson: any, analysisStatus: string, readinessScore?: number): Promise<Manuscript | undefined>;
  deleteManuscriptsByUserId(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async updateUserProfile(id: string, profile: ProfileSetup): Promise<User | undefined> {
    const [user] = await db.update(users).set({
      researchLevel: profile.researchLevel,
      primaryField: profile.primaryField,
      learningMode: profile.learningMode,
      updatedAt: new Date(),
    }).where(eq(users.id, id)).returning();
    return user;
  }

  async updateUserXP(id: string, xp: number, level: number): Promise<User | undefined> {
    const [user] = await db.update(users).set({ xp, level }).where(eq(users.id, id)).returning();
    return user;
  }

  async updateUserStreak(id: string, streak: number, lastActiveDate: string): Promise<User | undefined> {
    const [user] = await db.update(users).set({ streak, lastActiveDate }).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(manuscripts).where(eq(manuscripts.userId, id));
    await db.delete(users).where(eq(users.id, id));
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

  async updateManuscriptExtraction(id: string, previewText: string, extractionStatus: string, fullText?: string): Promise<Manuscript | undefined> {
    const updateData: any = { previewText, extractionStatus };
    if (fullText !== undefined) {
      updateData.fullText = fullText;
    }
    const [manuscript] = await db.update(manuscripts).set(updateData).where(eq(manuscripts.id, id)).returning();
    return manuscript;
  }

  async updateManuscriptAnalysis(id: string, analysisJson: any, analysisStatus: string, readinessScore?: number): Promise<Manuscript | undefined> {
    const updateData: any = { analysisJson, analysisStatus };
    if (readinessScore !== undefined) {
      updateData.readinessScore = readinessScore;
    }
    const [manuscript] = await db.update(manuscripts).set(updateData).where(eq(manuscripts.id, id)).returning();
    return manuscript;
  }

  async deleteManuscriptsByUserId(userId: string): Promise<void> {
    await db.delete(manuscripts).where(eq(manuscripts.userId, userId));
  }
}

export const storage = new DatabaseStorage();
