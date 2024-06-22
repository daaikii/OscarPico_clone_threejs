import * as THREE from "three";
import GUI from "lil-gui";
import { gsap } from "gsap";


import img1 from "/image1.jpg";
import img2 from "/image2.jpg";
import img3 from "/image3.jpg";
import img4 from "/image4.jpg";

import vertex from "../glsl/vertex.glsl";
import vertex2 from "../glsl/vertex2.glsl";
import vertex3 from "../glsl/vertex3.glsl";
import vertex4 from "../glsl/vertex4.glsl";

import fragment from "../glsl/fragment.glsl";
import fragment2 from "../glsl/fragment2.glsl";
import fragment3 from "../glsl/fragment3.glsl";
import fragment4 from "../glsl/fragment4.glsl";



export default class Canvas {
  private static _instance: Canvas | null;
  private canvas: HTMLCanvasElement | null;
  private scene: THREE.Scene;

  private indices: number[]
  private uMouseWheel: number

  private settings: {};
  private gui: GUI;

  private images: string[];
  private textures: THREE.Texture[]
  private meshes: THREE.Mesh[];
  private mainMesh: FourthMesh;

  private size: { width: number; height: number };
  private aspectRatio: number;
  private perspective: number;
  private fov: number;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  constructor() {
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.scene = new THREE.Scene();
    this.images = [img1, img2, img3, img4];
    this.textures = [];
    this.meshes = [];

    this.setDimension();
    this.setTextures();
    this.setupRenderer();
    this.resize();
    this.createMesh();
    // this.setGUI();
    this.addEventListener()
    this.animate();
  }


  static get instance() {
    if (!this._instance) {
      this._instance = new Canvas()
    }
    return this._instance;
  }


  //メインメッシュでのみ使用するイベント
  private addEventListener() {
    this.indices = [0, 1, 2, 3]
    this.uMouseWheel = 0;
    document.addEventListener("wheel", this.mouseWheelEvent.bind(this))
  }

  private removeWheelEventListener() {
    document.removeEventListener("wheel", this.mouseWheelEvent);
  }

  private addWheelEventListener() {
    document.addEventListener("wheel", this.mouseWheelEvent);
  }

  private mouseWheelEvent(event) {
    const mainMeshUni = this.mainMesh.material.uniforms
    this.uMouseWheel += event.deltaY / 2000;


    if (this.uMouseWheel < -1) {
      this.removeWheelEventListener()
      this.indices.unshift(this.indices.pop()!) //前のテクスチャを用意

      mainMeshUni.uTexture2.value = this.textures[this.indices[0]];  //アニメーション[前]  テクスチャ2をセット 

      //アニメーション
      gsap.to(mainMeshUni.uProgress, {
        value: 1, duration: 2, onComplete: () => {
          mainMeshUni.uTexture.value = mainMeshUni.uTexture2.value; //アニメーション[後]  テクスチャ2をテクスチャ1に変更
          mainMeshUni.uProgress.value = 0;  //進行をリセット
        }
      });
      this.uMouseWheel = 0;  //リセット
    }

    if (this.uMouseWheel > 1) {
      this.removeWheelEventListener()
      this.indices.push(this.indices.shift()!)  //次のテクスチャを用意
      mainMeshUni.uTexture2.value = this.textures[this.indices[0]] //アニメーション[前]  テクスチャ2をセット

      //アニメーション
      gsap.to(mainMeshUni.uProgress, {
        value: 1, duration: 2, onComplete: () => {
          mainMeshUni.uTexture.value = mainMeshUni.uTexture2.value; //アニメーション[後]  テクスチャ2をテクスチャ1に変更
          mainMeshUni.uProgress.value = 0;  //進行をリセット
        }
      });
      this.uMouseWheel = 0;  //リセット
    }

    mainMeshUni.uMouseWheel.value = this.uMouseWheel;

  }


  private setDimension(): void {
    this.size = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    this.aspectRatio = this.size.width / this.size.height;
  }


  // SET TEXTURE
  private setTextures(): void {
    const loader = new THREE.TextureLoader();
    for (let i = 0; i < this.images.length; i++) {
      const texture = loader.load(this.images[i]);
      this.textures.push(texture);
    }
  }


  // REMOVE MESHES
  private removeEntity(object) {
    var selectedObject = this.scene.getObjectByName(object.name);
    if (!selectedObject) return //メッシュにnameを設定しているものだけ削除
    this.scene.remove(selectedObject);
  }


  // GUI SETTINGS
  // private setGUI(): void {
  //   this.settings = {
  //     progress: 0
  //   }
  //   this.gui = new GUI()
  //   this.gui.add(this.settings, "progress", 0, 5.1, 0.01).onChange((value: number) => {
  //     for (let i = 0; i < this.meshes.length; i++) {
  //       if (!this.meshes[i].material) return
  //       this.meshes[i].material.uniforms.uProgress.value = value;

