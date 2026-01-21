import React, { useEffect, useState } from 'react';
import { getUserPresentations } from '../services/firebase';
import { UserProfile, SavedPresentation } from '../types';

interface SavedPresentationsProps {
  user: UserProfile;
}

const SavedPresentations: React.FC<SavedPresentationsProps> = ({ user }) => {
  const [presentations, setPresentations] = useState<SavedPresentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPres = async () => {
      try {
        const data = await getUserPresentations(user.uid);
        setPresentations(data as SavedPresentation[]);
      } catch (e) {
        console.error("Error fetching presentations", e);
      } finally {
        setLoading(false);
      }
    };
    fetchPres();
  }, [user.uid]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return <div className="p-8 text-nexus-accent">Accessing memory archives...</div>;

  return (
    <div className="p-8 h-full overflow-y-auto bg-nexus-black text-white w-full">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">Saved Presentations</h1>
      
      {presentations.length === 0 ? (
        <p className="text-gray-500">No presentations archived in neural memory.</p>
      ) : (
        <div className="space-y-6">
          {presentations.map((p) => {
            // Check if data is array or object. Based on instruction, it returns an array of 1 object.
            const presData = Array.isArray(p.data) ? p.data[0] : p.data;
            const meta = presData.presentation_metadata;

            return (
              <div key={p.id} className="bg-nexus-panel border border-white/10 rounded-lg overflow-hidden transition-all hover:border-yellow-400/50">
                <div 
                  className="p-6 cursor-pointer flex justify-between items-center bg-nexus-dark/50"
                  onClick={() => toggleExpand(p.id)}
                >
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">{meta?.title || "Untitled Deck"}</h2>
                    <p className="text-sm text-gray-400">{meta?.author} • {meta?.theme}</p>
                  </div>
                  <i className={`fas fa-chevron-down transition-transform ${expandedId === p.id ? 'rotate-180' : ''}`}></i>
                </div>

                {expandedId === p.id && (
                   <div className="p-6 bg-nexus-black/50 border-t border-white/5 space-y-8">
                      <div className="text-sm text-gray-300 italic border-l-2 border-yellow-400 pl-4">
                        " {meta?.objective} "
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {presData.slides?.map((slide: any) => (
                          <div key={slide.slide_number} className="bg-nexus-dark p-4 rounded border border-white/5 hover:bg-nexus-panel transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-nexus-accent text-sm">Slide {slide.slide_number}: {slide.header}</h3>
                            </div>
                            <ul className="list-disc list-inside text-xs text-gray-300 mb-3 space-y-1">
                              {slide.content.map((point: string, idx: number) => (
                                <li key={idx}>{point}</li>
                              ))}
                            </ul>
                            <div className="text-[10px] text-gray-500 bg-black/40 p-2 rounded font-mono">
                                <i className="fas fa-eye mr-1"></i> Visual: {slide.visual_prompt}
                            </div>
                          </div>
                        ))}
                      </div>
                   </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedPresentations;