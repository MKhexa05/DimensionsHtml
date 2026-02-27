import { observer } from 'mobx-react-lite';
import { appStore, type ActiveTool } from '../../store/AppStore';
import { MousePointer2, PenTool, Ruler } from 'lucide-react';
import { useEffect } from 'react';

export const Toolbar = observer(() => {
  const tools: { id: ActiveTool; icon: any; label: string; key: string }[] = [
    { id: 'select', icon: MousePointer2, label: 'Select (S)', key: 's' },
    { id: 'wall', icon: PenTool, label: 'Wall (W)', key: 'w' },
    { id: 'dimension', icon: Ruler, label: 'Dimension (D)', key: 'd' },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 's') appStore.setActiveTool('select');
      if (key === 'w') appStore.setActiveTool('wall');
      if (key === 'd') appStore.setActiveTool('dimension');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '10px',
      padding: '10px',
      background: 'rgba(30, 30, 30, 0.8)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      zIndex: 1000,
    }}>
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = appStore.activeTool === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => appStore.setActiveTool(tool.id)}
            title={tool.label}
            style={{
              background: isActive ? '#3b82f6' : 'transparent',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <Icon size={20} />
          </button>
        );
      })}
    </div>
  );
});