  //       //5.0以降に1～3meshを削除+mainMeshを表示
  //       if (value > 5.0) {
  //         for (let i = 0; i < this.meshes.length; i++) {
  //           this.removeEntity(this.meshes[i])
  //           this.mainMesh.material.uniforms.uDisplay.value = 1.0;
  //         }
  //       }
  //     }
  //   })
  // }


  //RENDERER
  private setupRenderer(): void {
    this.perspective = 7;
    this.fov = 50;
    this.camera = new THREE.PerspectiveCamera(this.fov, this.aspectRatio, 0.1, 1000);
    this.camera.position.z = this.perspective;
    this.scene.add(this.camera);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas!,
      alpha: true,
      antialias: true,
    });
    this.renderer.setSize(this.size.width, this.size.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }


  //RESIZE
  private resize(): void {
    window.addEventListener("resize", () => {
      this.setDimension();
      this.camera.aspect = this.aspectRatio;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(this.size.width, this.size.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }


  //CREATE MESHES
  private createMesh(): void {
    for (let i = 0; i < this.images.length; i++) {
      const mesh = new FirstMesh(this.textures[i], i);  //拡大する最初の4つのメッシュ
      this.scene.add(mesh.mesh)
      this.meshes.push(mesh.mesh);
    }

    const mesh2 = new SecondMesh(this.textures[1], Math.PI / 2);  //回転して表示されるメッシュ

    const mesh3 = new ThirdMesh(this.textures[0], Math.PI); //2×2から画面サイズに拡大されるメッシュ
    const closeZ = 1.0 / Math.tan((this.camera.fov / 2.0) * Math.PI / 180.0); //画面サイズに拡大するため
    const uZMax = new THREE.Uniform(this.camera.position.z - closeZ);
    mesh3.material.uniforms.uZMax = uZMax;

    this.scene.add(mesh2.mesh, mesh3.mesh)
    this.meshes.push(mesh2.mesh, mesh3.mesh)

    const mesh4 = new FourthMesh(this.textures[0], this.textures[1])  //メインのメッシュ
    mesh4.material.uniforms.uZMax = uZMax;
    this.scene.add(mesh4.mesh)
    this.mainMesh = mesh4
  }

  progress = 0;
  clock = new THREE.Clock()
  // ANIMATION
  private animate(): void {
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.animate.bind(this));
    for (let i = 0; i < this.meshes.length; i++) {
      if (!this.meshes[i].material) return
      this.meshes[i].material.uniforms.uProgress.value = this.progress;

      //5.0以降に1～3meshを削除+mainMeshを表示
      if (this.progress > 5.0) {
        for (let i = 0; i < this.meshes.length; i++) {
          this.removeEntity(this.meshes[i])
          this.mainMesh.material.uniforms.uDisplay.value = 1.0;
        }
      }
    }
    this.progress += this.clock.getElapsedTime() / 1000;
  }
}








/*FirstMesh------------------------------------------------------------------------- */
class FirstMesh {
  private texture: THREE.Texture;
  private index: number;
  private geometry: THREE.PlaneGeometry;
  public material: THREE.ShaderMaterial;
  public mesh: THREE.Mesh;

  constructor(texture: THREE.Texture, index: number) {
    this.texture = texture
    this.index = index
    this.createMesh();
  }

  private createMesh(): void {
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

  public update(value: number): void {
    this.material.uniforms.uProgress.value = value;
  }
}


/*SecondMesh------------------------------------------------------------------ */
class SecondMesh {
  private texture: THREE.Texture;
  private angle: number;
  private geometry: THREE.PlaneGeometry;
  public material: THREE.ShaderMaterial;
  public mesh: THREE.Mesh;

  constructor(texture: THREE.Texture, angle: number) {
    this.texture = texture;
    this.angle = angle;

    this.createMesh();
  }

  private createMesh(): void {
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

  public update(value: number): void {
    this.material.uniforms.uProgress.value = value;
  }
}


/*ThirdMesh------------------------------------------------------------------ */
class ThirdMesh {
  private texture: THREE.Texture;
  private angle: number;
  public geometry: THREE.PlaneGeometry;
  public material: THREE.ShaderMaterial;
  public mesh: THREE.Mesh;

  constructor(texture: THREE.Texture, angle: number) {
    this.texture = texture;
    this.angle = angle;

    this.createMesh();
  }

  private createMesh(): void {
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

  public update(value: number): void {
    this.material.uniforms.uProgress.value = value;
  }
}


/*FourthMesh------------------------------------------------------------------ */
class FourthMesh {
  private texture: THREE.Texture;
  private texture2: THREE.Texture;
  public geometry: THREE.PlaneGeometry;
  public material: THREE.ShaderMaterial;
  public mesh: THREE.Mesh;

  constructor(texture: THREE.Texture, texture2: THREE.Texture) {
    this.texture = texture;
    this.texture2 = texture2;

    this.createMesh();
  }

  private createMesh(): void {
    this.geometry = new THREE.PlaneGeometry(2, 2, 15, 15);
    this.material = new THREE.ShaderMaterial({
      vertexShader: vertex4,
      fragmentShader: fragment4,
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

  public update(value: number): void {
    this.material.uniforms.uProgress.value = value;
  }
}