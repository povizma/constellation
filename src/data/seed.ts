import type { ProjectState, Task, Dependency } from '../types';

const now = Date.now();

const tasks: Task[] = [
  { id: 't1', title: 'Discovery interviews', description: 'Talk to 8 target users about workflow pain', status: 'done', priority: 'high', effort: 3, assignee: 'Aria', tags: ['research'], createdAt: now, updatedAt: now },
  { id: 't2', title: 'Competitive analysis', description: 'Teardown of Jira, Linear, Trello, Height', status: 'done', priority: 'medium', effort: 2, assignee: 'Aria', tags: ['research'], createdAt: now, updatedAt: now },
  { id: 't3', title: 'Data model spec', description: 'Nodes, edges, statuses, permissions', status: 'in_progress', priority: 'high', effort: 4, assignee: 'Kai', tags: ['spec'], createdAt: now, updatedAt: now },
  { id: 't4', title: 'Graph engine POC', description: 'Prototype the constellation renderer', status: 'in_progress', priority: 'critical', effort: 6, assignee: 'Kai', tags: ['engineering', 'spike'], createdAt: now, updatedAt: now },
  { id: 't5', title: 'Design system tokens', description: 'Dark-first palette, motion tokens', status: 'review', priority: 'medium', effort: 3, assignee: 'Noor', tags: ['design'], createdAt: now, updatedAt: now },
  { id: 't6', title: 'Task detail panel', description: 'Sidebar UX for node inspection + edit', status: 'todo', priority: 'high', effort: 4, assignee: 'Noor', tags: ['design', 'ui'], createdAt: now, updatedAt: now },
  { id: 't7', title: 'Auth + workspaces', description: 'Sign-in, teams, workspace switcher', status: 'blocked', priority: 'high', effort: 8, assignee: 'Kai', tags: ['engineering', 'backend'], createdAt: now, updatedAt: now },
  { id: 't8', title: 'Realtime sync', description: 'CRDT-based collaborative graph edits', status: 'todo', priority: 'critical', effort: 9, assignee: 'Kai', tags: ['engineering', 'backend'], createdAt: now, updatedAt: now },
  { id: 't9', title: 'Onboarding flow', description: 'Empty state + first-task magic moment', status: 'todo', priority: 'medium', effort: 5, assignee: 'Noor', tags: ['design', 'ui'], createdAt: now, updatedAt: now },
  { id: 't10', title: 'Marketing site', description: 'Landing + waitlist + docs shell', status: 'todo', priority: 'low', effort: 4, assignee: 'Aria', tags: ['marketing'], createdAt: now, updatedAt: now },
  { id: 't11', title: 'Beta launch', description: 'Invite 50 users, collect telemetry', status: 'todo', priority: 'critical', effort: 3, tags: ['launch'], createdAt: now, updatedAt: now },
  { id: 't12', title: 'Performance pass', description: 'Handle 1k+ node graphs at 60fps', status: 'todo', priority: 'high', effort: 6, assignee: 'Kai', tags: ['engineering'], createdAt: now, updatedAt: now },
];

const deps: [string, string][] = [
  ['t1', 't3'], ['t2', 't3'],
  ['t3', 't4'], ['t3', 't5'],
  ['t4', 't6'], ['t5', 't6'],
  ['t4', 't7'],
  ['t7', 't8'],
  ['t6', 't9'], ['t8', 't9'],
  ['t9', 't11'], ['t10', 't11'],
  ['t4', 't12'], ['t12', 't11'],
];

const dependencies: Dependency[] = deps.map(([source, target], i) => ({
  id: `d${i + 1}`,
  source,
  target,
}));

export const seedProject: ProjectState = {
  tasks: Object.fromEntries(tasks.map((t) => [t.id, t])),
  dependencies: Object.fromEntries(dependencies.map((d) => [d.id, d])),
};
