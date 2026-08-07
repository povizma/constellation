# ✦ Constellation

**A graph-first project management dashboard.** Tasks are nodes, dependencies are edges, and the critical path lights up like a constellation across the sky.

Where Jira gives you tickets and Trello gives you columns, Constellation gives you the *shape* of your project — you can see the bottlenecks, the parallel workstreams, and what actually blocks the launch, at a glance.

---

## Why this exists

Kanban boards hide the two questions that matter most on a project:

1. **What's actually blocking us?**
2. **What's the true minimum path to shipping?**

Constellation answers both by making dependencies a first-class citizen of the UI, not a metadata field you have to click into a ticket to see.

## Features

- **Interactive dependency graph** — every task is a node, every "blocks" relationship is an edge, auto-laid out left-to-right with [dagre](https://github.com/dagrejs/dagre)
- **Nodes sized by effort** — a 9-point task is visibly larger than a 2-point task
- **Status color coding** — Todo / In progress / Review / Done / Blocked, with a pulsing red halo on blocked work
- **Critical path highlighting** — the longest remaining-effort chain through the graph glows pink and animates, so you always know where slippage will actually cost you
- **Focus mode** — pick any task and dim everything that isn't an ancestor or descendant, so you can zoom in on one workstream without losing the graph
- **Live editing sidebar** — title, description, status, priority, effort, assignee, tags, and full dependency management
- **Drag to connect** — pull from any node's edge to another to create a dependency; double-click any edge to delete it
- **Toolbar telemetry** — total tasks, in-progress count, blocked count, critical-path length, and weighted-by-effort progress %
- **Persists to `localStorage`** — reload keeps your graph; one click resets to the seed sample
- **Dark, spacey aesthetic** — because a "constellation" of tasks deserves it

## Tech stack

| Layer | Choice | Why |
|-------|--------|-----|
| Build | Vite + React 19 + TypeScript | Fast dev loop, tiny config |
| Graph | [@xyflow/react](https://reactflow.dev) (React Flow) | Best-in-class node/edge canvas — pan, zoom, minimap, custom nodes, dragging out of the box |
| Layout | [dagre](https://github.com/dagrejs/dagre) | Auto DAG layout, so you don't hand-position nodes |
| State | [Zustand](https://zustand.docs.pmnd.rs/) + `persist` | Tiny store, localStorage out of the box |
| Styling | Tailwind CSS v4 | No CSS file wrangling, dark theme baked in |

Zero backend. Everything runs in the browser and persists to `localStorage`. You can pull the whole thing offline.

## Getting started

Requires Node 18+ (developed on Node 24).

```bash
git clone https://github.com/povizma/constellation.git
cd constellation
npm install
npm run dev
```

Then open http://localhost:5173 (or whatever port Vite prints).

### Windows PowerShell note

If you see `File C:\Program Files\nodejs\npm.ps1 cannot be loaded because running scripts is disabled`, run this once:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

## Project structure

```
src/
├── App.tsx                        # Root layout: toolbar + canvas + sidebar
├── main.tsx                       # React entry
├── index.css                      # Tailwind import + theme + React Flow theming
├── types.ts                       # Task, Dependency, ProjectState
├── store.ts                       # Zustand store, persisted to localStorage
├── data/
│   └── seed.ts                    # 12 sample tasks + realistic dependencies
├── lib/
│   ├── layout.ts                  # dagre → React Flow positions
│   └── criticalPath.ts            # Longest-path over remaining effort
└── components/
    ├── GraphCanvas.tsx            # React Flow instance, node/edge state
    ├── TaskNode.tsx               # Custom node: status, effort, tags
    ├── Sidebar.tsx                # Editable task inspector + dep manager
    └── Toolbar.tsx                # Stats, toggles, actions
```

## Keyboard & mouse

| Action | What happens |
|--------|--------------|
| Click a node | Opens it in the sidebar |
| Click empty canvas | Deselects |
| Scroll | Zoom |
| Drag canvas | Pan |
| Drag from node edge to another node | Creates a dependency |
| Double-click an edge | Deletes that dependency |
| **Focus** toggle (with a selection) | Dims everything that isn't in the selected task's ancestor/descendant tree |
| **Critical** toggle | Highlight/hide the longest remaining-effort path |
| **+ New task** | Adds a fresh task and selects it |
| **↺** | Reset the graph to the seed sample |

## How "critical path" works

Constellation computes the longest path through the DAG using each task's **remaining effort** as edge weight (done tasks contribute 0). This is the chain that, if any step slips, delays the whole project — and the chain you should staff aggressively.

## Roadmap ideas

- Swimlane view grouped by assignee
- Timeline overlay showing when things ship, given a start date and per-assignee capacity
- Multi-select + bulk status change
- Import from CSV / Linear / Jira
- CRDT-based real-time collaboration
- Sub-graphs (a task node that expands into its own constellation)

## License

MIT — do whatever you want.

---

Built as a Claude Code session, one commit at a time.
