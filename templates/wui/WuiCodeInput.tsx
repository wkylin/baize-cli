import { useState } from 'react';
import OneTimePasscode from '@w.ui/wui-react/one-time-passcode';

export function WuiCodeInput() {
  const [value, setValue] = useState('');
  return <OneTimePasscode length={6} value={value} onChange={setValue} />;
}
