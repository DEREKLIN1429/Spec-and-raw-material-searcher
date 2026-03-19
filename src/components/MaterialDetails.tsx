import React, { useState } from 'react';
import { RawMaterial } from '../types';
import { Package, Truck, Calendar, Info, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface MaterialDetailsProps {
  material: RawMaterial;
  onClose: () => void;
}

export const MaterialDetails: React.FC<MaterialDetailsProps> = ({ material, onClose }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const generateInsight = async () => {
    setLoadingInsight(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: `Provide a brief (2-3 sentences) industrial market insight or usage recommendation for the following raw material:
        Name: ${material.name}
        Category: ${material.category}
        Specifications: ${JSON.stringify(material.specifications)}
        Description: ${material.description}`,
      });
      setInsight(response.text || "No insight available at this time.");
    } catch (error) {
      console.error("Error generating insight:", error);
      setInsight("Failed to generate insight. Please check your API key.");
    } finally {
      setLoadingInsight(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-ink/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg w-full max-w-2xl border border-line shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-line flex justify-between items-start">
          <div>
            <span className="col-header block mb-1">{material.category}</span>
            <h2 className="text-3xl font-bold tracking-tight uppercase">{material.name}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-ink hover:text-bg transition-colors border border-line"
          >
            ESC
          </button>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <section>
              <h3 className="col-header mb-3 flex items-center gap-2">
                <Info size={14} /> Description
              </h3>
              <p className="text-sm leading-relaxed">{material.description}</p>
            </section>
            
            <section>
              <h3 className="col-header mb-3 flex items-center gap-2">
                <Package size={14} /> Inventory
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-line p-3">
                  <span className="text-[10px] uppercase opacity-50 block">Quantity</span>
                  <span className="data-value text-xl">{material.quantity} {material.unit}</span>
                </div>
                <div className="border border-line p-3">
                  <span className="text-[10px] uppercase opacity-50 block">Unit Price</span>
                  <span className="data-value text-xl">${material.unitPrice.toFixed(2)}</span>
                </div>
              </div>
            </section>

            {/* AI Insight Section */}
            <section className="border border-line p-4 bg-ink/5 relative overflow-hidden">
              <div className="flex justify-between items-center mb-2">
                <h3 className="col-header flex items-center gap-2">
                  <Sparkles size={14} className="text-indigo-600" /> AI Market Insight
                </h3>
                {!insight && !loadingInsight && (
                  <button 
                    onClick={generateInsight}
                    className="text-[10px] font-bold uppercase tracking-widest hover:underline"
                  >
                    Generate
                  </button>
                )}
              </div>
              
              {loadingInsight ? (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-[10px] uppercase tracking-widest opacity-50">Analyzing Market Data...</span>
                </div>
              ) : insight ? (
                <p className="text-xs italic leading-relaxed opacity-80">{insight}</p>
              ) : (
                <p className="text-[10px] uppercase tracking-widest opacity-30">Click generate for AI analysis</p>
              )}
            </section>
          </div>
          
          <div className="space-y-6">
            <section>
              <h3 className="col-header mb-3 flex items-center gap-2">
                <Truck size={14} /> Supplier Info
              </h3>
              <div className="border border-line p-3">
                <span className="text-sm font-medium">{material.supplier}</span>
                <div className="flex items-center gap-2 mt-2 opacity-50">
                  <Calendar size={12} />
                  <span className="text-[10px] uppercase">Last Updated: {new Date(material.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>
            </section>
            
            <section>
              <h3 className="col-header mb-3">Specifications</h3>
              <div className="space-y-2">
                {Object.entries(material.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b border-line/20 py-1 text-sm">
                    <span className="capitalize opacity-60">{key}</span>
                    <span className="font-mono">{value}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
        
        <div className="p-6 bg-ink text-bg flex justify-end gap-4">
          <button className="px-6 py-2 border border-bg/20 hover:bg-bg hover:text-ink transition-colors text-xs uppercase tracking-widest">
            Edit Details
          </button>
          <button className="px-6 py-2 bg-bg text-ink hover:bg-bg/90 transition-colors text-xs uppercase tracking-widest font-bold">
            Order Restock
          </button>
        </div>
      </div>
    </div>
  );
};
