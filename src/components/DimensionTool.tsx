import { observer } from "mobx-react-lite";
import { appStore } from "../store/AppStore";
import { useEffect } from "react";

export const DimensionTool = observer(() => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (appStore.activeTool !== "dimension") return;
      const key = e.key.toLowerCase();

      const selectedWall = appStore.selectedWall;
      if (!selectedWall || !selectedWall.dimension) return;

      if (key === "x") {
        selectedWall.dimension.setLockedAxis(
          selectedWall.dimension.lockedAxis === "x" ? "none" : "x",
        );
      } else if (key === "y") {
        selectedWall.dimension.setLockedAxis(
          selectedWall.dimension.lockedAxis === "y" ? "none" : "y",
        );
      } else if (e.ctrlKey) {
        selectedWall.dimension.setLockedAxis("none");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null; // Logic only tool
});
