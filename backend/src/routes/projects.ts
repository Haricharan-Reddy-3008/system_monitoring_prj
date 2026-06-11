import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

/**
 * @route   GET /api/projects
 * @desc    Return all projects
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      console.error("Projects Fetch Error:", error);
      return res
        .status(500)
        .json({ error: "Failed to fetch projects", details: error.message });
    }

    return res.json(data || []);
  } catch (error: any) {
    console.error("Projects Route Error:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

/**
 * @route   GET /api/projects/:projectId
 * @desc    Get a single project
 */
router.get("/:projectId", async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (error) {
      console.error("Project Fetch Error:", error);
      return res
        .status(500)
        .json({ error: "Failed to fetch project", details: error.message });
    }

    if (!data) {
      return res.status(404).json({ error: "Project not found" });
    }

    return res.json(data);
  } catch (error: any) {
    console.error("Project Route Error:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

/**
 * @route   POST /api/projects
 * @desc    Create a new project
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, user_id } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Project name is required" });
    }

    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }

    const { data, error } = await supabase
      .from("projects")
      .insert([{ name, user_id }])
      .select()
      .single();

    if (error) {
      console.error("Project Creation Error:", error);
      return res
        .status(500)
        .json({ error: "Failed to create project", details: error.message });
    }

    return res.status(201).json(data);
  } catch (error: any) {
    console.error("Project Create Route Error:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

export default router;
