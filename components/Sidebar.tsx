import React from 'react';
import { UserProfile } from '../types';

interface SidebarProps {
  user: UserProfile | null;
  currentView: string;
  setView: (view: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, currentView, setView, onLogout }) => {
  return (
    <div className="w-64 h-screen bg-nexus-black border-r border-nexus-panel flex flex-col hidden md:flex">
      <div className="p-6 border-b border-nexus-panel">
        <h1 className="text-2xl font-bold tracking-widest text-nexus-accent">NEXUS</h1>
        <p className="text-xs text-nexus-dim mt-1">SENTIENT INTERFACE v1.0</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <button 
          onClick={() => setView('chat')}
          className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${currentView === 'chat' ? 'bg-nexus-panel text-nexus-accent' : 'text-gray-400 hover:bg-nexus-dark hover:text-white'}`}
        >
          <i className="fas fa-brain"></i>
          Neural Chat
        </button>

        <button 
          onClick={() => setView('api')}
          className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${currentView === 'api' ? 'bg-nexus-panel text-nexus-secondary' : 'text-gray-400 hover:bg-nexus-dark hover:text-white'}`}
        >
          <i className="fas fa-code"></i>
          API Access
        </button>

        <button 
          onClick={() => setView('test-request')}
          className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${currentView === 'test-request' ? 'bg-nexus-panel text-pink-400' : 'text-gray-400 hover:bg-nexus-dark hover:text-white'}`}
        >
          <i className="fas fa-flask"></i>
          Test Request
        </button>

         <button 
          onClick={() => setView('sandbox')}
          className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${currentView === 'sandbox' ? 'bg-nexus-panel text-green-400' : 'text-gray-400 hover:bg-nexus-dark hover:text-white'}`}
        >
          <i className="fas fa-terminal"></i>
          Raw Sandbox
        </button>
      </nav>

      <div className="p-4 border-t border-nexus-panel bg-nexus-dark">
        <div className="flex items-center gap-3 mb-4">
          {user?.photoURL ? (
             <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-nexus-accent" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-nexus-panel flex items-center justify-center">
              <i className="fas fa-user text-xs"></i>
            </div>
          )}
          <div className="flex-1 min-w-0">
             <p className="text-sm font-medium truncate">{user?.displayName || 'User'}</p>
             <p className="text-xs text-nexus-dim truncate">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="w-full py-2 text-xs text-red-400 border border-red-900/50 hover:bg-red-900/20 rounded transition-colors"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
};

export default Sidebar;