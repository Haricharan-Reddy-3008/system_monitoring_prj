import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";
import { anomalyService, DEFAULT_THRESHOLDS } from "../services/anomaly";

const router = Router();

/**
 * @route   GET /api/projects
 * @desc    Return all projects
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    
    let dbQuery = supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (userId) {
      dbQuery = dbQuery.eq("user_id", userId);
    }

    const { data, error } = await dbQuery.limit(100);

    if (error) {
      console.error("Projects Fetch Error:", error);
      return res
        .status(500)
        .json({ error: "Failed to fetch projects", details: error.message });
    }

    return res.json({ projects: data || [] });
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
    const { name, user_id, thresholds } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Project name is required" });
    }

    if (!user_id) {
      return res.status(400).json({ error: "user_id is required" });
    }

    const { data, error } = await supabase
      .from("projects")
      .insert([{ name, user_id, thresholds: normalizeThresholds(thresholds) }])
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

/**
 * @route   GET /api/projects/:projectId/thresholds/recommendation
 * @desc    Recommend thresholds from recent metric history
 */
router.get("/:projectId/thresholds/recommendation", async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const recommendation = await anomalyService.getRecommendedThresholds(projectId);

    return res.json(recommendation);
  } catch (error: any) {
    console.error("Threshold Recommendation Error:", error);
    return res
      .status(500)
      .json({ error: "Failed to recommend thresholds", details: error.message });
  }
});

/**
 * @route   PATCH /api/projects/:projectId/thresholds
 * @desc    Update per-project alert thresholds
 */
router.patch("/:projectId/thresholds", async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const thresholds = normalizeThresholds(req.body.thresholds || req.body);

    const { data, error } = await supabase
      .from("projects")
      .update({ thresholds })
      .eq("id", projectId)
      .select()
      .single();

    if (error) {
      console.error("Threshold Update Error:", error);
      return res
        .status(500)
        .json({ error: "Failed to update thresholds", details: error.message });
    }

    return res.json(data);
  } catch (error: any) {
    console.error("Threshold Route Error:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

function normalizeThresholds(input: any) {
  const merged = {
    ...DEFAULT_THRESHOLDS,
    ...(input || {}),
  };

  return {
    cpu: clampThreshold(merged.cpu, 1, 100, DEFAULT_THRESHOLDS.cpu),
    memory: clampThreshold(merged.memory, 1, 100, DEFAULT_THRESHOLDS.memory),
    requests: clampThreshold(merged.requests, 1, 100000, DEFAULT_THRESHOLDS.requests),
    errors: clampThreshold(merged.errors, 0, 100000, DEFAULT_THRESHOLDS.errors),
  };
}

function clampThreshold(value: any, min: number, max: number, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export default router;
