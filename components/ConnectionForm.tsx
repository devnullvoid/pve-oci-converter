import React, { useState, useEffect } from 'react';
import { ProxmoxConnection, ContainerConfig } from '../types';
import { getNextVmid, generatePctScript } from '../services/proxmoxService';

interface Props {
  config: ContainerConfig;
  onBack: () => void;
}

const ConnectionForm: React.FC<Props> = ({ config, onBack }) => {
  const [connection, setConnection] = useState<ProxmoxConnection>({
    host: '192.168.1.100',
    port: 8006,
    node: 'pve',
    user: 'root@pam',
    tokenName: 'oci-tool',
    tokenSecret: '',
    sslVerify: false
  });

  const [generatedScript, setGeneratedScript] = useState('');
  const [vmid, setVmid] = useState<number>(100);
  const [mode, setMode] = useState<'script' | 'api'>('script');

  useEffect(() => {
    // Generate an initial random ID or 100
    setVmid(Math.floor(100 + Math.random() * 900));
  }, []);

  useEffect(() => {
    const script = generatePctScript(connection, config, vmid);
    setGeneratedScript(script);
  }, [connection, config, vmid]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedScript);
    alert('Script copied to clipboard!');
  };

  return (
    <div className="bg-proxmox-base p-6 rounded-lg shadow-lg animate-fade-in">
       <h2 className="text-xl font-bold text-proxmox-orange mb-6">3. Deploy to Proxmox</h2>
       
       {/* Connection Settings */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
         <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Target Node</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Host/IP</label>
                <input value={connection.host} onChange={e => setConnection({...connection, host: e.target.value})} className="w-full bg-proxmox-dark border border-gray-600 rounded p-2 text-white" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Node Name</label>
                <input value={connection.node} onChange={e => setConnection({...connection, node: e.target.value})} className="w-full bg-proxmox-dark border border-gray-600 rounded p-2 text-white" />
              </div>
            </div>
             <div>
                <label className="block text-xs text-gray-400 mb-1">Desired VMID</label>
                <input type="number" value={vmid} onChange={e => setVmid(parseInt(e.target.value))} className="w-full bg-proxmox-dark border border-gray-600 rounded p-2 text-white font-mono" />
             </div>
         </div>

         <div className="space-y-4">
           <h3 className="text-lg font-semibold text-white">Authentication (Optional for Script)</h3>
           <div className="bg-gray-700 bg-opacity-30 p-4 rounded text-xs text-gray-400 mb-2">
             API access requires a Token ID and Secret. This is only needed if you want to attempt direct deployment (which may fail due to browser CORS).
             <br/><strong>Recommended:</strong> Use the generated script.
           </div>
         </div>
       </div>

       {/* Tabs */}
       <div className="flex border-b border-gray-600 mb-4">
          <button 
            className={`px-4 py-2 font-bold ${mode === 'script' ? 'text-proxmox-orange border-b-2 border-proxmox-orange' : 'text-gray-400'}`}
            onClick={() => setMode('script')}
          >
            Generated Script (Bash)
          </button>
           <button 
            className={`px-4 py-2 font-bold ${mode === 'api' ? 'text-proxmox-orange border-b-2 border-proxmox-orange' : 'text-gray-400'}`}
            onClick={() => setMode('api')}
          >
            Direct API (Experimental)
          </button>
       </div>

       {mode === 'script' && (
         <div className="relative">
           <textarea 
            readOnly
            value={generatedScript}
            className="w-full h-96 bg-black text-green-400 font-mono text-sm p-4 rounded border border-gray-700 shadow-inner"
           />
           <button 
            onClick={copyToClipboard}
            className="absolute top-4 right-4 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs"
           >
             Copy
           </button>
           <div className="mt-4 text-sm text-gray-400">
             <p><strong>Instructions:</strong></p>
             <ol className="list-decimal list-inside space-y-1 ml-2">
               <li>SSH into your Proxmox Node (<code>{connection.node}</code>).</li>
               <li>Paste the content above into a file, e.g., <code>create_ct.sh</code>.</li>
               <li>Make it executable: <code>chmod +x create_ct.sh</code>.</li>
               <li>Run it: <code>./create_ct.sh</code>.</li>
             </ol>
           </div>
         </div>
       )}

       {mode === 'api' && (
         <div className="text-center py-12 bg-proxmox-dark rounded border border-dashed border-gray-600">
           <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
           <h3 className="text-xl text-gray-300 font-bold mb-2">Browser CORS Restriction</h3>
           <p className="text-gray-400 max-w-lg mx-auto mb-6">
             Browsers prevent direct API calls to Proxmox servers that haven't explicitly allowed your domain via CORS headers. 
             This feature is disabled in this demo to prevent errors. Please use the <strong>Generated Script</strong> tab.
           </p>
         </div>
       )}

       <div className="mt-8 flex justify-start">
         <button onClick={onBack} className="px-6 py-2 rounded text-gray-300 hover:text-white hover:bg-gray-700">Back to Config</button>
       </div>
    </div>
  );
};

export default ConnectionForm;