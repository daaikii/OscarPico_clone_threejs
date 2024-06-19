uniform sampler2D uTexture;
uniform float uProgress;
uniform vec2 uAspect; // アスペクト比
varying vec2 vUv;

void main() {
  gl_FragColor = texture2D(uTexture, vUv);
}