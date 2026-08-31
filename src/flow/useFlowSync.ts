import { useEffect, useState } from 'react';
import { initFlowStorage, onFlowStorage, pullFlowStorage } from './storage';

let storageReady = false;

export function useFlowSync() {
  const [ready, setReady] = useState(storageReady);

  useEffect(() => {
    void initFlowStorage().then(() => {
      storageReady = true;
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    const tick = () => {
      void pullFlowStorage();
    };
    const id = window.setInterval(tick, 2000);
    window.addEventListener('focus', tick);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', tick);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [ready]);

  return ready;
}

export function useFlowStorageTick(onTick: () => void) {
  useEffect(() => onFlowStorage(onTick), [onTick]);
}
