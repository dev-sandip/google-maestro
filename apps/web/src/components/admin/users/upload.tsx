
import { Button } from '@/components/ui/button';
import { api } from '@google-maestro-new/backend/convex/_generated/api';
import type { Id } from '@google-maestro-new/backend/convex/_generated/dataModel';
import { useMutation } from 'convex/react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Save,
  Trash2,
  UploadCloud,
  Users,
  X
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useRef, useState } from 'react';
import { toast } from 'sonner';

interface ParsedRow {
  email: string;
  status: 'VALID' | 'INVALID';
  error?: string;
}

interface ParticipantsUploadViewProps {
  roundId: string;
  onBack: () => void;
}

export function ParticipantsUploadView({ roundId, onBack }: ParticipantsUploadViewProps) {
  const [step, setStep] = useState<'UPLOAD' | 'PREVIEW' | 'UPLOADING'>('UPLOAD');
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mutation
  const addParticipants = useMutation(api.allowed.addEmails);

  // --- CSV PARSER ---
  const parseCSV = (text: string) => {
    const lines = text.split(/\r\n|\n/);
    const rows: ParsedRow[] = [];

    // Email Regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    lines.forEach((line) => {
      const cleanLine = line.trim().replace(/['"]+/g, '');
      if (!cleanLine) return; // Skip empty lines

      // Assume CSV is just a list of emails, or taking the first column
      const parts = cleanLine.split(',');
      const email = parts[0].trim();

      if (emailRegex.test(email)) {
        rows.push({ email, status: 'VALID' });
      } else {
        rows.push({ email, status: 'INVALID', error: 'Invalid Format' });
      }
    });

    setParsedData(rows);
    setStep('PREVIEW');
  };

  const handleFile = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error("Please upload a valid CSV file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  // --- HANDLERS ---
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    const validEmails = parsedData.filter(r => r.status === 'VALID').map(r => r.email);

    if (validEmails.length === 0) {
      toast.error("No valid emails to import");
      return;
    }

    setStep('UPLOADING');
    try {
      await addParticipants({
        roundId: roundId as Id<'rounds'>,
        emails: validEmails
      });
      console.log(validEmails);
      toast.success(`Successfully added ${validEmails.length} participants`);
      onBack();
    } catch (e) {
      toast.error("Failed to import participants");
      setStep('PREVIEW');
    }
  };

  const removeRow = (index: number) => {
    setParsedData(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto h-[calc(100vh-100px)] flex flex-col"
    >

      {/* Header */}
      <div className="flex items-center gap-4 mb-8 shrink-0">
        <Button variant="ghost" onClick={onBack} className="text-zinc-500 hover:text-white pl-0">
          <ArrowRight size={16} className="rotate-180 mr-2" /> Back to Round
        </Button>
        <div className="h-6 w-px bg-white/10" />
        <h1 className="text-xl font-display font-medium text-white flex items-center gap-3">
          Import Participants
        </h1>
      </div>

      {/* Main Content */}
      <div className="bg-[#121214] border border-white/5 rounded-xl overflow-hidden flex flex-col flex-grow relative">
        <AnimatePresence mode="wait">

          {/* STATE 1: UPLOAD */}
          {step === 'UPLOAD' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-grow flex flex-col items-center justify-center p-12 text-center"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
            >
              <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center border border-dashed border-zinc-700 mb-6 group-hover:border-white transition-colors">
                <UploadCloud size={32} className="text-zinc-500" />
              </div>

              <h2 className="text-2xl font-display font-medium text-white mb-2">Upload Email List</h2>
              <p className="text-zinc-500 text-sm max-w-sm mb-8">
                Drag and drop your CSV file here. The file should contain a single column of email addresses.
              </p>

              <div className="flex gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".csv"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <Button onClick={() => fileInputRef.current?.click()} className="bg-white text-black hover:bg-zinc-200">
                  Select File
                </Button>
              </div>
            </motion.div>
          )}

          {/* STATE 2: PREVIEW & CONFIRM */}
          {step === 'PREVIEW' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full"
            >
              {/* Toolbar */}
              <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded text-blue-500"><FileText size={18} /></div>
                  <div>
                    <h3 className="text-sm font-medium text-white">Data Preview</h3>
                    <p className="text-xs text-zinc-500 font-mono">
                      {parsedData.filter(r => r.status === 'VALID').length} Valid • {parsedData.filter(r => r.status === 'INVALID').length} Errors
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep('UPLOAD')} className="text-zinc-500 hover:text-white">
                  <X size={16} /> Cancel
                </Button>
              </div>

              {/* Table */}
              <div className="flex-grow overflow-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#09090B] text-[10px] font-mono uppercase text-zinc-500 sticky top-0 z-10">
                    <tr>
                      <th className="p-4 font-medium border-b border-white/5 w-16">Status</th>
                      <th className="p-4 font-medium border-b border-white/5">Email Address</th>
                      <th className="p-4 font-medium border-b border-white/5 w-20 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-white/5">
                    {parsedData.map((row, i) => (
                      <tr key={i} className={`group hover:bg-white/5 transition-colors ${row.status === 'INVALID' ? 'bg-red-500/5' : ''}`}>
                        <td className="p-4">
                          {row.status === 'VALID' ? (
                            <CheckCircle2 size={16} className="text-green-500" />
                          ) : (
                            <AlertCircle size={16} className="text-red-500" />
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`font-mono ${row.status === 'VALID' ? 'text-zinc-300' : 'text-red-400 line-through'}`}>
                            {row.email}
                          </span>
                          {row.status === 'INVALID' && (
                            <span className="ml-3 text-[10px] text-red-500 font-mono uppercase bg-red-500/10 px-2 py-0.5 rounded">
                              {row.error}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => removeRow(i)}
                            className="text-zinc-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-white/5 bg-[#09090B] flex justify-end gap-3 shrink-0">
                <Button variant="ghost" onClick={() => setStep('UPLOAD')}>Reset</Button>
                <Button
                  onClick={handleUpload}
                  disabled={parsedData.filter(r => r.status === 'VALID').length === 0}
                  className="bg-white text-black hover:bg-zinc-200"
                >
                  <Save size={16} className="mr-2" />
                  Import {parsedData.filter(r => r.status === 'VALID').length} Users
                </Button>
              </div>
            </motion.div>
          )}

          {/* STATE 3: UPLOADING */}
          {step === 'UPLOADING' && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex-grow flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <Users size={32} className="text-blue-500" />
              </div>
              <h2 className="text-xl font-display text-white mb-2">Syncing Database...</h2>
              <p className="text-zinc-500 text-sm">Please wait while we register the agents.</p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
}