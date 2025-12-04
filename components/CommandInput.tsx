import React, { useState } from 'react';

interface Props {
  onAnalyze: (input: string) => void;
  isAnalyzing: boolean;
}

const CommandInput: React.FC<Props> = ({ onAnalyze, isAnalyzing }) => {
  const [input, setInput] = useState('');

  // Sample data for quick testing
  const loadSample = () => {
    setInput(`docker run -d \\
  --name=grafana \\
  -p 3000:3000 \\
  -v /var/lib/grafana:/var/lib/grafana \\
  -e "GF_SERVER_ROOT_URL=http://grafana.server.name" \\
  -e "GF_SECURITY_ADMIN_PASSWORD=secret" \\
  grafana/grafana:latest`);
  };

  return (
    <div className="bg-proxmox-base p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-proxmox-orange">1. Input Source</h2>
        <button 
          onClick={loadSample}
          className="text-xs text-gray-400 hover:text-white underline"
        >
          Load Sample
        </button>
      </div>
      
      <p className="text-sm text-gray-400 mb-4">
        Paste a <code>docker run</code> command or a <code>docker-compose</code> service snippet. 
        The AI will extract the configuration for Proxmox.
      </p>

      <textarea
        className="w-full h-64 bg-proxmox-dark text-gray-200 p-4 rounded border border-gray-600 focus:border-proxmox-orange focus:outline-none font-mono text-sm"
        placeholder="docker run -d -p 80:80 nginx:latest..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => onAnalyze(input)}
          disabled={!input.trim() || isAnalyzing}
          className={`px-6 py-2 rounded font-bold transition-colors ${
            !input.trim() || isAnalyzing
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-proxmox-orange hover:bg-proxmox-accent text-white'
          }`}
        >
          {isAnalyzing ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </span>
          ) : (
            'Analyze & Convert'
          )}
        </button>
      </div>
    </div>
  );
};

export default CommandInput;