import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './services/firebase';
import { UserProfile } from './types';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import ApiDashboard from './components/ApiDashboard';
import ApiSandbox from './components/ApiSandbox';
import TestRequest from './components/TestRequest';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('chat'); // 'chat', 'api', 'sandbox', 'test-request'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    auth.signOut();
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-nexus-black flex items-center justify-center text-nexus-accent font-mono">
        INITIALIZING SYSTEM CORE...
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen w-full bg-nexus-black text-nexus-text font-sans">
      <Sidebar 
        user={user} 
        currentView={currentView} 
        setView={setCurrentView} 
        onLogout={handleLogout}
      />
      
      <main className="flex-1 flex flex-col relative">
        {/* Mobile Header (Hamburger) - simplified for this demo */}
        <div className="md:hidden h-14 bg-nexus-panel border-b border-white/5 flex items-center justify-between px-4">
            <span className="font-bold text-nexus-accent">NEXUS</span>
            <div className="flex gap-2">
                <button onClick={() => setCurrentView('chat')} className="p-2 text-xs bg-white/5 rounded">Chat</button>
                <button onClick={() => setCurrentView('test-request')} className="p-2 text-xs bg-white/5 rounded">Test</button>
            </div>
        </div>

        {currentView === 'chat' && <ChatInterface />}
        {currentView === 'api' && <ApiDashboard user={user} />}
        {currentView === 'sandbox' && <ApiSandbox />}
        {currentView === 'test-request' && <TestRequest user={user} />}
      </main>
    </div>
  );
};

export default App;