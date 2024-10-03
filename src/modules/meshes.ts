import * as THREE from "three"
import gsap from "gsap";


import vertex from "../glsl/vertex.glsl";
import fragment from "../glsl/fragment.glsl";

import vertex2 from "../glsl/vertex2.glsl";
import fragment2 from "../glsl/fragment2.glsl";

import vertex3 from "../glsl/vertex3.glsl";
import fragment3 from "../glsl/fragment3.glsl";

import mainVert from "../glsl/main/vertex.glsl";
import mainFrag from "../glsl/main/fragment.glsl";




/*FirstMesh------------------------------------------------------------------------- */
export class FirstMesh {
  private texture: THREE.Texture;
  private index: number;
  private geometry: THREE.PlaneGeometry;
  public material: THREE.ShaderMaterial;
  public mesh: THREE.Mesh;

  constructor(texture: THREE.Texture, index: number) {
    this.texture = texture
    this.index = index
    this.geometry = new THREE.PlaneGeometry(2, 2, 15, 15);
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uTexture: { value: this.texture },
        uProgress: { value: 0 },
        uIndex: { value: this.index }
      },
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.name = `mesh_${this.index}`
  }

}


/*SecondMesh------------------------------------------------------------------ */
export class SecondMesh {
  private texture: THREE.Texture;
  private angle: number;
  private geometry: THREE.PlaneGeometry;
  public material: THREE.ShaderMaterial;
  public mesh: THREE.Mesh;

  constructor(texture: THREE.Texture, angle: number) {
    this.texture = texture;
    this.angle = angle;
    this.geometry = new THREE.PlaneGeometry(2, 2, 15, 15);
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex2,
      fragmentShader: fragment2,
      uniforms: {
        uTexture: { value: this.texture },
        uProgress: { value: 0 },
        uAngle: { value: this.angle }
      }
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.name = `mesh_4`
  }
}


/*ThirdMesh------------------------------------------------------------------ */
export class ThirdMesh {
  private texture: THREE.Texture;
  private angle: number;
  public geometry: THREE.PlaneGeometry;
  public material: THREE.ShaderMaterial;
  public mesh: THREE.Mesh;

  constructor(texture: THREE.Texture, angle: number) {
    this.texture = texture;
    this.angle = angle;
    this.geometry = new THREE.PlaneGeometry(2, 2, 15, 15);
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex3,
      fragmentShader: fragment3,
      uniforms: {
        uTexture: { value: this.texture },
        uProgress: { value: 0 },
        uAngle: { value: this.angle },
        uAspect: { value: new THREE.Vector2(window.innerWidth / window.innerHeight, 1) },
        uZMax: { value: 0 }
      }
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.name = `mesh_5`
  }
}


/*MainMesh------------------------------------------------------------------ */
export class MainMesh {
  private texture: THREE.Texture;
  private texture2: THREE.Texture;
  public geometry: THREE.PlaneGeometry;
  public material: THREE.ShaderMaterial;
  public mesh: THREE.Mesh;

  constructor(texture: THREE.Texture, texture2: THREE.Texture) {
    this.texture = texture;
    this.texture2 = texture2;
    this.geometry = new THREE.PlaneGeometry(2, 2, 15, 15);
    this.material = new THREE.ShaderMaterial({
      vertexShader: mainVert,
      fragmentShader: mainFrag,
      uniforms: {
        uTexture: { value: this.texture },
        uTexture2: { value: this.texture2 },
        uProgress: { value: 0 },
        uAspect: { value: new THREE.Vector2(window.innerWidth / window.innerHeight, 1) },
        uZMax: { value: 0 },
        uMouseWheel: { value: 0 },
        uDisplay: { value: 0 }
      },
      transparent: true
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }
}


/* cursorMesh */
export class CursorMesh {
  private aspectRatio
  private texture
  public index

  private geometry
  private material
  public mesh
  public originalX
  constructor(aspectRatio: number, texture: THREE.Texture, index: number) {
    this.aspectRatio = aspectRatio
    this.texture = texture
    this.index = index
    const geoSize = 0.2;

    this.geometry = new THREE.PlaneGeometry(geoSize * this.aspectRatio * 0.75, geoSize)
    this.material = new THREE.MeshBasicMaterial({ map: this.texture, transparent: true })
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.position.set(0, 0, 0)
    this.mesh.material.opacity = 0;
    this.originalX = 0;
    const MESH_MAX_LENGTH = 4;
    const MARGIN = 0.05;
    const geoWidth = geoSize * this.aspectRatio * 0.75
    const totalWidth = MESH_MAX_LENGTH * geoWidth + (MESH_MAX_LENGTH - 1) * MARGIN;

    // 各メッシュのx座標を計算
    this.originalX = (index * (geoWidth + MARGIN)) - totalWidth / 2 + geoWidth / 2;

    this.mesh.position.set(this.originalX, -0.8, 0)
  }
  public removeOriginalPosition() {
    gsap.to(this.mesh.position, { x: this.originalX, y: -0.8, duration: 0.2 * this.index })
  }
}