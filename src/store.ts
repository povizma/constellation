import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, TaskStatus, ProjectState } from './types';
import { seedProject } from './data/seed';

interface Store extends ProjectState {
  selectedId: string | null;
  focusMode: boolean;
  showCritical: boolean;
  select: (id: string | null) => void;
  toggleFocus: () => void;
  toggleCritical: () => void;
  addTask: (t?: Partial<Task>) => string;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setStatus: (id: string, status: TaskStatus) => void;
  addDependency: (source: string, target: string) => void;
  deleteDependency: (id: string) => void;
  resetToSeed: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...seedProject,
      selectedId: null,
      focusMode: false,
      showCritical: true,

      select: (id) => set({ selectedId: id }),
      toggleFocus: () => set({ focusMode: !get().focusMode }),
      toggleCritical: () => set({ showCritical: !get().showCritical }),

      addTask: (t) => {
        const id = uid();
        const now = Date.now();
        const task: Task = {
          id,
          title: t?.title ?? 'New task',
          description: t?.description ?? '',
          status: t?.status ?? 'todo',
          priority: t?.priority ?? 'medium',
          effort: t?.effort ?? 3,
          assignee: t?.assignee,
          tags: t?.tags ?? [],
          createdAt: now,
          updatedAt: now,
        };
        set({ tasks: { ...get().tasks, [id]: task }, selectedId: id });
        return id;
      },

      updateTask: (id, patch) => {
        const task = get().tasks[id];
        if (!task) return;
        set({
          tasks: {
            ...get().tasks,
            [id]: { ...task, ...patch, updatedAt: Date.now() },
          },
        });
      },

      deleteTask: (id) => {
        const { tasks, dependencies, selectedId } = get();
        const { [id]: _, ...rest } = tasks;
        const deps = Object.fromEntries(
          Object.entries(dependencies).filter(
            ([, d]) => d.source !== id && d.target !== id,
          ),
        );
        set({
          tasks: rest,
          dependencies: deps,
          selectedId: selectedId === id ? null : selectedId,
        });
      },

      setStatus: (id, status) => get().updateTask(id, { status }),

      addDependency: (source, target) => {
        if (source === target) return;
        const exists = Object.values(get().dependencies).some(
          (d) => d.source === source && d.target === target,
        );
        if (exists) return;
        // Prevent trivial cycle A->B if B->A already exists.
        const reverseExists = Object.values(get().dependencies).some(
          (d) => d.source === target && d.target === source,
        );
        if (reverseExists) return;
        const id = uid();
        set({
          dependencies: {
            ...get().dependencies,
            [id]: { id, source, target },
          },
        });
      },

      deleteDependency: (id) => {
        const { [id]: _, ...rest } = get().dependencies;
        set({ dependencies: rest });
      },

      resetToSeed: () =>
        set({ ...seedProject, selectedId: null, focusMode: false }),
    }),
    { name: 'constellation-v1' },
  ),
);
