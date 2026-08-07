import dagre from 'dagre';
import type { Node, Edge } from '@xyflow/react';

export function layoutGraph(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'LR', nodesep: 60, ranksep: 110, marginx: 40, marginy: 40 });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((n) => {
    const size = (n.data as any)?.size ?? { w: 200, h: 90 };
    g.setNode(n.id, { width: size.w, height: size.h });
  });
  edges.forEach((e) => g.setEdge(e.source, e.target));

  dagre.layout(g);

  return nodes.map((n) => {
    const pos = g.node(n.id);
    return {
      ...n,
      position: { x: pos.x - pos.width / 2, y: pos.y - pos.height / 2 },
    };
  });
}
