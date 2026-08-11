"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { fetchWorkbench, saveWorkbench } from "./api";
import {
  emptyDailyProgress,
  mergeDailyProgress,
  normalizeDailyProgress,
  type DailyProgress,
} from "./daily";
import { getIdentityKey, IDENTITY_CHANGE_EVENT } from "./identity";
import type { Task } from "./types";

export interface WorkbenchState {
  dismissed: string[];
  customTasks: Task[];
  dailyProgress: DailyProgress;
}

const EMPTY: WorkbenchState = {
  dismissed: [],
  customTasks: [],
  dailyProgress: emptyDailyProgress(),
};

const listeners = new Set<() => void>();
let snapshot: WorkbenchState | null = null;
let hydratePromise: Promise<void> | null = null;
let lastSavedJson = "";
let activeUserKey = "anon";
let identityListenerAttached = false;
let pendingRemoteSave: {
  userKey: string;
  state: WorkbenchState;
  json: string;
} | null = null;
let remoteSavePromise: Promise<void> | null = null;

function currentUserId(): string {
  return getIdentityKey();
}

function storageKey(userKey = activeUserKey): string {
  return `sf-workbench:${userKey || "anon"}`;
}

function load(): WorkbenchState {
  if (typeof window === "undefined") return EMPTY;
  try {
    activeUserKey = currentUserId();
    const raw = window.localStorage.getItem(storageKey());
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<WorkbenchState>;
    return {
      dismissed: Array.isArray(parsed.dismissed) ? parsed.dismissed : [],
      customTasks: Array.isArray(parsed.customTasks) ? parsed.customTasks : [],
      dailyProgress: normalizeDailyProgress(parsed.dailyProgress),
    };
  } catch {
    return EMPTY;
  }
}

function persist(next: WorkbenchState) {
  snapshot = next;
  try {
    activeUserKey = currentUserId();
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
    dailyProgress: mergeDailyProgress(local.dailyProgress, remote.dailyProgress),
  };
}

function updateDailyProgress(
  date: string,
  updater: (progress: DailyProgress) => DailyProgress
) {
  const current = getSnapshot();
  const progress = current.dailyProgress.date === date
    ? normalizeDailyProgress(current.dailyProgress)
    : emptyDailyProgress(date);
  const previousUpdate = Date.parse(progress.updatedAt);
  const updatedAt = new Date(
    Number.isNaN(previousUpdate)
      ? Date.now()
      : Math.max(Date.now(), previousUpdate + 1)
  ).toISOString();
  const dailyProgress = normalizeDailyProgress({
    ...updater(progress),
    date,
    updatedAt,
  });
  const next = { ...current, dailyProgress };
  persist(next);
  void pushRemote(next);
}

function toggled(values: string[], id: string): string[] {
  return values.includes(id)
    ? values.filter((value) => value !== id)
    : [...values, id];
}

async function flushRemoteSaves() {
  while (pendingRemoteSave) {
    const queued = pendingRemoteSave;
    pendingRemoteSave = null;

    if (queued.userKey !== currentUserId()) continue;

    try {
      const saved = await saveWorkbench(queued.state);
      if (queued.userKey === currentUserId()) {
        lastSavedJson = JSON.stringify(saved);
      }
    } catch {
      // Preserve local state if remote sync fails. A later mutation retries it.
    }
  }
}

function startRemoteFlush(): Promise<void> {
  if (remoteSavePromise) return remoteSavePromise;

  remoteSavePromise = flushRemoteSaves().finally(() => {
    remoteSavePromise = null;
    if (pendingRemoteSave) void startRemoteFlush();
  });
  return remoteSavePromise;
}

function pushRemote(next: WorkbenchState): Promise<void> {
  const json = JSON.stringify(next);
  const userKey = currentUserId();
  if (userKey === activeUserKey && json === lastSavedJson) {
    return Promise.resolve();
  }
  if (pendingRemoteSave?.userKey === userKey && pendingRemoteSave.json === json) {
    return startRemoteFlush();
  }

  // Keep only the newest queued snapshot; the in-flight request still finishes
  // first, so an older response can never overwrite a newer interaction.
  pendingRemoteSave = { userKey, state: next, json };
  return startRemoteFlush();
}

async function hydrateRemote() {
  if (typeof window === "undefined") return;
  if (hydratePromise) return hydratePromise;

  hydratePromise = (async () => {
    const hydrationUserKey = currentUserId();
    activeUserKey = hydrationUserKey;
    const local = getSnapshot();
    try {
      const remote = await fetchWorkbench();
      if (hydrationUserKey !== currentUserId()) return;
      const merged = mergeState(local, remote);
      persist(merged);
      await pushRemote(merged);
    } catch {
      if (hydrationUserKey === currentUserId()) {
        lastSavedJson = JSON.stringify(local);
      }
    }
  })();

  return hydratePromise;
}

export function subscribe(cb: () => void) {
  if (typeof window !== "undefined" && !identityListenerAttached) {
    window.addEventListener(IDENTITY_CHANGE_EVENT, () => {
      snapshot = null;
      hydratePromise = null;
      lastSavedJson = "";
      pendingRemoteSave = null;
      listeners.forEach((listener) => listener());
    });
    identityListenerAttached = true;
  }
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getSnapshot(): WorkbenchState {
  const nextUserKey = typeof window === "undefined" ? activeUserKey : currentUserId();
  if (snapshot === null || nextUserKey !== activeUserKey) {
    activeUserKey = nextUserKey;
    snapshot = load();
    hydratePromise = null;
    lastSavedJson = "";
    pendingRemoteSave = null;
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
    const current = getSnapshot();
    if (current.dismissed.includes(id)) return;
    const next = { ...current, dismissed: [...current.dismissed, id] };
    persist(next);
    void pushRemote(next);
  }, []);

  const restoreDismissed = useCallback((id: string) => {
    const current = getSnapshot();
    const next = {
      ...current,
      dismissed: current.dismissed.filter((item) => item !== id),
    };
    persist(next);
    void pushRemote(next);
  }, []);

  const addTask = useCallback((task: Task) => {
    const current = getSnapshot();
    const exists = current.customTasks.some((item) => item.id === task.id);
    if (exists) return false;
    const next = { ...current, customTasks: [task, ...current.customTasks] };
    persist(next);
    void pushRemote(next);
    return true;
  }, []);

  const removeTask = useCallback((taskId: string | number) => {
    const current = getSnapshot();
    const next = {
      ...current,
      customTasks: current.customTasks.filter((task) => task.id !== taskId),
    };
    persist(next);
    void pushRemote(next);
  }, []);

  const isDismissed = useCallback((id: string) => state.dismissed.includes(id), [state.dismissed]);
  const hasTask = useCallback((taskId: string | number) => state.customTasks.some((task) => task.id === taskId), [state.customTasks]);

  const toggleReviewedSignal = useCallback((date: string, id: string) => {
    updateDailyProgress(date, (progress) => ({
      ...progress,
      reviewedSignalIds: toggled(progress.reviewedSignalIds, id),
    }));
  }, []);

  const toggleCompletedTask = useCallback((date: string, id: string) => {
    updateDailyProgress(date, (progress) => ({
      ...progress,
      completedTaskIds: toggled(progress.completedTaskIds, id),
    }));
  }, []);

  const setPostDone = useCallback((date: string, done: boolean) => {
    updateDailyProgress(date, (progress) => ({ ...progress, postDone: done }));
  }, []);

  const resetDailyProgress = useCallback((date: string) => {
    updateDailyProgress(date, () => emptyDailyProgress(date));
  }, []);

  return {
    state,
    dismiss,
    restoreDismissed,
    addTask,
    removeTask,
    isDismissed,
    hasTask,
    toggleReviewedSignal,
    toggleCompletedTask,
    setPostDone,
    resetDailyProgress,
  };
}
