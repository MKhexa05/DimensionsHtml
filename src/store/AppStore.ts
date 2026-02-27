import { makeAutoObservable } from "mobx";
import * as THREE from "three";
import { Wall } from "./Wall";
import { Dimension } from "./Dimension";
import type { LockedAxis } from "./Dimension";
import seedWallData from "../data/walls.json";

export type ActiveTool = "select" | "wall" | "dimension";

interface SeedWallRecord {
  centerX: number;
  centerY: number;
  angle: number;
  length: number;
  dimensionOffset: number;
}

class AppStore {
  seedWalls: Wall[] = [];
  userWalls: Wall[] = [];
  visibleSeedWallCount = 0;
  activeTool: ActiveTool = "select";
  selectedWallId: string | null = null;
  drawingWall: Wall | null = null;
  isLengthModalOpen = false;
  lengthModalAxis: LockedAxis = "none";

  constructor() {
    makeAutoObservable(this);
    this.seedWalls = this.createSeedWalls(seedWallData as SeedWallRecord[]);
    this.visibleSeedWallCount = 200;
  }

  private createSeedWalls(seedRecords: SeedWallRecord[]): Wall[] {
    return seedRecords.map((record) => {
      const halfDx = Math.cos(record.angle) * (record.length * 0.5);
      const halfDy = Math.sin(record.angle) * (record.length * 0.5);
      const start = new THREE.Vector3(record.centerX - halfDx, record.centerY - halfDy, 0);
      const end = new THREE.Vector3(record.centerX + halfDx, record.centerY + halfDy, 0);
      const wall = new Wall(start, end);
      const dim = new Dimension();
      dim.offset = record.dimensionOffset;
      wall.setDimension(dim);
      return wall;
    });
  }

  setActiveTool(tool: ActiveTool) {
    this.activeTool = tool;
    if (tool !== "select") {
      this.selectedWallId = null;
    }
    if (tool === "wall") {
      this.closeLengthModal();
    }
  }

  setVisibleSeedWallCount(count: number) {
    const clamped = Math.max(0, Math.min(Math.floor(count), this.seedWalls.length));
    this.visibleSeedWallCount = clamped;
    if (this.selectedWallId && !this.walls.some((wall) => wall.id === this.selectedWallId)) {
      this.selectedWallId = null;
      this.closeLengthModal();
    }
  }

  get maxSeedWallCount(): number {
    return this.seedWalls.length;
  }

  get walls(): Wall[] {
    return [
      ...this.seedWalls.slice(0, this.visibleSeedWallCount),
      ...this.userWalls,
    ];
  }

  addWall(wall: Wall) {
    this.userWalls.push(wall);
  }

  setSelectedWallId(id: string | null) {
    this.selectedWallId = id;
  }

  setDrawingWall(wall: Wall | null) {
    this.drawingWall = wall;
  }

  openLengthModal(wallId: string, axis: LockedAxis = "none") {
    this.selectedWallId = wallId;
    this.lengthModalAxis = axis;
    this.isLengthModalOpen = true;
  }

  closeLengthModal() {
    this.isLengthModalOpen = false;
  }

  get selectedWall(): Wall | undefined {
    return this.walls.find((w) => w.id === this.selectedWallId);
  }

  deleteWall(id: string) {
    this.seedWalls = this.seedWalls.filter((w) => w.id !== id);
    this.userWalls = this.userWalls.filter((w) => w.id !== id);
    if (this.selectedWallId === id) {
      this.selectedWallId = null;
      this.closeLengthModal();
    }
  }
}

export const appStore = new AppStore();
