import { ReactFlowProvider } from '@xyflow/react';
import { Toolbar } from './components/Toolbar';
import { GraphCanvas } from './components/GraphCanvas';
import { Sidebar } from './components/Sidebar';

export default function App() {
  return (
    <div className="h-screen w-screen flex flex-col bg-[#06070c]">
      <Toolbar />
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 relative min-w-0 min-h-0" style={{ height: '100%' }}>
          <ReactFlowProvider>
            <GraphCanvas />
          </ReactFlowProvider>
        </div>
        <Sidebar />
      </div>
    </div>
  );
}
