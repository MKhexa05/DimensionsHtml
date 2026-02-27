import { observer } from "mobx-react-lite";
import { appStore } from "../../store/AppStore";

export const WallCountTweak = observer(() => {
  const max = appStore.maxSeedWallCount;
  if (max === 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        right: "16px",
        top: "16px",
        zIndex: 1200,
        minWidth: "260px",
        background: "rgba(30, 30, 30, 0.85)",
        color: "white",
        border: "1px solid rgba(255, 255, 255, 0.15)",
        borderRadius: "12px",
        padding: "10px 12px",
        backdropFilter: "blur(8px)",
      }}
    >
      <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "6px" }}>
        Seed Walls
      </div>
      <div style={{ fontWeight: 600, marginBottom: "8px" }}>
        {appStore.visibleSeedWallCount} / {max}
      </div>
      <input
        type="range"
        min={0}
        max={max}
        step={50}
        value={appStore.visibleSeedWallCount}
        onChange={(e) => appStore.setVisibleSeedWallCount(Number(e.target.value))}
        onPointerUp={(e) => (e.currentTarget as HTMLInputElement).blur()}
        style={{ width: "100%" }}
      />
    </div>
  );
});
