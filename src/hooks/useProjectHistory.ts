import { useState, useRef, useCallback } from 'react';
import { ProjectSettings } from '../types';

export interface HistoryStep {
  name: string;
  time: string;
  layersCount: number;
}

export function useProjectHistory(initialProject: ProjectSettings) {
  const [project, setProjectInternal] = useState<ProjectSettings>(initialProject);
  const pastRef = useRef<{ state: ProjectSettings; timestamp: string }[]>([]);
  const futureRef = useRef<{ state: ProjectSettings; timestamp: string }[]>([]);
  const lastSavedTimeRef = useRef<number>(0);
  const pendingSnapshotRef = useRef<ProjectSettings | null>(null);

  // Set project with debounce for rapid continuous changes
  const setProject = useCallback(
    (action: React.SetStateAction<ProjectSettings>) => {
      setProjectInternal((prev) => {
        const next = typeof action === 'function' ? action(prev) : action;

        const now = Date.now();
        // If more than 400ms since last history snapshot, record previous state
        if (now - lastSavedTimeRef.current > 400) {
          const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          pastRef.current = [...pastRef.current.slice(-30), { state: prev, timestamp: timeStr }];
          futureRef.current = [];
          lastSavedTimeRef.current = now;
        } else {
          if (!pendingSnapshotRef.current) {
            pendingSnapshotRef.current = prev;
          }
        }

        return next;
      });
    },
    []
  );

  // Direct load without push
  const loadProjectDirect = useCallback((newProject: ProjectSettings) => {
    pastRef.current = [];
    futureRef.current = [];
    setProjectInternal(newProject);
  }, []);

  const undo = useCallback(() => {
    if (pastRef.current.length === 0) return;
    const previous = pastRef.current[pastRef.current.length - 1];
    pastRef.current = pastRef.current.slice(0, -1);

    setProjectInternal((current) => {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      futureRef.current = [{ state: current, timestamp: timeStr }, ...futureRef.current.slice(0, 30)];
      return previous.state;
    });
  }, []);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const next = futureRef.current[0];
    futureRef.current = futureRef.current.slice(1);

    setProjectInternal((current) => {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      pastRef.current = [...pastRef.current.slice(-30), { state: current, timestamp: timeStr }];
      return next.state;
    });
  }, []);

  const canUndo = pastRef.current.length > 0;
  const canRedo = futureRef.current.length > 0;
  const undoCount = pastRef.current.length;
  const redoCount = futureRef.current.length;

  return {
    project,
    setProject,
    loadProjectDirect,
    undo,
    redo,
    canUndo,
    canRedo,
    undoCount,
    redoCount,
    pastSteps: pastRef.current.map((p) => ({
      name: p.state.name,
      time: p.timestamp,
      layersCount: p.state.layers.length,
    })),
  };
}
