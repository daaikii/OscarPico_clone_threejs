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
  private currentScroll: number

  private settings!: {};
  private gui!: GUI;

  private images: string[];
  private textures: THREE.Texture[]
  private meshes: THREE.Mesh[];
  private mainMesh!: MainMesh;
  private cursorMeshes: CursorMesh[];
  private yellowBoxLine!: THREE.LineSegments;
  private cursorOriginalScale!: number;
  private cursorRaycasterMeshes: THREE.Mesh[];

  private size!: { width: number; height: number };
  private aspectRatio!: number;
  private perspective!: number;
  private fov!: number;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private raycaster: THREE.Raycaster;
  private pointer: THREE.Vector2
  private point: THREE.Vector3
  private renderTarget!: THREE.WebGLRenderTarget
  private finalScene!: THREE.Scene
  private finalCamera!: THREE.OrthographicCamera
  private finalMesh!: THREE.Mesh;
  private meshArea;
  private isHover: boolean;
  private isLoading: boolean;
  private clock: THREE.Clock;
  private isChanging: boolean;

  constructor() {
    this.meshArea = document.getElementById("meshes")
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.scene = new THREE.Scene();
    this.images = [img1, img2, img3, img4];
    this.textures = [];
    this.meshes = [];
    this.cursorMeshes = [];
    this.cursorRaycasterMeshes = [];
    this.indices = [0, 1, 2, 3];
    this.currentScroll = 0;
    this.raycaster = new THREE.Raycaster()
    this.pointer = new THREE.Vector2()
    this.point = new THREE.Vector3()
    this.isHover = false
    this.isLoading = true
    this.clock = new THREE.Clock()
    this.isChanging = false;

    this.setTextures();
    this.setupRenderer();
    this.setupRenderTarget()
    this.createMesh();
    // this.setGUI();
    this.animate();

    this.meshes.forEach((mesh) => {
      this.openingAnimation(mesh)
    })
  }
  private openingAnimation = (mesh: any) => gsap.to(mesh.material.uniforms.uProgress, {
    value: 7.0,
    duration: 7.0,
    onComplete: () => {
      this.removeEntity(this.meshes);
      this.mainMesh.material.uniforms.uDisplay.value = 1.0;
      this.displayCursorMeshes()
      this.mosaicAnimation()
    }
  })
  private displayCursorMeshes = () => this.cursorMeshes.forEach((mesh) => {
    gsap.to(mesh.material, { opacity: 1, duration: 1, })
  })
  private mosaicAnimation = () => {
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
  }





  static get instance() {
    if (!this._instance) {
      this._instance = new Canvas()
    }
    return this._instance;
  }


  // GUI SETTINGS
  // private setGUI(): void {
  //   this.settings = {
  //     progress: 0,
  //     progress2: 0,
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
  //   this.gui.add(this.settings, "progress2", 0, 1., 0.01).onChange((value: number) => {
  //     this.mainMesh.material.uniforms.uMosaicRatio.value = value
  //   })
  // }


  //RENDERER
  private setupRenderer(): void {
    this.perspective = 7;
    this.fov = 50;
    this.setDimension()
    this.camera = new THREE.PerspectiveCamera(this.fov, this.aspectRatio, 0.1, 1000);
    this.camera.position.z = this.perspective;

    this.finalCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.finalCamera.position.z = 1;

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
  private setDimension(): void {
    this.size = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    this.aspectRatio = this.size.width / this.size.height;
  }
  public resize() {
    this.setDimension()
    this.setShaderChunk()

    this.camera.aspect = this.aspectRatio;
    this.camera.updateProjectionMatrix();
    this.finalCamera.updateProjectionMatrix()

    this.renderer.setSize(this.size.width, this.size.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.renderTarget.setSize(this.size.width, this.size.height);

    this.mainMesh.changeAspectRatio(this.aspectRatio);
    this.cursorMeshes.forEach((cursor) => {
      cursor.mesh.scale.x = this.cursorOriginalScale / this.aspectRatio;
      cursor.originalX && cursor.setOriginalPos();
    });
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
  }










  private setShaderChunk() {
    const closeZ = 1.0 / Math.tan((this.camera.fov / 2.0) * Math.PI / 180.0);
    const zMax = this.camera.position.z - closeZ;  //画面サイズになるZの位置
    THREE.ShaderChunk.myCommon = `
    // rotation https://gist.github.com/yiwenl/3f804e80d0930e34a0b33359259b556c
    mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
    }
    vec3 rotate(vec3 v, vec3 axis, float angle) {
      mat4 m = rotationMatrix(axis, angle);
	    return (m * vec4(v, 1.0)).xyz;
    }
    
    //画面サイズになるZの位置
    const float zMax = ${zMax};
    const float PI = 3.14159265359;
    const float baseAspect= 1920. / 1080. ;
    const float  aspectRatio = ${this.aspectRatio}
    `
  }

  //CREATE MESHES
  private createMesh(): void {
    this.setShaderChunk()

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
    this.meshes.push(mesh2.mesh, mesh3.mesh)


    // MAIN MESH
    this.mainMesh = new MainMesh(this.textures[0], this.textures[1], this.aspectRatio)  //メインのメッシュ

    this.scene.add(mesh2.mesh, mesh3.mesh, this.mainMesh.mesh)


    // FINAL MESH
    const finalGeo = new THREE.PlaneGeometry(2 * Math.max(1, this.aspectRatio), 2);
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
    if (this.yellowBoxLine.material instanceof THREE.Material) (this.yellowBoxLine.material as THREE.LineBasicMaterial).opacity = 0;
    this.yellowBoxLine.position.set(0, -0.8, 0)
    this.cursorMeshes.push({ mesh: this.yellowBoxLine } as unknown as CursorMesh)
    this.finalScene.add(this.yellowBoxLine)

    this.cursorOriginalScale = this.aspectRatio;
  }










  //mainMesh変更時
  private changeMainMeshTexture() {
    const uniforms = this.mainMesh.material.uniforms
    this.isChanging = true                                         //アニメーション中は操作できないようにする
    gsap.to(uniforms.uMosaicRatio, { value: 0, duration: 1 })      //全体をモザイク調に変更
    uniforms.uTexture2.value = this.textures[this.indices[0]]      //texture2に新しいテクスチャをセット
    gsap.to(uniforms.uProgress,                                    //波のアニメーション
      {
        value: 1,
        duration: 1,
        onComplete: () => {
          uniforms.uTexture.value = uniforms.uTexture2.value        //アニメーション後、texture2をtextureにセット
          uniforms.uProgress.value = 0;                             //progressをリセット
          gsap.to(uniforms.uMosaicRatio, { value: 1, duration: 1 }) //全体をモザイク調から戻す
          this.isChanging = false                                   //操作可能にする
        }
      })
    this.cursorMeshes.forEach((cursor) => {
      if (!this.isHover) return                                     //idがmeshesを持つhtml要素にhoverしている時のみ動作する
      if (cursor.index === this.indices[0]) {                       //現在選択しているcursorMeshの位置にyellowBoxを移動
        cursor.removeOriginalPosition(this.yellowBoxLine.position)
        return
      }
      cursor.removeOriginalPosition && cursor.removeOriginalPosition(cursor.mesh.position)//cursorMeshesをそれぞれの位置に移動
    })
  }

  private mouseWheelEvent(event: WheelEvent) {
    console.log(this.isChanging)
    if (this.isChanging) return
    const mainMeshUni = (this.mainMesh.mesh.material as THREE.ShaderMaterial).uniforms;
    this.currentScroll += event.deltaY / 2000;
    if (this.currentScroll < -1) {
      this.indices.unshift(this.indices.pop()!);  //次のテクスチャを用意 
      this.changeMainMeshTexture.call(this)
      this.currentScroll = 0;                     //リセット
    } else if (this.currentScroll > 1) {
      this.indices.push(this.indices.shift()!);   //次のテクスチャを用意
      this.changeMainMeshTexture.call(this)
      this.currentScroll = 0;                     //リセット
    }
    mainMeshUni.uScroll.value = this.currentScroll;
  }

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

  private clickEvent() {
    const intersects = this.raycaster.intersectObjects(this.cursorRaycasterMeshes);
    if (intersects.length > 0) {
      if (intersects[0].object) {

        const selectNumber = Number(intersects[0].object.name)
        const index = this.indices.indexOf(selectNumber)
        let removed = this.indices.splice(index, 1)[0];
        this.indices.unshift(removed);

        this.changeMainMeshTexture.call(this)
      }
    }
  }

  private addEventListener() {
    document.addEventListener("wheel", this.mouseWheelEvent.bind(this));
    document.addEventListener("mousemove", this.onPointerMove.bind(this))
    document.addEventListener("click", this.clickEvent.bind(this))
    let resizeTimeout: any = null;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        this.resize.call(this)
      }, 100);
    });
  }

  public enter() {  //要素にホバーしたとき
    this.isHover = true;
    if (!this.isLoading) {
      if (this.yellowBoxLine.material instanceof THREE.LineBasicMaterial) this.yellowBoxLine.material.opacity = 1;
    }
    this.cursorMeshes.forEach((cursor: CursorMesh) => {
      if (cursor.index === this.indices[0]) {   //洗濯しているメッシュの位置にイエローボックスを配置
        cursor.removeOriginalPosition(this.yellowBoxLine.position,)
        return
      }
      cursor.removeOriginalPosition && cursor.removeOriginalPosition(cursor.mesh.position)
    })
  }
  public leave() {  //要素を離れたとき
    this.isHover = false;
    if (this.yellowBoxLine.material instanceof THREE.LineBasicMaterial) this.yellowBoxLine.material.opacity = 0;
  }












  // REMOVE MESHES
  private removeEntity(meshes: THREE.Mesh[]) {
    for (let i = 0; i < meshes.length; i++) {
      var selectedObject = this.scene.getObjectByName(meshes[i].name);
      if (!selectedObject) return //メッシュにnameを設定しているものだけ削除
      this.scene.remove(selectedObject);
    }
  }


  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));

    const elapsedTime = this.clock.getElapsedTime();    // 経過時間を取得

    this.mainMesh.material.uniforms.uTime.value = elapsedTime;// uTimeとuProgressの更新
    this.renderer.setRenderTarget(this.renderTarget);

    // for (let i = 0; i < this.meshes.length; i++) {
    //   const material = this.meshes[i].material;
    //   if (material instanceof THREE.ShaderMaterial) {
    //     material.uniforms.uProgress.value = elapsedTime;
    //   }
    //   if (elapsedTime > 7.0) {      // 7.0秒以降に1～3meshを削除 => mainMeshを表示

    //   }
    // }

    this.renderer.render(this.scene, this.camera);    // Render Targetのレンダリング
    if (this.finalMesh.material instanceof THREE.MeshBasicMaterial) {
      this.finalMesh.material.map = this.renderTarget.texture;
    }
    this.renderer.setRenderTarget(null);

    this.cursorMeshes.forEach((cursor: CursorMesh, index) => {    // カーソルの追従処理
      const mesh = cursor.mesh;
      if (this.isHover && cursor.index !== this.indices[0]) return;
      const delayFactor = 0.1 + index * 0.05;   // メッシュごとに異なる遅延係数
      const targetX = this.point.x + 0.1 * this.aspectRatio * 0.75;
      const targetY = this.point.y + 0.15;
      const deltaX = targetX - mesh.position.x; // 現在の位置と目標位置の差
      const deltaY = targetY - mesh.position.y;
      mesh.position.x += deltaX * delayFactor;  // 慣性をかけながら徐々に目標位置に近づける
      mesh.position.y += deltaY * delayFactor;
      mesh.position.z = 0;
    });

    this.renderer.render(this.finalScene, this.finalCamera);    // 最終レンダリング
  }


}





