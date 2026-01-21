import React, { useState, useRef, useEffect } from 'react';
import { NexusModel, Message } from '../types';
import { nexusBrain } from '../services/nexusService';

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'model',
      content: "I am Nexus. Select your model paradigm. Malevolent is direct and unfiltered. Infinite Perspective provides structured data.",
      type: 'text',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<NexusModel>(NexusModel.MALEVOLENT);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      type: 'text',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Convert current messages to history format for context
      const history = messages.filter(m => m.id !== 'init').map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const response = await nexusBrain.talkToNexus(userMsg.content, selectedModel, history);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response.text || "No response generated.",
        type: response.type as any,
        imageUrl: response.imageUrl,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // Could add toast notification here
  };

  // Helper to render text with code blocks
  const renderTextWithCode = (text: string) => {
    // Regex to split by ```language code ```
    const parts = text.split(/```(\w*)\n([\s\S]*?)```/g);
    
    // If no code blocks, return raw text
    if (parts.length === 1) return <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">{text}</div>;

    const result = [];
    for (let i = 0; i < parts.length; i += 3) {
        // Text part
        if (parts[i]) {
            result.push(<div key={`text-${i}`} className="whitespace-pre-wrap leading-relaxed text-sm md:text-base mb-2">{parts[i]}</div>);
        }
        // Code part (captured groups)
        if (i + 2 < parts.length) {
            const lang = parts[i + 1] || 'code';
            const code = parts[i + 2];
            result.push(
                <div key={`code-${i}`} className="my-4 rounded-lg overflow-hidden border border-nexus-panel bg-black relative group">
                    <div className="bg-nexus-panel/50 px-4 py-1 flex justify-between items-center">
                        <span className="text-xs text-nexus-dim font-mono">{lang}</span>
                        <button 
                            onClick={() => handleCopyCode(code)}
                            className="text-xs text-nexus-accent hover:text-white transition-colors"
                        >
                            <i className="fas fa-copy mr-1"></i> Copy
                        </button>
                    </div>
                    <pre className="p-4 overflow-x-auto text-xs font-mono text-green-400">
                        {code.trim()}
                    </pre>
                </div>
            );
        }
    }
    return result;
  };

  // Helper to render JSON Presentation
  const renderPresentation = (content: string) => {
    try {
        const data = JSON.parse(content);
        const pres = Array.isArray(data) ? data[0] : data;
        
        if (!pres.presentation_metadata) throw new Error("Not a presentation");

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <h3 className="font-bold text-yellow-400">{pres.presentation_metadata.title}</h3>
                    <div className="text-xs text-gray-500">JSON Preview</div>
                </div>
                
                {/* Visual Preview */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-4 border-b border-white/5 pb-4">
                    {pres.slides?.map((slide: any) => (
                        <div key={slide.slide_number} className="bg-black/40 border border-white/10 p-3 rounded">
                            <p className="font-bold text-xs text-nexus-accent mb-1">Slide {slide.slide_number}: {slide.header}</p>
                            <ul className="list-disc list-inside text-xs text-gray-300 mb-2">
                                {slide.content.map((c: string, idx: number) => <li key={idx}>{c}</li>)}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Raw Code Block for Copying */}
                <div className="bg-black rounded border border-white/10 overflow-hidden">
                    <div className="bg-nexus-panel/50 px-3 py-1 flex justify-between items-center border-b border-white/5">
                        <span className="text-[10px] font-mono text-gray-400">presentation.json</span>
                        <button 
                            onClick={() => handleCopyCode(content)}
                            className="text-xs text-nexus-accent hover:text-white flex items-center gap-1"
                        >
                            <i className="fas fa-copy"></i> Copy JSON Code
                        </button>
                    </div>
                    <pre className="p-3 text-[10px] font-mono text-green-400 overflow-x-auto max-h-[150px]">
                        {content}
                    </pre>
                </div>
            </div>
        );

    } catch (e) {
        // Fallback for standard JSON
        return (
             <div className="space-y-2">
                <p className="text-sm font-bold text-cyan-400">Structured Output:</p>
                <div className="relative group">
                    <button 
                        onClick={() => handleCopyCode(content)}
                        className="absolute right-2 top-2 text-xs text-nexus-dim hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        Copy
                    </button>
                    <pre className="bg-black/80 p-3 rounded text-xs font-mono text-green-400 overflow-x-auto border border-white/10">
                        {content}
                    </pre>
                </div>
            </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-nexus-black relative overflow-hidden">
        {/* Header */}
        <div className="h-16 border-b border-nexus-panel flex items-center justify-between px-6 bg-nexus-dark/50 backdrop-blur-sm z-10">
            <div className="flex items-center gap-4">
                <span className="text-nexus-dim text-sm uppercase tracking-widest">Model:</span>
                <div className="flex bg-nexus-black rounded-lg p-1 border border-nexus-panel">
                    <button 
                        onClick={() => setSelectedModel(NexusModel.MALEVOLENT)}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${selectedModel === NexusModel.MALEVOLENT ? 'bg-red-900/50 text-red-400 border border-red-800' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        MALEVOLENT
                    </button>
                    <button 
                        onClick={() => setSelectedModel(NexusModel.INFINITE_PERSPECTIVE)}
                        className={`px-3 py-1 rounded text-xs font-bold transition-all ${selectedModel === NexusModel.INFINITE_PERSPECTIVE ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-800' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        INFINITE
                    </button>
                </div>
            </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] md:max-w-[70%] p-4 rounded-xl backdrop-blur-sm border ${
                        msg.role === 'user' 
                        ? 'bg-nexus-panel/50 border-nexus-dim/30 text-white rounded-tr-none' 
                        : 'bg-black/40 border-nexus-accent/20 text-nexus-text rounded-tl-none shadow-[0_0_15px_rgba(0,240,255,0.05)]'
                    }`}>
                        {/* Header for Bot */}
                        {msg.role === 'model' && (
                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                                <i className="fas fa-microchip text-nexus-accent text-xs"></i>
                                <span className="text-xs font-mono text-nexus-accent uppercase tracking-widest">Nexus Core</span>
                            </div>
                        )}

                        {/* Content Rendering */}
                        {msg.type === 'image' ? (
                             <div className="space-y-2">
                                <p className="text-sm">{msg.content}</p>
                                <img src={msg.imageUrl} alt="Generated" className="rounded-lg border border-nexus-accent/50 w-full" />
                                <div className="text-[10px] font-mono text-nexus-dim p-2 bg-black rounded border border-white/10 flex justify-between items-center">
                                    <span>&lt;image_xml /&gt;</span>
                                    <button onClick={() => handleCopyCode(`<image><url>${msg.imageUrl}</url></image>`)} className="text-xs hover:text-white">Copy XML</button>
                                </div>
                             </div>
                        ) : msg.type === 'json' ? (
                            renderPresentation(msg.content)
                        ) : (
                            renderTextWithCode(msg.content)
                        )}
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
            
            {/* Loading Indicator */}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-black/40 border border-nexus-accent/20 p-4 rounded-xl rounded-tl-none flex items-center gap-2">
                        <div className="w-2 h-2 bg-nexus-accent rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-nexus-accent rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-nexus-accent rounded-full animate-bounce delay-150"></div>
                    </div>
                </div>
            )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-nexus-black border-t border-nexus-panel">
            <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={selectedModel === NexusModel.MALEVOLENT ? "Communicate with the machine..." : "Enter parameters for structured synthesis..."}
                    className="w-full bg-nexus-dark text-white p-4 pr-12 rounded-xl border border-nexus-panel focus:border-nexus-accent focus:outline-none focus:ring-1 focus:ring-nexus-accent transition-all font-mono placeholder-gray-600"
                />
                <button 
                    type="submit"
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-nexus-accent hover:text-white transition-colors disabled:opacity-50"
                >
                    <i className="fas fa-paper-plane text-lg"></i>
                </button>
            </form>
            <div className="text-center mt-2">
                 <p className="text-[10px] text-nexus-dim font-mono">NEXUS v1.0 | Dictionary Mode Active | Image Synthesis Active</p>
            </div>
        </div>
    </div>
  );
};

export default ChatInterface;