"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { fetchWorkbench, saveWorkbench } from "./api";
import { getBrowserUserKey } from "./identity";
import type { Task } from "./types";

export interface WorkbenchState {
  dismissed: string[];
  customTasks: Task[];
}

const EMPTY: WorkbenchState = { dismissed: [], customTasks: [] };

const listeners = new Set<() => void>();
let snapshot: WorkbenchState | null = null;
let hydratePromise: Promise<void> | null = null;
let lastSavedJson = "";
let activeUserKey = "default";

function storageKey(userKey = activeUserKey): string {
  return `sf-workbench:${userKey || "default"}`;
}

function load(): WorkbenchState {
  if (typeof window === "undefined") return EMPTY;
  try {
    activeUserKey = getBrowserUserKey() || "default";
    const raw = window.localStorage.getItem(storageKey());
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<WorkbenchState>;
    return {
      dismissed: Array.isArray(parsed.dismissed) ? parsed.dismissed : [],
      customTasks: Array.isArray(parsed.customTasks) ? parsed.customTasks : [],
    };
  } catch {
    return EMPTY;
  }
}

function persist(next: WorkbenchState) {
  snapshot = next;
  try {
    activeUserKey = getBrowserUserKey() || "default";
    window.localStorage.setItem(storageKey(), JSON.stringify(next));
  } catch {}
  listeners.forEach((listener) => listener());
}

function mergeState(local: WorkbenchState, remote: WorkbenchState): WorkbenchState {
  const dismissed = [...new Set([...remote.dismissed, ...local.dismissed])];
  const taskMap = new Map<string, Task>();

  for (const task of remote.customTasks) taskMap.set(String(task.id), task);
  for (const task of local.customTasks) taskMap.set(String(task.id), task);

  return {
    dismissed,
    customTasks: Array.from(taskMap.values()),
  };
}

async function pushRemote(next: WorkbenchState) {
  const json = JSON.stringify(next);
  if (json === lastSavedJson) return;
  try {
    const saved = await saveWorkbench(next);
    lastSavedJson = JSON.stringify(saved);
  } catch {
    // preserve local state if remote sync fails
  }
}

async function hydrateRemote() {
  if (typeof window === "undefined") return;
  if (hydratePromise) return hydratePromise;

  hydratePromise = (async () => {
    activeUserKey = getBrowserUserKey() || "default";
    const local = getSnapshot();
    try {
      const remote = await fetchWorkbench(activeUserKey);
      const merged = mergeState(local, remote);
      persist(merged);
      await pushRemote(merged);
    } catch {
      lastSavedJson = JSON.stringify(local);
    }
  })();

  return hydratePromise;
}

export function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getSnapshot(): WorkbenchState {
  const nextUserKey = typeof window === "undefined" ? activeUserKey : (getBrowserUserKey() || "default");
  if (snapshot === null || nextUserKey !== activeUserKey) {
    activeUserKey = nextUserKey;
    snapshot = load();
    hydratePromise = null;
    lastSavedJson = "";
  }
  if (snapshot === null) snapshot = load();
  return snapshot;
}

export function getServerSnapshot(): WorkbenchState {
  return EMPTY;
}

export function useWorkbench() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    void hydrateRemote();
  }, []);

  const dismiss = useCallback((id: string) => {
    if (state.dismissed.includes(id)) return;
    const next = { ...state, dismissed: [...state.dismissed, id] };
    persist(next);
    void pushRemote(next);
  }, [state]);

  const restoreDismissed = useCallback((id: string) => {
    const next = { ...state, dismissed: state.dismissed.filter((item) => item !== id) };
    persist(next);
    void pushRemote(next);
  }, [state]);

  const addTask = useCallback((task: Task) => {
    const exists = state.customTasks.some((item) => item.id === task.id);
    if (exists) return false;
    const next = { ...state, customTasks: [task, ...state.customTasks] };
    persist(next);
    void pushRemote(next);
    return true;
  }, [state]);

  const removeTask = useCallback((taskId: string | number) => {
    const next = {
      ...state,
      customTasks: state.customTasks.filter((task) => task.id !== taskId),
    };
    persist(next);
    void pushRemote(next);
  }, [state]);

  const isDismissed = useCallback((id: string) => state.dismissed.includes(id), [state.dismissed]);
  const hasTask = useCallback((taskId: string | number) => state.customTasks.some((task) => task.id === taskId), [state.customTasks]);

  return {
    state,
    dismiss,
    restoreDismissed,
    addTask,
    removeTask,
    isDismissed,
    hasTask,
  };
}
