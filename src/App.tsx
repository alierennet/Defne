/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { db, auth } from './lib/firebase';
import { generatePrompts } from './lib/geminiService';
import { collection, addDoc, query, onSnapshot, orderBy, serverTimestamp } from 'firebase/firestore';
import { 
  PlusCircle, 
  GalleryVertical, 
  Zap, 
  Loader2, 
  Copy, 
  Sparkles, 
  Search, 
  SlidersHorizontal, 
  Folder, 
  Compass, 
  ArrowRight, 
  Eye, 
  Download, 
  User, 
  Image as ImageIcon, 
  Home, 
  Shield, 
  Rocket, 
  Layers, 
  X, 
  Check, 
  Info,
  Layers3,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function App() {
  const [simpleDescription, setSimpleDescription] = useState('');
  const [artStyle, setArtStyle] = useState('None');
  const [lighting, setLighting] = useState('None');
  const [camera, setCamera] = useState('None');
  const [palette, setPalette] = useState('None');
  const [positivePrompt, setPositivePrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [tags, setTags] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSaveCategory, setSelectedSaveCategory] = useState('Genel');
  const [activeCategory, setActiveCategory] = useState('Tümü');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedMain, setCopiedMain] = useState(false);
  const [isParamsOpen, setIsParamsOpen] = useState(true);

  const categories = ['Tümü', 'Genel', 'Karakter', 'Manzara', 'Mimari', 'Fantezi', 'Bilim Kurgu', 'Soyut', 'Anatomi (18+)'];
  const saveCategories = ['Genel', 'Karakter', 'Manzara', 'Mimari', 'Fantezi', 'Bilim Kurgu', 'Soyut', 'Anatomi (18+)'];

  const artStyles = ['None', 'Photorealistic', 'Anime', 'Watercolor', 'Cyberpunk', 'Oil Painting', 'Artistic & Sensual (18+)'];
  const lightings = ['None', 'Cinematic', 'Soft', 'Dramatic', 'Natural'];
  const cameras = ['None', 'Close-up', 'Wide Angle', 'Aerial'];
  const palettes = ['None', 'Vibrant', 'Monochrome', 'Pastel'];

  const templates = [
    { name: 'Sinematik Portre', artStyle: 'Photorealistic', lighting: 'Cinematic', camera: 'Close-up', palette: 'Vibrant' },
    { name: 'Anime Manzara', artStyle: 'Anime', lighting: 'Soft', camera: 'Wide Angle', palette: 'Pastel' },
    { name: 'Cyberpunk Şehir', artStyle: 'Cyberpunk', lighting: 'Dramatic', camera: 'Wide Angle', palette: 'Vibrant' },
  ];

  const applyTemplate = (template: any) => {
    setArtStyle(template.artStyle);
    setLighting(template.lighting);
    setCamera(template.camera);
    setPalette(template.palette);
  };

  useEffect(() => {
    const q = query(collection(db, 'prompts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const promptsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPrompts(promptsData);
    });
    return () => unsubscribe();
  }, []);

  const handleGenerate = async () => {
    if (!simpleDescription) return;
    setIsGenerating(true);
    try {
      const result = await generatePrompts(simpleDescription, artStyle === 'None' ? 'none' : artStyle, {
        lighting: lighting === 'None' ? 'none' : lighting,
        camera: camera === 'None' ? 'none' : camera,
        palette: palette === 'None' ? 'none' : palette
      });
      setPositivePrompt(result.positive);
      setNegativePrompt(result.negative);
      if (result.tags && Array.isArray(result.tags)) {
        setTags(result.tags.join(', '));
      } else {
        setTags('');
      }
    } catch (error) {
      console.error("Error generating prompt:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!positivePrompt) return;
    if (!window.confirm("Bu prompt'u galeriye kaydetmek istediğinizden emin misiniz?")) return;
    await addDoc(collection(db, 'prompts'), {
      positivePrompt,
      negativePrompt,
      artStyle,
      lighting,
      camera,
      palette,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      category: selectedSaveCategory,
      userId: auth.currentUser?.uid || 'anonymous',
      createdAt: serverTimestamp()
    });
    setPositivePrompt('');
    setNegativePrompt('');
    setTags('');
    setSimpleDescription('');
    setSelectedSaveCategory('Genel');
  };

  const copyToClipboard = (text: string, id?: string) => {
    navigator.clipboard.writeText(text);
    if (id) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      setCopiedMain(true);
      setTimeout(() => setCopiedMain(false), 2000);
    }
  };

  const exportToJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(prompts));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "prompts.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName) {
      case 'Tümü': return <Compass size={15} />;
      case 'Genel': return <Sparkles size={15} />;
      case 'Karakter': return <User size={15} />;
      case 'Manzara': return <ImageIcon size={15} />;
      case 'Mimari': return <Home size={15} />;
      case 'Fantezi': return <Shield size={15} />;
      case 'Bilim Kurgu': return <Rocket size={15} />;
      case 'Soyut': return <Layers size={15} />;
      case 'Anatomi (18+)': return <User size={15} className="text-indigo-500 shrink-0" />;
      default: return <Folder size={15} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800 antialiased overflow-hidden">
      {/* Sleek, Compact Sidebar */}
      <aside className="w-60 bg-white border-r border-slate-100 flex flex-col shrink-0 select-none">
        {/* Brand Header */}
        <div className="h-14 px-4 flex items-center gap-2.5 border-b border-slate-100">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-250">
            <Zap className="text-white w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900">PromptCraft</h1>
            <p className="text-[9px] text-slate-400 font-medium -mt-0.5">V3.5 / Compact Platform</p>
          </div>
        </div>

        {/* Categories Navigation */}
        <div className="p-3 flex-1 overflow-y-auto space-y-1.5 scrollbar-thin">
          <div className="px-2 mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Koleksiyonlar</span>
            <span className="text-[9px] bg-slate-100 text-slate-500 font-semibold px-1.5 py-0.5 rounded">
              {prompts.length} Prompt
            </span>
          </div>
          
          <nav className="space-y-0.5">
            {categories.map(cat => {
              const count = cat === 'Tümü' 
                ? prompts.length 
                : prompts.filter(p => (p.category || 'Genel') === cat).length;
              const isSelected = activeCategory === cat;
              
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    isSelected
                      ? 'bg-indigo-50/75 text-indigo-700 font-semibold shadow-inner'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={isSelected ? 'text-indigo-600' : 'text-slate-400'}>
                      {getCategoryIcon(cat)}
                    </span>
                    <span>{cat}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full transition-colors ${
                    isSelected ? 'bg-indigo-100/80 text-indigo-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Compact parameter settings accordions */}
        <div className="p-3 border-t border-slate-100 select-none bg-slate-50/40">
          <button 
            type="button"
            onClick={() => setIsParamsOpen(!isParamsOpen)}
            className="w-full flex items-center justify-between px-2 py-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors uppercase tracking-wider"
          >
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal size={12} className="text-indigo-600" />
              <span>Parametreler</span>
            </div>
            {isParamsOpen ? <ChevronUp size={12} className="text-slate-400" /> : <ChevronDown size={12} className="text-slate-400" />}
          </button>

          {isParamsOpen && (
            <div className="mt-2 space-y-2 px-1 pb-1 transition-all">
              {/* Art Style Dropdown */}
              <div className="space-y-0.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Sanat Stili</label>
                <div className="relative">
                  <select
                    value={artStyle}
                    onChange={(e) => setArtStyle(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-700 font-semibold outline-none appearance-none cursor-pointer hover:border-slate-300 focus:border-indigo-400 transition"
                  >
                    {artStyles.map(style => (
                      <option key={style} value={style}>{style === 'None' ? 'Varsayılan' : style}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-400 text-[7px]">
                    ▼
                  </div>
                </div>
              </div>

              {/* Lighting Dropdown */}
              <div className="space-y-0.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Işıklandırma</label>
                <div className="relative">
                  <select
                    value={lighting}
                    onChange={(e) => setLighting(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-700 font-semibold outline-none appearance-none cursor-pointer hover:border-slate-300 focus:border-indigo-400 transition"
                  >
                    {lightings.map(l => (
                      <option key={l} value={l}>{l === 'None' ? 'Varsayılan' : l}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-400 text-[7px]">
                    ▼
                  </div>
                </div>
              </div>

              {/* Camera Dropdown */}
              <div className="space-y-0.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Açı / Kadraj</label>
                <div className="relative">
                  <select
                    value={camera}
                    onChange={(e) => setCamera(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-700 font-semibold outline-none appearance-none cursor-pointer hover:border-slate-300 focus:border-indigo-400 transition"
                  >
                    {cameras.map(c => (
                      <option key={c} value={c}>{c === 'None' ? 'Varsayılan' : c}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-400 text-[7px]">
                    ▼
                  </div>
                </div>
              </div>

              {/* Palette Dropdown */}
              <div className="space-y-0.5">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Renk Paleti</label>
                <div className="relative">
                  <select
                    value={palette}
                    onChange={(e) => setPalette(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-700 font-semibold outline-none appearance-none cursor-pointer hover:border-slate-300 focus:border-indigo-400 transition"
                  >
                    {palettes.map(p => (
                      <option key={p} value={p}>{p === 'None' ? 'Varsayılan' : p}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-400 text-[7px]">
                    ▼
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Micro Footer Account Info */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold uppercase shrink-0">
              {auth.currentUser?.email?.[0] || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-800 truncate leading-none">Ali Eren</p>
              <p className="text-[9px] text-slate-400 truncate mt-0.5">{auth.currentUser?.email || 'alieren1@gmail.com'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Board */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#FBFDFE] overflow-hidden">
        {/* Sleek Subheader instead of full high headers */}
        <header className="h-14 px-6 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-indigo-600" />
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Sihirbaz & Prompt Mühendisliği</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Info size={11} className="text-slate-400" /> Hızlı ve temiz AI prompt nesli
            </span>
          </div>
        </header>

        {/* Master Workspace Split Grid */}
        <div className="flex-1 overflow-hidden grid grid-cols-12 gap-5 p-5">
          {/* Left Panel: Generation & Attributes Form */}
          <div className="col-span-12 lg:col-span-7 flex flex-col gap-4 overflow-y-auto pr-1 select-none">
            
            {/* Step 1: Input Description Card */}
            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm relative">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sparkles size={11} className="text-indigo-600" /> 1. Fikir / Açıklama
                </label>
              </div>
              <div className="flex gap-2">
                <input 
                  className="flex-1 px-3 py-2 bg-slate-50/70 hover:bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 leading-normal transition outline-none focus:border-indigo-400 focus:bg-white" 
                  placeholder="Hayal ettiğiniz görseli basitçe yazın (Örn: Antik tapınak kalıntıları arasında süzülen neon kelebekler)" 
                  value={simpleDescription} 
                  onChange={e => setSimpleDescription(e.target.value)} 
                />
                <button 
                  onClick={handleGenerate} 
                  disabled={isGenerating || !simpleDescription} 
                  className={`px-4 py-2 rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 transition whitespace-nowrap min-w-[120px] justify-center ${
                    simpleDescription 
                      ? 'bg-slate-950 text-white hover:bg-slate-800 active:scale-95 cursor-pointer' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={13} /> : <Zap size={12} />}
                  {isGenerating ? 'Tasarlanıyor...' : 'Prompt Oluştur'}
                </button>
              </div>

              {/* Quick Template Pill Row */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 tracking-wide">Stil Setleri:</span>
                <div className="flex flex-wrap gap-1.5">
                  {templates.map(t => (
                    <button 
                      key={t.name} 
                      onClick={() => applyTemplate(t)} 
                      className="px-2 py-1 text-[10px] font-semibold bg-[#F0F2FD] text-indigo-700 hover:bg-[#E5E8FC] rounded-md transition active:scale-95 flex items-center gap-1"
                    >
                      <Layers3 size={10} />
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2: Editor & Output Fields */}
            <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm flex flex-col gap-3 flex-1 min-h-[300px]">
              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  2. Çıktı & Düzenleme
                </label>
                {positivePrompt && (
                  <div className="flex items-center gap-1.5 self-end">
                    <button 
                      onClick={() => copyToClipboard(positivePrompt)} 
                      className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-250 hover:text-slate-800 rounded-md transition flex items-center gap-1"
                    >
                      {copiedMain ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                      {copiedMain ? 'Kopyalandı!' : 'Pozitifi Kopyala'}
                    </button>
                  </div>
                )}
              </div>

              {/* Positive prompt field */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-indigo-600 block uppercase tracking-wide">Pozitif Prompt (Görsel İçeriği)</span>
                <textarea 
                  className="w-full p-2.5 bg-slate-50/70 rounded-lg border border-slate-200 text-xs text-slate-800 font-mono focus:bg-white focus:border-indigo-300 outline-none resize-none h-[75px]" 
                  placeholder="Otomatik oluşturulan veya el ile yazacağınız pozitif prompt..." 
                  value={positivePrompt} 
                  onChange={e => setPositivePrompt(e.target.value)} 
                />
              </div>

              {/* Negative prompt field */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-rose-600 block uppercase tracking-wide">Negatif Prompt (İstenmeyen Unsurlar)</span>
                <textarea 
                  className="w-full p-2.5 bg-slate-50/70 rounded-lg border border-slate-200 text-xs text-slate-800 font-mono focus:bg-white focus:border-indigo-300 outline-none resize-none h-[60px]" 
                  placeholder="Kötü anatomi, bozuk eller, düşük kalite..." 
                  value={negativePrompt} 
                  onChange={e => setNegativePrompt(e.target.value)} 
                />
              </div>

              {/* Tags and Category saving inputs */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Etiketler (Virgülle Ayırın)</span>
                  <input 
                    className="w-full px-2.5 py-1.5 bg-slate-50/70 rounded-lg border border-slate-200 text-xs text-slate-800 focus:bg-white focus:border-indigo-300 outline-none" 
                    placeholder="tag1, tag2..." 
                    value={tags} 
                    onChange={e => setTags(e.target.value)} 
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Kaydetme Kategorisi</span>
                  <div className="relative">
                    <select 
                      className="w-full px-2.5 py-1.5 bg-slate-50/70 rounded-lg border border-slate-200 text-xs text-slate-800 focus:bg-white focus:border-indigo-300 outline-none appearance-none cursor-pointer"
                      value={selectedSaveCategory}
                      onChange={e => setSelectedSaveCategory(e.target.value)}
                    >
                      {saveCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-slate-400 text-[10px] font-bold">
                      ▼
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                <button
                  type="button"
                  onClick={() => {
                    setPositivePrompt('');
                    setNegativePrompt('');
                    setTags('');
                    setSimpleDescription('');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition"
                >
                  Sıfırla
                </button>
                <button 
                  onClick={handleSave} 
                  disabled={!positivePrompt}
                  className={`px-5 py-2 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5 transition ${
                    positivePrompt 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer active:scale-95 shadow-indigo-100' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <PlusCircle size={14} />
                  Koleksiyona Kaydet
                </button>
              </div>
            </div>

          </div>

          {/* Right Panel: Prompt Store Gallery (Filtered by active Category) */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-3 overflow-hidden">
            {/* Gallery Header and Search */}
            <div className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <GalleryVertical size={13} className="text-slate-700" />
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    {activeCategory} Galerisi
                  </span>
                </div>
                <button 
                  onClick={exportToJson} 
                  className="text-[10px] text-indigo-600 font-bold hover:text-indigo-800 hover:underline flex items-center gap-1 transition"
                >
                  <Download size={11} /> Dışa Aktar
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-2.5 flex items-center text-slate-400">
                  <Search size={12} />
                </span>
                <input 
                  type="text" 
                  placeholder="Koleksiyon içinde ara..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs placeholder-slate-400 focus:bg-white focus:border-indigo-300 transition-all outline-none" 
                />
              </div>
            </div>

            {/* Scrollable Gallery list */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 select-none scrollbar-thin">
              {prompts
                .filter(p => p.positivePrompt.toLowerCase().includes(searchTerm.toLowerCase()))
                .filter(p => activeCategory === 'Tümü' || (p.category || 'Genel') === activeCategory)
                .map(p => {
                  const isCopied = copiedId === p.id;
                  return (
                    <div 
                      key={p.id} 
                      onClick={() => setSelectedPrompt(p)} 
                      className="p-3 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 hover:shadow-sm cursor-pointer transition-all duration-150 relative group flex flex-col gap-1.5"
                    >
                      {/* Copy absolute button */}
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          copyToClipboard(p.positivePrompt, p.id); 
                        }} 
                        className="absolute top-2.5 right-2.5 p-1 bg-white border border-slate-200 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-slate-50 transition-all duration-150 shadow-sm"
                        title="Pozitif promptu kopyala"
                      >
                        {isCopied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} className="text-slate-500" />}
                      </button>

                      {/* Info header badges */}
                      <div className="flex items-center gap-1.5 flex-wrap pr-6">
                        <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100/50 rounded text-[9px] font-bold uppercase tracking-wider">
                          {p.category || 'Genel'}
                        </span>
                        {p.artStyle && p.artStyle !== 'None' && p.artStyle !== 'none' && (
                          <span className="px-1.5 py-0.5 bg-slate-50 text-slate-600 border border-slate-100 rounded text-[9px] font-medium">
                            {p.artStyle}
                          </span>
                        )}
                      </div>

                      {/* Content block */}
                      <p className="font-semibold text-slate-800 text-xs line-clamp-2 leading-relaxed pr-2">
                        {p.positivePrompt}
                      </p>
                      
                      {p.negativePrompt && (
                        <p className="text-[10px] text-slate-400 font-medium line-clamp-1 italic">
                          Neg: {p.negativePrompt}
                        </p>
                      )}

                      {/* Tag list */}
                      {p.tags && p.tags.length > 0 && (
                        <div className="flex gap-1 items-center flex-wrap mt-0.5 pt-1.5 border-t border-slate-50">
                          {p.tags.map((t: string) => (
                            <span key={t} className="px-1.5 py-0.5 bg-slate-50 rounded text-[9px] text-slate-500 font-medium">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

              {/* Clean Empty State */}
              {prompts
                .filter(p => p.positivePrompt.toLowerCase().includes(searchTerm.toLowerCase()))
                .filter(p => activeCategory === 'Tümü' || (p.category || 'Genel') === activeCategory).length === 0 && (
                  <div className="text-center py-10 bg-white border border-dashed border-slate-150 rounded-xl">
                    <GalleryVertical size={20} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-xs text-slate-400 font-medium">Bu kategoride henüz kaydedilmiş prompt bulunmuyor.</p>
                  </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Pure, high-aesthetic Premium Detail Modal */}
      {selectedPrompt && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all" 
          onClick={() => setSelectedPrompt(null)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-100 overflow-hidden flex flex-col transition-all max-h-[90vh]" 
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded uppercase">
                  {selectedPrompt.category || 'Genel'}
                </span>
                <h3 className="font-bold text-sm text-slate-900 mt-1">Prompt Detayları</h3>
              </div>
              <button 
                onClick={() => setSelectedPrompt(null)} 
                className="w-7 h-7 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center transition text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            </div>

            {/* Scrollable Information list */}
            <div className="p-5 overflow-y-auto space-y-4">
              
              {/* Params grid */}
              <div className="bg-slate-50/55 rounded-xl border border-slate-100 p-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Sanat Stili</p>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">{selectedPrompt.artStyle || 'Belirtilmedi'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Işıklandırma</p>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">{selectedPrompt.lighting || 'Belirtilmedi'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Açı / Kamera</p>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">{selectedPrompt.camera || 'Belirtilmedi'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Renk Paleti</p>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">{selectedPrompt.palette || 'Belirtilmedi'}</p>
                </div>
              </div>

              {/* Text elements */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider">Pozitif Prompt</p>
                  <button 
                    onClick={() => copyToClipboard(selectedPrompt.positivePrompt, 'modal-pos')} 
                    className="text-[9px] font-bold text-slate-500 hover:text-slate-800 transition flex items-center gap-1"
                  >
                    {copiedId === 'modal-pos' ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                    Kopyala
                  </button>
                </div>
                <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 min-h-[45px] leading-relaxed font-mono select-text">
                  {selectedPrompt.positivePrompt}
                </div>
              </div>

              {selectedPrompt.negativePrompt && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-bold text-rose-500 uppercase tracking-wider">Negatif Prompt</p>
                    <button 
                      onClick={() => copyToClipboard(selectedPrompt.negativePrompt, 'modal-neg')} 
                      className="text-[9px] font-bold text-slate-500 hover:text-slate-800 transition flex items-center gap-1"
                    >
                      {copiedId === 'modal-neg' ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                      Kopyala
                    </button>
                  </div>
                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 min-h-[45px] leading-relaxed font-mono select-text">
                    {selectedPrompt.negativePrompt}
                  </div>
                </div>
              )}

              {/* Tag list */}
              {selectedPrompt.tags && selectedPrompt.tags.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Etiketler</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {selectedPrompt.tags.map((t: string) => (
                      <span key={t} className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[9px] font-medium transition cursor-default">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer closes */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/20 flex gap-2">
              <button 
                onClick={() => setSelectedPrompt(null)} 
                className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
