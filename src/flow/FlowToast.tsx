import { useEffect, useState } from 'react';

export function FlowToast() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let hide = 0;
    const onToast = (e: Event) => {
      const next = (e as CustomEvent<string>).detail;
      if (!next) return;
      setMessage(next);
      window.clearTimeout(hide);
      hide = window.setTimeout(() => setMessage(null), 2800);
    };
    window.addEventListener('flow-toast', onToast);
    return () => {
      window.removeEventListener('flow-toast', onToast);
      window.clearTimeout(hide);
    };
  }, []);

  if (!message) return null;
  return (
    <p className="flow-toast" role="status">
      {message}
    </p>
  );
}
