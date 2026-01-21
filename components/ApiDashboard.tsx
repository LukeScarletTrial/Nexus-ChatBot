import React, { useState, useEffect } from 'react';
import { generateApiKey, getUserKeys } from '../services/firebase';
import { UserProfile } from '../types';

interface ApiDashboardProps {
  user: UserProfile;
}

const ApiDashboard: React.FC<ApiDashboardProps> = ({ user }) => {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  useEffect(() => {
    loadKeys();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.uid]);

  const loadKeys = async () => {
    try {
      const k = await getUserKeys(user.uid);
      setKeys(k);
    } catch (error) {
      console.error("Failed to load keys", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newKeyName.trim()) return;

    setCreating(true);
    try {
      await generateApiKey(user.uid, newKeyName);
      setNewKeyName('');
      await loadKeys();
    } catch (error) {
      console.error("Failed to generate key", error);
      alert("Failed to generate API Key. Please check your connection.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto bg-nexus-black text-white w-full relative z-0">
      <h1 className="text-3xl font-bold mb-2 text-nexus-secondary">Developer Access</h1>
      <p className="text-gray-400 mb-8 max-w-2xl">
        Generate authentication tokens to integrate Nexus intelligence directly into your applications.
      </p>

      {/* Generator */}
      <div className="bg-nexus-panel p-6 rounded-lg border border-white/5 mb-8 max-w-3xl">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <i className="fas fa-key text-nexus-accent"></i> Generate New Key
        </h2>
        <form onSubmit={handleCreateKey} className="flex flex-col sm:flex-row gap-4">
            <input 
                type="text" 
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Key Name (e.g. Production App)"
                className="flex-1 bg-nexus-black border border-gray-700 rounded p-2 text-white focus:border-nexus-secondary outline-none transition-colors"
                disabled={creating}
            />
            <button 
                type="submit"
                disabled={!newKeyName.trim() || creating}
                className="bg-nexus-secondary hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2 rounded font-bold transition-colors flex items-center justify-center min-w-[100px]"
            >
                {creating ? <i className="fas fa-circle-notch fa-spin"></i> : "Create"}
            </button>
        </form>
      </div>

      {/* Key List */}
      <div className="mb-12 max-w-3xl">
          <h3 className="text-sm uppercase tracking-widest text-gray-500 mb-4">Active Keys</h3>
          {loading ? (
              <div className="text-gray-500 flex items-center gap-2">
                <i className="fas fa-circle-notch fa-spin"></i> Loading registry...
              </div>
          ) : keys.length === 0 ? (
              <div className="text-gray-600 italic">No keys active.</div>
          ) : (
              <div className="space-y-3">
                  {keys.map((k) => (
                      <div key={k.id} className="bg-nexus-dark p-4 rounded border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="overflow-hidden w-full">
                              <p className="font-bold text-white mb-1 truncate">{k.name}</p>
                              <code className="bg-black px-2 py-1 rounded text-nexus-accent text-sm font-mono block sm:inline-block w-full sm:w-auto truncate">
                                {k.key?.data?.key || k.key}
                              </code>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              <span className="text-xs text-green-500">Active</span>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>

      {/* Code Snippet */}
      <div className="max-w-4xl">
          <h3 className="text-sm uppercase tracking-widest text-gray-500 mb-4">Integration Snippet</h3>
          <div className="bg-nexus-dark border border-nexus-panel rounded-lg overflow-hidden">
              <div className="bg-black/50 p-2 px-4 border-b border-white/5 flex justify-between items-center">
                  <span className="text-xs font-mono text-gray-400">nexus-client.js</span>
                  <span className="text-xs text-gray-600">Node.js</span>
              </div>
              <pre className="p-4 text-xs md:text-sm font-mono text-gray-300 overflow-x-auto">
{`const fetch = require('node-fetch');

// Initialize Nexus with your generated key
const NEXUS_API_KEY = '${keys.length > 0 ? (keys[0].key?.data?.key || keys[0].key) : 'YOUR_GENERATED_KEY_HERE'}';
const NEXUS_ENDPOINT = 'https://api.nexus.ai/v1/generate'; // Mock Endpoint

async function consultNexus(prompt) {
  const response = await fetch(NEXUS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${NEXUS_API_KEY}\`
    },
    body: JSON.stringify({
      model: 'malevolent', // or 'infinite_perspective'
      prompt: prompt,
      return_images_as: 'xml' 
    })
  });

  const data = await response.json();
  console.log("Nexus Response:", data);
}

consultNexus("Define the word 'pizza' and generate an image of it.");`}
              </pre>
          </div>
      </div>
    </div>
  );
};

export default ApiDashboard;