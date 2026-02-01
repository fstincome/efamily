import React, { useEffect, useState } from 'react';
import { AppView } from '../types.ts';
import { 
  ArrowRight, Activity, Zap, ChevronLeft, ChevronRight, X, ShieldAlert 
} from 'lucide-react';

// --- CONFIGURATION DES DONNÉES LOCALES (/public) ---
const LANDMARKS = [
  { image: "/1.jpg", name: "Héritage", desc: "La fondation de notre identité partagée." },
  { image: "/2.jpg", name: "Exploration", desc: "Chaque voyage renforce les liens de notre structure." },
  { image: "/3.JPG", name: "Futur", desc: "Préserver demain en documentant aujourd'hui." }
];

const CARDS = [
  { id: "01", img: "/4.jpg", cat: "Biosphere", title: "Biomes", gallery: ["/5.jpg", "/6.jpg", "/7.jpg", "/8.jpg"] },
  { id: "02", img: "/9.jpg", cat: "Intelligence", title: "Archive", gallery: ["/10.jpg", "/11.jpg", "/12.jpg", "/13.jpg"] },
  { id: "03", img: "/14.jpg", cat: "Topography", title: "Nexus", gallery: ["/15.jpg", "/16.jpg", "/17.JPG", "/18.JPG"] },
  { id: "04", img: "/19.jpg", cat: "Atmosphere", title: "Skyline", gallery: ["/20.jpg", "/21.jpg", "/22.jpg", "/23.jpg"] },
  { id: "05", img: "/24.jpg", cat: "Hydrosphere", title: "Oceanic", gallery: ["/25.jpg", "/26.jpg", "/27.JPG", "/28.jpg"] },
  { id: "06", img: "/29.jpg", cat: "Geosphere", title: "Summit", gallery: ["/30.jpg", "/31.jpg", "/32.jpg", "/33.jpg"] }
];

const VIGNETTES = Array.from({ length: 12 }, (_, i) => `/${34 + i}.jpg`);

