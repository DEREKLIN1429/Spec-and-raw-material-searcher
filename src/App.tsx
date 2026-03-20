import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, AlertCircle, Database, Layers, Package, Copy, Check, Image as ImageIcon, X } from 'lucide-react';
import { toBlob, toPng } from 'html-to-image';
import { fetchRecipeData, fetchSpecData, fetchRubberData, RecipeItem, SpecData, RubberData } from './services/sheetService';

export default function App() {
  const recipeTableRef = useRef<HTMLDivElement>(null);
  const specsTableRef = useRef<HTMLDivElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [rubberData, setRubberData] = useState<RubberData[]>([]);
  const [specData, setSpecData] = useState<SpecData[]>([]);
  
  const [result, setResult] = useState<{
    recipe: RecipeItem[];
    specs: SpecData[];
    matchedCompounds: string[];
    hasSearched: boolean;
  }>({
    recipe: [],
    specs: [],
    matchedCompounds: [],
    hasSearched: false
  });

  const [copiedRecipe, setCopiedRecipe] = useState(false);
  const [copiedSpecs, setCopiedSpecs] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [lang, setLang] = useState<'en' | 'zh'>('zh');

  const t = {
    en: {
      title: "MAXXIS RUBBER INDIA",
      subtitle: "Spec and raw material searcher",
      placeholder: "Enter Rubber Name, Material, or SAP Code...",
      search: "Search",
      initializing: "Initializing Database...",
      rawMaterialDetails: "Raw Material Details for",
      copy: "Copy",
      copied: "Copied!",
      compoundsUsed: "Rubber Compounds Used in this Spec:",
      doubleClickInfo: "* Raw material recipes for these compounds are shown in the table below.",
      doubleClickSearch: "Double-click to search",
      rubberCompound: "Rubber Compound",
      material: "Material",
      weight: "Weight",
      totalWeight: "Total Weight",
      noRecipe: "No matching rubber compound or raw material found for",
      tyreSpecs: "Compatible Tyre Specs",
      matches: "Matches",
      match: "Match",
      noSpecs: "No compatible tyre specs found for",
      longText: "Long Text (Tyre Spec)",
      detailedSpec: "Detailed Specification",
      close: "Close",
      clearCache: "Clear Cache",
      refreshing: "Refreshing...",
      rightClickCopy: "Right-click image to copy",
      browserSecurity: "Your browser's security settings prevent direct clipboard access. Please right-click the image below and select \"Copy Image\"."
    },
    zh: {
      title: "MAXXIS RUBBER INDIA",
      subtitle: "規格和原料搜尋器",
      placeholder: "輸入膠料名稱、材料或 SAP 代碼...",
      search: "搜尋",
      initializing: "資料庫初始化中...",
      rawMaterialDetails: "原料詳情",
      copy: "複製",
      copied: "已複製！",
      compoundsUsed: "此規格使用的膠料：",
      doubleClickInfo: "* 這些膠料的原料配方顯示在下表中。",
      doubleClickSearch: "雙擊進行搜尋",
      rubberCompound: "膠料名稱",
      material: "原料名稱及代碼",
      weight: "重量",
      totalWeight: "總重量",
      noRecipe: "找不到符合的膠料或原料：",
      tyreSpecs: "相容輪胎規格",
      matches: "個符合",
      match: "個符合",
      noSpecs: "找不到相容的輪胎規格：",
      longText: "詳細規格",
      detailedSpec: "詳細規格資訊",
      close: "關閉",
      clearCache: "清除暫存檔案",
      refreshing: "重新整理中...",
      rightClickCopy: "右鍵點擊圖片進行複製",
      browserSecurity: "您的瀏覽器安全性設定阻止了直接存取剪貼簿。請右鍵點擊下方圖片並選擇「複製圖片」。"
    }
  };

  const currentT = t[lang];

  const handleDoubleClick = (text: string) => {
    const cleanText = text.trim();
    if (!cleanText) return;
    setQuery(cleanText);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyRecipe = async () => {
    if (!result.recipe.length || !recipeTableRef.current) return;
    try {
      const blob = await toBlob(recipeTableRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });
      if (!blob) return;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopiedRecipe(true);
        setTimeout(() => setCopiedRecipe(false), 2000);
      } catch (clipboardError) {
        console.warn('Clipboard write failed, showing preview modal:', clipboardError);
        const dataUrl = await toPng(recipeTableRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });
        setPreviewImage(dataUrl);
      }
    } catch (err) {
      console.error('Failed to generate image:', err);
    }
  };

  const handleCopySpecs = async () => {
    if (!result.specs.length || !specsTableRef.current) return;
    try {
      const blob = await toBlob(specsTableRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });
      if (!blob) return;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopiedSpecs(true);
        setTimeout(() => setCopiedSpecs(false), 2000);
      } catch (clipboardError) {
        console.warn('Clipboard write failed, showing preview modal:', clipboardError);
        const dataUrl = await toPng(specsTableRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });
        setPreviewImage(dataUrl);
      }
    } catch (err) {
      console.error('Failed to generate image:', err);
    }
  };

  const loadData = async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    else setIsRefreshing(true);
    
    try {
      const [rubber, spec] = await Promise.all([
        fetchRubberData(),
        fetchSpecData()
      ]);
      setRubberData(rubber);
      setSpecData(spec);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to load data from Google Sheets. Please ensure the sheet is accessible.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClearCache = () => {
    loadData(false);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const q = query.trim().toUpperCase();
    if (!q) return;

    setIsSearching(true);
    setError(null);
    
    try {
      console.log('Searching for:', q);

      // 1. Initial direct search in specs (by Material, Long Text, or Alternative Text)
      const directSpecMatches = specData.filter(s => 
        s.material.toUpperCase().includes(q) || 
        s.longText.toUpperCase().includes(q) ||
        s.alternativeText.toUpperCase().includes(q)
      );

      // 2. Identify initial compounds to fetch recipes for
      const initialCompounds = new Set<string>();
      const extractCode = (str: string) => {
        if (!str) return '';
        const match = str.match(/\d{4}/);
        return match ? match[0] : str.trim();
      };

      directSpecMatches.forEach(s => {
        if (s.cusionCompound?.trim()) initialCompounds.add(extractCode(s.cusionCompound));
        if (s.treadCompound1?.trim()) initialCompounds.add(extractCode(s.treadCompound1));
        if (s.treadCompound2?.trim()) initialCompounds.add(extractCode(s.treadCompound2));
      });

      // 3. Fetch recipes for the query and any compounds found in direct spec matches
      const recipeQueries = [q, ...Array.from(initialCompounds)];
      const recipe = await fetchRecipeData(recipeQueries);
      
      // 4. Identify all involved compounds from the recipe results
      // (This handles the case where searching by material code returns compounds using it)
      const allInvolvedCompounds = new Set<string>(initialCompounds);
      recipe.forEach(r => {
        const code = extractCode(r.rubberName);
        if (code) allInvolvedCompounds.add(code);
      });

      // Also check rubberData for SAP code matches to be thorough
      const rubberMatch = rubberData.find(r => 
        r.rubberName.toUpperCase().includes(q) || r.sapCode.toUpperCase().includes(q)
      );
      if (rubberMatch) {
        const code = extractCode(rubberMatch.sapCode);
        if (code) allInvolvedCompounds.add(code);
      }

      // 5. Final spec filtering: 
      // Include specs that match directly OR use any of the involved compounds
      const finalSpecMatches = specData.filter(s => {
        // Direct match
        if (s.material.toUpperCase().includes(q) || 
            s.longText.toUpperCase().includes(q) ||
            s.alternativeText.toUpperCase().includes(q)) return true;

        // Compound match
        const c = extractCode(s.cusionCompound);
        const t1 = extractCode(s.treadCompound1);
        const t2 = extractCode(s.treadCompound2);

        return (c && allInvolvedCompounds.has(c)) || 
               (t1 && allInvolvedCompounds.has(t1)) || 
               (t2 && allInvolvedCompounds.has(t2));
      });
      
      // Sort recipes by rubber name to ensure grouping works in the table
      const sortedRecipe = [...recipe].sort((a, b) => a.rubberName.localeCompare(b.rubberName));

      setResult({
        recipe: sortedRecipe,
        specs: finalSpecMatches,
        matchedCompounds: Array.from(allInvolvedCompounds),
        hasSearched: true
      });
    } catch (err) {
      console.error(err);
      setError('Failed to fetch data.');
    } finally {
      setIsSearching(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-4" />
        <p className="text-slate-500 text-sm font-medium tracking-wide uppercase">{currentT.initializing}</p>
      </div>
    );
  }

  // Find if the search query matches a material code to show its long text
  const trimmedQuery = query.trim().toUpperCase();
  const matchedSpecForHeader = result.specs.find(s => 
    s.material.toUpperCase() === trimmedQuery || 
    s.longText.toUpperCase() === trimmedQuery ||
    s.alternativeText.toUpperCase() === trimmedQuery
  ) || (result.specs.length === 1 ? result.specs[0] : null);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header & Search */}
        <header className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border-t-4 border-orange-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                <Database className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold tracking-tight text-slate-900">{currentT.title}</h1>
                <p className="text-sm text-slate-500 font-medium">{currentT.subtitle}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 self-end md:self-auto">
              <button 
                onClick={handleClearCache}
                disabled={isRefreshing}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isRefreshing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Database className="w-3 h-3" />}
                {isRefreshing ? currentT.refreshing : currentT.clearCache}
              </button>
              <div className="w-px h-4 bg-slate-200 mx-1"></div>
              <button 
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${lang === 'en' ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                English
              </button>
              <button 
                onClick={() => setLang('zh')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${lang === 'zh' ? 'bg-orange-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                繁體中文
              </button>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={currentT.placeholder}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-lg"
              />
            </div>
            <button
              type="submit"
              disabled={!query.trim() || isSearching}
              className="px-8 py-4 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 whitespace-nowrap"
            >
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Search className="w-5 h-5" /> {currentT.search}</>}
            </button>
          </form>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 text-sm border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </header>

        {/* Results Area */}
        {result.hasSearched && (
          <div className="space-y-6">
            
            {/* Raw Material Card */}
            <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Layers className="w-5 h-5 text-orange-500" />
                    <h2 className="text-lg font-bold tracking-tight text-slate-800">
                      {currentT.rawMaterialDetails} "{query.toUpperCase()}"
                    </h2>
                    {matchedSpecForHeader && (
                      <div className="ml-0 md:ml-4 px-3 py-1 bg-orange-100 border border-orange-200 rounded-lg text-xs font-bold text-orange-800 flex items-center gap-2">
                        <span className="opacity-60">{currentT.longText}:</span>
                        {matchedSpecForHeader.longText}
                      </div>
                    )}
                  </div>
                  {result.recipe.length > 0 && (
                    <button
                      onClick={handleCopyRecipe}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      title={currentT.copy}
                    >
                      {copiedRecipe ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      {copiedRecipe ? currentT.copied : currentT.copy}
                    </button>
                  )}
                </div>

                {result.matchedCompounds.length > 0 && (
                  <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                    <p className="text-xs font-bold text-orange-700 uppercase tracking-wider mb-2">{currentT.compoundsUsed}</p>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedCompounds.map(c => (
                        <div 
                          key={c} 
                          onDoubleClick={() => handleDoubleClick(c)}
                          className="px-3 py-1 bg-white border border-orange-200 rounded-lg text-sm font-bold text-slate-700 shadow-sm flex items-center gap-2 cursor-pointer hover:border-orange-400 transition-colors select-none"
                          title={currentT.doubleClickSearch}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                          {c}
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-orange-600 mt-2 italic">{currentT.doubleClickInfo}</p>
                  </div>
                )}
              </div>
              
              {result.recipe.length > 0 ? (
                <div ref={recipeTableRef} className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="py-2 px-2 md:px-4 text-[11px] md:text-xs uppercase tracking-wider text-slate-500 font-bold w-[30%]">
                          {currentT.rubberCompound}<br/><span className="text-[9px] md:text-[10px] font-normal text-slate-400">{lang === 'zh' ? '膠料名稱' : 'Rubber Compound'}</span>
                        </th>
                        <th className="py-2 px-2 md:px-4 text-[11px] md:text-xs uppercase tracking-wider text-slate-500 font-bold w-[45%] min-w-[110px]">
                          {currentT.material}<br/><span className="text-[9px] md:text-[10px] font-normal text-slate-400">{lang === 'zh' ? '原料名稱及代碼' : 'Material Name & Code'}</span>
                        </th>
                        <th className="py-2 px-2 md:px-4 text-[11px] md:text-xs uppercase tracking-wider text-slate-500 font-bold text-right w-[25%]">
                          {currentT.weight}<br/><span className="text-[9px] md:text-[10px] font-normal text-slate-400">{lang === 'zh' ? '重量' : 'Weight'}</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(() => {
                        const groups: { name: string; items: RecipeItem[] }[] = [];
                        result.recipe.forEach(item => {
                          if (groups.length === 0 || groups[groups.length - 1].name !== item.rubberName) {
                            groups.push({ name: item.rubberName, items: [item] });
                          } else {
                            groups[groups.length - 1].items.push(item);
                          }
                        });

                        return groups.map((group, gIdx) => {
                          const groupTotal = group.items.reduce((sum, item) => sum + (parseFloat(item.weight) || 0), 0);
                          return (
                            <React.Fragment key={gIdx}>
                              {group.items.map((item, iIdx) => (
                                <tr key={`${gIdx}-${iIdx}`} className="hover:bg-orange-50/50 transition-colors group">
                                  {iIdx === 0 && (
                                    <td 
                                      rowSpan={group.items.length + 1} 
                                      onDoubleClick={() => handleDoubleClick(group.name)}
                                      className="py-3 px-2 md:px-4 text-xs md:text-sm font-bold text-slate-800 align-middle text-center border-r border-slate-100 bg-slate-50/30 cursor-pointer hover:bg-orange-100/50 transition-colors select-none"
                                      title={currentT.doubleClickSearch}
                                    >
                                      {group.name}
                                    </td>
                                  )}
                                  <td 
                                    onDoubleClick={() => handleDoubleClick(item.name)}
                                    className="py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-slate-800 align-top cursor-pointer hover:bg-orange-50 transition-colors select-none"
                                    title={currentT.doubleClickSearch}
                                  >
                                    {item.name}
                                    <div 
                                      onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        handleDoubleClick(item.code);
                                      }}
                                      className="font-mono text-[10px] md:text-xs text-slate-500 mt-0.5 whitespace-nowrap hover:text-orange-600"
                                    >
                                      {item.code}
                                    </div>
                                  </td>
                                  <td className="py-3 px-2 md:px-4 text-xs md:text-sm font-bold text-orange-600 text-right align-top">
                                    {item.weight}
                                  </td>
                                </tr>
                              ))}
                              <tr className="bg-orange-50/30 font-bold border-t border-orange-100">
                                <td className="py-2 px-2 md:px-4 text-[10px] md:text-xs text-orange-700 text-right uppercase tracking-wider">
                                  {currentT.totalWeight}
                                </td>
                                <td className="py-2 px-2 md:px-4 text-xs md:text-sm text-orange-800 text-right">
                                  {groupTotal.toFixed(3)}
                                </td>
                              </tr>
                            </React.Fragment>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                  <p>{currentT.noRecipe} "{query}".</p>
                </div>
              )}
            </section>

            {/* Tyre Specs Table */}
            <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-bold tracking-tight text-slate-800">{currentT.tyreSpecs}</h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 px-3 py-1 rounded-full text-xs font-bold text-orange-700">
                    {result.specs.length} {result.specs.length === 1 ? currentT.match : currentT.matches}
                  </div>
                  {result.specs.length > 0 && (
                    <button
                      onClick={handleCopySpecs}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      title={currentT.copy}
                    >
                      {copiedSpecs ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      {copiedSpecs ? currentT.copied : currentT.copy}
                    </button>
                  )}
                </div>
              </div>

              {result.specs.length > 0 ? (
                <div ref={specsTableRef} className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="py-2 px-2 md:px-4 text-[11px] md:text-xs uppercase tracking-wider text-slate-500 font-bold w-[40%] min-w-[110px]">
                          {currentT.material}<br/><span className="text-[9px] md:text-[10px] font-normal text-slate-400">{lang === 'zh' ? '替代文字及料號' : 'Alt Text & Material Code'}</span>
                        </th>
                        <th className="py-2 px-2 md:px-4 text-[11px] md:text-xs uppercase tracking-wider text-slate-500 font-bold w-[60%]">
                          {currentT.longText}<br/><span className="text-[9px] md:text-[10px] font-normal text-slate-400">{lang === 'zh' ? '詳細規格' : 'Detailed Specification'}</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {result.specs.map((spec, idx) => (
                        <tr key={idx} className="hover:bg-orange-50/50 transition-colors group">
                          <td 
                            onDoubleClick={() => handleDoubleClick(spec.alternativeText)}
                            className="py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-slate-800 align-top cursor-pointer hover:bg-orange-100/30 transition-colors select-none"
                            title={currentT.doubleClickSearch}
                          >
                            {spec.alternativeText}
                            <div 
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                handleDoubleClick(spec.material);
                              }}
                              className="font-mono text-[10px] md:text-xs text-slate-500 mt-0.5 whitespace-nowrap hover:text-orange-600"
                            >
                              {spec.material}
                            </div>
                          </td>
                          <td 
                            onDoubleClick={() => handleDoubleClick(spec.longText)}
                            className="py-3 px-2 md:px-4 text-xs md:text-sm text-slate-600 align-top cursor-pointer hover:bg-orange-50 transition-colors select-none"
                            title={currentT.doubleClickSearch}
                          >
                            {spec.longText}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                  <p>{currentT.noSpecs} "{query}".</p>
                </div>
              )}
            </section>

          </div>
        )}
      </div>
      {/* Preview Modal for Fallback Image Copy */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" 
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto flex flex-col items-center gap-4 shadow-2xl" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between w-full items-center">
              <h3 className="text-lg font-bold text-slate-800">{currentT.rightClickCopy}</h3>
              <button 
                onClick={() => setPreviewImage(null)} 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                title={currentT.close}
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="bg-orange-50 text-orange-800 px-4 py-3 rounded-xl text-sm w-full border border-orange-100 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{currentT.browserSecurity}</p>
            </div>
            <div className="w-full overflow-auto border border-slate-200 rounded-xl bg-slate-50 p-4 flex justify-center">
              <img 
                src={previewImage} 
                alt="Table Preview" 
                className="max-w-full h-auto shadow-sm bg-white" 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
