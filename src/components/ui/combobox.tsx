import React, { useState } from 'react';
import { Input } from './input';

interface ComboboxProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const Combobox: React.FC<ComboboxProps> = ({ options, value, onChange, placeholder, disabled }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = query.length > 0
    ? options.filter(o => o.toLowerCase().includes(query.toLowerCase())).slice(0, 20)
    : [];

  const handleSelect = (option: string) => {
    onChange(option);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="relative">
      <Input
        value={open ? query : value}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        disabled={disabled}
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 w-full bg-background border border-border rounded-md shadow-md mt-1 max-h-48 overflow-y-auto">
          {filtered.map((option) => (
            <li
              key={option}
              onMouseDown={() => handleSelect(option)}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-accent"
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Combobox;
