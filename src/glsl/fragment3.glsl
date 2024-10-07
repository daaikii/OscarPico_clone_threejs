uniform sampler2D uTexture;
uniform float uProgress;
uniform float  uAspect; 
varying vec2 vUv;

void main() {

  vec2 centeredUv = vUv - vec2(0.5, 0.5);   // UV座標を中心に揃える

  if (uAspect > 1.0) {
    centeredUv.x /= uAspect-(uAspect-1.0)*smoothstep(5.0,6.0,uProgress);  // アスペクト比に基づいて横方向をスケール
  }


  centeredUv += vec2(0.5, 0.5);   // 元に戻す

  gl_FragColor = texture2D(uTexture, centeredUv);
}