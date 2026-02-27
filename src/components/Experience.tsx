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

      {/* Infinite Grid on XY Plane */}
      <Grid
        infiniteGrid
        fadeDistance={50}
        fadeStrength={5}
        cellSize={1}
        // sectionSize={12}
        // sectionThickness={1.5}
        sectionColor="#cbd5e1"
        cellColor="black"
        rotation={[Math.PI / 2, 0, 0]}
      />

      <OrbitControls
        enableRotate={false}
        mouseButtons={{ LEFT: undefined, MIDDLE: 1, RIGHT: 2 }}
      />

      {/* Render existing walls */}
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
          {wall.dimension && <DimensionRenderer wall={wall} />}
          {appStore.selectedWallId === wall.id && <WallEndpoints wall={wall} />}
        </group>
      ))}

      {/* Render rubber-band wall */}
      {appStore.drawingWall && (
        <WallMesh wall={appStore.drawingWall} isPreview />
      )}

      {/* Drawing & Dimension Tool Logic */}
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
