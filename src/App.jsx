import React, { useState } from 'react';
import { Lock, ShieldCheck, Server, Settings } from 'lucide-react';
import TenantManager from './components/TenantManager';
import './index.css';

const GlobalGateway = ({ onUnlock }) => {
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const REQUIRED_PIN = import.meta.env.VITE_MASTER_ADMIN_PIN;

  const handleUnlock = (e) => {
    e.preventDefault();
    if (!REQUIRED_PIN) {
      setError('Error de Sistema: PIN no configurado en .env');
      return;
    }

    if (pinInput === REQUIRED_PIN) {
      setIsUnlocking(true);
      setError('');
      setTimeout(() => {
        sessionStorage.setItem('master_panel_unlocked', 'true');
        onUnlock();
      }, 800);
    } else {
      setError('Credenciales de administrador inválidas');
      setPinInput('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 sm:p-12">
      {/* Elementos decorativos de fondo claros */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-50 to-transparent pointer-events-none -z-10"></div>

      <div className={`glass-panel bg-white p-10 md:p-16 w-full max-w-lg relative z-10 transition-all duration-700 ${isUnlocking ? 'opacity-0 scale-95' : 'animate-fade-in'}`}>
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-8 border border-white/50">
            {isUnlocking ? (
              <ShieldCheck className="text-white w-12 h-12 animate-pulse" />
            ) : (
              <Lock className="text-white w-12 h-12" />
            )}
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight text-center">
            ControlFace
          </h1>
          <p className="text-blue-600 font-bold tracking-[0.2em] text-sm mt-3 uppercase">Master Control</p>
        </div>

        <p className="text-slate-500 text-[15px] text-center mb-10 leading-relaxed font-medium">
          Acceso privado al núcleo de despliegues globales. Por favor, identifícate.
        </p>

        <form onSubmit={handleUnlock} className="space-y-8">
          <div>
            <input
              type="password"
              value={pinInput}
              onChange={(e) => { setPinInput(e.target.value); setError(''); }}
              className={`input-field text-center text-3xl tracking-[0.4em] font-mono text-slate-800 ${error ? 'border-red-400 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]' : ''}`}
              placeholder="••••••••"
              disabled={isUnlocking}
              autoFocus
            />
            {error && <p className="text-red-500 text-sm text-center mt-3 font-semibold animate-fade-in">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isUnlocking}
            className="w-full btn-primary py-4 text-lg rounded-xl shadow-[0_8px_20px_rgba(59,130,246,0.25)] hover:shadow-[0_12px_25px_rgba(59,130,246,0.35)] flex justify-center items-center gap-2"
          >
            {isUnlocking ? 'Abriendo conexión...' : 'Ingresar al Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Panel de Administración 
const DashboardAdmin = () => {
  return (
    <div className="min-h-screen animate-fade-in p-6 md:p-12 max-w-[1500px] mx-auto">
      {/* Banner Superior / Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 glass-panel bg-white p-8 md:p-10 border-l-[6px] border-l-blue-500 shadow-sm rounded-3xl gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-50 rounded-[20px] flex items-center justify-center border border-blue-100 shadow-inner">
            <Server className="text-blue-600 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Panel Principal</h1>
            <p className="text-slate-500 font-medium text-base mt-1">Gestión Dinámica de ControlFace</p>
          </div>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition-colors shadow-sm">
            <Settings className="w-6 h-6" />
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem('master_panel_unlocked');
              window.location.reload();
            }}
            className="px-6 py-3.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold border border-red-200 transition-colors shadow-sm w-full md:w-auto text-center"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Grid de Estado Superior */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="glass-panel bg-white p-8 border-t-[6px] border-t-emerald-400 shadow-sm relative overflow-hidden rounded-3xl">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-emerald-50 rounded-full pointer-events-none"></div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <h3 className="text-slate-500 font-bold tracking-wider uppercase text-xs">Estado Central</h3>
            <span className="flex h-3.5 w-3.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-4xl font-extrabold text-slate-800 relative z-10">Online</p>
          <p className="text-sm font-medium text-emerald-600 mt-2 relative z-10 flex items-center gap-1.5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Base de datos Firestore conectada
          </p>
        </div>

        <div className="glass-panel bg-white p-8 border-t-[6px] border-t-blue-500 shadow-sm relative overflow-hidden rounded-3xl">
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-blue-50 rounded-full pointer-events-none"></div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <h3 className="text-slate-500 font-bold tracking-wider uppercase text-xs">Despliegues (CI/CD)</h3>
          </div>
          <p className="text-4xl font-extrabold text-slate-800 relative z-10">Standby</p>
          <p className="text-sm font-medium text-blue-600 mt-2 relative z-10 flex items-center gap-1.5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Esperando petición manual
          </p>
        </div>

        <div className="glass-panel bg-slate-50/50 p-8 flex flex-col justify-center items-center border-dashed border-2 border-slate-200 rounded-3xl opacity-70">
          <Server className="w-12 h-12 text-slate-400 mb-4" />
          <p className="text-slate-600 font-semibold text-lg">Historial de Despliegues</p>
          <p className="text-slate-400 text-sm mt-2 font-medium">Disponible en FASE 4</p>
        </div>
      </div>

      {/* Módulo Principal de Administración */}
      <TenantManager />
    </div>
  );
};

function App() {
  const [isUnlocked, setIsUnlocked] = useState(() => sessionStorage.getItem('master_panel_unlocked') === 'true');

  if (!isUnlocked) {
    return <GlobalGateway onUnlock={() => setIsUnlocked(true)} />;
  }

  return <DashboardAdmin />;
}

export default App;
