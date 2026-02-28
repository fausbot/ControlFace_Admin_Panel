import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, Server, Settings, Users } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full filter blur-3xl mix-blend-screen pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full filter blur-3xl mix-blend-screen pointer-events-none"></div>

      <div className={`glass-panel p-10 w-full max-w-md relative z-10 transition-all duration-700 ${isUnlocking ? 'opacity-0 scale-95' : 'animate-fade-in'}`}>
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)] mb-6 border border-white/10">
            {isUnlocking ? (
              <ShieldCheck className="text-white w-10 h-10 animate-pulse" />
            ) : (
              <Lock className="text-white w-10 h-10" />
            )}
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight text-center">
            ControlFace
          </h1>
          <p className="text-blue-400 font-semibold tracking-widest text-sm mt-1 uppercase">Master Control</p>
        </div>

        <p className="text-gray-400 text-sm text-center mb-8">
          Centro de despliegue Multi-Tenant autorizado. Identifícate.
        </p>

        <form onSubmit={handleUnlock} className="space-y-6">
          <div>
            <input
              type="password"
              value={pinInput}
              onChange={(e) => { setPinInput(e.target.value); setError(''); }}
              className={`input-field text-center text-2xl tracking-[0.5em] font-mono ${error ? 'border-red-500/50 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.2)]' : ''}`}
              placeholder="••••••••"
              disabled={isUnlocking}
              autoFocus
            />
            {error && <p className="text-red-400 text-xs text-center mt-3 font-medium animate-fade-in">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isUnlocking}
            className="w-full btn-primary py-3.5 text-lg shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] flex justify-center items-center gap-2"
          >
            {isUnlocking ? 'Abriendo conexión...' : 'Ingresar al Core'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Panel de Administración Temporal (Mockup)
const DashboardAdmin = () => {
  return (
    <div className="min-h-screen animate-fade-in p-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-center mb-12 glass-panel p-6 border-l-4 border-l-blue-500">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <Server className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Centro de Mando</h1>
            <p className="text-blue-400 text-sm">Gestionando 3 clientes activos</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem('master_panel_unlocked');
              window.location.reload();
            }}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg font-medium transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Placeholder cards */}
        <div className="glass-panel p-6 border-t-4 border-t-emerald-500">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-gray-400 font-medium">Estado del Sistema</h3>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <p className="text-3xl font-bold text-white">Operativo</p>
          <p className="text-sm text-emerald-400 mt-2">Core API Online</p>
        </div>
        <div className="glass-panel p-6 flex flex-col justify-center items-center opacity-50 border-dashed border-2">
          <Users className="w-8 h-8 text-gray-500 mb-2" />
          <p className="text-gray-400 text-sm">Módulo Clientes (En desarrollo)</p>
        </div>
        <div className="glass-panel p-6 flex flex-col justify-center items-center opacity-50 border-dashed border-2">
          <Server className="w-8 h-8 text-gray-500 mb-2" />
          <p className="text-gray-400 text-sm">Módulo Deploy (En desarrollo)</p>
        </div>
      </div>
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
