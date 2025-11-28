import { api } from '@google-maestro-new/backend/convex/_generated/api';
import type { Id } from '@google-maestro-new/backend/convex/_generated/dataModel';
import { useMutation, useQuery } from 'convex/react';
import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Violation {
  id: number;
  type: string;
  timestamp: string;
  userAgent?: string;
  url?: string;
  userId: Id<'users'>;
  roundId: Id<'rounds'>;
}

interface ProtectionContextType {
  violations: Violation[];
  clearViolations: () => void;
  isBlocked: boolean;
  isSyncing: boolean;
}

interface ProtectionProviderProps {
  children: React.ReactNode;
  roundId: Id<'rounds'>;
  onError?: (error: Error) => void;
  autoSync?: boolean;
  violationThreshold?: number; // optional: auto-block after X violations
}

const ProtectionContext = createContext<ProtectionContextType | undefined>(undefined);

export const useProtection = (): ProtectionContextType => {
  const context = useContext(ProtectionContext);
  if (!context) {
    throw new Error('useProtection must be used within ProtectionProvider');
  }
  return context;
};

export const ProtectionProvider = ({
  children,
  roundId,
  onError,
  autoSync = true,
  violationThreshold = 0, // change to any number you want (0 = never auto-block)
}: ProtectionProviderProps) => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const user = useQuery(api.users.current);
  const voilationMutation = useMutation(api.violations.createViolation);
  // Placeholder – replace with your real Convex mutation

  const saveViolationToDatabase = async (violation: Violation) => {
    console.log("User Id", user?._id)
    console.log("Round Id", violation.roundId)
    if (!autoSync) return;
    try {
      setIsSyncing(true);
      console.log("User Id", user?._id)
      console.log("Round Id", violation.roundId)
      voilationMutation({
        type: violation.type,
        timestamp: violation.timestamp,
        userAgent: violation.userAgent as string,
        url: violation.url as string,
        userId: user?._id as Id<"users">,
        roundId: violation.roundId as Id<"rounds">,
      });
      // await convex.mutation('violations:insert', violation);
      console.log('Violation saved:', violation.type);
    } catch (error) {
      console.error('Failed to save violation', error);
      onError?.(error as Error);
    } finally {
      setIsSyncing(false);
    }
  };

  const addViolation = (type: string) => {
    const newViolation: Violation = {
      id: Date.now(),
      type,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: user?._id as Id<'users'>,
      roundId: roundId as Id<'rounds'>,
    };

    setViolations(prev => {
      const updated = [...prev, newViolation];

      // Auto-block after X violations (optional)
      if (violationThreshold > 0 && updated.length >= violationThreshold) {
        setIsBlocked(true);
        toast.error('Too many violations – access blocked');
      }

      return updated;
    });

    saveViolationToDatabase(newViolation);
  };

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      addViolation('Right-click attempted');
      toast.error('Right-click is disabled');
    };

    const blockCopyCut = (e: ClipboardEvent) => {
      e.preventDefault();
      addViolation(e.type === 'copy' ? 'Copy attempted' : 'Cut attempted');
      toast.error('Copy/cut is disabled');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        addViolation('F12 pressed');
        toast.error('Developer tools are disabled');
        return;
      }

      // Ctrl+Shift+I / J / C
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
        e.preventDefault();
        addViolation('DevTools shortcut (Ctrl+Shift+I/J/C)');
        toast.error('Developer tools are disabled');
        return;
      }

      // Ctrl+U (view source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        addViolation('View page source (Ctrl+U)');
        toast.error('View source is disabled');
        return;
      }

      // Ctrl+C / Ctrl+X
      if (e.ctrlKey && (e.key === 'c' || e.key === 'x')) {
        e.preventDefault();
        addViolation(`Ctrl+${e.key.toUpperCase()} blocked`);
        toast.error('Copy/cut is disabled');
      }
    };

    // Slightly better DevTools detection (still bypassable, but catches most users)
    const detectDevTools = () => {
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;

      if (widthDiff || heightDiff) {
        addViolation('DevTools window size detected');
        toast.error('Developer tools are not allowed');
        // Don't auto-block here – many users have legitimate side panels
      }
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      addViolation('Drag attempted');
      toast.error('Dragging is disabled');
    };

    // ─── Event Listeners ───
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', blockCopyCut);
    document.addEventListener('cut', blockCopyCut);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);

    const interval = setInterval(detectDevTools, 1500);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', blockCopyCut);
      document.removeEventListener('cut', blockCopyCut);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
      clearInterval(interval);
    };
  }, [violationThreshold]);

  const clearViolations = () => {
    setViolations([]);
    setIsBlocked(false);
  };

  return (
    <ProtectionContext.Provider
      value={{
        violations,
        clearViolations,
        isBlocked,
        isSyncing,
      }}
    >
      {children}
    </ProtectionContext.Provider>
  );
};