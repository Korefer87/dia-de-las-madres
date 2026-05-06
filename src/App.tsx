import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  MapPin, Car, Landmark, Utensils, Heart, Home,
  Coffee, Music, Navigation, Sparkles,
} from 'lucide-react';

/* ─── Unsplash photos ─── */
const PHOTO = {
  roses:       'photo-1519904981063-b0cf448d479e',
  food:        'photo-1533900298318-6b8da08a523e',
  plaza:       'photo-1511920170033-f8396924c348',
  celebration: 'photo-1559827260-dc66d52bef19',
};
const unsplash = (id: string, w = 1200, q = 80) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=${q}`;

/* ─── Map URLs ─── */
const MAP_SAUCEDA =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d34234.59619899517!2d-103.82107420633227!3d20.45278514795249!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8425e37c7e5a9331%3A0xde9e9253454161fc!2sHACIENDA%20LA%20SAUCEDA!5e0!3m2!1ses!2smx!4v1778037147765!5m2!1ses!2smx';
const MAP_FOGON =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d34484.687817640886!2d-103.82258553564796!3d20.399357350552485!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8425e50053def335%3A0xc0a31d8e333a4d3b!2sEl%20Fog%C3%B3n%20del%20Rancho!5e0!3m2!1ses!2smx!4v1778037700697!5m2!1ses!2smx';
const DIR_SAUCEDA = 'https://www.google.com/maps/dir/?api=1&destination=20.45278514795249,-103.82107420633227';
const DIR_FOGON   = 'https://www.google.com/maps/dir/?api=1&destination=20.399357350552485,-103.82258553564796';

/* ─── Itinerary steps (shared between timeline + bottom bar) ─── */
const STEPS = [
  { id: 'step-fogon',    label: 'Fogón',    time: '8:30am', Icon: Coffee,   optional: true  },
  { id: 'step-hacienda', label: 'Hacienda', time: '10:00am', Icon: MapPin,   optional: false },
  { id: 'step-plaza',    label: 'Plaza',    time: '12:00pm', Icon: Landmark, optional: false },
  { id: 'step-comida',   label: 'Comida',   time: '2:00pm',  Icon: Utensils, optional: false },
  { id: 'step-goza',     label: 'Gozadera', time: '¡Ya!',    Icon: Music,    optional: false },
];

/* ─── SVG: Rose ─── */
const RoseSVG = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 120 130" className={className} style={style} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <g transform="translate(60,62)">
      <line x1="0" y1="5" x2="0" y2="58" stroke="#4a7c59" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="-14" cy="32" rx="7" ry="14" fill="#4a7c59" opacity="0.8" transform="rotate(-38,-14,32)" />
      <ellipse cx="14" cy="40" rx="7" ry="13" fill="#3d6b4a" opacity="0.8" transform="rotate(38,14,40)" />
      {[0,45,90,135,180,225,270,315].map((a, i) => (
        <ellipse key={`op${i}`} cx={0} cy={-28} rx={11} ry={24} fill="#f48fb1" opacity={0.55+(i%2)*0.12} transform={`rotate(${a})`} />
      ))}
      {[22,67,112,157,202,247].map((a, i) => (
        <ellipse key={`ip${i}`} cx={0} cy={-16} rx={9} ry={17} fill="#e91e8c" opacity={0.72} transform={`rotate(${a})`} />
      ))}
      <circle cx={0} cy={0} r={9} fill="#c2185b" opacity={0.92} />
      <circle cx={-2} cy={-2} r={4} fill="#ec407a" opacity={0.5} />
    </g>
  </svg>
);

/* ─── SVG: Floating petal ─── */
const PetalSVG = ({ color }: { color: string }) => (
  <svg width="22" height="28" viewBox="0 0 22 28" aria-hidden="true">
    <ellipse cx="11" cy="14" rx="8" ry="13" fill={color} opacity="0.72" transform="rotate(-15,11,14)" />
  </svg>
);

/* ─── Gold divider ─── */
const GoldDivider = () => (
  <div className="flex items-center justify-center gap-3">
    <div className="h-px w-16 bg-gradient-to-r from-transparent to-gold" />
    <Heart className="w-4 h-4 text-gold fill-gold animate-gold-pulse" />
    <div className="h-px w-16 bg-gradient-to-l from-transparent to-gold" />
  </div>
);

/* ─── Embedded map ─── */
const MapEmbed = ({ src, title }: { src: string; title: string }) => (
  <div className="relative w-full rounded-2xl overflow-hidden mt-4 shadow-md" style={{ height: '260px' }}>
    <iframe
      src={src}
      className="absolute inset-0 w-full h-full"
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title={title}
    />
  </div>
);

/* ─── "Cómo llegar" button ─── */
const ComoLlegarBtn = ({ href }: { href: string }) => (
  <motion.a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    whileHover={{ scale: 1.04 }}
    whileTap={{ scale: 0.96 }}
    className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-full font-elegant font-semibold cursor-pointer mt-4"
    style={{ background: 'linear-gradient(135deg, #d4638c, #9d2455)', boxShadow: '0 8px 24px rgba(212,99,140,0.3)', fontSize: '1rem' }}
  >
    <Navigation className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
    Cómo llegar
  </motion.a>
);

/* ─── Image divider strip ─── */
const ImageDivider = ({ src, height = 220 }: { src: string; height?: number }) => (
  <div className="relative z-10 w-full overflow-hidden" style={{ height }}>
    <img src={src} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
    <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(255,249,245,1) 0%, transparent 25%, transparent 75%, rgba(253,244,232,1) 100%)' }} />
  </div>
);

/* ─── Floating petals ─── */
const PETAL_COLORS = ['#f9a8c9','#f48fb1','#fce4ec','#ffd6e7','#ffb3d1','#fce8f5'];
const FloatingPetals = () => {
  const [petals] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: `${(i * 5.8 + Math.sin(i) * 12 + 50) % 100}%`,
      color: PETAL_COLORS[i % PETAL_COLORS.length],
      duration: 10 + (i % 7) * 2,
      delay: (i * 1.3) % 12,
    }))
  );
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {petals.map((p) => (
        <div key={p.id} className="absolute animate-petal-fall"
          style={{ left: p.left, top: '-40px', animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s` }}>
          <PetalSVG color={p.color} />
        </div>
      ))}
    </div>
  );
};

