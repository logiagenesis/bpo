import { createRouter, createHashHistory } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({ routeTree, defaultErrorComponent: AppErrorComponent, history: import.meta.env.VITE_GITHUB_PAGES ? createHashHistory() : undefined });
}
