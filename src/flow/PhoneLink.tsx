import { useEffect, useState } from 'react';
import { flowToast } from './speech';
import { fetchPhoneOrigin, isFileSync } from './storage';

/** Always opens the workflow list so the phone sees every board on this Mac. */
const PHONE_PATH = '/flow';

export function PhoneLink({
  showUrl = false,
}: {
  showUrl?: boolean;
}) {
  const [url, setUrl] = useState('');
  const sync = isFileSync();

  useEffect(() => {
    void resolvePhoneUrl().then(setUrl);
  }, []);

  const copy = async () => {
    const next = await resolvePhoneUrl();
    setUrl(next);
    try {
      await navigator.clipboard.writeText(next);
      const local = /localhost|127\.0\.0\.1/.test(next);
      flowToast(
        local
          ? 'Copied localhost — phones need the Wi-Fi link shown here'
          : 'Copied — phone opens all workflows on this Mac'
      );
    } catch {
      flowToast('Could not copy');
    }
  };

  return (
    <div className="flow-phone">
      <button
        type="button"
        className={showUrl ? 'flow-new-btn' : 'flow-icon-btn'}
        data-tip="Copy phone link — all workflows"
        aria-label="Copy phone link to all workflows"
        onClick={() => void copy()}
      >
        {showUrl ? 'Copy phone link' : <PhoneGlyph />}
      </button>
      {showUrl && url ? (
        <p className="flow-phone-url">
          {sync ? 'Same Mac, same Wi-Fi. ' : ''}
          <span>{url}</span>
        </p>
      ) : null}
    </div>
  );
}

async function resolvePhoneUrl() {
  const origin = (await fetchPhoneOrigin()) ?? window.location.origin;
  return `${origin}${PHONE_PATH}`;
}

function PhoneGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect
        x="5.5"
        y="1.8"
        width="5"
        height="12.2"
        rx="1.1"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M7.2 12.6h1.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
