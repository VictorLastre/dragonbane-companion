import React, { useState } from 'react';
import { 
  Crown, Shield, Users, ArrowRight, Wand2, Sparkles, Key, AlertCircle
} from 'lucide-react';

export default function CampaignGateway({ 
  onOpenCreate, 
  onOpenGmLogin, 
  onJoinByCode, 
  onEnterStandalone,
  loading,
  error 
}) {
  const [code, setCode] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    onJoinByCode(code.trim().toUpperCase());
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-3xl w-full space-y-8 animate-in fade-in duration-500">
        
        {/* Cabecera del Portal */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-950/50 border border-amber-600/40 text-4xl shadow-xl">
            🐉
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-100 tracking-wider">
            DRAGONBANE <span className="text-rose-600">COMPANION</span>
          </h1>
          <p className="text-stone-400 text-sm max-w-md mx-auto">
            Mesa virtual de campaña para Directores de Juego y Aventureros con las reglas oficiales de Devir en español.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto p-3.5 bg-rose-950/50 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Tarjetas de Selección de Rol */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* TARJETA 1: DIRECTOR DE JUEGO (MASTER) */}
          <div className="bg-stone-900/90 border border-amber-600/40 hover:border-amber-500 rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-6 transition-all hover:shadow-amber-950/20">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Crown className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-black text-amber-200">Director de Juego</h2>
              <p className="text-xs text-stone-400 leading-relaxed">
                Crea una nueva campaña para tu grupo o inicia sesión en tu mesa existente para controlar las ubicaciones, el visor de TV y las hojas del grupo.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={onOpenCreate}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Crear Nueva Campaña</span>
              </button>
              <button
                onClick={onOpenGmLogin}
                className="w-full bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-700 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-colors"
              >
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Entrar como Master a mi Campaña</span>
              </button>
            </div>
          </div>

          {/* TARJETA 2: JUGADOR (AVENTURERO) */}
          <div className="bg-stone-900/90 border border-stone-800 hover:border-sky-600/50 rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-6 transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-black text-sky-200">Jugador / Aventurero</h2>
              <p className="text-xs text-stone-400 leading-relaxed">
                Únete a la partida de tu Director de Juego ingresando el código de la campaña o usando el enlace de invitación directo que te compartieron.
              </p>
            </div>

            <form onSubmit={handleJoin} className="space-y-2.5 pt-2">
              <div>
                <input
                  type="text"
                  placeholder="Código o nombre (Ej: VESTIG-FZ30)"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-stone-950 border border-stone-700 focus:border-sky-500 rounded-xl px-3 py-2 text-xs font-mono tracking-wider text-sky-200 placeholder:text-stone-600 focus:outline-none uppercase"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg transition-colors disabled:opacity-50"
              >
                <span>{loading ? 'Buscando mesa...' : 'Unirse a la Campaña'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Acceso Secundario: Modo Hoja Solitaria */}
        <div className="text-center pt-2">
          <button
            onClick={onEnterStandalone}
            className="text-xs text-stone-500 hover:text-amber-400 transition-colors underline underline-offset-4 decoration-stone-700 hover:decoration-amber-400 font-medium"
          >
            ¿Quieres probar la hoja de personaje en solitario sin campaña? Entrar en Modo Libre
          </button>
        </div>

      </div>
    </div>
  );
}
