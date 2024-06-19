const float PI = 3.14159265359;

uniform float uProgress;
uniform float uAngle;
uniform vec2 uAspect;
uniform float uZMax;

varying vec2 vUv;



// rotation
mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}
vec3 rotate(vec3 v, vec3 axis, float angle) {
	mat4 m = rotationMatrix(axis, angle);
	return (m * vec4(v, 1.0)).xyz;
}




void main(){
  vUv = uv ;

  vec3 newPos = position;
  //xを軸にして回転
  newPos = rotate(newPos,vec3(1.0,0.0,0.0),uAngle);
  newPos.z -=1.0;



  //90度回転先1の位置の作成
  vec3 rotPos1 = rotate(newPos,vec3(1.0,0.0,0.0),-PI/2.);
  //回転先1へ移動
  newPos+=normalize(rotPos1-newPos)*length(rotPos1-newPos)*smoothstep(1.0,2.0,uProgress);
  //もう90度
  vec3 rotPos2 = rotate(newPos,vec3(1.0,0.0,0.0),-PI/2.);
  //移動
  newPos+=normalize(rotPos2-newPos)*length(rotPos2-newPos)*smoothstep(2.0,3.0,uProgress);



  //谷状->山なり+画面サイズに
  newPos.z -= sin(vUv.x*PI)*0.4*sin(PI*(smoothstep(3.0,4.0,uProgress)));
  newPos.z -= sin(vUv.y*PI)*0.4*sin(PI*(smoothstep(3.0,4.0,uProgress)));

  newPos.z += sin(vUv.x*PI)*0.4*(smoothstep(4.0,5.0,uProgress));
  newPos.z += sin(vUv.y*PI)*0.4*(smoothstep(4.0,5.0,uProgress));




  //画面サイズの作成
  vec3 scaledPosition = position;
  scaledPosition.xy = position.xy*uAspect;
  //textureのアスペクト比まで幅を伸ばす。
  newPos += normalize(scaledPosition-position)*length(scaledPosition-position)*(clamp(uProgress,4.0,5.0)-4.0);
  //画面サイズまで拡大する。
  newPos.z += normalize(uZMax-newPos.z)*length(uZMax-newPos.z)*(clamp(uProgress,4.0,5.0)-4.0);





  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos,1.0);
}