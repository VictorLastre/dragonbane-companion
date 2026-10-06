import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Sparkles, Eye, EyeOff, Plus, Trash2, CheckCircle2, 
  Coins, Package, Shield, Swords, Heart, Compass, MapPin, 
  ChevronRight, RefreshCw, AlertCircle, User, Check, X,
  Anchor, Tent, Warehouse, Beer, Hammer, Flame, Utensils
} from 'lucide-react';
import { 
  SETTLEMENT_SCALES, 
  SETTLEMENT_ENVIRONMENTS, 
  generateSettlementShops,
  detectEnvironmentFromName 
} from '../utils/settlementGenerator';
import { 
  DRAGONBANE_EQUIPMENT, 
  convertirACobre, 
  formatearMonedas 
} from '../data/dragonbaneEquipmentData';

export default function SettlementView({ 
  location, 
  campaign, 
  isGm, 
  party = [], 
  activeChar, 
  onUpdateCharacter,
  apiBase,
  showNotification 
}) {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState(null);

  // Estados del generador modal
  const [genScale, setGenScale] = useState('lugar_de_paso');
  const [genEnv, setGenEnv] = useState('costero');
  const [genLocationName, setGenLocationName] = useState(location || 'Puerto Brumoso');
  const [isGenerating, setIsGenerating] = useState(false);

  // Estado para añadir ítem manual a una tienda
  const [isAddingItemModal, setIsAddingItemModal] = useState(false);
  const [targetShopForAdd, setTargetShopForAdd] = useState(null);
  const [itemSearchQuery, setItemSearchQuery] = useState('');

  // Personaje que está comprando
  const [buyerChar, setBuyerChar] = useState(activeChar || party[0] || null);

  useEffect(() => {
    if (activeChar) setBuyerChar(activeChar);
    else if (party.length > 0 && !buyerChar) setBuyerChar(party[0]);
  }, [activeChar, party]);

  useEffect(() => {
    setGenLocationName(location || 'Puerto Brumoso');
    setGenEnv(detectEnvironmentFromName(location || 'Puerto Brumoso'));
    fetchShops();
  }, [location, campaign]);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const campCode = campaign ? campaign.code : '';
      const url = `${apiBase}/shops.php?location=${encodeURIComponent(location || 'Puerto Brumoso')}${campCode ? `&campaign_code=${campCode}` : ''}&is_gm=${isGm ? 'true' : 'false'}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.shops) {
        setShops(data.shops);
        if (data.shops.length > 0 && !selectedShopId) {
          setSelectedShopId(data.shops[0].id);
        }
      } else {
        setShops([]);
      }
    } catch (err) {
      console.warn('Error cargando tiendas:', err);
      setShops([]);
    } finally {
      setLoading(false);
    }
  };

  // Generar asentamiento con el generador procedural
  const handleGenerateSettlement = async () => {
    setIsGenerating(true);
    try {
      const newShops = generateSettlementShops(genLocationName, genScale, genEnv);
      
      const payload = {
        campaign_code: campaign ? campaign.code : null,
        location: genLocationName,
        shops: newShops
      };

      const res = await fetch(`${apiBase}/shops-batch.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        setIsGeneratorOpen(false);
        showNotification?.(`¡Asentamiento "${genLocationName}" generado con éxito!`);
        fetchShops();
      } else {
        showNotification?.(data.message || 'Error al generar asentamiento.');
      }
    } catch (e) {
      console.error(e);
      showNotification?.('Error comunicando con el servidor al generar.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Alternar visibilidad de una tienda
  const handleToggleShopVisibility = async (shopId) => {
    try {
      const shop = shops.find(s => s.id === shopId);
      if (!shop) return;
      const newUnlocked = !shop.is_unlocked;

      const res = await fetch(`${apiBase}/shops-toggle.php?id=${shopId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_unlocked: newUnlocked })
      });
      const data = await res.json();

      if (data.success) {
        setShops(shops.map(s => s.id === shopId ? { ...s, is_unlocked: newUnlocked } : s));
        showNotification?.(newUnlocked ? 'Tienda ahora VISIBLE para los jugadores.' : 'Tienda ahora OCULTA para los jugadores.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Alternar todas las tiendas (visibles / ocultas)
  const handleToggleAllShops = async (setUnlocked) => {
    try {
      for (const s of shops) {
        await fetch(`${apiBase}/shops-toggle.php?id=${s.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_unlocked: setUnlocked })
        });
      }
      setShops(shops.map(s => ({ ...s, is_unlocked: setUnlocked })));
      showNotification?.(setUnlocked ? 'Todas las tiendas ahora son visibles para el grupo.' : 'Todas las tiendas han sido ocultadas.');
    } catch (e) {
      console.error(e);
    }
  };

  // Eliminar tienda
  const handleDeleteShop = async (shopId) => {
    if (!confirm('¿Seguro que deseas eliminar este puesto comercial?')) return;
    try {
      const res = await fetch(`${apiBase}/shops.php?id=${shopId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setShops(shops.filter(s => s.id !== shopId));
        if (selectedShopId === shopId) setSelectedShopId(null);
        showNotification?.('Tienda eliminada.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Limpiar todas las tiendas de la ubicación
  const handleClearLocationShops = async () => {
    if (!confirm(`¿Eliminar todos los comercios y servicios registrados en "${location}"?`)) return;
    try {
      const res = await fetch(`${apiBase}/shops-clear.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location,
          campaign_code: campaign ? campaign.code : null
        })
      });
      const data = await res.json();
      if (data.success) {
        setShops([]);
        setSelectedShopId(null);
        showNotification?.('Servicios de la ubicación eliminados.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Comprar o contratar servicio para el héroe activo
  const handleBuyItem = async (item, shopName) => {
    if (!buyerChar) {
      alert('Debes tener un héroe seleccionado para comprar o contratar servicios.');
      return;
    }

    const itemPriceCopper = item.price_copper || convertirACobre(item.gold, item.silver, item.copper) || 10;
    const buyerCopper = convertirACobre(buyerChar.gold || 0, buyerChar.silver || 0, buyerChar.copper || 0);

    if (buyerCopper < itemPriceCopper) {
      alert(`No tienes suficiente dinero. Cuesta ${item.cost_str || formatearMonedas(itemPriceCopper)}, pero solo tienes ${formatearMonedas(buyerCopper)}.`);
      return;
    }

    const remainingCopper = buyerCopper - itemPriceCopper;
    const newGold = Math.floor(remainingCopper / 100);
    const remGold = remainingCopper % 100;
    const newSilver = Math.floor(remGold / 10);
    const newCopper = remGold % 10;

    let updatedChar = {
      ...buyerChar,
      gold: newGold,
      silver: newSilver,
      copper: newCopper
    };

    // Si es un servicio inmediato (comida, baño, guiso, noche)
    if (item.category === 'services') {
      showNotification?.(`¡${buyerChar.name} adquirió ${item.name}! Efecto: ${item.effect}`);
    } 
    // Si es un arma
    else if (item.category === 'weapon_melee' || item.category === 'weapon_ranged') {
      const currentWeapons = Array.isArray(buyerChar.weapons) ? [...buyerChar.weapons] : [];
      currentWeapons.push({
        name: item.name,
        grip: item.grip || '1M',
        damage: item.damage || '1D8',
        range: item.range || '2',
        durability: item.durability || 9,
        features: item.effect || ''
      });
      updatedChar.weapons = currentWeapons;
      showNotification?.(`¡${item.name} añadida al arsenal de ${buyerChar.name}!`);
    } 
    // Si es armadura
    else if (item.category === 'armor') {
      updatedChar.armor = {
        name: item.name,
        rating: item.armor_rating || 1,
        penalty: item.effect || ''
      };
      showNotification?.(`¡${item.name} equipada en ${buyerChar.name}!`);
    } 
    // Si es casco
    else if (item.category === 'helmet') {
      updatedChar.helmet = {
        name: item.name,
        rating: item.armor_rating || 1,
        penalty: item.effect || ''
      };
      showNotification?.(`¡${item.name} equipado en la cabeza de ${buyerChar.name}!`);
    } 
    // Cualquier otro objeto o mercancía: al inventario
    else {
      const currentInv = Array.isArray(buyerChar.inventory) ? [...buyerChar.inventory] : [];
      currentInv.push({
        id: Date.now(),
        name: item.name,
        slots: item.weight || 1,
        description: item.effect || ''
      });
      updatedChar.inventory = currentInv;
      showNotification?.(`¡${item.name} guardado en el inventario de ${buyerChar.name}!`);
    }

    setBuyerChar(updatedChar);
    if (onUpdateCharacter) {
      await onUpdateCharacter(updatedChar);
    }
  };

  const activeShop = shops.find(s => s.id === selectedShopId) || shops[0] || null;

  // Filtrar artículos por categoría
  const filteredItems = activeShop && Array.isArray(activeShop.items)
    ? activeShop.items.filter(item => {
        if (selectedCategory === 'all') return true;
        if (selectedCategory === 'weapons') return item.category === 'weapon_melee' || item.category === 'weapon_ranged';
        if (selectedCategory === 'protection') return item.category === 'armor' || item.category === 'helmet' || item.category === 'shield';
        if (selectedCategory === 'travel') return item.category === 'travel' || item.category === 'tools' || item.category === 'medicine';
        if (selectedCategory === 'services') return item.category === 'services';
        if (selectedCategory === 'cargo') return item.category === 'cargo' || item.category === 'transport' || item.category === 'animals';
        return true;
      })
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">
      
      {/* CABECERA DE UBICACIÓN Y CONTROL DEL DIRECTOR */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-amber-500 flex items-center space-x-1">
                <Compass className="w-3.5 h-3.5" />
                <span>Asentamiento Oficial Dragonbane</span>
              </span>
              {shops.length > 0 && (
                <span className="text-[11px] bg-stone-800 text-stone-300 font-semibold px-2 py-0.5 rounded-full border border-stone-700">
                  {shops.length} servicio{shops.length > 1 ? 's' : ''} registrado{shops.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-stone-100 flex items-center space-x-2.5">
              <MapPin className="w-7 h-7 text-rose-500 shrink-0" />
              <span>{location || 'Puerto Brumoso'}</span>
            </h1>
            
            <p className="text-xs sm:text-sm text-stone-400 max-w-2xl">
              {location === 'Puerto Brumoso' 
                ? 'Lugar de paso costero con almacenes de carga, muelle de cabotaje, cantina para remeros y pertrechos elementales.'
                : 'Exploración de servicios locales, forjas, posadas y mercados regulados por el Capítulo 6.'}
            </p>
          </div>

          {/* Selector de Comprador / Héroe activo (Para Jugadores y GM) */}
          {party.length > 0 && (
            <div className="bg-stone-950 border border-stone-800 p-3 rounded-2xl flex items-center space-x-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-sm">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-stone-400 uppercase font-bold">Héroe Comprador:</div>
                <select
                  value={buyerChar?.id || ''}
                  onChange={(e) => {
                    const found = party.find(p => p.id === parseInt(e.target.value, 10));
                    if (found) setBuyerChar(found);
                  }}
                  className="bg-transparent text-xs font-bold text-amber-200 outline-none cursor-pointer"
                >
                  {party.map(p => (
                    <option key={p.id} value={p.id} className="bg-stone-900 text-stone-200">
                      {p.name} ({p.profession || 'Aventurero'})
                    </option>
                  ))}
                </select>
                {buyerChar && (
                  <div className="flex items-center space-x-2 text-[11px] font-bold text-amber-400 mt-0.5">
                    <Coins className="w-3 h-3 text-amber-400" />
                    <span>{buyerChar.gold || 0} MO</span>
                    <span>{buyerChar.silver || 0} MP</span>
                    <span>{buyerChar.copper || 0} MC</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Barra de Acciones del Master */}
        {isGm && (
          <div className="mt-5 pt-4 border-t border-stone-800 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsGeneratorOpen(true)}
                className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-black px-4 py-2 rounded-xl text-xs flex items-center space-x-2 shadow-lg transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>🎲 Generar Asentamiento ({location || 'Puerto Brumoso'})</span>
              </button>

              <button
                onClick={() => handleToggleAllShops(true)}
                className="bg-stone-800 hover:bg-stone-750 border border-stone-700 text-emerald-400 font-semibold px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-all"
                title="Habilitar todos para los jugadores"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Desbloquear Todo</span>
              </button>

              <button
                onClick={() => handleToggleAllShops(false)}
                className="bg-stone-800 hover:bg-stone-750 border border-stone-700 text-stone-400 font-semibold px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition-all"
                title="Ocultar todos para los jugadores"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Ocultar Todo</span>
              </button>
            </div>

            {shops.length > 0 && (
              <button
                onClick={handleClearLocationShops}
                className="text-rose-400 hover:text-rose-300 text-xs font-semibold px-3 py-2 rounded-xl hover:bg-rose-950/30 transition-all flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpiar Comercios</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* ESTADO VACÍO SI NO HAY COMERCIOS GENERADOS O VISIBLES */}
      {shops.length === 0 && !loading && (
        <div className="bg-stone-900/60 border border-stone-800 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-600/10 border border-amber-600/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Compass className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-stone-100">
              {isGm 
                ? `Asentamiento "${location || 'Puerto Brumoso'}" sin comercios configurados`
                : `Explorando ${location || 'Puerto Brumoso'}`
              }
            </h3>
            <p className="text-xs sm:text-sm text-stone-400">
              {isGm 
                ? 'Usa el Generador de Asentamientos para precargar automáticamente los almacenes, cantinas o herrerías oficiales acordes a su tamaño.'
                : 'Aún no has descubierto tiendas o servicios abiertos en esta zona. Tu Director de Juego los habilitará conforme avances en la exploración.'
              }
            </p>
          </div>

          {isGm && (
            <button
              onClick={() => setIsGeneratorOpen(true)}
              className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-black px-5 py-2.5 rounded-xl text-xs shadow-lg inline-flex items-center space-x-2 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Abrir Generador de Asentamiento</span>
            </button>
          )}
        </div>
      )}

      {/* CONTENIDO PRINCIPAL: LISTA DE TIENDAS Y CATÁLOGO */}
      {shops.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* COLUMNA LATERAL: TIENDAS DISPONIBLES */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-stone-400 flex items-center justify-between px-1">
              <span>Puestos y Servicios ({shops.length})</span>
              {isGm && <span className="text-[10px] text-amber-500">Vista Master</span>}
            </div>

            <div className="space-y-2.5">
              {shops.map((shop) => {
                const isSelected = activeShop?.id === shop.id;
                return (
                  <div
                    key={shop.id}
                    onClick={() => setSelectedShopId(shop.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-stone-900 border-amber-500/80 shadow-lg ring-1 ring-amber-500/30'
                        : 'bg-stone-900/60 border-stone-800 hover:border-stone-700 hover:bg-stone-900/90'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-black text-stone-100">{shop.name}</span>
                        </div>
                        <div className="text-[11px] text-amber-400/90 font-medium flex items-center space-x-1">
                          <User className="w-3 h-3 shrink-0" />
                          <span>{shop.keeper_name || 'Encargado local'}</span>
                        </div>
                        <div className="text-[11px] text-stone-400 line-clamp-2">
                          {shop.description}
                        </div>
                      </div>

                      {/* Icono de visibilidad (Sólo Master) */}
                      {isGm && (
                        <div className="flex items-center space-x-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleToggleShopVisibility(shop.id)}
                            className={`p-1.5 rounded-lg border text-xs transition-colors ${
                              shop.is_unlocked
                                ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300'
                                : 'bg-stone-950 border-stone-800 text-stone-500 hover:text-stone-300'
                            }`}
                            title={shop.is_unlocked ? 'Visible para jugadores (clic para ocultar)' : 'Oculto al grupo (clic para mostrar)'}
                          >
                            {shop.is_unlocked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteShop(shop.id)}
                            className="p-1.5 rounded-lg border border-stone-800 bg-stone-950 text-stone-500 hover:text-rose-400 transition-colors"
                            title="Eliminar tienda"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
                      <span className="bg-stone-950 px-2 py-0.5 rounded text-[10px] font-semibold text-stone-300">
                        {shop.shop_type || 'General'}
                      </span>
                      <span>{shop.items?.length || 0} artículos</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* COLUMNA CENTRAL: INVENTARIO Y CATÁLOGO DE LA TIENDA SELECCIONADA */}
          <div className="lg:col-span-8 space-y-4">
            {activeShop ? (
              <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
                
                {/* Encabezado del Puesto */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-800 gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-xl font-black text-amber-100">{activeShop.name}</h2>
                      {isGm && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          activeShop.is_unlocked ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50' : 'bg-stone-800 text-stone-400'
                        }`}>
                          {activeShop.is_unlocked ? 'Visible al Grupo' : 'Oculto al Grupo'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 mt-1">{activeShop.description}</p>
                    <div className="text-xs text-amber-400 font-semibold mt-1">
                      Atendido por: <strong>{activeShop.keeper_name || 'Comerciante'}</strong>
                    </div>
                  </div>

                  {isGm && (
                    <button
                      onClick={() => handleToggleShopVisibility(activeShop.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 border shrink-0 ${
                        activeShop.is_unlocked 
                          ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30' 
                          : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-750'
                      }`}
                    >
                      {activeShop.is_unlocked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{activeShop.is_unlocked ? 'Ocultar a Jugadores' : 'Desbloquear a Jugadores'}</span>
                    </button>
                  )}
                </div>

                {/* Filtros de Categoría */}
                <div className="flex flex-wrap items-center gap-1.5 bg-stone-950 p-1 rounded-2xl border border-stone-800 text-xs">
                  {[
                    { id: 'all', label: 'Todos' },
                    { id: 'weapons', label: 'Armas' },
                    { id: 'protection', label: 'Protección' },
                    { id: 'travel', label: 'Equipo y Viaje' },
                    { id: 'services', label: 'Servicios' },
                    { id: 'cargo', label: 'Transporte y Carga' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedCategory(tab.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                        selectedCategory === tab.id
                          ? 'bg-amber-600 text-stone-950 shadow-md'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Lista de Artículos en Venta */}
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {filteredItems.length === 0 ? (
                    <div className="p-8 text-center text-xs text-stone-500">
                      No hay artículos en esta categoría en este puesto.
                    </div>
                  ) : (
                    filteredItems.map((item, idx) => {
                      const costFormatted = item.cost_str || formatearMonedas(item.price_copper || 10);
                      const isAffordable = buyerChar 
                        ? convertirACobre(buyerChar.gold || 0, buyerChar.silver || 0, buyerChar.copper || 0) >= (item.price_copper || 10)
                        : true;

                      return (
                        <div
                          key={item.id || idx}
                          className="bg-stone-950/70 border border-stone-800/80 hover:border-stone-700 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-sm text-stone-100">{item.name}</span>
                              {item.availability && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                                  item.availability === 'Común' ? 'bg-stone-800 text-stone-300' :
                                  item.availability === 'Infrecuente' ? 'bg-sky-900/60 text-sky-300' :
                                  'bg-purple-900/60 text-purple-300'
                                }`}>
                                  {item.availability}
                                </span>
                              )}
                              {item.weight !== undefined && (
                                <span className="text-[10px] text-stone-400">
                                  {item.weight === 0 ? 'Diminuto (0)' : `${item.weight} hueco${item.weight > 1 ? 's' : ''}`}
                                </span>
                              )}
                            </div>

                            {/* Estadísticas de combate o efecto */}
                            <div className="text-xs text-stone-400">
                              {item.damage && (
                                <span className="text-rose-400 font-semibold mr-2">
                                  Daño: {item.damage} ({item.grip || '1M'})
                                </span>
                              )}
                              {item.durability > 0 && (
                                <span className="text-amber-300 font-semibold mr-2">
                                  Parada: {item.durability}
                                </span>
                              )}
                              {item.armor_rating && (
                                <span className="text-sky-400 font-semibold mr-2">
                                  Armadura: {item.armor_rating}
                                </span>
                              )}
                              <span>{item.effect}</span>
                            </div>
                          </div>

                          {/* Precio y Botón Comprar */}
                          <div className="flex items-center space-x-3 shrink-0 self-end sm:self-center">
                            <div className="text-right">
                              <div className="text-xs font-black text-amber-300">{costFormatted}</div>
                              <div className="text-[10px] text-stone-500">Capítulo 6</div>
                            </div>

                            <button
                              onClick={() => handleBuyItem(item, activeShop.name)}
                              disabled={!buyerChar || !isAffordable}
                              className={`px-3.5 py-2 rounded-xl text-xs font-black shadow-md flex items-center space-x-1.5 transition-all ${
                                !buyerChar
                                  ? 'bg-stone-800 text-stone-500 cursor-not-allowed'
                                  : isAffordable
                                  ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 active:scale-95'
                                  : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                              }`}
                              title={!isAffordable ? 'Monedas insuficientes' : 'Comprar para el héroe'}
                            >
                              <Coins className="w-3.5 h-3.5" />
                              <span>{item.category === 'services' ? 'Contratar' : 'Comprar'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            ) : (
              <div className="p-8 text-center text-stone-400">Selecciona un puesto comercial.</div>
            )}
          </div>

        </div>
      )}

      {/* MODAL DEL GENERADOR DE ASENTAMIENTOS (SOLO MASTER) */}
      {isGeneratorOpen && isGm && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-black text-stone-100">Generador de Asentamientos</h3>
              </div>
              <button
                onClick={() => setIsGeneratorOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Nombre del Asentamiento */}
              <div className="space-y-1.5">
                <label className="text-stone-300 font-bold uppercase tracking-wider text-[10px]">
                  Nombre del Asentamiento / Ubicación:
                </label>
                <input
                  type="text"
                  value={genLocationName}
                  onChange={(e) => setGenLocationName(e.target.value)}
                  placeholder="Ej: Puerto Brumoso"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 font-bold outline-none focus:border-amber-500"
                />
              </div>

              {/* Escala / Tamaño */}
              <div className="space-y-1.5">
                <label className="text-stone-300 font-bold uppercase tracking-wider text-[10px]">
                  Escala y Tamaño (Define qué servicios existen):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.values(SETTLEMENT_SCALES).map(s => (
                    <button
                      key={s.id}
                      onClick={() => setGenScale(s.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        genScale === s.id
                          ? 'bg-amber-600/20 border-amber-500 text-amber-200'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-300'
                      }`}
                    >
                      <div className="font-bold text-xs text-stone-100">{s.name}</div>
                      <div className="text-[10px] text-stone-400 mt-1 leading-tight">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Entorno Geográfico */}
              <div className="space-y-1.5">
                <label className="text-stone-300 font-bold uppercase tracking-wider text-[10px]">
                  Entorno Geográfico:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(SETTLEMENT_ENVIRONMENTS).map(e => (
                    <button
                      key={e.id}
                      onClick={() => setGenEnv(e.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        genEnv === e.id
                          ? 'bg-sky-600/20 border-sky-500 text-sky-200'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-300'
                      }`}
                    >
                      <div className="font-bold text-xs text-stone-100">{e.name}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{e.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div className="pt-2 border-t border-stone-800 flex items-center justify-end space-x-2">
              <button
                onClick={() => setIsGeneratorOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleGenerateSettlement}
                disabled={isGenerating}
                className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-black px-5 py-2 rounded-xl text-xs flex items-center space-x-2 shadow-lg"
              >
                {isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Generar Servicios del Libro</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