/* ─── Timeline step ─── */
interface StepProps {
  id?: string;
  time: string;
  Icon: React.ElementType;
  title: string;
  body: string;
  isLast?: boolean;
  delay?: number;
  children?: React.ReactNode;
}
const TimelineStep = ({ id, time, Icon, title, body, isLast = false, delay = 0, children }: StepProps) => (
  <motion.div
    id={id}
    initial={{ opacity: 0, x: -24 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.65, delay, ease: 'easeOut' }}
    viewport={{ once: true }}
    className="flex gap-5 relative"
  >
    {!isLast && (
      <div className="absolute left-[26px] top-16 bottom-0 w-0.5"
        style={{ background: 'linear-gradient(to bottom, #d4638c55, transparent)' }} />
    )}
    <div className="flex-shrink-0 w-[52px] h-[52px] rounded-full flex items-center justify-center shadow-lg z-10"
      style={{ background: 'linear-gradient(135deg, #d4638c, #9d2455)' }}>
      <Icon className="w-5 h-5 text-white" aria-hidden="true" />
    </div>
    <div className="pb-10 flex-1 min-w-0">
      <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full mb-3"
        style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.22), rgba(201,168,76,0.12))', border: '1.5px solid rgba(201,168,76,0.65)', boxShadow: '0 2px 10px rgba(201,168,76,0.18)' }}>
        <span style={{ fontSize: '0.8rem' }}>🕐</span>
        <p className="font-elegant text-gold font-extrabold tracking-[0.2em] uppercase" style={{ fontSize: '1rem' }}>{time}</p>
      </div>
      <h3 className="font-script text-mauve mb-1" style={{ fontSize: 'clamp(1.6rem, 5vw, 2.2rem)' }}>{title}</h3>
      <p className="font-elegant text-mist text-[1.1rem] leading-relaxed">{body}</p>
      {children}
    </div>
  </motion.div>
);

