#include <myCommon>;

varying vec2 vUv;

uniform float uProgress;
uniform float uIndex;



void main(){
  vUv = uv;
  float prog1 = smoothstep(0.0,2.0,uProgress); 


  vec3 pos = vec3(position.xy,uIndex*1.1+0.001*uIndex);  //メッシュが重ならないようzを離す
  pos.z += 1.0;

  pos.xy -=pos.xy;
  pos += length(position)*normalize(position)*smoothstep(0.2*uIndex,2.0+0.2*uIndex,uProgress);  //uProgressで大きく 

  pos.z+=sin(vUv.x*PI)*0.8*(1.0-prog1);  //山なりに変形x
  pos.z+=sin(vUv.y*PI)*0.8*(1.0-prog1);  //山なりに変形y

  pos.z-= uIndex*1.1*prog1;  //離した分戻す

  vec3 rotPos = rotate(pos,vec3(1.0,0.0,0.0),-PI/2.);                               //90度回転先の位置の作成
  pos += normalize(rotPos-pos)*length(rotPos-pos)*smoothstep(3.,4.0,uProgress);    //回転先へ移動
  vec3 rotPos2 = rotate(pos,vec3(1.0,0.0,0.0),-PI/2.);                              //もう90度回転
  pos += normalize(rotPos2-pos)*length(rotPos2-pos)*smoothstep(4.0,5.0,uProgress);  //移動

  if(aspectRatio>1.0){
    pos.x /=aspectRatio;
  }

  vec4 mvPosition = modelViewMatrix * vec4(pos,1.0);
  gl_Position =projectionMatrix*mvPosition;
}