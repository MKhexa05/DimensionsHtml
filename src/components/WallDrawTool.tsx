import { useCallback, useEffect, useMemo, useState } from "react";
import { useThree } from "@react-three/fiber";
import { observer } from "mobx-react-lite";
import * as THREE from "three";
import { appStore } from "../store/AppStore";
import { Wall } from "../store/Wall";

type AxisLock = "none" | "x" | "y";

export const WallDrawTool = observer(() => {
  const { camera, gl } = useThree();
  const [startPoint, setStartPoint] = useState<THREE.Vector3 | null>(null);
  const [axisLock, setAxisLock] = useState<AxisLock>("none");
  const ndcPoint = useMemo(() => new THREE.Vector3(), []);

  const resetDrawing = useCallback(() => {
    setStartPoint(null);
    setAxisLock("none");
    appStore.setDrawingWall(null);
  }, []);

  const constrainPoint = useCallback(
    (point: THREE.Vector3, start: THREE.Vector3) => {
      const constrained = point.clone();
      if (axisLock === "x") {
        constrained.y = start.y;
      } else if (axisLock === "y") {
        constrained.x = start.x;
      }
      constrained.z = 0;
      return constrained;
    },
    [axisLock],
  );

  const getWorldPoint = useCallback(
    (clientX: number, clientY: number) => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((clientY - rect.top) / rect.height) * 2 + 1;
      ndcPoint.set(x, y, 0).unproject(camera);
      ndcPoint.z = 0;
      return ndcPoint.clone();
    },
    [camera, gl, ndcPoint],
  );

  useEffect(() => {
    if (
      appStore.activeTool !== "wall" &&
      (startPoint || appStore.drawingWall)
    ) {
      resetDrawing();
    }
  }, [resetDrawing, startPoint, appStore.activeTool, appStore.drawingWall]);

  useEffect(() => {
    const element = gl.domElement;

    const handleKeydown = (e: KeyboardEvent) => {
      if (appStore.activeTool !== "wall") return;
      const key = e.key.toLowerCase();
      if (key === "escape" && startPoint) {
        e.preventDefault();
        resetDrawing();
        return;
      }
      if (key === "x") {
        e.preventDefault();
        setAxisLock((prev) => (prev === "x" ? "none" : "x"));
        return;
      }
      if (key === "y") {
        e.preventDefault();
        setAxisLock((prev) => (prev === "y" ? "none" : "y"));
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (appStore.activeTool !== "wall") return;
      const point = getWorldPoint(e.clientX, e.clientY);
      if (!point) return;

      if (!startPoint) {
        setStartPoint(point.clone());
        appStore.setDrawingWall(new Wall(point.clone(), point.clone()));
        return;
      }

      const constrainedPoint = constrainPoint(point, startPoint);
      if (constrainedPoint.distanceTo(startPoint) < 1e-4) return;
      appStore.addWall(new Wall(startPoint.clone(), constrainedPoint.clone()));
      resetDrawing();
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (
        appStore.activeTool !== "wall" ||
        !startPoint ||
        !appStore.drawingWall
      )
        return;
      const point = getWorldPoint(e.clientX, e.clientY);
      if (!point) return;
      appStore.drawingWall.setEndPoint(constrainPoint(point, startPoint));
    };

    element.addEventListener("click", handleClick);
    window.addEventListener("keydown", handleKeydown);
    element.addEventListener("pointermove", handlePointerMove);
    return () => {
      element.removeEventListener("click", handleClick);
      window.removeEventListener("keydown", handleKeydown);
      element.removeEventListener("pointermove", handlePointerMove);
    };
  }, [axisLock, constrainPoint, getWorldPoint, gl, resetDrawing, startPoint]);

  useEffect(() => {
    if (!startPoint || !appStore.drawingWall) return;
    appStore.drawingWall.setEndPoint(
      constrainPoint(appStore.drawingWall.endPoint, startPoint),
    );
  }, [axisLock, constrainPoint, startPoint]);

  return null;
});
