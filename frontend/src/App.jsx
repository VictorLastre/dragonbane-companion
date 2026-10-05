import React, { useState, useEffect } from 'react';
import CharacterSheet from './components/CharacterSheet';
import CharacterCreator from './components/CharacterCreator';
import { 
  Users, ShoppingBag, Tv, Plus, CheckCircle, AlertCircle, Sparkles, RefreshCw, Wand2
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function App() {
  const [view, setView] = useState('sheet'); // 'sheet', 'shops', 'projector'
  const [isCreating, setIsCreating] = useState(false);
  const [characters, setCharacters] = useState([]);
  const [selectedCharId, setSelectedCharId] = useState(null);
  const [activeChar, setActiveChar] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [apiConnected, setApiConnected] = useState(null);
  const [notification, setNotification] = useState(null);

  // Comprobar conexión y cargar personajes
  const fetchCharacters = async () => {
    try {
      const res = await fetch(`${API_BASE}/characters.php`, { method: 'GET' });
      if (!res.ok) throw new Error('API no disponible');
      const data = await res.json();
      if (data.success && data.characters) {
        setCharacters(data.characters);
        setApiConnected(true);
        if (data.characters.length > 0 && !selectedCharId) {
          loadSingleCharacter(data.characters[0].id);
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

  useEffect(() => {
    fetchCharacters();
  }, []);

  const handleSaveCharacter = async (charData) => {
    setIsSaving(true);
    let savedSuccessfully = false;

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
    setCharacters(updatedLocal);
    setIsSaving(false);
    setIsCreating(false);

    showNotification(savedSuccessfully 
      ? '¡Personaje guardado en el servidor MySQL!' 
      : '¡Personaje guardado localmente (copia segura offline)!'
    );
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      {/* Barra de Navegación Principal */}
      <header className="bg-stone-900 border-b border-stone-800 sticky top-0 z-40 backdrop-blur-md bg-stone-900/90">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🐉</span>
            <div>
              <span className="font-black text-rose-600 text-lg tracking-wider block leading-none drop-shadow">DRAGONBANE</span>
              <span className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">Companion Oficial de Campaña</span>
            </div>
          </div>

          {/* Menú de Módulos */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-stone-950 p-1 rounded-xl border border-stone-800">
            <button
              onClick={() => { setView('sheet'); setIsCreating(false); }}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                view === 'sheet' && !isCreating ? 'bg-amber-600 text-stone-950 shadow-md font-bold' : 'text-stone-300 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Hojas de Héroes</span>
            </button>
            <button
              onClick={() => { setView('sheet'); setIsCreating(true); }}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isCreating ? 'bg-emerald-600 text-white shadow-md font-bold' : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              <span>Creador de Personaje</span>
            </button>
            <button
              onClick={() => setView('shops')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                view === 'shops' ? 'bg-amber-600 text-stone-950 shadow-md font-bold' : 'text-stone-300 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Mercados y Tiendas</span>
            </button>
            <button
              onClick={() => setView('projector')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                view === 'projector' ? 'bg-amber-600 text-stone-950 shadow-md font-bold' : 'text-stone-300 hover:text-white'
              }`}
            >
              <Tv className="w-4 h-4" />
              <span>Visor TV / Proyección</span>
            </button>
          </nav>

          {/* Estado de Conexión MySQL */}
          <div className="flex items-center space-x-2 text-xs">
            <div className={`w-2.5 h-2.5 rounded-full ${apiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-stone-400 hidden sm:inline">
              {apiConnected ? 'MySQL Conectado' : 'Modo Offline / Local'}
            </span>
          </div>
        </div>
      </header>

      {/* Notificación Flotante */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 border border-amber-500/60 text-amber-200 px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Contenido Principal */}
      <main className="flex-1 py-4">
        {view === 'sheet' && (
          <div className="max-w-7xl mx-auto px-4">
            {isCreating ? (
              <CharacterCreator
                onComplete={handleSaveCharacter}
                onCancel={() => setIsCreating(false)}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Lista lateral de héroes */}
                <div className="lg:col-span-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider">Héroes del Grupo</h2>
                    <button
                      onClick={() => setIsCreating(true)}
                      className="flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 font-bold bg-stone-900 hover:bg-stone-800 border border-stone-800 px-2 py-1 rounded-lg transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nuevo</span>
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {characters.length === 0 ? (
                      <div className="p-4 bg-stone-900/50 border border-stone-800/80 rounded-xl text-center text-xs text-stone-500 space-y-2">
                        <p>No hay personajes registrados todavía.</p>
                        <button
                          onClick={() => setIsCreating(true)}
                          className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-3 py-1.5 rounded-lg text-xs"
                        >
                          Crear el primer héroe
                        </button>
                      </div>
                    ) : (
                      characters.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => loadSingleCharacter(c.id)}
                          className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                            selectedCharId === c.id
                              ? 'bg-amber-950/40 border-amber-600/70 text-amber-200 shadow-md'
                              : 'bg-stone-900/70 border-stone-800/80 text-stone-300 hover:border-stone-700'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-sm text-stone-100">{c.name || 'Sin nombre'}</div>
                            <div className="text-[11px] text-stone-400">{c.kin} · {c.profession}</div>
                          </div>
                          <div className="text-right text-[11px]">
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
          <div className="max-w-4xl mx-auto p-4 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-amber-100">Mercados y Tiendas de la Región</h2>
            <p className="text-sm text-stone-400 max-w-md mx-auto">
              Aquí podrás crear asentamientos con sus tiendas e inventarios (con precios oficiales de armas, armaduras, raciones y monturas extraídos directamente del capítulo 6 del manual de reglas).
            </p>
          </div>
        )}

        {view === 'projector' && (
          <div className="max-w-4xl mx-auto p-4 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Tv className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-sky-100">Visor TV / Pantalla Compartida</h2>
            <p className="text-sm text-stone-400 max-w-md mx-auto">
              Abre esta pantalla en tu Smart TV. En tu panel de director podrás hacer clic en "Mostrar NPC" o "Mostrar Mapa" para que aparezca aquí inmediatamente en tamaño completo.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
