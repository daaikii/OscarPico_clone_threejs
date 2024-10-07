import * as THREE from "three";
import GUI from "lil-gui";
import { gsap } from "gsap";

import { FirstMesh, SecondMesh, ThirdMesh, MainMesh, CursorMesh } from "./meshes";
import img1 from "/image4.jpg";
import img2 from "/image1.jpg";
import img3 from "/image2.jpg";
import img4 from "/image3.jpg";




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
  private mainMesh: MainMesh;
  private cursorMeshes: CursorMesh[];
  private cursorRaycasterMeshes: THREE.Mesh[];

  private size: { width: number; height: number };
  private aspectRatio: number;
  private perspective: number;
  private fov: number;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private time: number
  private raycaster: THREE.Raycaster;
  private pointer: THREE.Vector2
  private point: THREE.Vector3
  private wheelEvent;
  private clickEvent;
  private renderTarget: THREE.WebGLRenderTarget
  private finalScene: THREE.Scene
  private finalCamera: THREE.OrthographicCamera
  private finalMesh;
  private yellowBoxLine;
  private meshArea;
  private isHover: boolean;
  private isLoading: boolean;

  constructor() {
    this.meshArea = document.getElementById("meshes")
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.scene = new THREE.Scene();
    this.images = [img1, img2, img3, img4];
    this.textures = [];
    this.meshes = [];
    this.cursorMeshes = [];
    this.cursorRaycasterMeshes = [];
    this.time = 0;
    this.indices = [0, 1, 2, 3];
    this.uMouseWheel = 0;
    this.raycaster = new THREE.Raycaster()
    this.pointer = new THREE.Vector2()
    this.point = new THREE.Vector3()
    this.wheelEvent = this.mouseWheelEvent.bind(this)
    this.clickEvent = this.onClick.bind(this)
    this.isHover = false
    this.isLoading = true

    this.setTextures();
    this.setupRenderer();
    this.resize();
    this.setupRenderTarget()
    this.createMesh();
    this.setGUI();
    this.animate();

    setTimeout(() => {
      this.cursorMeshes.forEach((mesh) => {
        gsap.to(mesh.material, { opacity: 1, duration: 1, })
      })
      gsap.to(this.mainMesh.material.uniforms.uMosaicRatio, {
        value: 0,
        duration: 1,
        onComplete: () => {
          gsap.to(this.mainMesh.material.uniforms.uMosaicRatio, {
            value: 1,
            duration: 1,
          })
          gsap.to(this.mainMesh.material.uniforms.uAmplitude, {
            value: 1,
            duration: 1,
          })
          this.addEventListener()
        }
      })
      this.isLoading = false
    }, 10000)
  }


  static get instance() {
    if (!this._instance) {
      this._instance = new Canvas()
    }
    return this._instance;
  }


  // GUI SETTINGS
  private setGUI(): void {
    this.settings = {
      progress: 0,
      progress2: 0,
    }
    this.gui = new GUI()
    // this.gui.add(this.settings, "progress", 0, 5.1, 0.01).onChange((value: number) => {
    //   for (let i = 0; i < this.meshes.length; i++) {
    //     if (!this.meshes[i].material) return
    //     this.meshes[i].material.uniforms.uProgress.value = value;

    //     //5.0以降に1～3meshを削除+mainMeshを表示
    //     if (value > 5.0) {
    //       for (let i = 0; i < this.meshes.length; i++) {
    //         this.removeEntity(this.meshes[i])
    //         this.mainMesh.material.uniforms.uDisplay.value = 1.0;
    //       }
    //     }
    //   }
    // })
    this.gui.add(this.settings, "progress2", 0, 1., 0.01).onChange((value: number) => {
      this.mainMesh.material.uniforms.uMosaicRatio.value = value
    })
  }


  //RENDERER
  private setupRenderer(): void {
    this.perspective = 7;
    this.fov = 50;
    this.setDimension()
    this.camera = new THREE.PerspectiveCamera(this.fov, this.aspectRatio, 0.1, 1000);
    this.camera.position.z = this.perspective;
    this.scene.background = new THREE.Color(0xF7F5F2);
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


  private setupRenderTarget() {
    this.renderTarget = new THREE.WebGLRenderTarget(this.size.width, this.size.height)
    this.finalCamera = new THREE.OrthographicCamera(-this.aspectRatio, this.aspectRatio, 1, -1, 0.1, 1000)
    this.finalCamera.position.set(0, 0, 5);
  }











  //CREATE MESHES
  private createMesh(): void {
    const closeZ = 1.0 / Math.tan((this.camera.fov / 2.0) * Math.PI / 180.0);
    const uZMax = this.camera.position.z - closeZ;  //画面サイズになるZの位置


    //MESH1
    for (let i = 0; i < this.images.length; i++) {
      const mesh = new FirstMesh(this.textures[i], i);  //拡大する最初の4つのメッシュ
      this.scene.add(mesh.mesh)
      this.meshes.push(mesh.mesh);
    }


    // MESH 2
    const mesh2 = new SecondMesh(this.textures[1], Math.PI / 2);  //回転して表示されるメッシュ
    // MESH 3
    const mesh3 = new ThirdMesh(this.textures[0], Math.PI, this.aspectRatio); //2×2から画面サイズに拡大されるメッシュ
    mesh3.material.uniforms.uZMax.value = uZMax;
    this.meshes.push(mesh2.mesh, mesh3.mesh)


    // MAIN MESH
    this.mainMesh = new MainMesh(this.textures[0], this.textures[1], this.aspectRatio)  //メインのメッシュ
    this.mainMesh.material.uniforms.uZMax.value = uZMax;

    this.scene.add(mesh2.mesh, mesh3.mesh, this.mainMesh.mesh)


    // FINAL MESH
    const finalGeo = new THREE.PlaneGeometry(2 * this.aspectRatio, 2);
    const finalMat = new THREE.MeshBasicMaterial({
      map: this.renderTarget.texture,
    })
    this.finalMesh = new THREE.Mesh(finalGeo, finalMat)
    this.finalScene = new THREE.Scene()
    this.finalScene.add(this.finalMesh)


    //CURSOR MESH
    this.cursorMeshes = this.textures.map((texture, index) => {
      const cursorMesh = new CursorMesh(texture, index)
      this.finalScene.add(cursorMesh.mesh)
      this.cursorRaycasterMeshes.push(cursorMesh.mesh)
      return cursorMesh
    })


    // YELLOW BOX
    const yellowBoxEdge = new THREE.EdgesGeometry(this.cursorMeshes[0].mesh.geometry)
    this.yellowBoxLine = new THREE.LineSegments(yellowBoxEdge, new THREE.LineBasicMaterial({ color: 0xD7DC05, transparent: true }))
    this.yellowBoxLine.material.opacity = 0;
    this.yellowBoxLine.position.set(0, -0.8, 0)
    this.cursorMeshes.push({ mesh: this.yellowBoxLine } as CursorMesh)
    this.finalScene.add(this.yellowBoxLine)
  }





  //mainMesh変更時
  private changeMainMeshTexture(
    { removeEvent, addEvent }
      : { removeEvent: () => void, addEvent: () => void }
  ) {
    const uniforms = this.mainMesh.material.uniforms
    //クリックイベントの削除
    removeEvent.bind(this)
    //全体にモザイクエフェクト
    gsap.to(uniforms.uMosaicRatio, { value: 0, duration: 1 })
    //texture2に新しいテクスチャをセット
    uniforms.uTexture2.value = this.textures[this.indices[0]]
    //波のアニメーション
    gsap.to(uniforms.uProgress,
      {
        value: 1,
        duration: 1,
        onComplete: () => {
          uniforms.uTexture.value = uniforms.uTexture2.value
          uniforms.uProgress.value = 0;
          gsap.to(uniforms.uMosaicRatio, { value: 1, duration: 1 })
          addEvent.bind(this)
        }
      })
    this.resetCursorMeshPos()
  }


  //メッシュ選択範囲にホバー時のみ動作
  //カーソルメッシュとイエローボックスの動作を決める
  private resetCursorMeshPos() {
    this.cursorMeshes.forEach((cursor,) => {
      if (!this.isHover) return
      if (cursor.index === this.indices[0]) {
        gsap.to(this.yellowBoxLine.position, { x: cursor.originalX, y: -0.8, duration: 0.5 })
        return
      }
      cursor.removeOriginalPosition && cursor.removeOriginalPosition()
    })
  }


  private mouseWheelEvent(event: WheelEvent) {
    const mainMeshUni = this.mainMesh.mesh.material.uniforms;
    this.uMouseWheel += event.deltaY / 2000;

    if (this.uMouseWheel < -1) {
      //次のテクスチャを用意 
      this.indices.unshift(this.indices.pop()!);

      this.changeMainMeshTexture({
        removeEvent: this.removeWheelEventListener,
        addEvent: this.addWheelEventListener
      })

      //リセット
      this.uMouseWheel = 0;

    } else if (this.uMouseWheel > 1) {
      //次のテクスチャを用意
      this.indices.push(this.indices.shift()!);

      this.changeMainMeshTexture({
        removeEvent: this.removeWheelEventListener,
        addEvent: this.addWheelEventListener
      })

      //リセット
      this.uMouseWheel = 0;
    }

    mainMeshUni.uMouseWheel.value = this.uMouseWheel;
  }


  //cursor
  private onPointerMove(e: MouseEvent) {
    this.pointer.x = (e.clientX / this.size.width) * 2 - 1;
    this.pointer.y = -(e.clientY / this.size.height) * 2 + 1;
    this.raycaster.setFromCamera(this.pointer, this.finalCamera);
    const intersects = this.raycaster.intersectObject(this.finalMesh);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      this.point.copy(point)
    }

    if (!this.isHover) return
    const intersects2 = this.raycaster.intersectObjects(this.cursorRaycasterMeshes)
    if (intersects2.length > 0) {
      this.meshArea?.classList.add("hover")
      return
    }
    this.meshArea?.classList.remove("hover")
  }


  private onClick() {
    if (!this.isHover) return
    const geoSize = 0.2;
    const MESH_MAX_LENGTH = 4;
    const MARGIN = 0.05;
    const geoWidth = geoSize * this.aspectRatio * 0.75
    const totalWidth = MESH_MAX_LENGTH * geoWidth + (MESH_MAX_LENGTH - 1) * MARGIN;

    const intersects = this.raycaster.intersectObjects(this.cursorRaycasterMeshes);
    if (intersects.length > 0) {
      const selectMeshNumber = (intersects[0].object.position.x + totalWidth / 2 - geoWidth / 2) / (geoWidth + MARGIN);
      let index = this.indices.indexOf(Math.round(selectMeshNumber));
      let removed = this.indices.splice(index)
      this.indices.unshift(...removed);

      this.changeMainMeshTexture({
        removeEvent: this.removeClickEventListener,
        addEvent: this.addClickEventListener
      })

    }
  }


  //メインメッシュでのみ使用するイベント
  private addEventListener() {
    document.addEventListener("wheel", this.wheelEvent);
    document.addEventListener("mousemove", this.onPointerMove.bind(this))
    document.addEventListener("click", this.clickEvent)
  }
  private removeWheelEventListener() {
    document.removeEventListener("wheel", this.wheelEvent);
  }
  private addWheelEventListener() {
    document.addEventListener("wheel", this.wheelEvent);
  }
  private removeClickEventListener() {
    document.removeEventListener("click", this.clickEvent);
  }
  private addClickEventListener() {
    document.addEventListener("click", this.clickEvent);
  }



  //要素にホバーしたとき
  public enter() {
    this.isHover = true;
    if (!this.isLoading) {
      this.yellowBoxLine.material.opacity = 1;
    }
    this.cursorMeshes.forEach((cursor: CursorMesh) => {
      if (cursor.index === this.indices[0]) {   //洗濯しているメッシュの位置にイエローボックスを配置
        gsap.to(this.yellowBoxLine.position, { x: cursor.originalX, y: -0.8, duration: 0.2 })
        return
      }
      cursor.removeOriginalPosition && cursor.removeOriginalPosition()
    })
  }
  //要素を離れたとき
  public leave() {
    this.isHover = false;
    this.yellowBoxLine.material.opacity = 0;
  }












  // REMOVE MESHES
  private removeEntity(meshes: THREE.Mesh[]) {
    for (let i = 0; i < meshes.length; i++) {
      var selectedObject = this.scene.getObjectByName(meshes[i].name);
      if (!selectedObject) return //メッシュにnameを設定しているものだけ削除
      this.scene.remove(selectedObject);
    }
  }


  // ANIMATION
  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));
    this.mainMesh.material.uniforms.uTime.value = this.time

    this.renderer.setRenderTarget(this.renderTarget)
    for (let i = 0; i < this.meshes.length; i++) {
      this.meshes[i].material.uniforms.uProgress.value = this.time;
      // 10.0以降に1～3meshを削除 + mainMeshを表示
      if (this.time > 10.0) {
        this.removeEntity(this.meshes)
        this.mainMesh.material.uniforms.uDisplay.value = 1.0;
      }
    }

    // RT
    this.renderer.render(this.scene, this.camera);
    this.finalMesh.material.map = this.renderTarget.texture;
    this.renderer.setRenderTarget(null)

    // カーソルの追従処理
    this.cursorMeshes.forEach((cursor: CursorMesh, index) => {
      const mesh = cursor.mesh
      if (this.isHover && cursor.index !== this.indices[0]) return
      const delayFactor = 0.1 + index * 0.05; // メッシュごとに異なる遅延係数
      const targetX = this.point.x + 0.11 * this.aspectRatio * 0.75;
      const targetY = this.point.y + 0.11;
      // 現在の位置と目標位置の差
      const deltaX = targetX - mesh.position.x;
      const deltaY = targetY - mesh.position.y;
      // 慣性をかけながら徐々に目標位置に近づける
      mesh.position.x += deltaX * delayFactor;
      mesh.position.y += deltaY * delayFactor;
      mesh.position.z = 0; // z軸の調整
    });

    // final render
    this.renderer.render(this.finalScene, this.finalCamera)
    this.time += 0.03;
  }


}





