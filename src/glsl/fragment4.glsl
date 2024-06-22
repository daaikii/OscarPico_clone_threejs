uniform sampler2D uTexture;
uniform sampler2D uTexture2;
uniform float uProgress;
uniform float uDisplay;

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




void main() {
  vec2 center = vec2(0.5);
  vec2 water_disp = waterdrop(center,smoothstep(0.0,1.0,uProgress),vUv);
  vec2 uv_water = vUv-water_disp;

  vec3 texColor2 = texture2D(uTexture2,uv_water).rgb;
  vec3 texColor1 = texture2D(uTexture,vUv).rgb;

  // エフェクトでtexture1を表示、それまではtexture2を表示
  float effectRadius=smoothstep(0.0,1.0,uProgress);
  float distanceToCenter= length(vUv-center);
  float mixFactor=smoothstep(effectRadius,effectRadius,distanceToCenter);
  vec3 col = mix(texColor2,texColor1,mixFactor);

  gl_FragColor = vec4(col,uDisplay);
}