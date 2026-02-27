import { observer } from "mobx-react-lite";
import { Wall } from "../store/Wall";

interface WallMeshProps {
  wall: Wall;
  isSelected?: boolean;
  isPreview?: boolean;
  onPointerDown?: (e: any) => void;
}

export const WallMesh = observer(
  ({ wall, isSelected, isPreview, onPointerDown }: WallMeshProps) => {
    const length = Math.max(wall.length, 0.001);
    const thickness = wall.thickness;
    const angle = wall.angle;
    const center = wall.center;

    return (
      <group
        position={center}
        rotation={[0, 0, angle]}
        onPointerDown={onPointerDown}
      >
        <mesh>
          <boxGeometry args={[length, thickness, 0.1]} />
          <meshStandardMaterial
            color={isPreview ? "#f97316" : isSelected ? "#3b82f6" : "#000000"}
            roughness={0.1}
            transparent={!!isPreview}
            opacity={isPreview ? 0.7 : 1}
          />
        </mesh>
      </group>
    );
  },
);
