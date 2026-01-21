import React, { useState } from 'react';
import { getApiKeyDetails } from '../services/firebase';
import { nexusBrain } from '../services/nexusService';
import { NexusModel } from '../types';

const ApiSandbox: React.FC = () => {
    const [apiKey, setApiKey] = useState('');
    const [requestBody, setRequestBody] = useState(`{
  "model": "malevolent",
  "prompt": "What is the weather like in the digital realm?"
}`);
    const [response, setResponse] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('Ready');

    const handleSendRequest = async () => {
        setStatus('Validating Key...');
        setResponse(null);

        // 1. Validate Key against Firestore
        const keyData = await getApiKeyDetails(apiKey);
        if (!keyData) {
            setResponse(JSON.stringify({ error: "Unauthorized", message: "Invalid API Key" }, null, 2));
            setStatus('Error');
            return;
        }

        const isInfinite = keyData.name === "InfiniteVoid";

        setStatus('Processing...');
        try {
            // Parse user input to get prompt/model
            const parsed = JSON.parse(requestBody);
            const model = parsed.model === 'infinite_perspective' ? NexusModel.INFINITE_PERSPECTIVE : NexusModel.MALEVOLENT;
            const prompt = parsed.prompt || "";

            // Call the AI
            // If InfiniteVoid, we override config to allow higher limits (conceptual infinite)
            const result = await nexusBrain.talkToNexus(
              prompt, 
              model, 
              [], 
              isInfinite ? { maxOutputTokens: 8192 } : {} 
            );

            // Format Response (Simulating a REST API response)
            const apiResponse = {
                status: 200,
                id: `resp_${Date.now()}`,
                model: parsed.model,
                data: {
                    content: result.text,
                    type: result.type,
                    // If image, return XML format as requested
                    xml_output: result.imageUrl ? `<image><url>${result.imageUrl}</url></image>` : null
                },
                usage: {
                    tokens: isInfinite ? "Infinite" : Math.floor(prompt.length / 4) + Math.floor(result.text?.length || 0 / 4)
                }
            };

            setResponse(JSON.stringify(apiResponse, null, 2));
            setStatus('200 OK');

        } catch (e) {
            setResponse(JSON.stringify({ error: "Bad Request", message: "Invalid JSON body" }, null, 2));
            setStatus('400 Bad Request');
        }
    };

    return (
        <div className="p-8 h-screen overflow-y-auto bg-nexus-black text-white w-full flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold text-green-400 font-mono">API Sandbox</h1>
                <p className="text-gray-400 text-sm">Test your keys against the Nexus Core engine directly.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
                {/* Request Column */}
                <div className="flex flex-col gap-4">
                    <div className="bg-nexus-panel p-4 rounded border border-white/10">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Authorization</label>
                        <input 
                            type="text" 
                            placeholder="Paste your 'nx_...' key here"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="w-full bg-black border border-gray-700 rounded p-2 text-green-400 font-mono text-sm focus:border-green-500 outline-none"
                        />
                    </div>

                    <div className="bg-nexus-panel p-4 rounded border border-white/10 flex-1 flex flex-col">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Body (JSON)</label>
                        <textarea 
                            value={requestBody}
                            onChange={(e) => setRequestBody(e.target.value)}
                            className="w-full flex-1 bg-black border border-gray-700 rounded p-2 text-gray-300 font-mono text-sm focus:border-green-500 outline-none resize-none"
                        />
                    </div>

                    <button 
                        onClick={handleSendRequest}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded shadow-[0_0_10px_rgba(0,255,0,0.2)] transition-all"
                    >
                        SEND REQUEST
                    </button>
                </div>

                {/* Response Column */}
                <div className="bg-nexus-dark p-4 rounded border border-white/10 flex flex-col h-full overflow-hidden">
                     <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-2">
                        <span className="text-xs font-bold text-gray-500 uppercase">Response</span>
                        <span className={`text-xs font-mono px-2 py-1 rounded ${status.includes('OK') ? 'bg-green-900 text-green-400' : status.includes('Error') ? 'bg-red-900 text-red-400' : 'bg-gray-800 text-gray-400'}`}>
                            {status}
                        </span>
                     </div>
                     <pre className="flex-1 overflow-auto text-xs md:text-sm text-green-400 font-mono p-2">
                        {response || "// Waiting for request..."}
                     </pre>
                </div>
            </div>
        </div>
    );
};

export default ApiSandbox;