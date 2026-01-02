
import React, { useState, useEffect, useRef } from 'react';
import Snowfall from './components/Snowfall';
import DrawerWall from './components/DrawerWall';
import { generateFortuneSlip } from './services/geminiService';
import { audioService } from './services/audioService';
import { Language, FortuneType, AppState } from './types';
import { UI_TEXT } from './constants';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    language: Language.JP,
    step: 'intro',
    drawnNumber: null,
    drawnType: null,
    fortuneData: null,
  });

  const [isShaking, setIsShaking] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const t = UI_TEXT[state.language];
  const shakeIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    audioService.setEnabled(soundEnabled);
  }, [soundEnabled]);

  const handleLanguageChange = (lang: Language) => {
    setState(prev => ({ ...prev, language: lang }));
  };

  const getRandomFortuneType = (): FortuneType => {
    const rand = Math.random() * 100;
    if (rand < 10) return FortuneType.DAIKICHI;
    if (rand < 30) return FortuneType.KICHI;
    if (rand < 50) return FortuneType.CHUKICHI;
    if (rand < 70) return FortuneType.SHOKICHI;
    if (rand < 90) return FortuneType.SUEKICHI;
    return FortuneType.KYO;
  };

  const startShake = () => {
    if (isShaking) return;
    setIsShaking(true);
    setState(prev => ({ ...prev, step: 'shake', fortuneData: null, drawnNumber: null }));
    
    audioService.playShakeSound();
    shakeIntervalRef.current = window.setInterval(() => {
      audioService.playShakeSound();
    }, 800);

    const num = Math.floor(Math.random() * 100) + 1;
    const type = getRandomFortuneType();

    generateFortuneSlip(num, type, state.language).then(data => {
      setState(prev => ({ ...prev, fortuneData: data }));
    });

    setTimeout(() => {
      if (shakeIntervalRef.current) clearInterval(shakeIntervalRef.current);
      setIsShaking(false);
      audioService.playRevealSound();
      
      setState(prev => ({ 
        ...prev, 
        step: 'reveal_stick', 
        drawnNumber: num, 
        drawnType: type 
      }));
    }, 2400);
  };

  const proceedToWall = () => {
    setState(prev => ({ ...prev, step: 'reveal_number' }));
  };

  const handleDrawerClick = (num: number) => {
    if (num === state.drawnNumber) {
      audioService.playSuccessSound();
      setState(prev => ({ ...prev, step: 'show_slip' }));
    }
  };

  const reset = () => {
    setState(prev => ({
      ...prev,
      step: 'intro',
      drawnNumber: null,
      drawnType: null,
      fortuneData: null
    }));
  };

  return (
    <div className={`fixed inset-0 bg-[#7f1d1d] text-white overflow-hidden transition-all duration-1000 ${state.language === Language.JP ? 'custom-font-jp' : state.language === Language.CN ? 'custom-font-cn' : ''}`}>
      <Snowfall />

      {/* 顶部标题栏 */}
      <div className="absolute top-0 w-full p-4 md:p-6 flex justify-between items-start z-50">
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-5xl font-bold text-yellow-500 drop-shadow-2xl tracking-widest leading-tight">{t.title}</h1>
          <p className="text-yellow-600/60 text-xs md:text-base font-serif italic">令和七年 乙巳 初詣</p>
        </div>
        
        <div className="flex gap-1.5 bg-black/40 p-1.5 rounded-full backdrop-blur-md border border-yellow-600/20 shadow-xl">
          {(Object.keys(Language) as Array<keyof typeof Language>).map((key) => (
            <button
              key={key}
              onClick={() => handleLanguageChange(Language[key])}
              className={`px-2.5 py-1 rounded-full text-[10px] md:text-xs font-bold transition-all ${
                state.language === Language[key] 
                ? 'bg-yellow-500 text-red-950 shadow-inner' 
                : 'hover:bg-red-800/40 text-yellow-500/70'
              }`}
            >
              {key}
            </button>
          ))}
          <button 
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1 text-yellow-500/70 hover:text-yellow-500 transition-colors"
          >
            {soundEnabled ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"/></svg>
            )}
          </button>
        </div>
      </div>

      <main className="relative z-10 w-full h-full flex flex-col items-center justify-end pb-[8vh]">
        {/* 背景抽屉墙 */}
        <div className={`fixed inset-0 flex items-center justify-center p-4 transition-all duration-1000 ${state.step === 'reveal_number' || state.step === 'show_slip' ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-10 blur-2xl scale-110 pointer-events-none'}`}>
          <div className="w-full max-w-5xl">
            <DrawerWall 
              active={state.step === 'reveal_number'} 
              onDrawerClick={handleDrawerClick} 
              targetNumber={state.drawnNumber}
            />
          </div>
        </div>

        {/* 交互主体 */}
        {(state.step === 'intro' || state.step === 'shake' || state.step === 'reveal_stick') && (
          <div className="relative flex flex-col items-center justify-center z-30 transform scale-90 sm:scale-100 md:scale-125">
            <div className={`relative transition-transform duration-700 ${isShaking ? 'animate-shake' : ''}`}>
              
              {/* 签棒出的动画 */}
              <div className={`absolute top-0 right-4 w-4 h-64 shadow-2xl transition-all duration-1000 ease-out flex flex-col items-center z-0 rounded-t-full border-x border-[#d97706]/30 overflow-hidden
                ${state.step === 'reveal_stick' ? '-translate-y-32 opacity-100 rotate-6 translate-x-4' : 'translate-y-0 opacity-0'}`}
                style={{
                  background: 'linear-gradient(to bottom, #fef3c7 0%, #fde68a 50%, #d97706 100%)',
                  backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png"), linear-gradient(to bottom, #fef3c7, #fde68a, #d97706)'
                }}
              >
                <div className="w-full h-8 bg-gradient-to-b from-[#991b1b] to-[#7f1d1d] rounded-t-full shadow-inner border-b border-black/10" />
                <div className="flex-1 flex flex-col items-center pt-4">
                  <span className="text-[#451a03] font-black text-xl tracking-widest [writing-mode:vertical-rl] opacity-90 drop-shadow-sm select-none">
                    {state.drawnNumber}
                  </span>
                </div>
              </div>

              {/* 签筒本体 */}
              <div className="w-48 md:w-52 h-72 md:h-80 relative z-10">
                <div className="absolute inset-0 bg-gradient-to-r from-[#1a0f06] via-[#3a2211] to-[#1a0f06] rounded-[2rem] shadow-[0_40px_80px_rgba(0,0,0,0.8)] border-x-4 border-[#120a04] overflow-hidden">
                  <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]" />
                  <div className="absolute inset-y-0 left-3 w-4 bg-white/5 blur-md" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative bg-gradient-to-br from-[#991b1b] to-[#450a0a] border-2 border-yellow-500 px-4 py-8 md:py-12 rounded shadow-2xl flex items-center justify-center">
                      <span className="text-yellow-400 font-black [writing-mode:vertical-rl] text-2xl md:text-3xl tracking-[0.4em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        御神籤
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-40 h-8 bg-black/50 blur-3xl rounded-full" />
            </div>

            <div className="mt-8 md:mt-12 h-24 flex flex-col items-center">
              {state.step === 'intro' && (
                <button 
                  onClick={startShake}
                  className="group relative overflow-hidden bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 text-[#451a03] font-black py-4 md:py-5 px-12 md:px-16 rounded-full shadow-[0_8px_0_#78350f] active:translate-y-2 active:shadow-none transition-all text-xl md:text-2xl tracking-[0.3em] border-t-2 border-yellow-100"
                >
                  {t.shakeBtn}
                </button>
              )}
              {state.step === 'shake' && (
                <div className="text-lg md:text-xl font-black animate-pulse text-yellow-400 bg-red-950/80 px-10 py-4 rounded-full border border-yellow-600/30 backdrop-blur-xl">
                  {t.loading}
                </div>
              )}
              {state.step === 'reveal_stick' && (
                <button 
                  onClick={proceedToWall}
                  className="bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 text-[#451a03] font-black py-4 md:py-5 px-12 md:px-16 rounded-full shadow-[0_8px_0_#78350f] active:translate-y-2 active:shadow-none transition-all text-xl md:text-2xl tracking-[0.3em] flex items-center gap-4 animate-bounce border-t-2 border-yellow-100"
                >
                  {t.drawBtn} <span className="text-2xl md:text-3xl">→</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* 抽屉提示 */}
        {state.step === 'reveal_number' && (
           <div className="fixed bottom-10 left-0 w-full z-40 flex justify-center pointer-events-none px-4">
              <div className="bg-gradient-to-r from-[#78350f] via-yellow-500 to-[#78350f] text-[#451a03] py-4 px-8 rounded-full shadow-2xl border-2 border-yellow-100/30 animate-pulse font-black text-lg md:text-3xl text-center">
                 {t.findingDrawer.replace('{n}', state.drawnNumber?.toString() || '')}
              </div>
           </div>
        )}

        {/* 签文展示 */}
        {state.step === 'show_slip' && state.fortuneData && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 md:p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-[#fefce8] text-gray-950 w-full max-w-lg rounded shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh] border-[10px] md:border-[16px] border-[#b4935a]">
              <div className="absolute top-0 left-0 w-full h-3 bg-[#7f1d1d]" />
              <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar">
                <div className="border-2 border-[#7f1d1d]/10 p-5 md:p-8 flex flex-col items-center relative">
                  <h2 className="text-[#7f1d1d] text-5xl md:text-7xl font-black mb-4 border-b-4 md:border-b-8 border-[#7f1d1d] pb-2 md:pb-4 tracking-tighter">
                    {state.fortuneData.typeName || t.fortuneTypes[state.drawnType!]}
                  </h2>
                  <p className="text-sm md:text-lg text-gray-500 mb-8 tracking-[0.4em] font-black opacity-60">
                    {state.language === Language.JP ? `第 ${state.drawnNumber} 番` : `No. ${state.drawnNumber}`}
                  </p>
                  <pre className="whitespace-pre-wrap text-xl md:text-3xl text-gray-900 leading-relaxed mb-8 font-black tracking-widest text-center italic">
                    {state.fortuneData.poem}
                  </pre>
                  <p className="text-base md:text-xl text-gray-800 leading-relaxed mb-8 text-left font-serif">
                    {state.fortuneData.interpretation}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left text-sm md:text-base">
                    {Object.entries(state.fortuneData.details).map(([key, val]) => (
                      <div key={key} className="border-b border-gray-300 pb-2">
                        <span className="font-black text-[#7f1d1d] text-xs uppercase mr-2">{t.fields[key as keyof typeof t.fields]}</span>
                        <span className="text-gray-900 font-bold">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-8 flex justify-center">
                  <button onClick={reset} className="w-full sm:w-auto bg-[#7f1d1d] text-yellow-500 font-black py-4 px-16 rounded shadow-lg text-xl hover:bg-[#991b1b] transition-colors">
                    {t.backBtn}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 氛围渐变装饰 */}
      <div className="fixed -top-40 -left-40 w-80 h-80 bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed -bottom-40 -right-40 w-80 h-80 bg-yellow-500/5 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
};

export default App;
