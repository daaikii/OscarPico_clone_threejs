uniform sampler2D uTexture;
uniform sampler2D uTexture2;
uniform float uProgress;
uniform float uMosaicRatio;
uniform float uAmplitude;
uniform float uDisplay;
uniform float uAspect;
uniform float uBaseAspect;
uniform float uTime;
varying vec2 vUv;


// https://www.shadertoy.com/view/lXfSRf
vec2 waterdrop(vec2 center, float t, vec2 st) {
    vec2 dir = normalize(st-center);
    float d = length(st-center);
    float f = 1.;
    float A = 100.; // amplitude of the peak
    float dur = A/5.; // controls the duration of the wave (higher value = lower duration)
    
    t = mod(t, 4.*dur); // controls the animation loop duration
    float t_disp = t-d*.5;

    return A *
        cos(t_disp*f) * .5*sin(t_disp*f*4.) * .25*sin(t_disp*f*8.) 
            // base wave function, just a sum of sines
        * exp(-t_disp*dur) 
        * smoothstep(0.,.05,t_disp) 
        * normalize(st-center);
}


// ハッシュ関数でランダムな値を生成
float hash(vec2 p) {
    return fract(sin(dot(p ,vec2(12.9898,78.233))) * 43758.5453123);
}


void main() {
  vec2 newUV = vUv;
  newUV.x-=0.5;
  newUV.x /= uBaseAspect;
  
  if (uAspect > 1.0) {
    newUV.x *=uBaseAspect;
  }

  newUV.x+=0.5;

  // モザイクのブロックごとに操作するために、各ブロックの座標を計算
  float mosaicSizeX = 20.0 * uAspect;  // X方向のモザイクブロック数
  float mosaicSizeY = 20.0;            // Y方向のモザイクブロック数
  vec2 blockUV = vec2(floor(newUV.x * mosaicSizeX) / mosaicSizeX, floor(newUV.y * mosaicSizeY) / mosaicSizeY);

  float randomValue = hash(blockUV);
  float blockReturnThreshhold= step(0.5,uMosaicRatio*(0.5+randomValue));
  vec2 finalUV = mix(blockUV,newUV,blockReturnThreshhold);
  
  // 各モザイクブロックの中心座標を計算
  vec2 blockCenterUV = blockUV + vec2(0.5 / mosaicSizeX, 0.5 / mosaicSizeY);
  // 左下からの距離を基に波紋を作成
  float distanceFromCenter = length(blockCenterUV - vec2(0.0));  // 左下からの距離
  float waveFrequency = 1.0;  // 波の周波数（波の幅）
  float scalingFactor = 5.0 / waveFrequency;  // 周波数に応じたスケーリング
  float waveAmplitude = uAmplitude;   // 波の振幅（波の高さ）
  // 時間に応じて広がる波紋
float wave = sin((distanceFromCenter * waveFrequency - uTime*0.2) * scalingFactor) * waveAmplitude + 0.5;

  if (wave > 0.5) {
    finalUV = blockUV;  // 波が閾値を超えたらモザイクブロックのUVに置き換える
  }

  vec2 center = vec2(0.5);  
  vec2 water_disp = waterdrop(center, smoothstep(0.0, 1.0, uProgress), finalUV);
  vec2 uv_water = finalUV - water_disp;

  vec3 texColor2 = texture2D(uTexture2, uv_water).rgb;
  vec3 texColor1 = texture2D(uTexture, finalUV).rgb;

  // エフェクトでtexture1を表示、それまではtexture2を表示
  float effectRadius = smoothstep(0.0, 1.0, uProgress)*2.0;
  float distanceToCenter = length(newUV - vec2(0.5));
  float mixFactor = smoothstep(effectRadius, effectRadius, distanceToCenter);
  vec3 col = mix(texColor2, texColor1, mixFactor);

  gl_FragColor = vec4(col, uDisplay);
}
