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
  private aspectRatio: number

  public geometry: THREE.PlaneGeometry;
  public material: THREE.ShaderMaterial;
  public mesh: THREE.Mesh;
  constructor(texture: THREE.Texture, angle: number, aspectRatio: number) {
    this.texture = texture;
    this.angle = angle;
    this.aspectRatio = aspectRatio

    this.geometry = new THREE.PlaneGeometry(2, 2, 15, 15);
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex3,
      fragmentShader: fragment3,
      uniforms: {
        uTexture: { value: this.texture },
        uProgress: { value: 0 },
        uAngle: { value: this.angle },
        uAspect: { value: this.aspectRatio },
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
  private aspectRatio

  public geometry: THREE.PlaneGeometry;
  public material: THREE.ShaderMaterial;
  public mesh: THREE.Mesh;

  constructor(texture: THREE.Texture, texture2: THREE.Texture, aspectRatio: number) {
    this.texture = texture;
    this.texture2 = texture2;
    this.aspectRatio = aspectRatio

    this.geometry = new THREE.PlaneGeometry(2, 2, 15, 15);
    this.material = new THREE.ShaderMaterial({
      vertexShader: mainVert,
      fragmentShader: mainFrag,
      uniforms: {
        uTexture: { value: this.texture },
        uTexture2: { value: this.texture2 },
        uProgress: { value: 0 },
        uMosaicRatio: { value: 1 },
        uAmplitude: { value: 0 },
        uAspect: { value: this.aspectRatio },
        uScroll: { value: 0 },
        uDisplay: { value: 0 },
        uTime: { value: 0 }
      },
      transparent: true
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  public changeAspectRatio(aspect: number) {
    this.material.uniforms.uAspect.value = aspect;
  }
}


/* cursorMesh */
export class CursorMesh {
  private texture
  public index

  private geometry
  public material
  public mesh
  public originalX: number = 0;
  public originalY: number = 0;

  private BASE_ASPECT = 1920 / 1080;
  private GEO_SIZE: number = 0.2;
  private MESH_MAX_LENGTH: number = 4;
  private MARGIN: number = 0.1;
  private GEO_WIDTH: number = this.GEO_SIZE * this.BASE_ASPECT
  private TOTAL_WIDTH: number = this.MESH_MAX_LENGTH * this.GEO_WIDTH + (this.MESH_MAX_LENGTH - 1) * this.MARGIN;

  constructor(texture: THREE.Texture, index: number) {
    this.texture = texture
    this.index = index

    this.geometry = new THREE.PlaneGeometry(this.GEO_SIZE, this.GEO_SIZE)
    this.material = new THREE.MeshBasicMaterial({ map: this.texture, transparent: true })
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.mesh.position.set(0, 0, 0)
    this.mesh.material.opacity = 0;
    this.mesh.name = `${index}`

    this.setOriginalPos()
    this.mesh.position.set(this.originalX!, this.originalY!, 0)
  }

  public setOriginalPos() {
    this.originalX = 0.8;
    this.originalY = (this.index * (this.GEO_WIDTH + this.MARGIN)) - this.TOTAL_WIDTH / 2 + this.GEO_WIDTH / 2;
    // // 各メッシュのx座標を計算
    if (window.innerWidth > 1000) {
      this.originalX = (this.index * (this.GEO_WIDTH + this.MARGIN)) - this.TOTAL_WIDTH / 2 + this.GEO_WIDTH / 2;
      this.originalY = -0.8;
    }
  }

  public removeOriginalPosition(meshPosition: THREE.Vector3) {
    gsap.to(meshPosition, { x: this.originalX, y: this.originalY, duration: 0.2 * this.index })
  }
}