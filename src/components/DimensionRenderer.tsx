import { observer } from "mobx-react-lite";
import * as THREE from "three";
import { Wall } from "../store/Wall";
import { Html, Line } from "@react-three/drei";
import { useThree, type ThreeEvent } from "@react-three/fiber";
import { useCallback, useState } from "react";
import { appStore } from "../store/AppStore";
import { formatDimension } from "../utils/dimensionUtils";

interface DimensionRendererProps {
  wall: Wall;
  showLabel?: boolean;
}

const DIM_COLOR = "#3b82f6";
const TICK_SIZE = 0.2;
const LABEL_BASE_ZOOM = 50;
const LABEL_BASE_SCALE = 1.5;
const LABEL_SCALE_POWER = 1;
const LABEL_MIN_SCALE = 0.75;
const LABEL_MAX_SCALE = 1.5;

const getReadableParallelAngle = (baseAngle: number) => {
  let angle = Math.atan2(Math.sin(baseAngle), Math.cos(baseAngle));
  if (angle > Math.PI / 2) angle -= Math.PI;
  if (angle < -Math.PI / 2) angle += Math.PI;
  return angle;
};

const getLabelScaleFromZoom = (zoom: number) => {
  const safeZoom = Math.max(zoom, 0.0001);
  const scale =
    LABEL_BASE_SCALE * Math.pow(LABEL_BASE_ZOOM / safeZoom, LABEL_SCALE_POWER);
  return THREE.MathUtils.clamp(scale, LABEL_MIN_SCALE, LABEL_MAX_SCALE);
};

export const DimensionRenderer = observer(
  ({ wall, showLabel = true }: DimensionRendererProps) => {
    if (!wall.dimension) return null;

    const { camera, raycaster, mouse } = useThree();
    const [isDragging, setIsDragging] = useState(false);

    const start = wall.startPoint;
    const end = wall.endPoint;
    const normal = wall.normal;
    const dimension = wall.dimension;
    const xAxis = new THREE.Vector3(1, 0, 0);
    const yAxis = new THREE.Vector3(0, 1, 0);

    const getMouseWorldPoint = useCallback(() => {
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const target = new THREE.Vector3();
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(plane, target);
      return target;
    }, [camera, mouse, raycaster]);

    const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
      if (!showLabel) return;
      if (appStore.activeTool === "wall") return;
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      setIsDragging(true);
    };

    const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setIsDragging(false);
    };

    const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
      if (!showLabel) return;
      if (!isDragging) return;
      e.stopPropagation();

      const mousePoint = getMouseWorldPoint();
      const wallCenter = wall.center;
      const toMouse = new THREE.Vector3().subVectors(mousePoint, wallCenter);
      const offsetDirection =
        dimension.lockedAxis === "x"
          ? yAxis
          : dimension.lockedAxis === "y"
            ? xAxis
            : normal;
      const offset = toMouse.dot(offsetDirection);
      dimension.setOffset(offset);
    };

    let dimStart: THREE.Vector3;
    let dimEnd: THREE.Vector3;
    let dimCenter: THREE.Vector3;
    let extStart: THREE.Vector3;
    let extEnd: THREE.Vector3;

    if (dimension.lockedAxis === "x") {
      const dimY = wall.center.y + dimension.offset;
      dimStart = new THREE.Vector3(start.x, dimY, 0);
      dimEnd = new THREE.Vector3(end.x, dimY, 0);
      dimCenter = new THREE.Vector3((start.x + end.x) * 0.5, dimY, 0);
      const extTick = yAxis
        .clone()
        .multiplyScalar(TICK_SIZE * (dimension.offset >= 0 ? 1 : -1));
      extStart = dimStart.clone().add(extTick);
      extEnd = dimEnd.clone().add(extTick);
    } else if (dimension.lockedAxis === "y") {
      const dimX = wall.center.x + dimension.offset;
      dimStart = new THREE.Vector3(dimX, start.y, 0);
      dimEnd = new THREE.Vector3(dimX, end.y, 0);
      dimCenter = new THREE.Vector3(dimX, (start.y + end.y) * 0.5, 0);
      const extTick = xAxis
        .clone()
        .multiplyScalar(TICK_SIZE * (dimension.offset >= 0 ? 1 : -1));
      extStart = dimStart.clone().add(extTick);
      extEnd = dimEnd.clone().add(extTick);
    } else {
      const offsetVec = normal.clone().multiplyScalar(dimension.offset);
      dimStart = start.clone().add(offsetVec);
      dimEnd = end.clone().add(offsetVec);
      dimCenter = wall.center.clone().add(offsetVec);
      const extTick = normal
        .clone()
        .multiplyScalar(TICK_SIZE * (dimension.offset >= 0 ? 1 : -1));
      extStart = dimStart.clone().add(extTick);
      extEnd = dimEnd.clone().add(extTick);
    }

    let lengthValue = wall.length;
    if (dimension.lockedAxis === "x") {
      lengthValue = Math.abs(end.x - start.x);
    } else if (dimension.lockedAxis === "y") {
      lengthValue = Math.abs(end.y - start.y);
    }

    const lengthText = formatDimension(lengthValue, true);
    const angle =
      dimension.lockedAxis === "x"
        ? 0
        : dimension.lockedAxis === "y"
          ? Math.PI / 2
          : getReadableParallelAngle(
              Math.atan2(wall.direction.y, wall.direction.x),
            );
    const labelScale = showLabel ? getLabelScaleFromZoom(appStore.cameraZoom) : 1;

    return (
      <group
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerMove={onPointerMove}
      >
        <Line
          points={[dimStart, dimEnd, start, extStart, end, extEnd]}
          segments={true}
          color={DIM_COLOR}
          lineWidth={1.5}
        />

        {showLabel && (
          <group position={dimCenter} rotation={[0, 0, angle]} scale={labelScale}>
            <Html
              transform
              center
              distanceFactor={8}
              zIndexRange={[10, 0]}
              pointerEvents="auto"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  background: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  padding: "2px 4px",
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#1e293b",
                  whiteSpace: "nowrap",
                  userSelect: "none",
                  cursor: "pointer",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  appStore.openLengthModal(wall.id, dimension.lockedAxis);
                }}
              >
                {lengthText}
              </div>
            </Html>
          </group>
        )}
      </group>
    );
  },
);
