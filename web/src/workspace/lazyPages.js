// The workspace is code-split so the public website bundle stays small.
import { lazy } from "react";

export const WorkspaceLayout = lazy(() => import("./WorkspaceLayout"));
export const WorkspaceHome = lazy(() => import("./pages/WorkspaceHome"));
export const ExploreSolutions = lazy(() => import("./pages/ExploreSolutions"));
export const CategoryPage = lazy(() => import("./pages/CategoryPage"));
export const SolutionPage = lazy(() => import("./pages/SolutionPage"));
export const ToolPage = lazy(() => import("./pages/ToolPage"));
