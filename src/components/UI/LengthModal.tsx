import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState } from 'react';
import { appStore } from '../../store/AppStore';
import type { LockedAxis } from '../../store/Dimension';

const getEditableLength = (axis: LockedAxis, startX: number, startY: number, endX: number, endY: number, actualLength: number) => {
  if (axis === 'x') return Math.abs(endX - startX);
  if (axis === 'y') return Math.abs(endY - startY);
  return actualLength;
};

export const LengthModal = observer(() => {
  const wall = appStore.selectedWall;
  const axis = appStore.lengthModalAxis;
  const [value, setValue] = useState('0');
  const label = useMemo(() => {
    if (axis === 'x') return 'Edit Horizontal Length';
    if (axis === 'y') return 'Edit Vertical Length';
    return 'Edit Wall Length';
  }, [axis]);

  useEffect(() => {
    if (!wall || !appStore.isLengthModalOpen) return;
    const currentLength = getEditableLength(
      axis,
      wall.startPoint.x,
      wall.startPoint.y,
      wall.endPoint.x,
      wall.endPoint.y,
      wall.length
    );
    setValue(currentLength.toFixed(2));
  }, [wall, axis, appStore.isLengthModalOpen]);

  if (!wall || !appStore.isLengthModalOpen) return null;

  const handleApply = () => {
    const targetLength = parseFloat(value);
    if (isNaN(targetLength) || targetLength < 0) return;

    const dir = wall.direction;
    const EPS = 1e-6;
    let actualLength = targetLength;

    if (axis === 'x') {
      const absDxPerUnit = Math.abs(dir.x);
      if (absDxPerUnit < EPS) return;
      actualLength = targetLength / absDxPerUnit;
    } else if (axis === 'y') {
      const absDyPerUnit = Math.abs(dir.y);
      if (absDyPerUnit < EPS) return;
      actualLength = targetLength / absDyPerUnit;
    }

    const newEnd = wall.startPoint.clone().add(dir.multiplyScalar(actualLength));
    wall.setEndPoint(newEnd);
    appStore.closeLengthModal();
  };

  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(30, 30, 30, 0.95)',
      padding: '20px',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      zIndex: 2000,
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      color: 'white',
      minWidth: '200px',
    }}>
      <h3 style={{ margin: 0, fontSize: '16px' }}>{label}</h3>
      <input
        type="number"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '8px',
          color: 'white',
          fontSize: '18px',
          outline: 'none',
        }}
        autoFocus
      />
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => appStore.closeLengthModal()}
          style={{
            flex: 1,
            background: 'transparent',
            color: '#999',
            border: 'none',
            padding: '10px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleApply}
          style={{
            flex: 1,
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '10px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Apply
        </button>
      </div>
    </div>
  );
});
