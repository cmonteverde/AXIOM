import type { Express } from "express";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { isAuthenticated } from "../auth";
import { storage } from "../../storage";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

export function registerObjectStorageRoutes(app: Express): void {
  const objectStorageService = new ObjectStorageService();

  app.post("/api/uploads/request-url", isAuthenticated, async (req, res) => {
    try {
      const { name, size, contentType } = req.body;

      if (!name) {
        return res.status(400).json({
          error: "Missing required field: name",
        });
      }

      if (size && size > MAX_FILE_SIZE) {
        return res.status(400).json({
          error: "File too large. Maximum size is 50MB.",
        });
      }

      if (contentType && !ALLOWED_TYPES.includes(contentType)) {
        const ext = name.toLowerCase().split(".").pop();
        if (!["pdf", "docx", "txt"].includes(ext || "")) {
          return res.status(400).json({
            error: "Unsupported file type. Only PDF, DOCX, and TXT are allowed.",
          });
        }
      }

      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);

      res.json({
        uploadURL,
        objectPath,
        metadata: { name, size, contentType },
      });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });

  app.get("/objects/{*objectPath}", isAuthenticated, async (req: any, res) => {
    try {
      // Verify the requesting user owns a manuscript with this fileKey
      const userId = req.user.claims.sub;
      const objectPath = req.path;
      const userManuscripts = await storage.getManuscriptsByUserId(userId);
      const ownsFile = userManuscripts.some(
        (m) => m.fileKey === objectPath
      );

      if (!ownsFile) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const objectFile = await objectStorageService.getObjectEntityFile(objectPath);
      await objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ error: "Object not found" });
      }
      return res.status(500).json({ error: "Failed to serve object" });
    }
  });
}
