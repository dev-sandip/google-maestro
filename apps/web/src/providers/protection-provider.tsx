
import { api } from "@google-maestro-new/backend/convex/_generated/api";
import type { Id } from "@google-maestro-new/backend/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

interface Violation {
  id: number;
  type: string;
  timestamp: string;
  userAgent?: string;
  url?: string;
  userId: Id<"users">;
  roundId: Id<"rounds">;
}

interface ProtectionContextType {
  violations: Violation[];
  clearViolations: () => void;
  isBlocked: boolean;
  isSyncing: boolean;
}

interface ProtectionProviderProps {
  children: React.ReactNode;
  roundId: Id<"rounds">;
  onError?: (error: Error) => void;
  autoSync?: boolean;
  violationThreshold?: number; // 0 = never auto-block
}

const ProtectionContext = createContext<ProtectionContextType | undefined>(undefined);

export const useProtection = (): ProtectionContextType => {
  const context = useContext(ProtectionContext);
  if (!context) throw new Error("useProtection must be used within ProtectionProvider");
  return context;
};

export const ProtectionProvider = ({
  children,
  roundId,
  onError,
  autoSync = true,
  violationThreshold = 5, // block after 5 violations
}: ProtectionProviderProps) => {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const currentUser = useQuery(api.users.current);
  const createViolation = useMutation(api.violations.createViolation);

  // Refs to prevent spam crashes
  const violationCountRef = useRef(0);
  const lastToastTimeRef = useRef(0);
  const blockedRef = useRef(false);

  const saveViolationToDatabase = useCallback(
    async (violation: Violation) => {
      if (!autoSync || !currentUser?._id) return;

      try {
        setIsSyncing(true);
        await createViolation({
          type: violation.type,
          timestamp: violation.timestamp,
          userAgent: violation.userAgent as string,
          url: violation.url as string,
          userId: currentUser._id,
          roundId,
        });
      } catch (error) {
        onError?.(error as Error);
      } finally {
        setIsSyncing(false);
      }
    },
    [autoSync, currentUser?._id, roundId, createViolation, onError]
  );

  const addViolation = useCallback(
    (type: string) => {
      if (blockedRef.current) return;

      violationCountRef.current += 1;
      const now = Date.now();

      // Auto-block after threshold
      if (violationThreshold > 0 && violationCountRef.current >= violationThreshold) {
        blockedRef.current = true;
        setIsBlocked(true);
        toast.error("Too many violations – you have been blocked");
        return;
      }

      // Log violation locally (only first 20 to prevent memory blowup)
      if (violations.length < 20) {
        const newViolation: Violation = {
          id: Date.now() + Math.random(),
          type,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          userId: currentUser?._id as Id<'users'>,
          roundId,
        };
        setViolations((prev) => [...prev, newViolation]);

        // Save to DB only every 3rd violation + first 3
        if (violationCountRef.current <= 3 || violationCountRef.current % 3 === 0) {
          saveViolationToDatabase(newViolation);
        }
      }

      // Throttle toasts: max 1 every 3 seconds
      if (now - lastToastTimeRef.current > 3000) {
        lastToastTimeRef.current = now;
        toast.error("Action blocked – stop cheating");
      }
    },
    [
      violations.length,
      violationThreshold,
      currentUser?._id,
      roundId,
      saveViolationToDatabase,
    ]
  );

  // Debounced version for super spammy events (right-click, drag)
  const debouncedAddViolation = useCallback(
    debounce((type: string) => addViolation(type), 250),
    [addViolation]
  );

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      debouncedAddViolation("Right-click attempted");
    };

    const blockCopyCut = (e: ClipboardEvent) => {
      e.preventDefault();
      addViolation(e.type === "copy" ? "Copy attempted" : "Cut attempted");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F12") {
        e.preventDefault();
        addViolation("F12 pressed");
        return;
      }
      if (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key.toUpperCase())) {
        e.preventDefault();
        addViolation("DevTools shortcut");
        return;
      }
      if (e.ctrlKey && e.key === "u") {
        e.preventDefault();
        addViolation("View source (Ctrl+U)");
        return;
      }
      if (e.ctrlKey && ["c", "x"].includes(e.key.toLowerCase())) {
        e.preventDefault();
        addViolation(`Ctrl+${e.key.toUpperCase()} blocked`);
      }
    };

    const detectDevTools = () => {
      const threshold = 160;
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        addViolation("DevTools detected (size)");
      }
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      debouncedAddViolation("Drag attempted");
    };

    // Add listeners
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", blockCopyCut);
    document.addEventListener("cut", blockCopyCut);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("dragstart", handleDragStart);
    const interval = setInterval(detectDevTools, 2000);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", blockCopyCut);
      document.removeEventListener("cut", blockCopyCut);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("dragstart", handleDragStart);
      clearInterval(interval);
    };
  }, [addViolation, debouncedAddViolation]);

  const clearViolations = () => {
    setViolations([]);
    violationCountRef.current = 0;
    blockedRef.current = false;
    setIsBlocked(false);
  };

  return (
    <ProtectionContext.Provider
      value={{ violations, clearViolations, isBlocked, isSyncing }}
    >
      {children}
    </ProtectionContext.Provider>
  );
};

// Simple debounce helper
function debounce<F extends (...args: any[]) => any>(func: F, wait: number) {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<F>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}