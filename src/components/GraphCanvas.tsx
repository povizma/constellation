import { useMemo, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  MarkerType,
  useReactFlow,
  type Node,
  type Edge,
  type NodeMouseHandler,
  type EdgeMouseHandler,
} from '@xyflow/react';
import { useStore } from '../store';
import { TaskNode, type TaskNodeData } from './TaskNode';
import { layoutGraph } from '../lib/layout';
import { computeCriticalPath } from '../lib/criticalPath';

const nodeTypes = { task: TaskNode };

function sizeForEffort(effort: number) {
  const w = 190 + Math.min(effort, 10) * 10;   // 200 -> 290
  const h = 90 + Math.min(effort, 10) * 3;     // 93  -> 120
  return { w, h };
}

function useAncestorsDescendants(id: string | null) {
  const { tasks, dependencies } = useStore();
  return useMemo(() => {
    if (!id || !tasks[id]) return null;
    const parents: Record<string, string[]> = {};
    const children: Record<string, string[]> = {};
    Object.keys(tasks).forEach((k) => { parents[k] = []; children[k] = []; });
    Object.values(dependencies).forEach((d) => {
      if (children[d.source]) children[d.source].push(d.target);
      if (parents[d.target]) parents[d.target].push(d.source);
    });
    const visit = (start: string, map: Record<string, string[]>) => {
      const out = new Set<string>();
      const stack = [start];
      while (stack.length) {
        const n = stack.pop()!;
        for (const nx of map[n] ?? []) {
          if (!out.has(nx)) { out.add(nx); stack.push(nx); }
        }
      }
      return out;
    };
    const anc = visit(id, parents);
    const desc = visit(id, children);
    const visible = new Set<string>([id, ...anc, ...desc]);
    return { visible };
  }, [id, tasks, dependencies]);
}

export function GraphCanvas() {
  const tasks = useStore((s) => s.tasks);
  const deps = useStore((s) => s.dependencies);
  const selectedId = useStore((s) => s.selectedId);
  const focusMode = useStore((s) => s.focusMode);
  const showCritical = useStore((s) => s.showCritical);
  const select = useStore((s) => s.select);
  const deleteDependency = useStore((s) => s.deleteDependency);
  const addDependency = useStore((s) => s.addDependency);

  const critical = useMemo(() => computeCriticalPath(tasks, deps), [tasks, deps]);
  const focus = useAncestorsDescendants(focusMode ? selectedId : null);

  // Layout — recompute when the shape of the graph changes.
  const graphKey = useMemo(
    () =>
      Object.keys(tasks).sort().join(',') +
      '|' +
      Object.values(deps)
        .map((d) => `${d.source}->${d.target}`)
        .sort()
        .join(','),
    [tasks, deps],
  );

  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});

  useEffect(() => {
    const rawNodes: Node[] = Object.values(tasks).map((t) => ({
      id: t.id,
      type: 'task',
      position: { x: 0, y: 0 },
      data: { size: sizeForEffort(t.effort) },
    }));
    const rawEdges: Edge[] = Object.values(deps).map((d) => ({
      id: d.id,
      source: d.source,
      target: d.target,
    }));
    const laid = layoutGraph(rawNodes, rawEdges);
    const nextPos: Record<string, { x: number; y: number }> = {};
    laid.forEach((n) => (nextPos[n.id] = n.position));
    setPositions(nextPos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphKey]);

  const nodes: Node[] = useMemo(() => {
    return Object.values(tasks).map((t) => {
      const size = sizeForEffort(t.effort);
      const dimmed = !!focus && !focus.visible.has(t.id);
      const focused = focusMode && selectedId === t.id;
      const data: TaskNodeData = {
        task: t,
        size,
        selected: selectedId === t.id,
        onCritical: showCritical && critical.ids.has(t.id),
        dimmed,
        focused,
      };
      return {
        id: t.id,
        type: 'task',
        position: positions[t.id] ?? { x: 0, y: 0 },
        data: data as unknown as Record<string, unknown>,
        selected: selectedId === t.id,
      };
    });
  }, [tasks, positions, selectedId, focusMode, focus, critical, showCritical]);

  const edges: Edge[] = useMemo(() => {
    return Object.values(deps).map((d) => {
      const isCritical = showCritical && critical.edgeIds.has(d.id);
      const isDimmed = !!focus && (!focus.visible.has(d.source) || !focus.visible.has(d.target));
      return {
        id: d.id,
        source: d.source,
        target: d.target,
        type: 'smoothstep',
        animated: isCritical,
        className: [isCritical ? 'critical' : '', isDimmed ? 'dimmed' : ''].join(' ').trim(),
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isCritical ? '#f472b6' : isDimmed ? '#2a2d40' : '#363b52',
        },
      };
    });
  }, [deps, critical, showCritical, focus]);

  const onNodeClick: NodeMouseHandler = (_, node) => select(node.id);
  const onPaneClick = () => select(null);
  const onEdgeDoubleClick: EdgeMouseHandler = (_, edge) => {
    if (confirm('Delete this dependency?')) deleteDependency(edge.id);
  };

  const { fitView } = useReactFlow();
  useEffect(() => {
    const t = setTimeout(() => fitView({ padding: 0.15, duration: 400 }), 50);
    return () => clearTimeout(t);
  }, [graphKey, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      onEdgeDoubleClick={onEdgeDoubleClick}
      onConnect={(c) => c.source && c.target && addDependency(c.source, c.target)}
      fitView
      minZoom={0.2}
      maxZoom={2}
      proOptions={{ hideAttribution: false }}
    >
      <Background variant={BackgroundVariant.Dots} gap={24} size={1.5} />
      <Controls showInteractive={false} />
      <MiniMap
        pannable
        zoomable
        nodeColor={(n) => {
          const t = tasks[n.id];
          if (!t) return '#333';
          switch (t.status) {
            case 'done': return '#22c55e';
            case 'in_progress': return '#38bdf8';
            case 'review': return '#fbbf24';
            case 'blocked': return '#ef4444';
            default: return '#64748b';
          }
        }}
        maskColor="rgba(6,7,12,0.85)"
      />
    </ReactFlow>
  );
}
