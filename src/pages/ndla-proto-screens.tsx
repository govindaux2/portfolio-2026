const ui = '/case/ndla/fig/ui';

function Icon({ name, size = 24 }: { name: string; size?: number }) {
  return <img src={`${ui}/${name}.svg`} alt="" width={size} height={size} />;
}

function Field({
  label,
  trail,
}: {
  label: string;
  trail?: 'calendar';
}) {
  return (
    <div className="ndla-p-field">
      <span>{label}</span>
      {trail === 'calendar' ? <Icon name="calendar" /> : null}
    </div>
  );
}

function Status() {
  return (
    <div className="ndla-p-status">
      <span>9:41</span>
    </div>
  );
}

export function PersonalInfoScreen() {
  return (
    <div className="ndla-proto">
      <Status />
      <header className="ndla-p-nav">
        <p>Personal info</p>
        <img className="ndla-p-dots" src={`${ui}/dots.svg`} alt="" width={72} height={8} />
      </header>
      <div className="ndla-p-body">
        <div className="ndla-p-banner">
          <Icon name="bell" />
          <p>
            Before you begin:{' '}
            <a href="#frame-unfreeze">Unfreeze your credit</a> for faster
            processing
          </p>
          <Icon name="close" />
        </div>
        <p className="ndla-p-h">Your details</p>
        <Field label="First name" />
        <Field label="Middle initial (Optional)" />
        <Field label="Last name" />
        <Field label="Date of birth (MM/DD/YYYY)" trail="calendar" />
        <Field label="Email address" />
        <p className="ndla-p-h">Address details</p>
        <Field label="Home street address" />
        <Field label="Home street address 2 (Optional)" />
        <Field label="City" />
      </div>
      <footer className="ndla-p-foot">
        <span className="ndla-p-save">
          <Icon name="save" size={16} />
          Save
        </span>
        <div className="ndla-p-actions">
          <button type="button" className="ndla-p-ghost">
            Cancel
          </button>
          <button type="button" className="ndla-p-next">
            Next
          </button>
        </div>
      </footer>
    </div>
  );
}

export function UnfreezeScreen() {
  return (
    <div className="ndla-proto ndla-proto--center">
      <Status />
      <div className="ndla-p-instruct">
        <img className="ndla-p-globe" src={`${ui}/globe.svg`} alt="" width={114} height={115} />
        <h3>Unfreeze your credit to get a decision</h3>
        <div className="ndla-p-step">
          <Icon name="unlock" />
          <p>
            Step 1: Go to <a href="https://www.experian.com">Experian.com</a> to
            lift your credit freeze.
          </p>
        </div>
        <div className="ndla-p-step">
          <Icon name="phone" />
          <p>
            Step 2: Call us at <a href="tel:18009679521">1-800-967-9521</a> to
            finish processing your application.
          </p>
        </div>
        <p className="ndla-p-ref">
          Application reference number:
          <strong>20220743000764</strong>
        </p>
        <div className="ndla-p-copy">
          <Icon name="copy" size={16} />
          <span>Copy these instructions</span>
          <small>This page may time out.</small>
        </div>
      </div>
      <footer className="ndla-p-foot ndla-p-foot--one">
        <button type="button" className="ndla-p-back">
          Go back
        </button>
      </footer>
    </div>
  );
}
