"use client";

import { useEffect, useRef, useState } from 'react';
import { Phone, ArrowUpRight, ArrowRight, ChevronLeft, ChevronRight, Pause, Play, House, Heart, UserRound, Sparkles } from 'lucide-react';
import Artwork from './Artwork';
import type { Service, Settings } from '@/lib/types';

const DURATION = 6500;

type Slide = { id: string; eyebrow: string; title: string; accent: string; description: string; image: string; label: string; category: string; destination: string; action: string; };

export default function HeroSlider({ settings, services }: { settings: Settings; services: Service[] }) {
  const slides: Slide[] = [{
    id: 'home', eyebrow: 'DOMESTIC STAFFING · PAKISTAN', title: settings.heroTitle, accent: settings.heroAccent,
    description: settings.heroText, image: settings.heroImage, label: 'Housekeeper arranging a Pakistani home, with a cook preparing fresh food',
    category: 'A happier home', destination: '#hire', action: 'Find Staff for My Home'
  }];
  const stories = [
    { id: 'cooks', eyebrow: 'FRESH MEALS. FAMILIAR FLAVOURS.', title: 'A little more flavour.\nA lot more', accent: 'time together.', category: 'Cooks & Chefs', label: 'A cook preparing a fresh meal in a home kitchen' },
    { id: 'drivers', eyebrow: 'YOUR ROUTINE. A SMOOTHER RIDE.', title: 'Everyday journeys.\nExtraordinary', accent: 'peace of mind.', category: 'Personal Drivers', label: 'A household driver at the wheel of a car' },
    { id: 'care', eyebrow: 'THOUGHTFUL CARE. CLOSER TO HOME.', title: 'A helping hand.\nA little more', accent: 'comfort at home.', category: 'Care & Companionship', label: 'A carer assisting an older family member at home' },
  ];
  for (const story of stories) {
    const service = services.find(s => s.active && s.id === story.id);
    if (service) slides.push({ ...story, description: service.summary, image: service.image, destination: '/services/' + service.slug, action: 'Explore ' + service.title });
  }
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [visible, setVisible] = useState(true);
  const touchStart = useRef<number | null>(null);
  const slide = slides[active % slides.length];
  const stopped = paused || hovered || focused || reduced || !visible;

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReduced(media.matches);
    const updateVisibility = () => setVisible(!document.hidden);
    updateMotion(); updateVisibility();
    media.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => { media.removeEventListener('change', updateMotion); document.removeEventListener('visibilitychange', updateVisibility); };
  }, []);

  useEffect(() => {
    if (stopped || slides.length < 2) return;
    const timer = window.setTimeout(() => setActive(a => (a + 1) % slides.length), DURATION);
    return () => window.clearTimeout(timer);
  }, [active, stopped, slides.length]);

  const move = (direction: number) => setActive(a => (a + direction + slides.length) % slides.length);

  return <div className={'hero-slider ' + (stopped ? 'slider-paused' : '')} role="region" aria-roledescription="carousel" aria-label="Home staff services highlights"
    onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    onFocusCapture={() => setFocused(true)} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false); }}
    onKeyDown={e => { if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return; if (e.key === 'ArrowRight') { e.preventDefault(); move(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); } }}
    onTouchStart={e => { touchStart.current = e.touches[0].clientX; }} onTouchEnd={e => { if (touchStart.current !== null) { const delta = e.changedTouches[0].clientX - touchStart.current; if (Math.abs(delta) > 60) move(delta < 0 ? 1 : -1); touchStart.current = null; } }}>
    <div className="hero-ambient" aria-hidden="true"><span/><span/><span/></div>
    <div className="container hero-grid slider-grid">
      <div className="hero-copy slider-copy">
        <div className="slider-story" key={slide.id}>
          <p className="eyebrow slider-eyebrow"><span className="eyebrow-line"/>{slide.eyebrow}</p>
          <h1><span className="hero-title">{slide.title}</span><br/><em>{slide.accent}</em></h1>
          <p className="hero-description">{slide.description}</p>
          <div className="hero-buttons"><a className="button" href={slide.destination}>{slide.action} <ArrowUpRight size={17}/></a><a className="button outline" href="#services">All Services <ArrowRight size={15}/></a></div>{settings.phone && <a className="hero-call" href={'tel:'+settings.phone.replace(/[^+0-9]/g,'')}><span><Phone size={16}/></span>Call now: <strong>{settings.phone}</strong></a>}
        </div>
        <div className="hero-chips"><span><House/>Home help</span><span><Heart/>Family care</span><span><UserRound/>Personal service</span></div>
        <div className="slider-controls">
          <span className="slide-number" aria-hidden="true">0{active + 1}<small>/ 0{slides.length}</small></span>
          <div className="slide-dots" aria-label="Choose a slide">{slides.map((s, i) => <button key={s.id} className={i === active ? 'active' : ''} onClick={() => setActive(i)} aria-label={'Show slide ' + (i + 1) + ': ' + s.category} aria-current={i === active ? 'true' : undefined}><span key={i === active ? 'active-' + active : 'idle'} style={{ animationDuration: DURATION + 'ms' }}/></button>)}</div>
          <div className="slide-arrows"><button onClick={() => move(-1)} aria-label="Previous slide"><ChevronLeft size={17}/></button><button onClick={() => move(1)} aria-label="Next slide"><ChevronRight size={17}/></button><button className="slide-pause" onClick={() => setPaused(p => !p)} aria-label={paused ? 'Start automatic slides' : 'Pause automatic slides'} aria-pressed={paused}>{paused ? <Play size={12}/> : <Pause size={12}/>}</button></div>
        </div>
      </div>
      <div className="hero-visual slider-visual" role="group" aria-roledescription="slide" aria-label={(active + 1) + ' of ' + slides.length + ': ' + slide.category}>
        <div className="slider-orbit" aria-hidden="true"/><div className="slider-orbit second" aria-hidden="true"/>
        <div className="slider-image-stage">{slides.map((s, i) => <div key={s.id} className={'hero-shot ' + (i === active ? 'is-active' : '')} aria-hidden={i !== active}><Artwork image={s.image} label={i === active ? s.label : ''} priority={i === 0}/></div>)}<span key={'sweep-' + active} className="slide-light-sweep" aria-hidden="true"/></div>
        <div className="slider-float-label" key={'label-' + active}><span><Sparkles size={17}/></span><div><small>YOUR HOME. YOUR WAY.</small><strong>{slide.category}</strong></div></div>
        <div className="slider-side-note" aria-hidden="true">MADE FOR THE WAY YOU LIVE</div>
        <div className="slider-spark spark-one" aria-hidden="true">✦</div><div className="slider-spark spark-two" aria-hidden="true">✧</div>
      </div>
    </div>
    <p className="sr-only" aria-live={paused || focused ? 'polite' : 'off'} aria-atomic="true">Slide {active + 1} of {slides.length}: {slide.category}</p>
  </div>;
}
