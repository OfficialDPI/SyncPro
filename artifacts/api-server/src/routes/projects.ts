import { Router } from "express";
import { db } from "@workspace/db";
import { projectsTable, conversationsTable, messagesTable } from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";
import {
  CreateProjectBody,
  UpdateProjectBody,
  GetProjectParams,
  UpdateProjectParams,
  DeleteProjectParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/projects/stats", async (req, res) => {
  try {
    const [projectStats] = await db
      .select({
        totalProjects: count(projectsTable.id),
        activeProjects: sql<number>`count(case when ${projectsTable.status} = 'active' then 1 end)`,
      })
      .from(projectsTable);

    const [convStats] = await db
      .select({ totalConversations: count(conversationsTable.id) })
      .from(conversationsTable);

    const [msgStats] = await db
      .select({ totalMessages: count(messagesTable.id) })
      .from(messagesTable);

    res.json({
      totalProjects: Number(projectStats?.totalProjects ?? 0),
      activeProjects: Number(projectStats?.activeProjects ?? 0),
      totalConversations: Number(convStats?.totalConversations ?? 0),
      totalMessages: Number(msgStats?.totalMessages ?? 0),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get project stats");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/projects", async (req, res) => {
  try {
    const projects = await db.select().from(projectsTable).orderBy(projectsTable.createdAt);

    const result = await Promise.all(
      projects.map(async (project) => {
        const [{ count: convCount }] = await db
          .select({ count: count() })
          .from(conversationsTable)
          .where(eq(conversationsTable.projectId, project.id));
        return {
          ...project,
          conversationCount: Number(convCount),
          description: project.description ?? null,
        };
      })
    );

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to list projects");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/projects", async (req, res) => {
  try {
    const parsed = CreateProjectBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }
    const { name, description } = parsed.data;
    const [project] = await db
      .insert(projectsTable)
      .values({ name, description })
      .returning();
    res.status(201).json({ ...project, conversationCount: 0, description: project.description ?? null });
  } catch (err) {
    req.log.error({ err }, "Failed to create project");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/projects/:id", async (req, res) => {
  try {
    const parsed = GetProjectParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid project ID" });
      return;
    }
    const [project] = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id, parsed.data.id));
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    const [{ count: convCount }] = await db
      .select({ count: count() })
      .from(conversationsTable)
      .where(eq(conversationsTable.projectId, project.id));
    res.json({ ...project, conversationCount: Number(convCount), description: project.description ?? null });
  } catch (err) {
    req.log.error({ err }, "Failed to get project");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/projects/:id", async (req, res) => {
  try {
    const params = UpdateProjectParams.safeParse({ id: Number(req.params.id) });
    if (!params.success) {
      res.status(400).json({ error: "Invalid project ID" });
      return;
    }
    const body = UpdateProjectBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }
    const { name, description, status } = body.data;
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;

    const [project] = await db
      .update(projectsTable)
      .set(updates)
      .where(eq(projectsTable.id, params.data.id))
      .returning();
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    const [{ count: convCount }] = await db
      .select({ count: count() })
      .from(conversationsTable)
      .where(eq(conversationsTable.projectId, project.id));
    res.json({ ...project, conversationCount: Number(convCount), description: project.description ?? null });
  } catch (err) {
    req.log.error({ err }, "Failed to update project");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/projects/:id", async (req, res) => {
  try {
    const parsed = DeleteProjectParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid project ID" });
      return;
    }
    const [deleted] = await db
      .delete(projectsTable)
      .where(eq(projectsTable.id, parsed.data.id))
      .returning();
    if (!deleted) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete project");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
