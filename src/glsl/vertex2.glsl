const float PI = 3.14159265359;

uniform float uProgress;
uniform float uAngle;

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



void main(){
  vUv=uv;

  vec3 newPos = position;
  newPos = rotate(newPos,vec3(1.0,0.0,0.0),uAngle);  //xを軸にして回転
  newPos.y +=1.0;

  vec3 rotPos1 = rotate(newPos,vec3(1.0,0.0,0.0),-PI/2.);                                  //90度回転先の位置の作成
  newPos+=normalize(rotPos1-newPos)*length(rotPos1-newPos)*smoothstep(1.0,2.0,uProgress);  //回転先へ移動
  vec3 rotPos2 = rotate(newPos,vec3(1.0,0.0,0.0),-PI/2.);                                  //もう90度回転
  newPos+=normalize(rotPos2-newPos)*length(rotPos2-newPos)*smoothstep(2.0,3.0,uProgress);  //移動

  vec4 mvPosition = modelViewMatrix*vec4(newPos,1.0);
  gl_Position = projectionMatrix*mvPosition;
}