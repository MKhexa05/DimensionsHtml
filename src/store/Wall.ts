import { makeAutoObservable } from 'mobx';
import * as THREE from 'three';
import { Dimension } from './Dimension';

export class Wall {
  id: string = Math.random().toString(36).substr(2, 9);
  startPoint: THREE.Vector3;
  endPoint: THREE.Vector3;
  thickness: number = 0.2;
  dimension: Dimension | null = null;

  constructor(start: THREE.Vector3, end: THREE.Vector3) {
    this.startPoint = start.clone();
    this.endPoint = end.clone();
    makeAutoObservable(this);
  }

  setStartPoint(point: THREE.Vector3) {
    this.startPoint = point.clone();
  }

  setEndPoint(point: THREE.Vector3) {
    this.endPoint = point.clone();
  }

  setThickness(thickness: number) {
    this.thickness = thickness;
  }

  setDimension(dimension: Dimension | null) {
    this.dimension = dimension;
  }

  get length(): number {
    return this.startPoint.distanceTo(this.endPoint);
  }

  get center(): THREE.Vector3 {
    return new THREE.Vector3()
      .addVectors(this.startPoint, this.endPoint)
      .multiplyScalar(0.5);
  }

  get direction(): THREE.Vector3 {
    return new THREE.Vector3()
      .subVectors(this.endPoint, this.startPoint)
      .normalize();
  }

  get normal(): THREE.Vector3 {
    // Normal in XY plane (2D)
    const dir = this.direction;
    return new THREE.Vector3(-dir.y, dir.x, 0).normalize();
  }

  get angle(): number {
    const dir = this.direction;
    return Math.atan2(dir.y, dir.x);
  }
}
