import React, { useState, useEffect } from 'react';
import CharacterSheet from './components/CharacterSheet';
import CharacterCreator from './components/CharacterCreator';
import CampaignModal from './components/CampaignModal';
import CampaignGateway from './components/CampaignGateway';
import PartyHUD from './components/PartyHUD';
import { 
  Users, ShoppingBag, Tv, Plus, CheckCircle, AlertCircle, Sparkles, 
  RefreshCw, Wand2, Crown, Shield, Link2, Copy, Check, MapPin, ChevronDown,
  LogOut, Compass
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const OFFICIAL_LOCATIONS = [
  'Puerto Brumoso',
  'El Valle de la Niebla',
  'Ruinas de Oakhaven',
  'Fortaleza de los Enanos',
  'Campamento en el Bosque',
  'Cueva del Dragon Rojo'
];

export default function App() {
  const [view, setView] = useState('sheet'); // 'sheet', 'party', 'shops', 'projector'
  const [isCreating, setIsCreating] = useState(false);
  const [characters, setCharacters] = useState([]);
  const [selectedCharId, setSelectedCharId] = useState(null);
  const [activeChar, setActiveChar] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [apiConnected, setApiConnected] = useState(null);
  const [notification, setNotification] = useState(null);

  // Estados de Campaña y Roles
  const [campaign, setCampaign] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dragonbane_campaign') || 'null');
    } catch {
      return null;
    }
  });
  const [isGm, setIsGm] = useState(() => {
    return localStorage.getItem('dragonbane_is_gm') === 'true';
  });
  const [party, setParty] = useState([]);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState('join');
  const [modalInitialIsGm, setModalInitialIsGm] = useState(false);
  const [standaloneMode, setStandaloneMode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isChangingLocation, setIsChangingLocation] = useState(false);
  const [customLocation, setCustomLocation] = useState('');

  // Notificación flotante
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Cargar personajes y resumen de campaña
  const fetchCharacters = async (targetCampaign = campaign) => {
    try {
      const campCode = targetCampaign ? targetCampaign.code : '';
      const url = campCode 
        ? `${API_BASE}/characters.php?campaign_code=${campCode}` 
        : `${API_BASE}/characters.php`;

      const res = await fetch(url, { method: 'GET' });
      if (!res.ok) throw new Error('API no disponible');
      const data = await res.json();

      if (data.success && data.characters) {
        setCharacters(data.characters);
        setApiConnected(true);
        if (data.characters.length > 0 && !selectedCharId) {
          loadSingleCharacter(data.characters[0].id);
        }
      }

      // Si hay campaña, actualizar también el estado del grupo (Party HUD)
      if (campCode) {
        const campRes = await fetch(`${API_BASE}/campaigns.php?code=${campCode}`);
        const campData = await campRes.json();
        if (campData.success) {
          if (campData.party) setParty(campData.party);
          if (campData.campaign && campData.campaign.active_location) {
            setCampaign(prev => prev ? { ...prev, active_location: campData.campaign.active_location } : prev);
          }
        }
      }
    } catch (err) {
      console.warn('Conexión con la API no detectada, usando almacenamiento local:', err.message);
      setApiConnected(false);
      const localChars = JSON.parse(localStorage.getItem('dragonbane_chars') || '[]');
      setCharacters(localChars);
      if (localChars.length > 0 && !selectedCharId) {
        setActiveChar(localChars[0]);
        setSelectedCharId(localChars[0].id);
      }
    }
  };

  const loadSingleCharacter = async (id) => {
    setSelectedCharId(id);
    setIsCreating(false);
    if (apiConnected) {
      try {
        const res = await fetch(`${API_BASE}/characters.php?id=${id}`);
        const data = await res.json();
        if (data.success && data.character) {
          setActiveChar(data.character);
          return;
        }
      } catch (e) {
        console.error('Error cargando personaje:', e);
      }
    }
    const localChars = JSON.parse(localStorage.getItem('dragonbane_chars') || '[]');
    const found = localChars.find(c => c.id === id);
    if (found) setActiveChar(found);
  };

  // Detectar enlace de invitación al cargar la página (?join=CODIGO o ?campana=CODIGO)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join') || params.get('campana') || params.get('campaign');

    if (joinCode) {
      const cleanCode = joinCode.trim().toUpperCase();
      fetch(`${API_BASE}/campaigns.php?code=${cleanCode}`)
        .then(r => r.json())
        .then(data => {
          if (data.success && data.campaign) {
            handleCampaignChange({
              ...data.campaign,
              is_gm: false
            });
            showNotification(`¡Te has unido a la campaña: ${data.campaign.name}!`);
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        })
        .catch(e => console.error('Error al unirse mediante enlace:', e));
    } else {
      fetchCharacters();
    }
  }, []);

  // Polling automático para sincronizar Party HUD y Ubicación activa cada 10 segundos
  useEffect(() => {
    if (!campaign || !apiConnected) return;
    const interval = setInterval(() => {
      fetch(`${API_BASE}/campaigns.php?code=${campaign.code}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            if (data.party) setParty(data.party);
            if (data.campaign && data.campaign.active_location !== campaign.active_location) {
              setCampaign(prev => prev ? { ...prev, active_location: data.campaign.active_location } : prev);
            }
          }
        })
        .catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [campaign, apiConnected]);

  // Manejar cambio o creación de campaña
  const handleCampaignChange = (newCamp) => {
    if (newCamp) {
      localStorage.setItem('dragonbane_campaign', JSON.stringify(newCamp));
      localStorage.setItem('dragonbane_is_gm', newCamp.is_gm ? 'true' : 'false');
      setCampaign(newCamp);
      setIsGm(!!newCamp.is_gm);
      setStandaloneMode(false);
      fetchCharacters(newCamp);
      showNotification(newCamp.is_gm 
        ? `¡Campaña "${newCamp.name}" activa como Director de Juego!` 
        : `¡Campaña "${newCamp.name}" vinculada como Jugador!`
      );
    } else {
      localStorage.removeItem('dragonbane_campaign');
      localStorage.removeItem('dragonbane_is_gm');
      setCampaign(null);
      setIsGm(false);
      setParty([]);
      fetchCharacters(null);
      showNotification('Has salido de la campaña.');
    }
  };

  // Copiar enlace rápido de invitación
  const handleQuickCopyLink = (e) => {
    e.stopPropagation();
    if (!campaign) return;
    const url = `${window.location.origin}/?join=${campaign.code}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showNotification('¡Enlace de invitación copiado al portapapeles!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Cambiar ubicación activa de la mesa (Solo Master)
  const handleUpdateLocation = async (newLocation) => {
    if (!campaign || !isGm || !newLocation) return;
    try {
      const res = await fetch(`${API_BASE}/campaigns-settings.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: campaign.code,
          active_location: newLocation
        })
      });
      const data = await res.json();
      if (data.success) {
        const updatedCamp = { ...campaign, active_location: newLocation };
        setCampaign(updatedCamp);
        localStorage.setItem('dragonbane_campaign', JSON.stringify(updatedCamp));
        setIsChangingLocation(false);
        showNotification(`Ubicación actualizada: ${newLocation}`);
      }
    } catch (e) {
      console.error('Error al actualizar ubicación:', e);
    }
  };

  // Guardar personaje
  const handleSaveCharacter = async (charData) => {
    setIsSaving(true);
    let savedSuccessfully = false;

    // Vincular automáticamente a la campaña actual si existe
    if (campaign && campaign.code) {
      charData.campaign_code = campaign.code;
    }

    // 1. Guardar en API remota
    try {
      const method = charData.id ? 'PUT' : 'POST';
      const url = charData.id ? `${API_BASE}/characters.php?id=${charData.id}` : `${API_BASE}/characters.php`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(charData)
      });
      const data = await res.json();
      if (data.success) {
        savedSuccessfully = true;
        if (data.id) {
          charData.id = data.id;
        }
        setApiConnected(true);
      }
    } catch (err) {
      console.warn('No se pudo guardar en el servidor remoto, guardando en navegador:', err);
      setApiConnected(false);
    }

    // 2. Guardar en LocalStorage
    const currentLocal = JSON.parse(localStorage.getItem('dragonbane_chars') || '[]');
    const charToSave = { ...charData, id: charData.id || Date.now() };
    const existsIndex = currentLocal.findIndex(c => c.id === charToSave.id);
    let updatedLocal;
    if (existsIndex >= 0) {
      updatedLocal = [...currentLocal];
      updatedLocal[existsIndex] = charToSave;
    } else {
      updatedLocal = [charToSave, ...currentLocal];
    }
    localStorage.setItem('dragonbane_chars', JSON.stringify(updatedLocal));

    setActiveChar(charToSave);
    setSelectedCharId(charToSave.id);
    setIsSaving(false);
    setIsCreating(false);

    // Refrescar lista de personajes y HUD
    fetchCharacters(campaign);

    showNotification(savedSuccessfully 
      ? '¡Personaje guardado en el servidor MySQL!' 
      : '¡Personaje guardado localmente (copia segura offline)!'
    );
  };

  // PANTALLA INICIAL (LOBBY / GATEWAY) SI NO HAY CAMPAÑA SELECCIONADA Y NO ESTÁ EN MODO LIBRE
  if (!campaign && !standaloneMode) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between">
        <CampaignGateway
          onOpenCreate={() => {
            setModalInitialTab('create');
            setModalInitialIsGm(true);
            setIsCampaignModalOpen(true);
          }}
          onOpenGmLogin={() => {
            setModalInitialTab('join');
            setModalInitialIsGm(true);
            setIsCampaignModalOpen(true);
          }}
          onJoinByCode={(code) => {
            fetch(`${API_BASE}/campaigns.php?code=${code}`)
              .then(r => r.json())
              .then(data => {
                if (data.success && data.campaign) {
                  handleCampaignChange({
                    ...data.campaign,
                    is_gm: false
                  });
                } else {
                  showNotification('No se encontró ninguna campaña con ese código.');
                }
              })
              .catch(() => showNotification('Error conectando con el servidor.'));
          }}
          onEnterStandalone={() => setStandaloneMode(true)}
        />

        <CampaignModal
          isOpen={isCampaignModalOpen}
          onClose={() => setIsCampaignModalOpen(false)}
          campaign={campaign}
          isGm={isGm}
          onCampaignChange={handleCampaignChange}
          apiBase={API_BASE}
          party={party}
          initialTab={modalInitialTab}
          initialIsGm={modalInitialIsGm}
        />
      </div>
    );
  }

  const activeLocation = campaign?.active_location || 'Puerto Brumoso';

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      {/* Barra de Navegación Principal */}
      <header className="bg-stone-900 border-b border-stone-800 sticky top-0 z-40 backdrop-blur-md bg-stone-900/90 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          
          {/* Logo y Campaña */}
          <div className="flex items-center space-x-3">
            <span className="text-2xl drop-shadow">🐉</span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-rose-600 text-lg tracking-wider block leading-none drop-shadow">
                  DRAGONBANE
                </span>
                {campaign && (
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md flex items-center space-x-1 ${
                    isGm ? 'bg-amber-500 text-stone-950' : 'bg-sky-600/30 text-sky-300 border border-sky-500/40'
                  }`}>
                    {isGm ? <Crown className="w-2.5 h-2.5" /> : <Shield className="w-2.5 h-2.5" />}
                    <span>{isGm ? 'Master' : 'Jugador'}</span>
                  </span>
                )}
              </div>
              <span className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold block mt-0.5">
                {campaign ? `Campaña: ${campaign.name}` : 'Modo Hoja Libre'}
              </span>
            </div>
          </div>

          {/* Menú de Módulos (DIFERENCIADO: Master vs Jugador) */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-stone-950 p-1 rounded-xl border border-stone-800">
            {/* Pestaña Hojas */}
            <button
              onClick={() => { setView('sheet'); setIsCreating(false); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                view === 'sheet' && !isCreating ? 'bg-amber-600 text-stone-950 shadow-md font-bold' : 'text-stone-300 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{isGm ? 'Hojas del Grupo' : 'Mi Héroe'}</span>
            </button>

            {/* Pestaña Crear (o nuevo héroe) */}
            <button
              onClick={() => { setView('sheet'); setIsCreating(true); }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isCreating ? 'bg-emerald-600 text-white shadow-md font-bold' : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>{isGm ? 'Creador PJ/NPC' : 'Crear Héroe'}</span>
            </button>

            {/* Pestaña Ubicación / Mercados (habilitado según Master) */}
            <button
              onClick={() => setView('shops')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                view === 'shops' ? 'bg-amber-600 text-stone-950 shadow-md font-bold' : 'text-stone-300 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isGm ? 'Mercados' : `Explorar: ${activeLocation}`}</span>
            </button>

            {/* Visor TV: SOLO VISIBLE PARA EL MASTER */}
            {isGm && (
              <button
                onClick={() => setView('projector')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  view === 'projector' ? 'bg-amber-600 text-stone-950 shadow-md font-bold' : 'text-stone-300 hover:text-white'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Visor TV</span>
              </button>
            )}
          </nav>

          {/* Selector de Ubicación y Enlaces */}
          <div className="flex items-center space-x-2 text-xs">
            
            {/* UBICACIÓN ACTIVA (Controlable por el Master, informativa para jugadores) */}
            {campaign && (
              <div className="relative">
                {isGm ? (
                  <button
                    onClick={() => setIsChangingLocation(!isChangingLocation)}
                    className="flex items-center space-x-1.5 bg-stone-950 hover:bg-stone-850 border border-amber-600/40 text-amber-300 px-2.5 py-1.5 rounded-xl font-bold transition-all shadow-sm"
                    title="Cambiar ubicación activa de la mesa"
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="max-w-[110px] sm:max-w-[140px] truncate">{activeLocation}</span>
                    <ChevronDown className="w-3 h-3 text-stone-400" />
                  </button>
                ) : (
                  <div className="flex items-center space-x-1.5 bg-stone-950 border border-stone-800 text-stone-300 px-2.5 py-1.5 rounded-xl">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="text-[11px]">Ubicación:</span>
                    <span className="font-bold text-amber-200 max-w-[100px] truncate">{activeLocation}</span>
                  </div>
                )}

                {/* Dropdown de cambio de ubicación (Solo Master) */}
                {isGm && isChangingLocation && (
                  <div className="absolute right-0 mt-2 w-56 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl z-50 p-2 space-y-1 animate-in fade-in">
                    <div className="text-[10px] uppercase font-bold text-stone-400 px-2 py-1">
                      Ubicación del Grupo:
                    </div>
                    {OFFICIAL_LOCATIONS.map((loc) => (
                      <button
                        key={loc}
                        onClick={() => handleUpdateLocation(loc)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          activeLocation === loc 
                            ? 'bg-amber-600 text-stone-950 font-bold' 
                            : 'text-stone-300 hover:bg-stone-800'
                        }`}
                      >
                        {loc}
                      </button>
                    ))}
                    <div className="pt-1 border-t border-stone-800 flex items-center space-x-1">
                      <input
                        type="text"
                        placeholder="Otra ubicación..."
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 rounded px-2 py-1 text-xs text-stone-200 focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          if (customLocation.trim()) handleUpdateLocation(customLocation.trim());
                        }}
                        className="bg-amber-600 text-stone-950 px-2 py-1 rounded text-xs font-bold"
                      >
                        OK
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Botón rápido para invitar / copiar link */}
            {campaign && (
              <button
                onClick={handleQuickCopyLink}
                className="flex items-center space-x-1 p-2 bg-stone-950 border border-stone-800 hover:border-amber-500 text-amber-400 rounded-xl transition-all"
                title="Copiar enlace de invitación"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5" />}
              </button>
            )}

            {/* Botón Administrar Campaña / Salir */}
            <button
              onClick={() => setIsCampaignModalOpen(true)}
              className="p-2 bg-stone-950 border border-stone-800 hover:border-stone-700 text-stone-400 hover:text-white rounded-xl transition-all"
              title="Ajustes de campaña"
            >
              <Users className="w-3.5 h-3.5" />
            </button>

            {/* Indicador MySQL */}
            <div 
              className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ml-1"
              title={apiConnected ? 'Conectado a MySQL en Hostinger' : 'Modo Offline'}
            />
          </div>

        </div>
      </header>

      {/* Notificación Flotante */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 border border-amber-500/80 text-amber-200 px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Modal de Campaña */}
      <CampaignModal
        isOpen={isCampaignModalOpen}
        onClose={() => setIsCampaignModalOpen(false)}
        campaign={campaign}
        isGm={isGm}
        onCampaignChange={handleCampaignChange}
        apiBase={API_BASE}
        party={party}
        initialTab={modalInitialTab}
        initialIsGm={modalInitialIsGm}
      />

      {/* Contenido Principal */}
      <main className="flex-1 py-4">
        {view === 'sheet' && (
          <div className="max-w-7xl mx-auto px-4">
            
            {/* Banner Informativo si es Jugador */}
            {campaign && !isGm && (
              <div className="mb-4 bg-gradient-to-r from-stone-900 to-stone-950 border border-sky-600/30 p-3.5 rounded-2xl flex items-center justify-between shadow-md">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-sky-200">
                      Campaña: {campaign.name} · Master: {campaign.gm_name}
                    </div>
                    <div className="text-[11px] text-stone-400">
                      Ubicación del grupo: <strong className="text-amber-300">{activeLocation}</strong>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-stone-400">
                  {characters.length === 0 ? (
                    <span className="text-amber-400 font-bold">¡Crea tu personaje abajo para unirte a la mesa!</span>
                  ) : (
                    <span>{characters.length} héroe(s) registrado(s)</span>
                  )}
                </div>
              </div>
            )}

            {/* Party HUD en vivo para toda la campaña */}
            {campaign && party.length > 0 && !isCreating && (
              <PartyHUD
                party={party}
                selectedCharId={selectedCharId}
                onSelectCharacter={(id) => loadSingleCharacter(id)}
                isGm={isGm}
              />
            )}

            {isCreating ? (
              <CharacterCreator
                onComplete={handleSaveCharacter}
                onCancel={() => setIsCreating(false)}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Lista lateral de héroes (ESTRICTAMENTE AISLADA A ESTA CAMPAÑA) */}
                <div className="lg:col-span-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                      {campaign ? `Héroes de ${campaign.name} (${characters.length})` : 'Héroes Registrados'}
                    </h2>
                    <button
                      onClick={() => setIsCreating(true)}
                      className="flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 font-bold bg-stone-900 hover:bg-stone-800 border border-stone-800 px-2 py-1 rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isGm ? 'Nuevo PJ/NPC' : 'Crear Héroe'}</span>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {characters.length === 0 ? (
                      <div className="p-5 bg-stone-900/50 border border-stone-800/80 rounded-2xl text-center text-xs text-stone-400 space-y-3">
                        <p>No tienes ningún personaje creado para esta campaña todavía.</p>
                        <button
                          onClick={() => setIsCreating(true)}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl text-xs shadow-md transition-colors flex items-center justify-center space-x-1.5"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>Crear mi Personaje</span>
                        </button>
                      </div>
                    ) : (
                      characters.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => loadSingleCharacter(c.id)}
                          className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                            selectedCharId === c.id
                              ? 'bg-amber-950/40 border-amber-600/70 text-amber-200 shadow-md ring-1 ring-amber-500/30'
                              : 'bg-stone-900/70 border-stone-800/80 text-stone-300 hover:border-stone-700'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div className="font-bold text-sm text-stone-100 truncate">{c.name || 'Sin nombre'}</div>
                            <div className="text-[11px] text-stone-400 truncate">
                              {c.kin} · {c.profession} {c.player_name ? `(${c.player_name})` : ''}
                            </div>
                          </div>
                          <div className="text-right text-[11px] shrink-0">
                            <span className="text-rose-400 font-bold">{c.hp_current || c.hp_max || 10} PV</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Hoja de Personaje Activa */}
                <div className="lg:col-span-3">
                  <CharacterSheet
                    key={activeChar ? activeChar.id : 'default'}
                    initialChar={activeChar}
                    onSave={handleSaveCharacter}
                    isSaving={isSaving}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'shops' && (
          <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-amber-100">
                Mercados y Tiendas: <span className="text-rose-400">{activeLocation}</span>
              </h2>
              <p className="text-sm text-stone-400 max-w-lg mx-auto">
                {isGm 
                  ? 'Como Director de Juego, aquí podrás crear las tiendas del asentamiento actual y habilitar cuáles pueden ver los jugadores.'
                  : `Estás explorando los puestos comerciales y servicios disponibles en ${activeLocation}.`
                }
              </p>
            </div>

            <div className="p-6 bg-stone-900/80 border border-stone-800 rounded-2xl text-center text-xs text-stone-400 space-y-2">
              <p className="font-semibold text-stone-300">
                📍 Asentamiento Activo: <strong className="text-amber-300">{activeLocation}</strong>
              </p>
              <p>
                {isGm 
                  ? 'Listo para precargar el catálogo oficial de armas, armaduras y equipo del Capítulo 6 para esta ubicación.'
                  : 'Tu Director de Juego aún está preparando el inventario de esta zona.'
                }
              </p>
            </div>
          </div>
        )}

        {view === 'projector' && isGm && (
          <div className="max-w-4xl mx-auto p-4 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-xl">
              <Tv className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-sky-100">Visor TV / Pantalla Compartida</h2>
            <p className="text-sm text-stone-400 max-w-md mx-auto">
              Abre esta pantalla en tu Smart TV o segunda pantalla. Desde tu panel de director podrás hacer clic en "Mostrar NPC" o "Mostrar Mapa" para que aparezca aquí inmediatamente en tamaño completo.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
