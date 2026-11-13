import { useState } from 'react';
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import Segmented from '../components/ui/Segmented';
import usePageTitle from '../hooks/usePageTitle';
import { useTheme } from '../context/Theme';
import { useFeedback } from '../context/Feedback';
import { exportApi, saveBlob } from '../utils/api';

const THEMES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'Match device' },
];

function Settings() {
  usePageTitle('Settings');
  const { mode, setTheme } = useTheme();
  const { toast } = useFeedback();
  const [busy, setBusy] = useState('');

  const exportAs = async (kind) => {
    setBusy(kind);
    try {
      const blob = kind === 'csv' ? await exportApi.downloadCsv() : await exportApi.downloadPdf();
      saveBlob(blob, kind === 'csv' ? 'trackspense-transactions.csv' : 'trackspense-report.pdf');
      toast.success(kind === 'csv' ? 'CSV downloaded.' : 'PDF report downloaded.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy('');
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Settings</h1>
          <p className="muted">Choose how Trackspense looks and take your data with you.</p>
        </div>
      </div>
      <div className="grid-even">
        <Panel title="Appearance">
          <div className="field">
            <span className="label">Theme</span>
            <Segmented label="Theme" options={THEMES} value={mode} onChange={setTheme} />
            <p className="hint">Your choice is saved on this device.</p>
          </div>
        </Panel>
        <Panel title="Your data">
          <p className="muted">Download every transaction you’ve logged.</p>
          <div className="row">
            <Button icon="download" loading={busy === 'csv'} onClick={() => exportAs('csv')}>Export CSV</Button>
            <Button icon="download" loading={busy === 'pdf'} onClick={() => exportAs('pdf')}>Export PDF report</Button>
          </div>
        </Panel>
      </div>
    </>
  );
}

export default Settings;