/* ═══════════════════════════════════════════════
   BOTTOM TIMELINE (mobile only)
═══════════════════════════════════════════════ */
const BottomTimeline = () => {
  const [activeIdx, setActiveIdx] = useState(-1);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // pick the entry closest to the top of the viewport
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));

        if (visible.length > 0) {
          const idx = STEPS.findIndex(s => s.id === visible[0].target.id);
          if (idx !== -1) setActiveIdx(idx);
        }
      },
      { threshold: 0.15, rootMargin: '-5% 0px -45% 0px' }
    );

    STEPS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav
      aria-label="Itinerario"
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div
        className="relative px-3 pt-2 pb-2"
        style={{
          background: 'rgba(255,252,250,0.96)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(212,99,140,0.18)',
          boxShadow: '0 -8px 32px rgba(74,25,66,0.1)',
        }}
      >
        {/* Connecting line across all dots */}
        <div
          className="absolute left-[13%] right-[13%]"
          style={{
            top: '22px',
            height: '2px',
            background: 'linear-gradient(to right, rgba(201,168,76,0.35), rgba(212,99,140,0.35), rgba(201,168,76,0.35))',
            borderRadius: '1px',
          }}
        />

        {/* Progress fill up to active step */}
        {activeIdx >= 0 && (
          <div
            className="absolute"
            style={{
              top: '22px',
              left: '13%',
              width: `${(activeIdx / (STEPS.length - 1)) * 74}%`,
              height: '2px',
              background: 'linear-gradient(to right, #c9a84c, #d4638c)',
              borderRadius: '1px',
              transition: 'width 0.4s ease',
            }}
          />
        )}

        <div className="flex items-start justify-around">
          {STEPS.map((step, i) => {
            const isActive = i === activeIdx;
            const isPast   = i < activeIdx;

            return (
              <button
                key={step.id}
                onClick={() => scrollTo(step.id)}
                aria-label={`Ir a ${step.label}`}
                className="flex flex-col items-center gap-1 flex-1 min-w-0 pt-1 relative"
                style={{ WebkitTapHighlightColor: 'transparent', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {/* Icon bubble */}
                <div
                  className="relative w-9 h-9 rounded-full flex items-center justify-center z-10 transition-all duration-300"
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg, #d4638c, #9d2455)'
                      : isPast
                      ? 'rgba(212,99,140,0.2)'
                      : step.optional
                      ? 'rgba(201,168,76,0.12)'
                      : 'white',
                    border: isActive
                      ? '2px solid rgba(255,255,255,0.6)'
                      : isPast
                      ? '2px solid rgba(212,99,140,0.45)'
                      : step.optional
                      ? '2px solid rgba(201,168,76,0.45)'
                      : '2px solid rgba(212,99,140,0.22)',
                    transform: isActive ? 'scale(1.18)' : 'scale(1)',
                    boxShadow: isActive
                      ? '0 4px 18px rgba(212,99,140,0.45)'
                      : 'none',
                    transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                  }}
                >
                  <step.Icon
                    className="w-[18px] h-[18px]"
                    style={{
                      color: isActive ? 'white' : isPast ? '#d4638c' : step.optional ? '#c9a84c' : '#c4849e',
                    }}
                    aria-hidden="true"
                  />

                  {/* Pulse ring when active */}
                  {isActive && (
                    <span
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{ background: 'rgba(212,99,140,0.25)', animationDuration: '1.5s' }}
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className="font-elegant leading-none w-full text-center truncate px-0.5"
                  style={{
                    fontSize: '0.6rem',
                    letterSpacing: '0.02em',
                    color: isActive ? '#9d2455' : isPast ? '#d4638c' : step.optional ? '#c9a84c' : '#9b7b8e',
                    fontWeight: isActive ? 700 : isPast ? 500 : 400,
                    transition: 'color 0.3s ease',
                  }}
                >
                  {step.label}
                </span>

                {/* Time */}
                <span
                  className="font-elegant leading-none w-full text-center truncate px-0.5"
                  style={{
                    fontSize: '0.58rem',
                    letterSpacing: '0.03em',
                    color: isActive ? '#b8892a' : isPast ? 'rgba(201,168,76,0.85)' : 'rgba(201,168,76,0.75)',
                    fontWeight: isActive ? 800 : 600,
                    transition: 'color 0.3s ease',
                  }}
                >
                  {step.time}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

/* ═══════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════ */
export default function App() {
  return (
    <div
      className="min-h-dvh relative overflow-x-hidden pb-28 md:pb-0"
      style={{ background: 'linear-gradient(150deg, #fff9f5 0%, #fce4ec 45%, #fdf4e8 100%)' }}
    >
      <FloatingPetals />
      <BottomTimeline />

      {/* ── HERO ────────────────────────────────── */}
      <section className="relative min-h-dvh flex flex-col items-center justify-center text-center px-6 py-24 z-10 overflow-hidden">
        <div className="absolute inset-0">
          <img src={unsplash(PHOTO.roses, 1920)} alt="" aria-hidden="true" className="w-full h-full object-cover" style={{ opacity: 0.22 }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(150deg, rgba(255,249,245,0.9) 0%, rgba(252,228,236,0.85) 45%, rgba(253,244,232,0.9) 100%)' }} />
        </div>

        <RoseSVG className="absolute top-2 left-2 w-28 h-28 opacity-55 animate-float" style={{ animationDuration: '5s' }} />
        <RoseSVG className="absolute top-2 right-2 w-28 h-28 opacity-55 animate-float [transform:scaleX(-1)]" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <RoseSVG className="absolute bottom-2 left-2 w-20 h-20 opacity-35 animate-float" style={{ animationDuration: '7s', animationDelay: '2s' }} />
        <RoseSVG className="absolute bottom-2 right-2 w-20 h-20 opacity-35 animate-float [transform:scaleX(-1)]" style={{ animationDuration: '5.5s', animationDelay: '0.5s' }} />

        <motion.div initial={{ opacity: 0, scaleX: 0.3 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ duration: 1, delay: 0.2 }}>
          <GoldDivider />
        </motion.div>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.45 }}
          className="font-elegant text-blossom mt-5 tracking-[0.32em] uppercase text-lg">
          La Familia Ramos
        </motion.p>
        <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.65, ease: 'easeOut' }}
          className="font-script text-mauve leading-none mt-3" style={{ fontSize: 'clamp(3.8rem, 13vw, 8.5rem)' }}>
          Feliz Día
        </motion.h1>
        <motion.h1 initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.9, ease: 'easeOut' }}
          className="font-script text-blossom leading-none" style={{ fontSize: 'clamp(2.8rem, 10vw, 6.5rem)' }}>
          de las Madres
        </motion.h1>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.3 }}
          className="flex items-center gap-3 mt-7">
          <div className="h-px w-10 bg-gold" />
          <p className="font-elegant text-gold font-medium tracking-[0.2em] uppercase text-sm">Sábado 9 de Mayo, 2026</p>
          <div className="h-px w-10 bg-gold" />
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="flex items-center gap-2 mt-6">
          <Heart className="w-4 h-4 text-petal fill-petal" />
          <Heart className="w-7 h-7 text-blossom fill-blossom animate-heartbeat" />
          <Heart className="w-4 h-4 text-petal fill-petal" />
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-9 h-9 rounded-full border-2 border-blossom/40 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-blossom" />
          </div>
        </motion.div>
      </section>

      {/* ── MENSAJE ────────────────────────────── */}
      <section className="relative z-10 px-5 py-12 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.85 }} viewport={{ once: true }}
          className="relative rounded-3xl px-8 py-12 text-center shadow-xl border border-white/80"
          style={{ background: 'rgba(255,255,255,0.68)', backdropFilter: 'blur(12px)' }}>
          <RoseSVG className="absolute -top-11 left-1/2 -translate-x-1/2 w-24 h-24" />
          <p className="font-elegant text-mist italic text-xl leading-relaxed mt-3">
            "Para las mujeres que nos dieron la vida, el amor incondicional y la fuerza para seguir adelante…"
          </p>
          <div className="w-12 h-px bg-gold mx-auto my-6" />
          <p className="font-elegant text-mauve text-[1.15rem] leading-relaxed">
            Las invitamos a celebrar su día especial con un paseo lleno de alegría, paisajes hermosos y mucho amor familiar.
            Este día es para ustedes — <span className="text-blossom font-semibold">las mamás, las abuelitas, las tías</span> —
            ¡el corazón de nuestra familia!
          </p>
          <div className="flex items-center justify-center gap-2 mt-7">
            <Heart className="w-4 h-4 text-petal fill-petal" />
            <Heart className="w-6 h-6 text-blossom fill-blossom animate-heartbeat" />
            <Heart className="w-4 h-4 text-petal fill-petal" />
          </div>
        </motion.div>
      </section>

      {/* ── FLORAL DIVIDER ──────────────────────── */}
      <ImageDivider src={unsplash(PHOTO.roses, 1920)} height={200} />

      {/* ── PLAN DEL DÍA título ─────────────────── */}
      <section className="relative z-10 px-5 pt-10 pb-2 max-w-2xl mx-auto text-center">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
          <h2 className="font-script text-mauve" style={{ fontSize: 'clamp(2.6rem, 8vw, 4rem)' }}>Plan del Día</h2>
          <div className="flex items-center justify-center gap-3 mt-2 mb-10">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-gold" />
            <div className="w-2 h-2 rounded-full bg-gold" />
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-gold" />
          </div>
        </motion.div>
      </section>

      {/* ── OPCIONAL: El Fogón del Rancho ───────── */}
      <section id="step-fogon" className="relative z-10 px-5 pb-10 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.75 }} viewport={{ once: true }}
          className="rounded-3xl overflow-hidden shadow-lg border" style={{ borderColor: 'rgba(201,168,76,0.4)' }}>
          <div className="relative h-52 overflow-hidden">
            <img src={unsplash(PHOTO.food, 900)} alt="Desayuno tradicional El Fogón del Rancho" className="w-full h-full object-cover" loading="lazy" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(255,249,245,0.85) 100%)' }} />
          </div>
          <div className="px-5 py-3 flex items-center justify-center gap-2"
            style={{ background: 'rgba(255,255,255,0.82)', borderBottom: '1px solid rgba(201,168,76,0.35)' }}>
            <Sparkles className="w-4 h-4 text-gold" aria-hidden="true" />
            <span className="font-elegant text-gold font-semibold tracking-[0.25em] uppercase text-sm">Opcional · Para los madrugadores</span>
            <Sparkles className="w-4 h-4 text-gold" aria-hidden="true" />
          </div>
          <div className="p-6 md:p-8" style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(10px)' }}>
            <div className="flex items-start gap-4 mb-2">
              <div className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-md"
                style={{ background: 'linear-gradient(135deg, #c9a84c, #a07830)' }}>
                <Coffee className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full mb-2"
                  style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.22), rgba(201,168,76,0.12))', border: '1.5px solid rgba(201,168,76,0.65)', boxShadow: '0 2px 10px rgba(201,168,76,0.18)' }}>
                  <span style={{ fontSize: '0.8rem' }}>🕐</span>
                  <p className="font-elegant text-gold font-extrabold tracking-[0.2em] uppercase" style={{ fontSize: '1rem' }}>8:30 AM</p>
                </div>
                <h3 className="font-script text-mauve" style={{ fontSize: 'clamp(1.6rem, 5vw, 2.2rem)' }}>El Fogón del Rancho</h3>
              </div>
            </div>
            <p className="font-elegant text-mist text-[1.1rem] leading-relaxed mb-1 ml-16">
              Para quienes quieran llegar antes y abrir apetito con un desayuno de comida tradicional al fogón. ¡Una experiencia auténtica y deliciosa!
            </p>
            <div className="ml-16">
              <MapEmbed src={MAP_FOGON} title="El Fogón del Rancho" />
              <ComoLlegarBtn href={DIR_FOGON} />
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── TIMELINE PRINCIPAL ──────────────────── */}
      <section className="relative z-10 px-5 pb-6 max-w-2xl mx-auto">
        <div className="pl-1">
          <TimelineStep id="step-hacienda" time="10:00 AM · Punto de Encuentro" Icon={MapPin}
            title="Hacienda La Sauceda"
            body="Ya desayunados, nos reunimos aquí en Cocula, Jalisco. ¡Puntuales! Cada quien en su auto."
            delay={0.1}>
            <MapEmbed src={MAP_SAUCEDA} title="Hacienda La Sauceda" />
            <ComoLlegarBtn href={DIR_SAUCEDA} />
          </TimelineStep>

          <TimelineStep id="step-plaza" time="12:00 PM" Icon={Landmark}
            title="Plaza de Cocula"
            body="Paseo por el centro histórico de Cocula. Fotos, antojitos y disfrutar el ambiente del pueblo."
            delay={0.2}>
            <motion.img
              src={unsplash(PHOTO.plaza, 800)}
              alt="Plaza de Cocula, Jalisco"
              className="mt-4 w-full object-cover rounded-2xl shadow-md"
              style={{ height: '200px' }}
              loading="lazy"
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            />
          </TimelineStep>

          <TimelineStep id="step-comida" time="2:00 PM · Comida" Icon={Utensils}
            title="Santa Cruz de las Flores"
            body="A la 1 PM salimos hacia Santa Cruz de las Flores. Comida abundante en casa de la familia Ramos — risas, música y mucho amor."
            delay={0.3}
          />

          <TimelineStep id="step-goza" time="¡A Gozar!" Icon={Music}
            title="¡La Gozadera!"
            body="La fiesta continúa en casa. Música, convivencia y el mejor cierre para el día más especial del año."
            isLast delay={0.4}
          />
        </div>
      </section>

      {/* ── NOTA DE TRANSPORTE ──────────────────── */}
      <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
        className="relative z-10 px-5 pb-10 max-w-xl mx-auto">
        <div className="rounded-2xl px-6 py-5 flex items-start gap-4 border"
          style={{ background: 'rgba(201,168,76,0.1)', borderColor: 'rgba(201,168,76,0.35)' }}>
          <Car className="w-8 h-8 text-gold flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="font-elegant text-mauve text-[1.1rem] leading-relaxed">
            <span className="font-semibold">Transporte:</span> Cada quien en su propio auto.
            Nos reunimos en <span className="text-blossom font-semibold">Hacienda La Sauceda a las 10:00 AM</span> y salimos hacia <span className="text-blossom font-semibold">Santa Cruz a la 1:00 PM</span> — ¡no lleguen tarde!
          </p>
        </div>
      </motion.section>

      {/* ── BANNER DE CIERRE ────────────────────── */}
      <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.9 }} viewport={{ once: true }}
        className="relative z-10 mx-5 mb-10 rounded-3xl overflow-hidden shadow-2xl max-w-2xl md:mx-auto"
        style={{ minHeight: '280px' }}>
        <img src={unsplash(PHOTO.celebration, 1200)} alt="Celebración en familia"
          className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(74,25,66,0.72) 0%, rgba(157,36,85,0.65) 100%)' }} />
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-8 py-14">
          <RoseSVG className="w-16 h-16 mb-4 opacity-90" />
          <p className="font-script text-white mb-3" style={{ fontSize: 'clamp(2rem, 7vw, 3.2rem)' }}>
            ¡Las esperamos con los brazos abiertos!
          </p>
          <p className="font-elegant text-pink-100 text-lg leading-relaxed max-w-md">
            Porque los mejores momentos de la vida son los que compartimos en familia.
          </p>
          <div className="flex items-center gap-2 mt-6">
            <Heart className="w-4 h-4 text-pink-200 fill-pink-200" />
            <Heart className="w-6 h-6 text-white fill-white animate-heartbeat" />
            <Heart className="w-4 h-4 text-pink-200 fill-pink-200" />
          </div>
        </div>
      </motion.section>

      {/* ── FOOTER ──────────────────────────────── */}
      <footer className="relative z-10 text-center pb-14 px-5">
        <div className="flex items-center justify-center gap-4 mb-5">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold" />
          <RoseSVG className="w-14 h-14" />
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold" />
        </div>
        <p className="font-script text-mauve" style={{ fontSize: 'clamp(2rem, 6vw, 3rem)' }}>Con todo nuestro amor</p>
        <p className="font-elegant text-mist text-xl mt-1">La Familia Ramos</p>
        <p className="font-elegant text-mist/50 text-sm mt-5">9 de Mayo, 2026 · Cocula, Jalisco</p>
      </footer>
    </div>
  );
}
