import React, { useState, useEffect } from 'react';
import { Rocket, Globe, CheckCircle, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { VirtualFile } from '../types';

interface DeploymentProps {
  files: VirtualFile[];
}

const Deployment: React.FC<DeploymentProps> = ({ files }) => {
  const [domain, setDomain] = useState('');
  const [status, setStatus] = useState<'idle' | 'building' | 'deployed' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const handleDeploy = async () => {
    if (!domain.trim()) return;

    setStatus('building');
    setLogs(['Initializing build environment...']);
    setDeployedUrl(null);

    // Simulate build steps
    await new Promise(r => setTimeout(r, 800));
    setLogs(p => [...p, 'Bundling assets...']);
    
    // Bundle Logic
    try {
        const entryPoint = files.find(f => f.name === 'index.html');
        if (!entryPoint) throw new Error("Missing index.html");

        let html = entryPoint.content;
        
        // Inline CSS - Robust Regex for any attribute order
        html = html.replace(/<link[^>]+>/g, (match) => {
          if (!match.includes('rel="stylesheet"')) return match;
          const hrefMatch = match.match(/href="([^"]+)"/);
          if (!hrefMatch) return match;
          
          const href = hrefMatch[1];
          const cssFile = files.find(f => f.name === href);
          return cssFile ? `<style>/* Inlined ${href} */\n${cssFile.content}</style>` : match;
        });
        
        // Inline JS
        html = html.replace(/<script[^>]+src="([^"]+)"[^>]*><\/script>/g, (match, src) => {
          const jsFile = files.find(f => f.name === src);
          return jsFile ? `<script>/* Inlined ${src} */\n${jsFile.content}</script>` : match;
        });

        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);

        await new Promise(r => setTimeout(r, 800));
        setLogs(p => [...p, 'Optimizing build...']);
        
        await new Promise(r => setTimeout(r, 800));
        setLogs(p => [...p, 'Uploading to CDN...']);
        
        await new Promise(r => setTimeout(r, 600));
        setStatus('deployed');
        setDeployedUrl(`https://${domain}.devbrowser.app`);
        setLogs(p => [...p, 'Deployment successful!']);

    } catch (e: any) {
        setStatus('error');
        setLogs(p => [...p, `Build failed: ${e.message}`]);
    }
  };

  return (
    <div className="w-64 bg-browser-toolbar border-r border-gray-700 flex flex-col h-full select-none text-gray-300">
      <div className="h-9 px-3 flex items-center justify-between border-b border-gray-700 bg-[#252526]">
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
          <Rocket size={14} />
          <span>DEPLOYMENT</span>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
         <div className="mb-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Project Domain</h3>
            <div className="flex items-center bg-gray-900 border border-gray-700 rounded-md overflow-hidden focus-within:border-blue-500 transition-colors">
                <div className="pl-3 pr-2 text-gray-500">
                    <Globe size={14} />
                </div>
                <input 
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="project-name"
                    className="flex-1 bg-transparent border-none outline-none text-xs text-white py-2"
                    disabled={status === 'building'}
                />
                <div className="pr-3 text-[10px] text-gray-500 select-none bg-gray-800 h-full flex items-center px-2 border-l border-gray-700">
                    .dev
                </div>
            </div>
            <p className="text-[10px] text-gray-500 mt-2">
                Only lowercase letters, numbers, and dashes.
            </p>
         </div>

         {status === 'deployed' ? (
             <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-6 animate-in fade-in zoom-in duration-300">
                 <div className="flex items-center gap-2 text-green-400 font-bold text-xs mb-2">
                     <CheckCircle size={14} />
                     <span>Live on Production</span>
                 </div>
                 <div className="text-xs text-gray-300 break-all font-mono mb-3 bg-black/20 p-1.5 rounded">
                     {deployedUrl}
                 </div>
                 <a 
                    href={blobUrl || '#'} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-500 text-white text-xs font-medium py-1.5 rounded transition-colors"
                 >
                     <ExternalLink size={12} />
                     Visit Site
                 </a>
                 <button 
                    onClick={() => setStatus('idle')}
                    className="w-full text-[10px] text-gray-500 hover:text-gray-300 mt-2 underline"
                 >
                    Deploy new version
                 </button>
             </div>
         ) : (
             <button
                onClick={handleDeploy}
                disabled={status === 'building' || !domain}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium py-2 rounded flex items-center justify-center gap-2 transition-all"
             >
                 {status === 'building' ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
                 {status === 'building' ? 'Deploying...' : 'Publish Project'}
             </button>
         )}

         {/* Logs / Status */}
         {(status === 'building' || status === 'error' || logs.length > 0) && (
             <div className="mt-6">
                 <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Build Logs</h3>
                 <div className="bg-black/40 rounded-lg p-3 font-mono text-[10px] space-y-1.5 h-40 overflow-y-auto custom-scrollbar border border-white/5">
                     {logs.map((log, i) => (
                         <div key={i} className={`flex items-start gap-2 ${log.includes('failed') ? 'text-red-400' : log.includes('successful') ? 'text-green-400' : 'text-gray-400'}`}>
                             <span className="opacity-50 select-none">{'>'}</span>
                             <span>{log}</span>
                         </div>
                     ))}
                     {status === 'building' && (
                         <div className="flex items-center gap-2 text-blue-400 animate-pulse">
                             <span className="opacity-50">{'>'}</span>
                             <span>Working...</span>
                         </div>
                     )}
                 </div>
             </div>
         )}

         {status === 'error' && (
             <div className="mt-4 flex items-center gap-2 text-red-400 text-xs bg-red-900/10 p-2 rounded border border-red-500/20">
                 <AlertCircle size={14} />
                 <span>Deployment Failed</span>
             </div>
         )}
      </div>
    </div>
  );
};

export default Deployment;