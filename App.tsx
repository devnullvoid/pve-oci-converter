import React, { useState } from 'react';
import { AppStep, ContainerConfig } from './types';
import CommandInput from './components/CommandInput';
import ConfigEditor from './components/ConfigEditor';
import ConnectionForm from './components/ConnectionForm';
import { parseDockerCommand } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.INPUT);
  const [config, setConfig] = useState<ContainerConfig | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (input: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await parseDockerCommand(input);
      setConfig(result);
      setStep(AppStep.CONFIGURE);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during parsing.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen font-sans text-proxmox-text p-4 md:p-8 bg-proxmox-dark">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 flex items-center space-x-4 border-b border-gray-700 pb-6">
          <div className="bg-proxmox-orange p-3 rounded shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Proxmox OCI Converter</h1>
            <p className="text-gray-400 text-sm">Convert Docker Run commands to Proxmox LXC OCI Containers</p>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="mb-8 flex items-center">
          <div className={`flex-1 h-2 rounded-l ${step >= AppStep.INPUT ? 'bg-proxmox-orange' : 'bg-gray-700'}`}></div>
          <div className={`flex-1 h-2 ${step >= AppStep.CONFIGURE ? 'bg-proxmox-orange' : 'bg-gray-700'}`}></div>
          <div className={`flex-1 h-2 rounded-r ${step >= AppStep.DEPLOY ? 'bg-proxmox-orange' : 'bg-gray-700'}`}></div>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
              <span className="text-red-300">×</span>
            </button>
          </div>
        )}

        <main>
          {step === AppStep.INPUT && (
            <CommandInput onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} />
          )}

          {step === AppStep.CONFIGURE && config && (
            <ConfigEditor 
              config={config} 
              onChange={setConfig} 
              onNext={() => setStep(AppStep.DEPLOY)}
              onBack={() => setStep(AppStep.INPUT)}
            />
          )}

          {step === AppStep.DEPLOY && config && (
            <ConnectionForm 
              config={config} 
              onBack={() => setStep(AppStep.CONFIGURE)} 
            />
          )}
        </main>

        <footer className="mt-16 text-center text-gray-600 text-xs">
          <p>This tool uses Google Gemini to parse commands. Verify all configurations before deploying to production.</p>
          <p className="mt-1">Proxmox VE is a registered trademark of Proxmox Server Solutions GmbH.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;