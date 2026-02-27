# Dimensions

Interactive 2D wall and dimension editor built with React, Three.js, and MobX.

## Tech Stack
- React 19 + TypeScript
- Vite
- `@react-three/fiber` + `@react-three/drei`
- MobX (`mobx`, `mobx-react-lite`)

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```
4. Preview production build:
   ```bash
   npm run preview
   ```

## Controls
- `S`: Select tool
- `W`: Wall draw tool
- `D`: Dimension tool
- `Esc` (while drawing wall): Cancel current in-progress wall

## Project Flow
### 1. Global state (MobX)
- `src/store/AppStore.ts`
  - Tracks active tool, wall list, selected wall, drawing preview wall, and length modal state.
- `src/store/Wall.ts`
  - Wall geometry model (`startPoint`, `endPoint`, `length`, `angle`, `normal`, etc.).
- `src/store/Dimension.ts`
  - Dimension settings (`offset`, locked axis: `none | x | y`).

### 2. Scene composition
- `src/components/Experience.tsx`
  - Renders grid, all walls, preview wall, endpoints, dimensions, and tool logic components.

### 3. Wall drawing lifecycle
- `src/components/WallDrawTool.tsx`
  - First click sets wall start point.
  - Mouse move updates rubber-band preview wall.
  - Second click sets endpoint and commits final wall.

### 4. Wall editing
- `src/components/WallEndpoints.tsx`
  - Drag white endpoint handles to update wall start/end points directly.

### 5. Dimension workflow
- `src/components/DimensionRenderer.tsx`
  - Draws dimension line, extension lines, and label.
  - Drag dimension line to offset it.
  - Double-click label to open length modal.
- `src/components/DimensionTool.tsx`
  - `X` toggles horizontal lock.
  - `Y` toggles vertical lock.

### 6. Length editing modal
- `src/components/UI/LengthModal.tsx`
  - Opens from dimension label double-click.
  - If axis is `none`: edits actual wall length.
  - If axis is `x`: edits horizontal projection length.
  - If axis is `y`: edits vertical projection length.

## Usage Guide
### Draw a wall
1. Press `W`.
2. Click once to set start point.
3. Move pointer to preview rubber wall.
4. Click again to finalize.

### Add dimension
1. Press `D`.
2. Click a wall to select/add its dimension.
3. Drag dimension line to move its offset.
4. Press `X` or `Y` to lock axis if needed.
5. Double-click dimension label to edit length numerically.

### Edit wall endpoints
1. Press `S` (or stay with selected wall visible).
2. Select wall.
3. Drag white endpoint handles.

## Notes
- Coordinate plane is XY (`z = 0`).
- Length label formatting uses feet/inch style via `src/utils/dimensionUtils.ts`.
