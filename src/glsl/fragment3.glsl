uniform sampler2D uTexture;
uniform float uProgress;
uniform vec2 uAspect; // アスペクト比
varying vec2 vUv;

void main() {
  // UV座標を中心に揃える
  vec2 centeredUv = vUv - vec2(0.5, 0.5);
  float aspectRatioX = uAspect.x / uAspect.y;

  // アスペクト比に基づいて横方向をスケール
  if (aspectRatioX > 1.0) {
    centeredUv.x /= aspectRatioX-(aspectRatioX-1.0)*sqrt(clamp(uProgress,4.0,5.0)-4.0);
  }

  // 中心に揃え直す
  centeredUv += vec2(0.5, 0.5);

  gl_FragColor = texture2D(uTexture, centeredUv);
}