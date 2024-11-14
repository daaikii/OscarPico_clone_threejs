#include <myCommon>;

uniform float uAspect;
uniform float uScroll;

varying vec2 vUv;



void main(){
  vUv = uv ;
  vec3 newPos = vec3(position.x,position.y,zMax);  //zMaxで画面サイズの距離までzを近づける。
  float localProg =uScroll;

  newPos.z += sin(vUv.x*PI)*0.2*(smoothstep(0.0,1.0,localProg));              //山なりに変形x
  newPos.z += 0.5*(1.0+cos(2.0*PI*vUv.x))*0.2*smoothstep(0.0,-1.0,localProg); //谷状に変形x

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos,1.0);
}