import React, { useState } from 'react';
import { KEYCODES, APPS, sendCommand, sendText, launchApp, connectToTv, scanForTvs } from './services/api';

// Iconos SVG
const IconUp = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" /></svg>;
const IconDown = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>;
const IconLeft = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>;
const IconRight = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>;
const IconPower = () => <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const IconHome = () => <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const IconBack = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;
const IconPlayPause = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconSettings = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconMic = () => <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
const IconKeyboard = () => <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
const IconMute = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>;
const IconMenu = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>;

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [ipAddress, setIpAddress] = useState(localStorage.getItem('tvIp') || '');
  const [connectionStatus, setConnectionStatus] = useState('');
  const [textInput, setTextInput] = useState('');
  
  // States for Network Scanner
  const [isScanning, setIsScanning] = useState(false);
  const [foundTvs, setFoundTvs] = useState([]);

  const vibrate = () => { if (navigator.vibrate) navigator.vibrate(40); };

  const handlePress = async (keyCode) => {
    vibrate();
    try { await sendCommand(keyCode); } catch (e) { console.error(e); }
  };

  const handleAppLaunch = async (pkg) => {
    vibrate();
    try { await launchApp(pkg); } catch (e) { console.error(e); }
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!textInput) return;
    try {
      await sendText(textInput);
      setTextInput('');
      setShowKeyboard(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleConnect = async (e) => {
    if (e) e.preventDefault();
    if (!ipAddress) return;
    setConnectionStatus('Conectando...');
    try {
      await connectToTv(ipAddress);
      setConnectionStatus('¡Conectado exitosamente!');
      localStorage.setItem('tvIp', ipAddress);
      setTimeout(() => { setShowSettings(false); setConnectionStatus(''); }, 1500);
    } catch (error) {
      setConnectionStatus(`Error: ${error.message}`);
    }
  };

  const handleScanNetwork = async () => {
    setIsScanning(true);
    setFoundTvs([]);
    setConnectionStatus('Buscando TVs en tu Wi-Fi...');
    try {
      const tvs = await scanForTvs();
      setFoundTvs(tvs);
      if (tvs.length === 0) {
        setConnectionStatus('No se encontraron TVs.');
      } else {
        setConnectionStatus('Selecciona un TV de la lista:');
      }
    } catch (e) {
      setConnectionStatus('Error al escanear.');
    } finally {
      setIsScanning(false);
    }
  };

  const RoundButton = ({ onPointerDown, children, className = "", activeColor = "active:bg-gray-700" }) => (
    <button
      onPointerDown={onPointerDown}
      className={`flex items-center justify-center rounded-full bg-[#1e2329] text-gray-300 shadow-xl border border-gray-800 transition-transform transform active:scale-90 ${activeColor} ${className}`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0d0f12] flex flex-col items-center py-8 px-4 relative font-sans">
      
      {/* Modal de Configuración */}
      {showSettings && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-xs shadow-2xl border border-gray-700 flex flex-col">
            <h2 className="text-xl font-bold text-white mb-4">Conectar a TV</h2>
            
            <button 
              onPointerDown={handleScanNetwork} 
              disabled={isScanning}
              className="w-full py-2 mb-4 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-bold transition-colors disabled:opacity-50"
            >
              {isScanning ? 'Escaneando...' : '🔍 Buscar TVs en Wi-Fi'}
            </button>

            {foundTvs.length > 0 && (
              <div className="mb-4 max-h-32 overflow-y-auto border border-gray-600 rounded-lg">
                {foundTvs.map((tv, idx) => (
                  <div 
                    key={idx} 
                    onPointerDown={() => { setIpAddress(tv.ip); setConnectionStatus(''); }}
                    className="p-3 border-b border-gray-600 last:border-0 hover:bg-gray-700 active:bg-gray-600 cursor-pointer"
                  >
                    <p className="text-white font-bold">{tv.name}</p>
                    <p className="text-gray-400 text-xs">{tv.ip}</p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleConnect}>
              <label className="block text-sm text-gray-400 mb-2">Dirección IP Manual</label>
              <input 
                type="text" 
                placeholder="Ej. 192.168.100.9" 
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white mb-4 focus:outline-none"
              />
              <p className="text-sm text-gray-400 mb-4 h-6 text-center">{connectionStatus}</p>
              <div className="flex gap-4">
                <button type="button" onPointerDown={() => setShowSettings(false)} className="flex-1 py-3 bg-gray-700 rounded-lg text-white font-bold">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 rounded-lg text-white font-bold">Conectar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Teclado */}
      {showKeyboard && (
        <div className="absolute inset-0 z-50 flex items-start pt-20 justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-xs shadow-2xl border border-gray-700">
            <h2 className="text-lg font-bold text-white mb-4">Escribir en el TV</h2>
            <form onSubmit={handleTextSubmit} className="flex flex-col gap-4">
              <input 
                type="text" 
                autoFocus
                placeholder="Escribe aquí..." 
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:outline-none"
              />
              <div className="flex gap-4">
                <button type="button" onPointerDown={() => setShowKeyboard(false)} className="flex-1 py-3 bg-gray-700 rounded-lg text-white font-bold">Cerrar</button>
                <button type="submit" className="flex-1 py-3 bg-green-600 rounded-lg text-white font-bold">Enviar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="w-full max-w-[340px] flex flex-col gap-10">
        
        {/* Fila Superior */}
        <div className="flex justify-between items-center px-2">
          <button onPointerDown={() => handlePress(KEYCODES.POWER)} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1e2329] shadow-lg active:scale-90">
            <IconPower />
          </button>
          
          <div className="flex gap-4">
            <button onPointerDown={() => setShowKeyboard(true)} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1e2329] shadow-lg active:scale-90 text-gray-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
            <button onPointerDown={() => handlePress(KEYCODES.ASSIST)} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1e2329] shadow-lg active:scale-90">
              <IconMic />
            </button>
            <button onPointerDown={() => setShowSettings(true)} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1e2329] shadow-lg active:scale-90 text-gray-400">
              <IconSettings />
            </button>
          </div>
        </div>

        {/* D-PAD Gigante */}
        <div className="flex justify-center mt-4">
          <div className="relative w-[280px] h-[280px] bg-[#16191d] rounded-full shadow-2xl border border-gray-800 flex items-center justify-center">
            {/* Arriba */}
            <button onPointerDown={() => handlePress(KEYCODES.UP)} className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-20 flex justify-center items-start pt-4 text-gray-400 hover:text-white active:bg-gray-700/30 rounded-t-full">
              <IconUp />
            </button>
            {/* Abajo */}
            <button onPointerDown={() => handlePress(KEYCODES.DOWN)} className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-20 flex justify-center items-end pb-4 text-gray-400 hover:text-white active:bg-gray-700/30 rounded-b-full">
              <IconDown />
            </button>
            {/* Izquierda */}
            <button onPointerDown={() => handlePress(KEYCODES.LEFT)} className="absolute left-2 top-1/2 -translate-y-1/2 w-20 h-20 flex justify-start items-center pl-4 text-gray-400 hover:text-white active:bg-gray-700/30 rounded-l-full">
              <IconLeft />
            </button>
            {/* Derecha */}
            <button onPointerDown={() => handlePress(KEYCODES.RIGHT)} className="absolute right-2 top-1/2 -translate-y-1/2 w-20 h-20 flex justify-end items-center pr-4 text-gray-400 hover:text-white active:bg-gray-700/30 rounded-r-full">
              <IconRight />
            </button>
            {/* Centro OK */}
            <button onPointerDown={() => handlePress(KEYCODES.CENTER)} className="w-[110px] h-[110px] bg-[#1a1e23] border border-gray-800 rounded-full shadow-inner flex items-center justify-center active:bg-gray-700 transition-colors">
              <span className="sr-only">OK</span>
            </button>
          </div>
        </div>

        {/* Navegación Base */}
        <div className="flex justify-between px-6 mt-2">
          <RoundButton onPointerDown={() => handlePress(KEYCODES.BACK)} className="w-14 h-14 bg-[#1a1e23]"><IconBack /></RoundButton>
          <RoundButton onPointerDown={() => handlePress(KEYCODES.HOME)} className="w-14 h-14 bg-[#1a1e23]"><IconHome /></RoundButton>
          <RoundButton onPointerDown={() => handlePress(KEYCODES.PLAY_PAUSE)} className="w-14 h-14 bg-[#1a1e23]"><IconPlayPause /></RoundButton>
        </div>

        {/* Botones de Volumen y Canal */}
        <div className="flex justify-between px-4 mt-4 items-center bg-[#14171a] p-4 rounded-3xl border border-gray-800 shadow-lg">
          
          {/* Volumen Vertical */}
          <div className="flex flex-col items-center bg-[#1a1e23] rounded-full p-2 w-16 shadow-inner gap-4">
            <button onPointerDown={() => handlePress(KEYCODES.VOL_UP)} className="text-gray-300 font-bold text-xl active:text-white p-2">+</button>
            <span className="text-gray-500 text-[10px] font-bold">VOL</span>
            <button onPointerDown={() => handlePress(KEYCODES.VOL_DOWN)} className="text-gray-300 font-bold text-xl active:text-white p-2">−</button>
          </div>

          <div className="flex flex-col gap-6">
            <RoundButton onPointerDown={() => handlePress(KEYCODES.MUTE)} className="w-12 h-12 bg-[#1a1e23]"><IconMute /></RoundButton>
            <RoundButton onPointerDown={() => handlePress(KEYCODES.MENU)} className="w-12 h-12 bg-[#1a1e23]"><IconMenu /></RoundButton>
          </div>

          {/* Canal Vertical */}
          <div className="flex flex-col items-center bg-[#1a1e23] rounded-full p-2 w-16 shadow-inner gap-4">
            <button onPointerDown={() => handlePress(KEYCODES.CHANNEL_UP)} className="text-gray-300 font-bold active:text-white p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
            </button>
            <span className="text-gray-500 text-[10px] font-bold">CH</span>
            <button onPointerDown={() => handlePress(KEYCODES.CHANNEL_DOWN)} className="text-gray-300 font-bold active:text-white p-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
            </button>
          </div>

        </div>

        {/* Accesos Rápidos a Apps */}
        <div className="grid grid-cols-4 gap-4 px-2 mt-4">
          <button onPointerDown={() => handleAppLaunch(APPS.NETFLIX)} className="flex items-center justify-center bg-red-600 rounded-xl h-14 font-black text-white text-xs shadow-lg active:scale-95 tracking-tighter">NETFLIX</button>
          <button onPointerDown={() => handleAppLaunch(APPS.YOUTUBE)} className="flex items-center justify-center bg-white rounded-xl h-14 shadow-lg active:scale-95 text-red-600 font-bold text-xs">YouTube</button>
          <button onPointerDown={() => handleAppLaunch(APPS.PRIME)} className="flex items-center justify-center bg-blue-500 rounded-xl h-14 font-bold text-white text-xs shadow-lg active:scale-95 leading-tight">prime<br/>video</button>
          <button onPointerDown={() => handleAppLaunch(APPS.HBO)} className="flex items-center justify-center bg-purple-700 rounded-xl h-14 font-bold text-white text-xs shadow-lg active:scale-95">MAX</button>
        </div>

      </div>
    </div>
  );
}

export default App;
