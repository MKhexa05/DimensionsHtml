import { observer } from "mobx-react-lite";
import { appStore } from "../../store/AppStore";

const SHARED_HINTS = ["S: Select", "W: Draw Wall", "D: Dimension Tool"];

export const InfoOverlay = observer(() => {
  let title = "Select Tool";
  let hints = [
    ...SHARED_HINTS,
    "Click a wall to select it",
    "Drag white endpoint handles to edit wall shape",
  ];

  if (appStore.activeTool === "wall") {
    title = "Wall Drawing";
    hints = [
      ...SHARED_HINTS,
      "Click once to set wall start point",
      "Move pointer to preview rubber wall",
      "Click again to set endpoint and finalize",
      "Press X to lock horizontal, Y to lock vertical",
      "Esc to cancel current wall",
    ];
  } else if (appStore.activeTool === "dimension") {
    title = "Dimension Tool";
    hints = [
      ...SHARED_HINTS,
      "Click a wall to select/add a dimension",
      "Drag dimension line to change offset",
      "Press X for horizontal lock, Y for vertical lock",
      "Press Ctlr to unlock axis",
      "Double-click label to edit length",
    ];
  }

  return (
    <div
      style={{
        position: "absolute",
        left: "16px",
        bottom: "4px",
        zIndex: 1100,
        width: "280px",
        background: "none",
        color: "black",
        // border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "12px",
        // backdropFilter: "blur(8px)",
        // boxShadow: "0 10px 24px rgba(0,0,0,0.25)",
        padding: "12px 14px",
      }}
    >
      <strong style={{ display: "block", marginBottom: "4px" }}>{title}</strong>
      <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px" }}>
        {hints.map((hint) => (
          <li key={hint}>{hint}</li>
        ))}
      </ul>
    </div>
  );
});
