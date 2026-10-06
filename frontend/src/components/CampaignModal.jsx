import React, { useState } from 'react';
import { 
  Shield, Crown, Users, Copy, Check, LogOut, Key, Sparkles, AlertCircle, X, ExternalLink
} from 'lucide-react';

export default function CampaignModal({ 
  isOpen, 
  onClose, 
  campaign, 
  isGm, 
  onCampaignChange, 
  apiBase,
  party = [] 
}) {
  const [tab, setTab] = useState(campaign ? 'info' : 'join'); // 'info', 'create', 'join'
  const [name, setName] = useState('');
  const [gmName, setGmName] = useState('');
  const [description, setDescription] = useState('');
  const [gmPass, setGmPass] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isGmCheck, setIsGmCheck] = useState(false);
  const [joinGmPass, setJoinGmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getInviteUrl = (code) => {
    const origin = window.location.origin;
    return `${origin}/?join=${code}`;
  };

  const handleCopyLink = () => {
    if (!campaign) return;
    const url = getInviteUrl(campaign.code);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor indica un nombre para la campaña.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/campaigns.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          gm_name: gmName.trim() || 'Director de Juego',
          description: description.trim(),
          gm_pass: gmPass.trim() || 'master123'
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Error al crear campaña');

      onCampaignChange({
        ...data.campaign,
        is_gm: true
      });
      setTab('info');
    } catch (err) {
      setError(err.message || 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCampaign = async (e) => {
    e.preventDefault();
    const cleanCode = joinCode.trim().toUpperCase();
    if (!cleanCode) {
      setError('Por favor escribe el código de la campaña.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${apiBase}/campaigns.php?code=${cleanCode}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Campaña no encontrada');

      let userIsGm = false;

      // Si afirma ser el Master, verificar contraseña
      if (isGmCheck) {
        const gmRes = await fetch(`${apiBase}/campaigns-login.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: cleanCode,
            gm_pass: joinGmPass.trim()
          })
        });
        const gmData = await gmRes.json();
        if (!gmData.success) throw new Error(gmData.message || 'Clave de Master incorrecta');
        userIsGm = true;
      }

      onCampaignChange({
        ...data.campaign,
        is_gm: userIsGm
      });
      setTab('info');
    } catch (err) {
      setError(err.message || 'No se pudo unir a la campaña.');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveCampaign = () => {
    onCampaignChange(null);
    setTab('join');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-stone-900 border border-amber-600/40 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cabecera del Modal */}
        <div className="p-4 bg-stone-950 border-b border-stone-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">⚔️</span>
            <div>
              <h3 className="font-bold text-base text-amber-100">Mesas y Campañas</h3>
              <p className="text-[11px] text-stone-400">Gestiona tus partidas y comparte enlace con jugadores</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas */}
        <div className="flex border-b border-stone-800 bg-stone-950/60 p-1 gap-1">
          {campaign && (
            <button
              onClick={() => { setTab('info'); setError(null); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                tab === 'info' ? 'bg-amber-600 text-stone-950 shadow' : 'text-stone-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Campaña Actual</span>
            </button>
          )}
          <button
            onClick={() => { setTab('join'); setError(null); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              tab === 'join' ? 'bg-amber-600 text-stone-950 shadow' : 'text-stone-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Unirse a Mesa</span>
          </button>
          <button
            onClick={() => { setTab('create'); setError(null); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              tab === 'create' ? 'bg-emerald-600 text-white shadow' : 'text-stone-400 hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Crear como Master</span>
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB: INFO DE LA CAMPAÑA ACTUAL */}
          {tab === 'info' && campaign && (
            <div className="space-y-4">
              <div className="p-4 bg-stone-950 border border-amber-500/30 rounded-xl space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-lg font-black text-amber-200">{campaign.name}</h4>
                      {isGm ? (
                        <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-amber-500 text-stone-950 flex items-center space-x-1">
                          <Crown className="w-3 h-3" />
                          <span>Master</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-stone-800 text-stone-300 flex items-center space-x-1">
                          <Shield className="w-3 h-3" />
                          <span>Jugador</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Master: <strong className="text-stone-200">{campaign.gm_name || 'Director de Juego'}</strong>
                    </p>
                  </div>
                </div>

                {campaign.description && (
                  <p className="text-xs text-stone-300 italic bg-stone-900/60 p-2.5 rounded-lg border border-stone-800">
                    "{campaign.description}"
                  </p>
                )}

                {/* Código y Enlace de Invitación */}
                <div className="pt-2 border-t border-stone-800 space-y-2">
                  <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                    Código de Invitación:
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-base font-black text-amber-400 tracking-wider bg-stone-900 px-3 py-1.5 rounded-lg border border-stone-700">
                      {campaign.code}
                    </span>
                    <button
                      onClick={handleCopyLink}
                      className={`flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shadow-md ${
                        copied 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-amber-600 hover:bg-amber-500 text-stone-950'
                      }`}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copied ? '¡Enlace copiado!' : 'Copiar enlace para jugadores'}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-stone-500">
                    Copia y envíale este enlace a tus amigos. Al abrirlo, se unirán automáticamente a esta campaña.
                  </p>
                </div>
              </div>

              {/* Héroes de la partida */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase tracking-wider">
                  <span>Héroes en la Mesa ({party.length})</span>
                </div>
                {party.length === 0 ? (
                  <p className="text-xs text-stone-500 italic p-3 bg-stone-950/40 rounded-lg border border-stone-800/80 text-center">
                    Aún no hay héroes vinculados. Crea uno o comparte el enlace.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {party.map((p) => (
                      <div 
                        key={p.id}
                        className="p-2.5 bg-stone-950/70 border border-stone-800 rounded-lg text-xs flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-stone-200">{p.name || 'Sin nombre'}</div>
                          <div className="text-[10px] text-stone-400">{p.kin} · {p.profession}</div>
                        </div>
                        <div className="text-right">
                          <span className="text-rose-400 font-bold">{p.hp_current || p.hp_max || 10} PV</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botón Salir */}
              <div className="pt-3 border-t border-stone-800 flex justify-end">
                <button
                  onClick={handleLeaveCampaign}
                  className="flex items-center space-x-1.5 text-xs text-rose-400 hover:text-rose-300 font-bold px-3 py-1.5 rounded-lg hover:bg-rose-950/30 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Salir de esta campaña</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB: UNIRSE A CAMPAÑA */}
          {tab === 'join' && (
            <form onSubmit={handleJoinCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                  Código de la Campaña:
                </label>
                <input
                  type="text"
                  placeholder="Ej: DRAGON-4X9K"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full bg-stone-950 border border-stone-700 focus:border-amber-500 rounded-xl px-3 py-2.5 text-sm font-mono tracking-wider text-amber-200 placeholder:text-stone-600 focus:outline-none uppercase"
                  required
                />
                <p className="text-[11px] text-stone-500 mt-1">
                  Pídele este código a tu Director de Juego (o usa el enlace que te envió).
                </p>
              </div>

              {/* Checkbox Soy el Master */}
              <div className="pt-2 border-t border-stone-800 space-y-2">
                <label className="flex items-center space-x-2 text-xs text-stone-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGmCheck}
                    onChange={(e) => setIsGmCheck(e.target.checked)}
                    className="rounded bg-stone-950 border-stone-700 text-amber-600 focus:ring-0"
                  />
                  <span>Soy el Director de Juego de esta campaña</span>
                </label>

                {isGmCheck && (
                  <div className="animate-in fade-in space-y-1">
                    <label className="block text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                      Clave de Master:
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="Contraseña secreta que elegiste al crearla"
                        value={joinGmPass}
                        onChange={(e) => setJoinGmPass(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-700 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none"
                        required={isGmCheck}
                      />
                      <Key className="w-3.5 h-3.5 text-stone-500 absolute right-3 top-2.5" />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold py-2.5 rounded-xl text-xs transition-colors shadow-lg disabled:opacity-50"
              >
                {loading ? 'Buscando mesa...' : 'Entrar a la Campaña'}
              </button>
            </form>
          )}

          {/* TAB: CREAR CAMPAÑA COMO MASTER */}
          {tab === 'create' && (
            <form onSubmit={handleCreateCampaign} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1">
                  Nombre de la Campaña:
                </label>
                <input
                  type="text"
                  placeholder="Ej: El Valle de la Niebla"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1">
                  Tu nombre o apodo (Master):
                </label>
                <input
                  type="text"
                  placeholder="Ej: Víctor"
                  value={gmName}
                  onChange={(e) => setGmName(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1">
                  Clave de Master (para administrarla):
                </label>
                <input
                  type="password"
                  placeholder="Elige una contraseña simple (ej: secreto123)"
                  value={gmPass}
                  onChange={(e) => setGmPass(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none"
                  required
                />
                <p className="text-[10px] text-stone-500 mt-0.5">
                  La usarás si abres la web desde tu celular u otra máquina para identificarte como Master.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-1">
                  Descripción o sinopsis breve (opcional):
                </label>
                <textarea
                  rows="2"
                  placeholder="Una expedición al corazón de las Tierras Sombrías..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-700 focus:border-emerald-500 rounded-xl p-2.5 text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-lg disabled:opacity-50 flex items-center justify-center space-x-1.5"
              >
                <Crown className="w-4 h-4" />
                <span>{loading ? 'Fundando campaña...' : 'Fundar Campaña'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
