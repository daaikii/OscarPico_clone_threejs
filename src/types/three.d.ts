// src/types/three.d.ts

import 'three';

declare module 'three' {
  namespace ShaderChunk {
    let myCommon: string; // 追加するカスタムプロパティ
  }
}
