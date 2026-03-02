import { Canvas } from "@react-three/fiber";
import { OrthographicCamera, Grid, OrbitControls } from "@react-three/drei";
import { observer } from "mobx-react-lite";
import { appStore } from "../store/AppStore";
import { WallMesh } from "./WallMesh";
import { WallEndpoints } from "./WallEndpoints";
import { WallDrawTool } from "./WallDrawTool";
import { DimensionRenderer } from "./DimensionRenderer";
import { DimensionTool } from "./DimensionTool";
import { Dimension } from "../store/Dimension";
import { Perf } from "r3f-perf";
import { Toolbar } from "./UI/Toolbar";
import { LengthModal } from "./UI/LengthModal";
import { InfoOverlay } from "./UI/InfoOverlay";
import { WallCountTweak } from "./UI/WallCountTweak";

const Scene = observer(() => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />

      <Grid
        infiniteGrid
        fadeDistance={50}
        fadeStrength={5}
        cellSize={1}
        sectionColor="#cbd5e1"
        cellColor="black"
        rotation={[Math.PI / 2, 0, 0]}
      />

      <OrbitControls
        enableRotate={false}
        mouseButtons={{ LEFT: undefined, MIDDLE: 1, RIGHT: 2 }}
        onChange={(e) => {
          if (!e) return;
          if (!appStore.showDimensionRenderer) return;
          const zoom = (e.target.object as { zoom?: number }).zoom;
          if (typeof zoom === "number") {
            appStore.setCameraZoom(zoom);
          }
        }}
      />

      {appStore.walls.map((wall) => (
        <group key={wall.id}>
          <WallMesh
            wall={wall}
            isSelected={appStore.selectedWallId === wall.id}
            onPointerDown={(e) => {
              if (appStore.activeTool === "wall") return;
              e.stopPropagation();
              if (
                appStore.activeTool === "select" ||
                appStore.activeTool === "dimension"
              ) {
                appStore.setSelectedWallId(wall.id);
                if (appStore.activeTool === "dimension" && !wall.dimension) {
                  wall.setDimension(new Dimension());
                }
              }
            }}
          />
          {wall.dimension && (
            <DimensionRenderer
              wall={wall}
              showLabel={appStore.showDimensionRenderer}
            />
          )}
          {appStore.selectedWallId === wall.id && <WallEndpoints wall={wall} />}
        </group>
      ))}

      {appStore.drawingWall && (
        <WallMesh wall={appStore.drawingWall} isPreview />
      )}

      <WallDrawTool />
      <DimensionTool />
    </>
  );
});

export const Experience = observer(() => {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#f8fafc",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "16px",
          left: "309px",
          width: "300px",
          lineHeight: "1.2",
          zIndex: 1200,
          background: "rgba(30, 30, 30, 0.85)",
          color: "white",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          borderRadius: "10px",
          padding: "8px 12px",
          fontSize: "22px",
          fontWeight: 600,
          letterSpacing: "0.2px",
          backdropFilter: "blur(8px)",
        }}
      >
        Dimensions with Line and Html from Drei
      </div>
      <Toolbar />
      <WallCountTweak />
      <InfoOverlay />
      <LengthModal />
      <Canvas>
        <OrthographicCamera
          makeDefault
          position={[0, 0, 10]}
          zoom={50}
          near={0.1}
          far={1000}
        />
        <Perf position="top-left" />
        <Scene />
      </Canvas>
    </div>
  );
});
