
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  UploadCloud,
  X
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useRef, useState } from 'react';

// Mock Parsed Data Type
interface CsvRow {
  name: string;
  email: string;
  handle: string;
  role: string;
  status: 'VALID' | 'ERROR';
  errorMsg?: string;
}

export function CsvUploadView({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<'UPLOAD' | 'PREVIEW' | 'PROCESSING' | 'DONE'>('UPLOAD');
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<CsvRow[]>([]);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HANDLERS ---

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Simulate CSV Parsing
  const processFile = (uploadedFile: File) => {
    setFile(uploadedFile);
    // Mock parsing logic
    const mockRows: CsvRow[] = [
      { name: "Alice M.", email: "alice@test.com", handle: "alicem", role: "USER", status: 'VALID' },
      { name: "Bob K.", email: "bob@test.com", handle: "bobk", role: "ADMIN", status: 'VALID' },
      { name: "Charlie", email: "invalid-email", handle: "chuck", role: "USER", status: 'ERROR', errorMsg: "Invalid Email Format" },
      { name: "David L.", email: "david@test.com", handle: "davel", role: "USER", status: 'VALID' },
      { name: "Eve", email: "eve@test.com", handle: "", role: "USER", status: 'ERROR', errorMsg: "Missing Handle" },
    ];
    setParsedData(mockRows);
    setStep('PREVIEW');
  };

  const handleImport = () => {
    setStep('PROCESSING');
    let p = 0;
    const interval = setInterval(() => {
      p += Math.floor(Math.random() * 15);
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => setStep('DONE'), 500);
      }
      setProgress(p);
    }, 300);
  };

  // --- RENDERERS ---

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack} className="text-zinc-500 hover:text-white pl-0">
          <ArrowRight size={16} className="rotate-180 mr-2" /> Back to Roster
        </Button>
        <div className="h-6 w-px bg-white/10" />
        <h1 className="text-xl font-display font-medium text-white">Batch Recruitment</h1>
      </div>

      {/* Main Content Card */}
      <div className="bg-[#121214] border border-white/5 rounded-xl overflow-hidden min-h-[400px] flex flex-col relative">

        <AnimatePresence mode="wait">

          {/* STEP 1: UPLOAD ZONE */}
          {step === 'UPLOAD' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-grow flex flex-col items-center justify-center p-12 text-center"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center border border-dashed border-zinc-700 mb-6 group-hover:border-white transition-colors">
                <UploadCloud size={32} className="text-zinc-500" />
              </div>

              <h2 className="text-2xl font-display font-medium text-white mb-2">Upload Manifest</h2>
              <p className="text-zinc-500 text-sm max-w-sm mb-8">
                Drag and drop your CSV file here, or click to browse.
                File must be under 5MB.
              </p>

              <div className="flex gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".csv"
                  onChange={handleFileSelect}
                />
                <Button onClick={() => fileInputRef.current?.click()} className="bg-white text-black hover:bg-zinc-200">
                  Select File
                </Button>
                <Button variant="outline" className="border-white/10 text-zinc-400 hover:text-white">
                  <Download size={16} className="mr-2" /> Template
                </Button>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 w-full max-w-md">
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                  Required Columns: NAME, EMAIL, HANDLE, ROLE
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 2: PREVIEW DATA */}
          {step === 'PREVIEW' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded text-blue-500"><FileText size={18} /></div>
                  <div>
                    <h3 className="text-sm font-medium text-white">{file?.name}</h3>
                    <p className="text-xs text-zinc-500 font-mono">{(file?.size || 0) / 1000} KB • {parsedData.length} Rows</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setFile(null); setStep('UPLOAD'); }} className="text-zinc-500 hover:text-white">
                  <X size={16} />
                </Button>
              </div>

              <div className="flex-grow overflow-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#09090B] text-[10px] font-mono uppercase text-zinc-500 sticky top-0">
                    <tr>
                      <th className="p-4 font-medium border-b border-white/5">Status</th>
                      <th className="p-4 font-medium border-b border-white/5">Name</th>
                      <th className="p-4 font-medium border-b border-white/5">Email</th>
                      <th className="p-4 font-medium border-b border-white/5">Handle</th>
                      <th className="p-4 font-medium border-b border-white/5">Role</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-white/5">
                    {parsedData.map((row, i) => (
                      <tr key={i} className={`hover:bg-white/5 transition-colors ${row.status === 'ERROR' ? 'bg-red-500/5' : ''}`}>
                        <td className="p-4">
                          {row.status === 'VALID' ? (
                            <CheckCircle2 size={16} className="text-green-500" />
                          ) : (
                            <div className="flex items-center gap-2 text-red-500">
                              <AlertCircle size={16} />
                              <span className="text-xs font-mono hidden md:inline">{row.errorMsg}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-zinc-300">{row.name}</td>
                        <td className="p-4 text-zinc-400 font-mono text-xs">{row.email}</td>
                        <td className="p-4 text-zinc-400 font-mono text-xs">@{row.handle}</td>
                        <td className="p-4">
                          <span className="text-[10px] font-mono border border-white/10 px-2 py-0.5 rounded text-zinc-500">
                            {row.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-white/5 bg-[#09090B] flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setStep('UPLOAD')}>Cancel</Button>
                <Button
                  onClick={handleImport}
                  className="bg-white text-black hover:bg-zinc-200"
                  disabled={parsedData.some(r => r.status === 'ERROR')}
                >
                  Import {parsedData.filter(r => r.status === 'VALID').length} Agents
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: PROCESSING */}
          {step === 'PROCESSING' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex-grow flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="w-64 space-y-4">
                <div className="flex justify-between text-xs font-mono text-zinc-400 uppercase">
                  <span>Ingesting Data...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-orange-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "easeOut" }}
                  />
                </div>
                <div className="h-32 bg-black border border-white/10 rounded p-4 text-left font-mono text-[10px] text-green-500 overflow-hidden relative">
                  <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.8))] pointer-events-none" />
                  <p>&gt; Initializing handshake...</p>
                  <p>&gt; Parsing CSV headers...</p>
                  <p>&gt; Validating {parsedData.length} records...</p>
                  {progress > 30 && <p>&gt; Creating user: {parsedData[0].handle}...</p>}
                  {progress > 60 && <p>&gt; Creating user: {parsedData[1].handle}...</p>}
                  {progress > 90 && <p>&gt; Finalizing database commit...</p>}
                  <span className="animate-pulse">_</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: DONE */}
          {step === 'DONE' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex-grow flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 border border-green-500/20">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-display font-medium text-white mb-2">Import Complete</h2>
              <p className="text-zinc-500 text-sm mb-8">
                Successfully onboarded {parsedData.filter(r => r.status === 'VALID').length} new agents to the roster.
              </p>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => setStep('UPLOAD')} className="border-white/10">
                  Upload Another
                </Button>
                <Button onClick={onBack} className="bg-white text-black hover:bg-zinc-200">
                  View Roster
                </Button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </motion.div>
  );
}