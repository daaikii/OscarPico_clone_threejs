#include <myCommon>;

uniform float uProgress;
uniform float uAngle;

varying vec2 vUv;


void main(){
  vUv=uv;

  vec3 pos = position;
  pos = rotate(pos,vec3(1.0,0.0,0.0),uAngle);  //xを軸にして回転
  pos.y +=1.0;

  vec3 rotPos1 = rotate(pos,vec3(1.0,0.0,0.0),-PI/2.);                                  //90度回転先の位置の作成
  pos+=normalize(rotPos1-pos)*length(rotPos1-pos)*smoothstep(3.0,4.0,uProgress);  //回転先へ移動
  vec3 rotPos2 = rotate(pos,vec3(1.0,0.0,0.0),-PI/2.);                                  //もう90度回転
  pos+=normalize(rotPos2-pos)*length(rotPos2-pos)*smoothstep(4.0,5.0,uProgress);  //移動

  if(aspectRatio>1.0){
    pos.x /=aspectRatio;
  }

  vec4 mvPosition = modelViewMatrix*vec4(pos,1.0);
  gl_Position = projectionMatrix*mvPosition;
}