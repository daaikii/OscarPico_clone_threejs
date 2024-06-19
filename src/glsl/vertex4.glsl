
uniform float uProgress;
uniform vec2 uAspect;
uniform float uZMax;
uniform float uMouseWheel;

varying vec2 vUv;


void main(){
  vUv = uv ;

  vec3 newPos = vec3(position.xy*uAspect,uZMax);



    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos,1.0);
}