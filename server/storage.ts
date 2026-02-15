import { type User, type Manuscript, type InsertManuscript, type ProfileSetup, type AuditHistoryEntry, type ReviewerComment, users, manuscripts, auditHistory, reviewerComments } from "@shared/schema";
import { db } from "./db";
import { eq, desc, gt, sql } from "drizzle-orm";

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
  updateManuscriptAnalysis(id: string, analysisJson: any, analysisStatus: string, readinessScore?: number, analysisModules?: string[]): Promise<Manuscript | undefined>;
  updateManuscriptPaperType(id: string, paperType: string): Promise<Manuscript | undefined>;
  updateManuscriptStage(id: string, stage: string): Promise<Manuscript | undefined>;
  updateManuscriptActionItems(id: string, completedIndices: number[]): Promise<Manuscript | undefined>;
  deleteManuscript(id: string): Promise<void>;
  deleteManuscriptsByUserId(userId: string): Promise<void>;
  addAuditHistory(entry: { manuscriptId: string; readinessScore: number; paperType?: string; helpTypes?: string[]; summary?: string; criticalIssueCount: number; feedbackCount: number; actionItemCount: number; scoreBreakdown?: any }): Promise<AuditHistoryEntry>;
  getAuditHistory(manuscriptId: string): Promise<AuditHistoryEntry[]>;
  updateManuscriptShareToken(id: string, shareToken: string | null): Promise<Manuscript | undefined>;
  getManuscriptByShareToken(shareToken: string): Promise<Manuscript | undefined>;
  getLeaderboard(limit?: number): Promise<{ id: string; firstName: string | null; lastName: string | null; profileImageUrl: string | null; primaryField: string | null; xp: number; level: number; streak: number }[]>;
  getReviewerComments(manuscriptId: string): Promise<ReviewerComment[]>;
  addReviewerComments(manuscriptId: string, comments: string[]): Promise<ReviewerComment[]>;
  updateReviewerComment(id: string, updates: { response?: string; changeMade?: string; status?: string }): Promise<ReviewerComment | undefined>;
  deleteReviewerComments(manuscriptId: string): Promise<void>;
  unlockAchievement(userId: string, achievementId: string): Promise<boolean>;
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

  async updateManuscriptAnalysis(id: string, analysisJson: any, analysisStatus: string, readinessScore?: number, analysisModules?: string[]): Promise<Manuscript | undefined> {
    const updateData: any = { analysisJson, analysisStatus };
    if (readinessScore !== undefined) {
      updateData.readinessScore = readinessScore;
    }
    if (analysisModules !== undefined) {
      updateData.analysisModules = analysisModules;
    }
    const [manuscript] = await db.update(manuscripts).set(updateData).where(eq(manuscripts.id, id)).returning();
    return manuscript;
  }

  async updateManuscriptPaperType(id: string, paperType: string): Promise<Manuscript | undefined> {
    const [manuscript] = await db.update(manuscripts).set({ paperType }).where(eq(manuscripts.id, id)).returning();
    return manuscript;
  }

  async updateManuscriptStage(id: string, stage: string): Promise<Manuscript | undefined> {
    const [manuscript] = await db.update(manuscripts).set({ stage }).where(eq(manuscripts.id, id)).returning();
    return manuscript;
  }

  async updateManuscriptActionItems(id: string, completedIndices: number[]): Promise<Manuscript | undefined> {
    const [existing] = await db.select().from(manuscripts).where(eq(manuscripts.id, id));
    if (!existing || !existing.analysisJson) return existing;

    const analysis = existing.analysisJson as any;
    if (Array.isArray(analysis.actionItems)) {
      analysis.actionItems = analysis.actionItems.map((item: any, idx: number) => ({
        ...item,
        completed: completedIndices.includes(idx),
      }));
    }

    const [manuscript] = await db.update(manuscripts).set({ analysisJson: analysis }).where(eq(manuscripts.id, id)).returning();
    return manuscript;
  }

  async deleteManuscript(id: string): Promise<void> {
    await db.delete(manuscripts).where(eq(manuscripts.id, id));
  }

  async deleteManuscriptsByUserId(userId: string): Promise<void> {
    await db.delete(manuscripts).where(eq(manuscripts.userId, userId));
  }

  async addAuditHistory(entry: { manuscriptId: string; readinessScore: number; paperType?: string; helpTypes?: string[]; summary?: string; criticalIssueCount: number; feedbackCount: number; actionItemCount: number; scoreBreakdown?: any }): Promise<AuditHistoryEntry> {
    const [row] = await db.insert(auditHistory).values({
      manuscriptId: entry.manuscriptId,
      readinessScore: entry.readinessScore,
      paperType: entry.paperType,
      helpTypes: entry.helpTypes || [],
      summary: entry.summary,
      criticalIssueCount: entry.criticalIssueCount,
      feedbackCount: entry.feedbackCount,
      actionItemCount: entry.actionItemCount,
      scoreBreakdown: entry.scoreBreakdown,
    }).returning();
    return row;
  }

  async getAuditHistory(manuscriptId: string): Promise<AuditHistoryEntry[]> {
    return db.select().from(auditHistory).where(eq(auditHistory.manuscriptId, manuscriptId)).orderBy(desc(auditHistory.createdAt));
  }

  async updateManuscriptShareToken(id: string, shareToken: string | null): Promise<Manuscript | undefined> {
    const [manuscript] = await db.update(manuscripts).set({ shareToken }).where(eq(manuscripts.id, id)).returning();
    return manuscript;
  }

  async getManuscriptByShareToken(shareToken: string): Promise<Manuscript | undefined> {
    const [manuscript] = await db.select().from(manuscripts).where(eq(manuscripts.shareToken, shareToken));
    return manuscript;
  }

  async getLeaderboard(limit = 10) {
    return db.select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      profileImageUrl: users.profileImageUrl,
      primaryField: users.primaryField,
      xp: users.xp,
      level: users.level,
      streak: users.streak,
    }).from(users).where(gt(users.xp, 0)).orderBy(desc(users.xp)).limit(limit);
  }

  async getReviewerComments(manuscriptId: string): Promise<ReviewerComment[]> {
    return db.select().from(reviewerComments).where(eq(reviewerComments.manuscriptId, manuscriptId)).orderBy(reviewerComments.sortOrder);
  }

  async addReviewerComments(manuscriptId: string, comments: string[]): Promise<ReviewerComment[]> {
    if (comments.length === 0) return [];
    const values = comments.map((comment, i) => ({
      manuscriptId,
      comment: comment.trim(),
      sortOrder: i,
    }));
    return db.insert(reviewerComments).values(values).returning();
  }

  async updateReviewerComment(id: string, updates: { response?: string; changeMade?: string; status?: string }): Promise<ReviewerComment | undefined> {
    const [row] = await db.update(reviewerComments).set(updates).where(eq(reviewerComments.id, id)).returning();
    return row;
  }

  async deleteReviewerComments(manuscriptId: string): Promise<void> {
    await db.delete(reviewerComments).where(eq(reviewerComments.manuscriptId, manuscriptId));
  }

  async unlockAchievement(userId: string, achievementId: string): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user) return false;
    const current = (user.achievements as Array<{ id: string; unlockedAt: string }>) || [];
    if (current.some(a => a.id === achievementId)) return false; // Already unlocked
    const updated = [...current, { id: achievementId, unlockedAt: new Date().toISOString() }];
    await db.update(users).set({ achievements: updated }).where(eq(users.id, userId));
    return true;
  }
}

export const storage = new DatabaseStorage();
