
import { initOrbitLogo } from "./three-logo.js";
import gsap from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm";
import { ScrollTrigger } from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js";
gsap.registerPlugin(ScrollTrigger);

const logo=document.querySelector(".hero-logo");
if(logo) initOrbitLogo(logo,false);
const small=document.querySelector("[data-small-logo]");
if(small) initOrbitLogo(small,true);

document.querySelectorAll("[data-reveal]").forEach((el,i)=>{
  gsap.fromTo(el,{y:35,opacity:0},{y:0,opacity:1,duration:1.1,delay:i*.04,ease:"power3.out",
    scrollTrigger:{trigger:el,start:"top 88%",once:true}});
});

gsap.utils.toArray(".orbit-card").forEach((el,i)=>{
  gsap.fromTo(el,{y:50,opacity:0,rotateX:7},{y:0,opacity:1,rotateX:0,duration:.9,delay:i*.05,
    ease:"power3.out",scrollTrigger:{trigger:el,start:"top 90%",once:true}});
});
gsap.to(".stars",{yPercent:20,scrollTrigger:{trigger:document.body,start:"top top",end:"bottom bottom",scrub:1}});

// Скорость орбит следует за скоростью скролла через CSS-переменную,
// а Three.js использует её как визуальный сигнал через масштаб/дрожание секций.
let last=scrollY, velocity=0;
addEventListener("scroll",()=>{velocity=Math.min(3,Math.abs(scrollY-last)/12);document.documentElement.style.setProperty("--scroll-speed",velocity);last=scrollY},{passive:true});

// Простая страничная "стыковка": перед уходом слегка затемняем экран.
document.querySelectorAll('a[href$=".html"]').forEach(a=>{
  a.addEventListener("click",e=>{
    if(a.target==="_blank" || e.metaKey || e.ctrlKey) return;
    e.preventDefault(); const href=a.href;
    gsap.to(document.body,{opacity:0,duration:.22,ease:"power2.in",onComplete:()=>location.href=href});
  });
});

// Кастомный курсор только на устройствах с мышью.
if(matchMedia("(pointer:fine)").matches){
  const c=document.querySelector(".cursor"), d=document.querySelector(".cursor-dot");
  let x=innerWidth/2,y=innerHeight/2,tx=x,ty=y;
  addEventListener("pointermove",e=>{tx=e.clientX;ty=e.clientY},{passive:true});
  gsap.ticker.add(()=>{x+=(tx-x)*.18;y+=(ty-y)*.18;if(c){c.style.left=x+"px";c.style.top=y+"px"}if(d){d.style.left=tx+"px";d.style.top=ty+"px"}});
}
