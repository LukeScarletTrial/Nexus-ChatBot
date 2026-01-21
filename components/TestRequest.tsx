import React, { useState, useEffect } from 'react';
import { getUserKeys } from '../services/firebase';
import { nexusBrain } from '../services/nexusService';
import { UserProfile, NexusModel } from '../types';

interface TestRequestProps {
  user: UserProfile;
}

const TestRequest: React.FC<TestRequestProps> = ({ user }) => {
  const [keys, setKeys] = useState<any[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [prompt, setPrompt] = useState('Explain quantum entanglement like I am five.');
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  useEffect(() => {
    const fetchKeys = async () => {
      try {
        const userKeys = await getUserKeys(user.uid);
        setKeys(userKeys);
        if (userKeys.length > 0) {
          // Default to the first key found
          setSelectedKey(userKeys[0].key?.data?.key || userKeys[0].key);
        }
      } catch (error) {
        console.error("Error fetching keys", error);
      } finally {
        setLoadingKeys(false);
      }
    };
    fetchKeys();
  }, [user.uid]);

  const handleTest = async () => {
    if (!selectedKey || !prompt.trim()) return;

    setProcessing(true);
    setResponse(null);

    // Simulate Network Delay
    await new Promise(r => setTimeout(r, 800));

    try {
      // We use the Nexus Brain service to generate the actual content
      // In a real scenario, this would be a fetch() to your backend
      const result = await nexusBrain.talkToNexus(prompt, NexusModel.MALEVOLENT);

      const mockApiResponse = {
        status: "success",
        code: 200,
        metadata: {
          model: "gemini-3-flash-preview", // Updated to match service
          latency_ms: 320, // Reduced latency simulation
          timestamp: new Date().toISOString()
        },
        data: {
          content: result.text,
          type: result.type,
          generated_image_url: result.imageUrl || null
        },
        usage: {
          prompt_tokens: Math.ceil(prompt.length / 4),
          completion_tokens: Math.ceil(result.text.length / 4),
          total_tokens: Math.ceil((prompt.length + result.text.length) / 4)
        }
      };

      setResponse(JSON.stringify(mockApiResponse, null, 2));

    } catch (error) {
      setResponse(JSON.stringify({
        status: "error",
        code: 500,
        message: "Neural link severed during processing."
      }, null, 2));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-nexus-black text-white w-full">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-nexus-accent">Test API Request</h1>
        <p className="text-gray-400 mb-8">
          Validate your generated API keys by sending a live test request to the Nexus Core.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            
            {/* Key Selector */}
            <div className="bg-nexus-panel p-5 rounded-lg border border-white/5">
              <label className="block text-xs font-bold text-nexus-dim uppercase mb-3">
                Select API Key
              </label>
              
              {loadingKeys ? (
                <div className="text-sm text-gray-400 animate-pulse">Loading keys...</div>
              ) : keys.length === 0 ? (
                <div className="text-red-400 text-sm">
                  No keys found. Please go to API Access to generate one.
                </div>
              ) : (
                <div className="relative">
                  <select 
                    value={selectedKey}
                    onChange={(e) => setSelectedKey(e.target.value)}
                    className="w-full bg-black border border-gray-700 text-white p-3 rounded appearance-none focus:border-nexus-accent outline-none font-mono text-sm"
                  >
                    {keys.map((k) => {
                       const actualKey = k.key?.data?.key || k.key;
                       return (
                         <option key={k.id} value={actualKey}>
                           {k.name} ({actualKey.substr(0, 8)}...)
                         </option>
                       );
                    })}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <i className="fas fa-chevron-down"></i>
                  </div>
                </div>
              )}
            </div>

            {/* Prompt Input */}
            <div className="bg-nexus-panel p-5 rounded-lg border border-white/5 flex flex-col h-64">
              <label className="block text-xs font-bold text-nexus-dim uppercase mb-3">
                Prompt Payload
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-1 bg-black border border-gray-700 text-gray-300 p-3 rounded focus:border-nexus-accent outline-none font-mono text-sm resize-none placeholder-gray-600"
                placeholder="Enter instructions for the model..."
              />
            </div>

            <button
              onClick={handleTest}
              disabled={processing || keys.length === 0}
              className="w-full bg-nexus-secondary hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg shadow-[0_0_20px_rgba(112,0,255,0.2)] transition-all flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <i className="fas fa-circle-notch fa-spin"></i> TRANSMITTING...
                </>
              ) : (
                <>
                  <i className="fas fa-bolt"></i> SEND REQUEST
                </>
              )}
            </button>
          </div>

          {/* Response Section */}
          <div className="bg-nexus-dark rounded-lg border border-nexus-panel overflow-hidden flex flex-col h-full min-h-[500px]">
            <div className="bg-nexus-panel/50 px-4 py-3 border-b border-white/5 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase">Response Output</span>
              {response && (
                <span className="text-xs text-green-400 font-mono">200 OK</span>
              )}
            </div>
            <div className="flex-1 relative bg-black/50">
               {!response && !processing && (
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-700">
                   <i className="fas fa-code text-4xl mb-3 opacity-20"></i>
                   <p className="text-sm font-mono">Waiting for input...</p>
                 </div>
               )}
               <pre className="p-4 text-xs md:text-sm font-mono text-green-400 overflow-auto h-full max-h-[600px] leading-relaxed">
                 {response || (processing ? "// Awaiting neural response..." : "")}
               </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestRequest;