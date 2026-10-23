"use client";
import {useEffect,useState} from 'react';
export default function Interactions(){
 const [progress,setProgress]=useState(0);
 useEffect(()=>{const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;const els=document.querySelectorAll('.reveal');if(!reduced&&'IntersectionObserver' in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target);}}),{threshold:.08});els.forEach(el=>{el.classList.add('will-reveal');io.observe(el)});const scroll=()=>setProgress(window.scrollY/Math.max(1,document.documentElement.scrollHeight-window.innerHeight)*100);window.addEventListener('scroll',scroll,{passive:true});return()=>{io.disconnect();window.removeEventListener('scroll',scroll)}}},[]);
 return <div className="scroll-progress" aria-hidden="true"><span style={{height:progress+'%'}}/></div>
}
