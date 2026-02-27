import { useState, useCallback, useMemo, useEffect } from 'react';
import { useThree, type ThreeEvent } from '@react-three/fiber';
import { observer } from 'mobx-react-lite';
import * as THREE from 'three';
import { Wall } from '../store/Wall';

interface WallEndpointsProps {
  wall: Wall;
}

export const WallEndpoints = observer(({ wall }: WallEndpointsProps) => {
  const { camera, gl } = useThree();
  const [draggingPoint, setDraggingPoint] = useState<'start' | 'end' | null>(null);
  const ndcPoint = useMemo(() => new THREE.Vector3(), []);

  const getWorldPoint = useCallback((clientX: number, clientY: number) => {
    const rect = gl.domElement.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;
    ndcPoint.set(x, y, 0).unproject(camera);
    ndcPoint.z = 0;
    return ndcPoint.clone();
  }, [camera, gl, ndcPoint]);

  const onPointerDown = (e: ThreeEvent<PointerEvent>, type: 'start' | 'end') => {
    e.stopPropagation();
    setDraggingPoint(type);
  };

  useEffect(() => {
    if (!draggingPoint) return;

    const handlePointerMove = (e: PointerEvent) => {
      const point = getWorldPoint(e.clientX, e.clientY);
      if (draggingPoint === 'start') {
        wall.setStartPoint(point);
      } else {
        wall.setEndPoint(point);
      }
    };

    const handlePointerUp = () => {
      setDraggingPoint(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggingPoint, getWorldPoint, wall]);

  return (
    <group>
      {/* Start Point Handle */}
      <mesh
        position={wall.startPoint}
        onPointerDown={(e) => onPointerDown(e, 'start')}
      >
        <circleGeometry args={[0.15, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* End Point Handle */}
      <mesh
        position={wall.endPoint}
        onPointerDown={(e) => onPointerDown(e, 'end')}
      >
        <circleGeometry args={[0.15, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
});
