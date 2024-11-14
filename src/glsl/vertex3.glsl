#include <myCommon>;

uniform float uProgress;
uniform float uAngle;
uniform float uAspect;

varying vec2 vUv;



void main(){
  vUv = uv ;

  vec3 pos = position;
  pos = rotate(pos,vec3(1.0,0.0,0.0),uAngle);  //xを軸にして回転
  pos.z -=1.0;

  vec3 rotPos1 = rotate(pos,vec3(1.0,0.0,0.0),-PI/2.);                                  //90度回転先の位置の作成
  pos+=normalize(rotPos1-pos)*length(rotPos1-pos)*smoothstep(3.0,4.0,uProgress);  //回転先へ移動
  vec3 rotPos2 = rotate(pos,vec3(1.0,0.0,0.0),-PI/2.);                                  //もう90度回転
  pos+=normalize(rotPos2-pos)*length(rotPos2-pos)*smoothstep(4.0,5.0,uProgress);  //移動

  pos.z -= sin(vUv.x*PI)*0.5*sin(PI*(smoothstep(5.0,6.0,uProgress)));  //谷状に変形x
  pos.z += sin(vUv.x*PI)*3.0*sin(PI*(smoothstep(5.5,7.0,uProgress)));  //山なりに変形x

    float localProg = smoothstep(5.0,7.0,uProgress);
  // z 軸の移動
  float zMovement = length(zMax - pos.z) * localProg;
  pos.z += normalize(zMax - pos.z) * zMovement;

  if(aspectRatio>1.0){
    pos.x /= aspectRatio;
    float localProg = smoothstep(5.0,7.0,uProgress);
    float wideLength = position.x - pos.x;
    pos.x += wideLength*localProg;
 }

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
}