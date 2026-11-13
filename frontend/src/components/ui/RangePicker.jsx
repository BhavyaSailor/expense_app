import Segmented from './Segmented';
import { RANGE_OPTIONS } from '../../utils/finance';

function RangePicker({ value, onChange }) {
  const set = (patch) => onChange({ ...value, ...patch });
  return (
    <div className="range-picker">
      <Segmented label="Date range" options={RANGE_OPTIONS} value={value.preset} onChange={(preset) => set({ preset })} />
      {value.preset === 'custom' && (
        <div className="range-custom">
          <input
            type="date"
            aria-label="From date"
            value={value.from}
            max={value.to || undefined}
            onChange={(e) => set({ from: e.target.value })}
          />
          <span className="muted">to</span>
          <input
            type="date"
            aria-label="To date"
            value={value.to}
            min={value.from || undefined}
            onChange={(e) => set({ to: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}

export default RangePicker;
