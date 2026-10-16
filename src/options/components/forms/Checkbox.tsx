import type { ChangeEvent, FC } from 'react';
export const Checkbox: FC<{
  isSwitch: boolean;
  label: string;
  checked: boolean;
  onChange: (evt: ChangeEvent<HTMLInputElement>) => void;
}> = ({ isSwitch, label, checked, onChange }) => (
  <div className="form-group">
    <label className={isSwitch ? 'form-switch' : 'form-checkbox'}>
      <span>{label}</span>
      <input type="checkbox" role={isSwitch ? 'switch' : undefined} checked={checked} onChange={onChange} />
    </label>
  </div>
);