export const HomeView: React.FC<{ setView: (view: AppView) => void }> = ({ setView }) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [selectedGallery, setSelectedGallery] = useState<string[] | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSecureBlur, setIsSecureBlur] = useState(false);

  // --- PROTOCOLES DE SÉCURITÉ ---
  useEffect(() => {
    // 1. Désactiver le clic droit
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    
    // 2. Détecter le changement de focus (Anti-Capture/Screenshot)
    const handleVisibilityChange = () => {
      setIsSecureBlur(document.visibilityState === 'hidden');
    };

    // 3. Désactiver les raccourcis clavier (Inspection/Source/Capture)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c' || e.key === 'J' || e.key === 'j')) || 
        (e.ctrlKey && (e.key === 'u' || e.key === 'U')) ||
        e.key === 'PrintScreen' ||
        (e.metaKey && e.shiftKey && (e.key === '4' || e.key === '3'))
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Audio Feedback
  const playSound = (type: 'hover' | 'click' | 'scan') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type === 'scan' ? 'square' : 'sine';
      osc.frequency.setValueAtTime(type === 'hover' ? 800 : 400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.1);
    } catch(e) {}
  };

  // Hero Auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      setIsScanning(true);
      setTimeout(() => {
        setActiveSlide((p) => (p + 1) % LANDMARKS.length);
        setIsScanning(false);
      }, 1000);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`transition-all duration-500 ${isSecureBlur ? 'blur-3xl' : 'blur-0'} select-none animate-fadeIn space-y-16 pb-20 bg-[#020617] min-h-screen p-4 md:p-8 selection:bg-transparent`}>
      
      {/* Overlay Sécurité */}
      {isSecureBlur && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-3xl">
          <div className="text-center">
            <ShieldAlert size={60} className="text-[#1EB53A] mx-auto animate-pulse mb-4" />
            <h2 className="text-white font-black text-xl uppercase tracking-widest">Contenu Sécurisé</h2>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scanline { 0% { top: -10%; } 100% { top: 110%; } }
        @keyframes vibrate { 0% { transform: translate(0); } 25% { transform: translate(1px, -1px); } 50% { transform: translate(-1px, 1px); } 100% { transform: translate(0); } }
        .scan-line { animation: scanline 3s linear infinite; }
        .hover-vibrate:hover { animation: vibrate 0.15s linear infinite; }
        /* Protection mobile appui long */
        img { -webkit-touch-callout: none !important; -webkit-user-select: none !important; pointer-events: none; }
      `}} />

      {/* --- SECTION 1: HERO SCANNER --- */}
      <section className="relative h-[70vh] rounded-[40px] overflow-hidden border border-white/5 bg-black shadow-2xl">
        {isScanning && (
          <div className="absolute inset-0 z-30 pointer-events-none">
            <div className="w-full h-[2px] bg-[#1EB53A] shadow-[0_0_20px_#1EB53A] absolute scan-line" />
          </div>
        )}
        {LANDMARKS.map((l, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-[1500ms] ${activeSlide === i ? 'opacity-100' : 'opacity-0'}`}>
            <img src={l.image} className="w-full h-full object-cover brightness-50" alt={l.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent" />
          </div>
        ))}
        <div className="absolute inset-0 flex flex-col justify-end p-12 z-10">
          <div className="max-w-2xl space-y-4">
            <span className="text-[#1EB53A] font-mono text-[9px] tracking-[0.5em] uppercase">Famille Hyady</span>
            <h1 className="text-6xl font-black text-white italic leading-none tracking-tighter">Plus que des souvenirs</h1>
            <p className="text-slate-400 font-mono text-xs italic">{">"} {LANDMARKS[activeSlide].desc}</p>
          </div>
        </div>
      </section>

      {/* --- SECTION 2: CARROUSEL --- */}
      <section className="space-y-8">
        <div className="flex justify-between items-center px-4">
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-8 bg-emerald-500 shadow-[0_0_10px_#1EB53A]" />
            <span className="text-emerald-500 font-mono text-[9px] uppercase tracking-[0.4em]">Node_Rotation</span>
          </div>
          <div className="flex gap-4">
            <button onClick={() => { playSound('click'); setCarouselIndex(p => Math.max(0, p - 1))}} className="p-3 rounded-full border border-white/10 text-white hover:bg-[#1EB53A] transition-all active:scale-90"><ChevronLeft size={18}/></button>
            <button onClick={() => { playSound('click'); setCarouselIndex(p => Math.min(CARDS.length - 1, p + 1))}} className="p-3 rounded-full border border-white/10 text-white hover:bg-[#1EB53A] transition-all active:scale-90"><ChevronRight size={18}/></button>
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${carouselIndex * (100 / 3)}%)` }}>
            {CARDS.map((card, i) => (
              <div key={i} className="w-full md:w-1/3 flex-shrink-0 px-3">
                <div onMouseEnter={() => playSound('hover')} className="relative h-[480px] rounded-[40px] overflow-hidden group border border-white/5 hover-vibrate cursor-pointer">
                  <img src={card.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={card.title} />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-10">
                    <span className="text-[#1EB53A] font-black text-[9px] uppercase tracking-widest mb-2">{card.cat}</span>
                    <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">{card.title}</h3>
                    <button 
                      onClick={() => { playSound('click'); setSelectedGallery(card.gallery); }}
                      className="mt-6 flex items-center gap-2 text-[9px] font-black text-white/40 group-hover:text-emerald-500 uppercase tracking-widest transition-all"
                    >
                      Voir Plus <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECTION 3: VIGNETTES --- */}
      <section className="bg-white/[0.02] border border-white/5 rounded-[40px] p-12 shadow-inner">
        <div className="flex items-center gap-3 mb-8">
            <Zap size={16} className="text-[#1EB53A]" />
            <span className="text-white/40 font-mono text-[9px] uppercase tracking-[0.4em]">Certaines de nos images</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
          {VIGNETTES.map((imgSrc, i) => (
            <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/10 grayscale hover:grayscale-0 hover-vibrate transition-all cursor-crosshair group relative">
              <img src={imgSrc} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={`Data ${i}`} />
              <div className="absolute inset-0 bg-[#1EB53A]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </section>

      {/* --- MODALE --- */}
      {selectedGallery && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020617]/95 backdrop-blur-xl animate-fadeIn">
          <div className="relative w-full max-w-5xl bg-black border border-white/10 rounded-[40px] p-8 md:p-12 overflow-hidden shadow-2xl">
            <button onClick={() => setSelectedGallery(null)} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors active:scale-90"><X size={32}/></button>
            <div className="flex items-center gap-3 mb-12">
              <Activity className="text-emerald-500 animate-pulse" />
              <span className="text-emerald-500 font-mono text-[10px] uppercase tracking-[0.5em]">Suite de photos</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedGallery.map((img, i) => (
                <div key={i} className="relative h-64 rounded-3xl overflow-hidden border border-white/5 group">
                  <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={`Gallery ${i}`} />
                  <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
            <div className="mt-12 text-center">
              <button 
                onClick={() => setSelectedGallery(null)} 
                className="px-10 py-4 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-lg active:scale-95"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};