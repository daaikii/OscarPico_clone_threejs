const float PI = 3.14159265359;

uniform float uProgress;
uniform float uAngle;
uniform float uAspect;
uniform float uZMax;

varying vec2 vUv;

// rotation https://gist.github.com/yiwenl/3f804e80d0930e34a0b33359259b556c
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




// // glsl
// コードをコピーする
float accelDecelProgress(float progress) {
    if (progress < 0.5) {
        // 前半は加速 (2乗を使って加速)
        return pow(progress * 2.0, 2.0) * 0.5;  // 0.0 ~ 0.5 の範囲
    } else {
        // 後半は減速 (反転させた曲線で減速)
        return 1.0 - pow((1.0 - progress) * 2.0, 2.0) * 0.5;  // 0.5 ~ 1.0 の範囲
    }
}


void main(){
  vUv = uv ;

  vec3 newPos = position;
  newPos = rotate(newPos,vec3(1.0,0.0,0.0),uAngle);  //xを軸にして回転
  newPos.z -=1.0;

  vec3 rotPos1 = rotate(newPos,vec3(1.0,0.0,0.0),-PI/2.);                                  //90度回転先の位置の作成
  newPos+=normalize(rotPos1-newPos)*length(rotPos1-newPos)*smoothstep(3.0,4.0,uProgress);  //回転先へ移動
  vec3 rotPos2 = rotate(newPos,vec3(1.0,0.0,0.0),-PI/2.);                                  //もう90度回転
  newPos+=normalize(rotPos2-newPos)*length(rotPos2-newPos)*smoothstep(4.0,5.0,uProgress);  //移動

  newPos.z -= sin(vUv.x*PI)*0.5*sin(PI*(smoothstep(5.0,6.0,uProgress)));  //谷状に変形x
  newPos.z += sin(vUv.x*PI)*3.0*sin(PI*(smoothstep(5.5,7.0,uProgress)));  //山なりに変形x

  // newPos.z -= sin(vUv.y*PI)*0.2*sin(PI*(smoothstep(5.0,5.5,uProgress)));  //谷状に変形y
  // newPos.z += sin(vUv.y*PI)*0.0*(smoothstep(5.0,5.5,uProgress));  //山なりに変形y

  vec3 scaledPosition = position;
  scaledPosition.xy = vec2(position.x*uAspect,position.y);  //テクスチャサイズの作成  x:1.?? , y:1を掛ける
float accelProgress = accelDecelProgress(clamp((uProgress - 5.2) / (6.0 - 5.2), 0.0, 1.0));

    // z 軸の移動
    float zMovement = length(uZMax - newPos.z) * accelProgress;
    newPos.z += normalize(uZMax - newPos.z) * zMovement;

    // 拡大処理
    newPos += normalize(scaledPosition - position) * length(scaledPosition - position) * accelProgress;


  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos,1.0);
}