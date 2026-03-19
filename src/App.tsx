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
    hasSearched: boolean;
  }>({
    recipe: [],
    specs: [],
    hasSearched: false
  });

  const [copiedRecipe, setCopiedRecipe] = useState(false);
  const [copiedSpecs, setCopiedSpecs] = useState(false);

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

  useEffect(() => {
    const loadData = async () => {
      try {
        const [rubber, spec] = await Promise.all([
          fetchRubberData(),
          fetchSpecData()
        ]);
        setRubberData(rubber);
        setSpecData(spec);
        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setError('Failed to load data from Google Sheets. Please ensure the sheet is accessible.');
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const q = query.trim().toUpperCase();
    if (!q) return;

    setIsSearching(true);
    setError(null);
    
    try {
      // Fetch recipe data dynamically for the searched rubber name
      const recipe = await fetchRecipeData(q);

      // Find the SAP code from the rubber data to search the specs
      const rubberMatch = rubberData.find(r => 
        r.rubberName.toUpperCase().includes(q) || r.sapCode.toUpperCase().includes(q)
      );
      const searchSapCode = rubberMatch?.sapCode.toUpperCase() || q;

      // Extract the first 4 digits from the query (e.g., "7316" from "7316F")
      const digitMatch = q.match(/\d{4}/);
      const baseCode = digitMatch ? digitMatch[0] : q;

      // We search specs by checking if the compound contains the 4-digit base code
      // (or matches the SAP code/raw query as a fallback)
      const specMatches = specData.filter(s => {
        const cusion = s.cusionCompound.toUpperCase();
        const tread1 = s.treadCompound1.toUpperCase();
        const tread2 = s.treadCompound2.toUpperCase();

        if (digitMatch) {
          return cusion.includes(baseCode) || tread1.includes(baseCode) || tread2.includes(baseCode);
        }

        return cusion === searchSapCode ||
               tread1 === searchSapCode ||
               tread2 === searchSapCode ||
               cusion === q ||
               tread1 === q ||
               tread2 === q;
      });

      setResult({
        recipe: recipe,
        specs: specMatches,
        hasSearched: true
      });
    } catch (err) {
      console.error(err);
      setError('Failed to fetch recipe data.');
    } finally {
      setIsSearching(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-4" />
        <p className="text-slate-500 text-sm font-medium tracking-wide uppercase">Initializing Database...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header & Search */}
        <header className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border-t-4 border-orange-500">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
              <Database className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">MAXXIS RUBBER INDIA</h1>
              <p className="text-sm text-slate-500 font-medium">Spec and raw material searcher規格和原料搜尋器</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Rubber Name, Material, or SAP Code..."
              className="w-full pl-12 pr-32 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-lg"
            />
            <button
              type="submit"
              disabled={!query.trim() || isSearching}
              className="absolute right-2 px-6 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
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
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-bold tracking-tight text-slate-800">Raw Material Details for 原料詳情 "{query.toUpperCase()}"</h2>
                </div>
                {result.recipe.length > 0 && (
                  <button
                    onClick={handleCopyRecipe}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    title="Copy"
                  >
                    {copiedRecipe ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    {copiedRecipe ? 'Copied!' : 'Copy'}
                  </button>
                )}
              </div>
              
              {result.recipe.length > 0 ? (
                <div ref={recipeTableRef} className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-1">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="py-2 px-2 md:px-4 text-[11px] md:text-xs uppercase tracking-wider text-slate-500 font-bold w-[30%]">
                          Rubber Compound<br/><span className="text-[9px] md:text-[10px] font-normal text-slate-400">膠料名稱</span>
                        </th>
                        <th className="py-2 px-2 md:px-4 text-[11px] md:text-xs uppercase tracking-wider text-slate-500 font-bold w-[45%] min-w-[110px]">
                          Material<br/><span className="text-[9px] md:text-[10px] font-normal text-slate-400">原料名稱及代碼</span>
                        </th>
                        <th className="py-2 px-2 md:px-4 text-[11px] md:text-xs uppercase tracking-wider text-slate-500 font-bold text-right w-[25%]">
                          Weight<br/><span className="text-[9px] md:text-[10px] font-normal text-slate-400">重量</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {result.recipe.map((item, idx) => (
                        <tr key={idx} className="hover:bg-orange-50/50 transition-colors group">
                          <td className="py-3 px-2 md:px-4 text-xs md:text-sm font-bold text-slate-800 align-top">
                            {item.rubberName}
                          </td>
                          <td className="py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-slate-800 align-top">
                            {item.name}
                            <div className="font-mono text-[10px] md:text-xs text-slate-500 mt-0.5 whitespace-nowrap">{item.code}</div>
                          </td>
                          <td className="py-3 px-2 md:px-4 text-xs md:text-sm font-bold text-orange-600 text-right align-top">
                            {item.weight}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                  <p>No matching rubber compound or raw material found for "{query}".</p>
                </div>
              )}
            </section>

            {/* Tyre Specs Table */}
            <section className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-orange-500" />
                  <h2 className="text-lg font-bold tracking-tight text-slate-800">Compatible Tyre Specs 相容輪胎規格</h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 px-3 py-1 rounded-full text-xs font-bold text-orange-700">
                    {result.specs.length} {result.specs.length === 1 ? 'Match' : 'Matches'}
                  </div>
                  {result.specs.length > 0 && (
                    <button
                      onClick={handleCopySpecs}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      title="Copy"
                    >
                      {copiedSpecs ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      {copiedSpecs ? 'Copied!' : 'Copy'}
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
                          Material<br/><span className="text-[9px] md:text-[10px] font-normal text-slate-400">替代文字及料號</span>
                        </th>
                        <th className="py-2 px-2 md:px-4 text-[11px] md:text-xs uppercase tracking-wider text-slate-500 font-bold w-[60%]">
                          Long Text (Tyre Spec)<br/><span className="text-[9px] md:text-[10px] font-normal text-slate-400">詳細規格</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {result.specs.map((spec, idx) => (
                        <tr key={idx} className="hover:bg-orange-50/50 transition-colors group">
                          <td className="py-3 px-2 md:px-4 text-xs md:text-sm font-medium text-slate-800 align-top">
                            {spec.alternativeText}
                            <div className="font-mono text-[10px] md:text-xs text-slate-500 mt-0.5 whitespace-nowrap">{spec.material}</div>
                          </td>
                          <td className="py-3 px-2 md:px-4 text-xs md:text-sm text-slate-600 align-top">
                            {spec.longText}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                  <p>No compatible tyre specs found for "{query}".</p>
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
              <h3 className="text-lg font-bold text-slate-800">Right-click image to copy</h3>
              <button 
                onClick={() => setPreviewImage(null)} 
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                title="Close"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="bg-orange-50 text-orange-800 px-4 py-3 rounded-xl text-sm w-full border border-orange-100 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>
                Your browser's security settings prevent direct clipboard access. 
                Please <strong>right-click</strong> the image below and select <strong>"Copy Image"</strong>.
              </p>
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
