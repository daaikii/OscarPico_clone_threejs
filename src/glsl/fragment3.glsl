uniform sampler2D uTexture;
uniform float uProgress;
uniform vec2 uAspect; 
varying vec2 vUv;

void main() {

  vec2 centeredUv = vUv - vec2(0.5, 0.5);   // UV座標を中心に揃える


  float aspectRatioX = uAspect.x / uAspect.y;
  if (aspectRatioX > 1.0) {
    centeredUv.x /= aspectRatioX-(aspectRatioX-1.0)*sqrt(clamp(uProgress,4.0,5.0)-4.0);  // アスペクト比に基づいて横方向をスケール
  }


  centeredUv += vec2(0.5, 0.5);   // 元に戻す

  gl_FragColor = texture2D(uTexture, centeredUv);
}