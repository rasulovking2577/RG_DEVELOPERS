
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js";
import { EffectComposer } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/postprocessing/UnrealBloomPass.js";

export function initOrbitLogo(container, compact=false){
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(42,container.clientWidth/container.clientHeight,.1,100);
  camera.position.set(0,0,7.2);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"high-performance"});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.7)); renderer.setSize(container.clientWidth,container.clientHeight);
  renderer.outputColorSpace=THREE.SRGBColorSpace; container.appendChild(renderer.domElement);

  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,camera));
  const bloom=new UnrealBloomPass(new THREE.Vector2(container.clientWidth,container.clientHeight),1.25,.7,.2);
  bloom.threshold=.05; bloom.strength=compact?.85:1.25; bloom.radius=.8; composer.addPass(bloom);

  const group=new THREE.Group(); scene.add(group);
  const mat=new THREE.MeshStandardMaterial({color:0xf8ffff,emissive:0xcfffff,emissiveIntensity:2.2,metalness:.25,roughness:.18});
  // Полумесяц: два пересекающихся объёма. Это лёгкая procedural-заглушка,
  // которую позже можно заменить GLB/Spline-моделью без изменения остальной системы.
  const outer=new THREE.CylinderGeometry(compact?1.05:1.38,compact?1.05:1.38,.42,96,1,false,Math.PI*.17,Math.PI*1.66);
  const crescent=new THREE.Mesh(outer,mat); crescent.rotation.x=Math.PI/2; group.add(crescent);

  const orbitMat=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.72});
  const curve=new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.2,.15,.1),new THREE.Vector3(-.9,1.0,.25),
    new THREE.Vector3(1.1,.75,-.15),new THREE.Vector3(2.2,-.2,.2),
    new THREE.Vector3(.7,-1.05,.1),new THREE.Vector3(-1.4,-.75,-.15),
    new THREE.Vector3(-2.2,.15,.1)
  ],true,"catmullrom",.5);
  const orbit=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(240)),orbitMat); group.add(orbit);

  const pCount=compact?420:800, pos=new Float32Array(pCount*3), vel=new Float32Array(pCount*3);
  for(let i=0;i<pCount;i++){let a=Math.random()*Math.PI*2,r=2.0+Math.random()*3.3;
    pos[i*3]=Math.cos(a)*r;pos[i*3+1]=Math.sin(a)*r;pos[i*3+2]=(Math.random()-.5)*2.8;
    vel[i*3]=(Math.random()-.5)*.0015;vel[i*3+1]=(Math.random()-.5)*.0015;vel[i*3+2]=0;
  }
  const pg=new THREE.BufferGeometry();pg.setAttribute("position",new THREE.BufferAttribute(pos,3));
  const pts=new THREE.Points(pg,new THREE.PointsMaterial({color:0xffffff,size:compact?.012:.018,transparent:true,opacity:.72}));
  scene.add(pts);

  const light=new THREE.PointLight(0xffffff,7,8); light.position.set(0,0,2); group.add(light);
  const clock=new THREE.Clock(); let targetSpeed=1, speed=1, hovered=false;
  container.addEventListener("pointerenter",()=>hovered=true);
  container.addEventListener("pointerleave",()=>hovered=false);

  const resize=()=>{camera.aspect=container.clientWidth/container.clientHeight;camera.updateProjectionMatrix();renderer.setSize(container.clientWidth,container.clientHeight);composer.setSize(container.clientWidth,container.clientHeight)};
  addEventListener("resize",resize);

  function tick(){
    const t=clock.getElapsedTime(); speed += ((hovered?2.3:1)-speed)*.035;
    group.rotation.y=t*.10*speed; group.rotation.z=Math.sin(t*.23)*.12;
    const s=1+Math.sin(t*1.7)*(hovered?.045:.018); group.scale.setScalar(s);
    orbit.rotation.x=Math.sin(t*.31)*.18; orbit.rotation.y=t*.18*speed;
    const a=pg.attributes.position.array;
    for(let i=0;i<pCount;i++){let x=a[i*3],y=a[i*3+1],z=a[i*3+2],d=Math.sqrt(x*x+y*y)+.001;
      a[i*3] += -x/d*.0009*speed; a[i*3+1] += -y/d*.0009*speed;
      if(d<1.5){let ang=Math.atan2(y,x)+.035*speed; let r=1.5+Math.random()*.2;a[i*3]=Math.cos(ang)*r;a[i*3+1]=Math.sin(ang)*r;a[i*3+2]=z*.98;}
    } pg.attributes.position.needsUpdate=true;
    composer.render(); requestAnimationFrame(tick);
  } tick();
  return {scene,renderer,dispose:()=>{renderer.dispose();container.innerHTML=""}};
}
