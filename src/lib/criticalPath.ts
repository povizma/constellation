import type { Task, Dependency } from '../types';

// Longest-path over remaining effort (skipping done tasks).
// Returns a set of task ids on the critical path.
export function computeCriticalPath(
  tasks: Record<string, Task>,
  deps: Record<string, Dependency>,
): { ids: Set<string>; edgeIds: Set<string> } {
  const ids = new Set<string>();
  const edgeIds = new Set<string>();

  const taskList = Object.values(tasks);
  if (taskList.length === 0) return { ids, edgeIds };

  const adj: Record<string, { target: string; edgeId: string }[]> = {};
  const indeg: Record<string, number> = {};
  taskList.forEach((t) => {
    adj[t.id] = [];
    indeg[t.id] = 0;
  });
  Object.values(deps).forEach((d) => {
    if (!adj[d.source] || indeg[d.target] === undefined) return;
    adj[d.source].push({ target: d.target, edgeId: d.id });
    indeg[d.target] += 1;
  });

  // Topological order.
  const queue: string[] = [];
  Object.keys(indeg).forEach((k) => indeg[k] === 0 && queue.push(k));
  const topo: string[] = [];
  const localIndeg = { ...indeg };
  while (queue.length) {
    const n = queue.shift()!;
    topo.push(n);
    for (const { target } of adj[n]) {
      localIndeg[target] -= 1;
      if (localIndeg[target] === 0) queue.push(target);
    }
  }

  const weight = (id: string) => (tasks[id].status === 'done' ? 0 : tasks[id].effort);
  const dist: Record<string, number> = {};
  const parent: Record<string, { node: string; edgeId: string } | null> = {};
  topo.forEach((n) => {
    dist[n] = weight(n);
    parent[n] = null;
  });
  topo.forEach((n) => {
    for (const { target, edgeId } of adj[n]) {
      const cand = dist[n] + weight(target);
      if (cand > dist[target]) {
        dist[target] = cand;
        parent[target] = { node: n, edgeId };
      }
    }
  });

  let endNode: string | null = null;
  let best = -Infinity;
  topo.forEach((n) => {
    if (dist[n] > best) {
      best = dist[n];
      endNode = n;
    }
  });
  if (!endNode || best <= 0) return { ids, edgeIds };

  let cur: string | null = endNode;
  while (cur) {
    ids.add(cur);
    const p: { node: string; edgeId: string } | null = parent[cur];
    if (p) edgeIds.add(p.edgeId);
    cur = p ? p.node : null;
  }
  return { ids, edgeIds };
}
