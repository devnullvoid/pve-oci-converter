import React from 'react';
import { ContainerConfig } from '../types';

interface Props {
  config: ContainerConfig;
  onChange: (config: ContainerConfig) => void;
  onNext: () => void;
  onBack: () => void;
}

const ConfigEditor: React.FC<Props> = ({ config, onChange, onNext, onBack }) => {
  
  const updateField = (field: keyof ContainerConfig, value: any) => {
    onChange({ ...config, [field]: value });
  };

  const updateEnv = (key: string, value: string) => {
    const newEnv = { ...config.env, [key]: value };
    onChange({ ...config, env: newEnv });
  };

  const removeEnv = (key: string) => {
    const newEnv = { ...config.env };
    delete newEnv[key];
    onChange({ ...config, env: newEnv });
  };

  const addEnv = () => {
    onChange({ ...config, env: { ...config.env, 'NEW_VAR': 'value' } });
  };

  return (
    <div className="bg-proxmox-base p-6 rounded-lg shadow-lg animate-fade-in">
       <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-proxmox-orange">2. Review Configuration</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b border-gray-600 pb-2">Resources</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase text-gray-400 mb-1">Image</label>
              <input type="text" value={config.image} onChange={(e) => updateField('image', e.target.value)} className="w-full bg-proxmox-dark border border-gray-600 rounded p-2 text-white" />
            </div>
            <div>
              <label className="block text-xs uppercase text-gray-400 mb-1">Tag</label>
              <input type="text" value={config.tag} onChange={(e) => updateField('tag', e.target.value)} className="w-full bg-proxmox-dark border border-gray-600 rounded p-2 text-white" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase text-gray-400 mb-1">Cores</label>
              <input type="number" value={config.cpus} onChange={(e) => updateField('cpus', parseInt(e.target.value))} className="w-full bg-proxmox-dark border border-gray-600 rounded p-2 text-white" />
            </div>
            <div>
              <label className="block text-xs uppercase text-gray-400 mb-1">Memory (MB)</label>
              <input type="number" value={config.memory} onChange={(e) => updateField('memory', parseInt(e.target.value))} className="w-full bg-proxmox-dark border border-gray-600 rounded p-2 text-white" />
            </div>
          </div>

           <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase text-gray-400 mb-1">Disk Size (GB)</label>
              <input type="number" value={config.diskSize} onChange={(e) => updateField('diskSize', parseInt(e.target.value))} className="w-full bg-proxmox-dark border border-gray-600 rounded p-2 text-white" />
            </div>
            <div>
              <label className="block text-xs uppercase text-gray-400 mb-1">Target Storage</label>
              <input type="text" value={config.storage} onChange={(e) => updateField('storage', e.target.value)} className="w-full bg-proxmox-dark border border-gray-600 rounded p-2 text-white" />
            </div>
          </div>
          
           <div className="flex items-center space-x-2 mt-4">
             <input type="checkbox" checked={config.features?.nesting} onChange={(e) => updateField('features', {...config.features, nesting: e.target.checked})} id="nesting" />
             <label htmlFor="nesting" className="text-sm text-gray-300">Nesting (Required for Docker-in-LXC)</label>
           </div>
           <div className="flex items-center space-x-2">
             <input type="checkbox" checked={!config.privileged} onChange={(e) => updateField('privileged', !e.target.checked)} id="privileged" />
             <label htmlFor="privileged" className="text-sm text-gray-300">Unprivileged Container (Recommended)</label>
           </div>
        </div>

        {/* Environment Variables */}
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-gray-600 pb-2">
            <h3 className="text-lg font-semibold text-white">Environment Variables</h3>
            <button onClick={addEnv} className="text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded text-white">+</button>
          </div>
          <div className="max-h-64 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
            {Object.entries(config.env).map(([k, v], i) => (
              <div key={i} className="flex space-x-2">
                <input 
                  className="w-1/3 bg-proxmox-dark border border-gray-600 rounded p-1 text-xs text-proxmox-orange font-mono"
                  value={k}
                  onChange={(e) => {
                    const newKey = e.target.value;
                    const newEnv = { ...config.env };
                    delete newEnv[k];
                    newEnv[newKey] = v;
                    onChange({ ...config, env: newEnv });
                  }}
                />
                <input 
                  className="w-2/3 bg-proxmox-dark border border-gray-600 rounded p-1 text-xs text-white font-mono"
                  value={v}
                  onChange={(e) => updateEnv(k, e.target.value)}
                />
                <button onClick={() => removeEnv(k)} className="text-red-400 hover:text-red-300">×</button>
              </div>
            ))}
            {Object.keys(config.env).length === 0 && <p className="text-gray-500 text-sm italic">No variables detected.</p>}
          </div>
        </div>

        {/* Mounts & Ports (Read Only for now mostly) */}
        <div className="col-span-1 lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
           <div className="bg-proxmox-dark p-4 rounded">
              <h4 className="text-sm font-bold text-gray-400 mb-2">Mount Points (Bind Mounts)</h4>
              {config.volumes.map((vol, i) => (
                <div key={i} className="text-xs font-mono text-gray-300 mb-1">
                  <span className="text-proxmox-accent">HOST:</span> {vol.host} <br/>
                  <span className="text-proxmox-accent">CT:</span> {vol.container}
                </div>
              ))}
              {config.volumes.length === 0 && <span className="text-xs text-gray-600">No volumes.</span>}
           </div>
           
           <div className="bg-proxmox-dark p-4 rounded">
              <h4 className="text-sm font-bold text-gray-400 mb-2">Port Mappings</h4>
              <p className="text-xs text-gray-500 mb-2">Note: LXC containers usually share an IP or bridge. Mappings below are informational unless using NAT.</p>
              {config.ports.map((p, i) => (
                <div key={i} className="text-xs font-mono text-gray-300">
                  {p.host}:{p.container}/{p.protocol}
                </div>
              ))}
              {config.ports.length === 0 && <span className="text-xs text-gray-600">No ports exported.</span>}
           </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <button onClick={onBack} className="px-6 py-2 rounded text-gray-300 hover:text-white hover:bg-gray-700">Back</button>
        <button onClick={onNext} className="px-6 py-2 rounded bg-proxmox-orange hover:bg-proxmox-accent text-white font-bold shadow-lg">Next: Connection & Deploy</button>
      </div>
    </div>
  );
};

export default ConfigEditor;