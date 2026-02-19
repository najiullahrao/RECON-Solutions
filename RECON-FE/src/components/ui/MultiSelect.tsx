import { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/cn';

export interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  label?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const displayText =
    value.length === 0
      ? placeholder
      : value.length === 1
        ? options.find((o) => o.value === value[0])?.label ?? value[0]
        : `${value.length} selected`;

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-[#1a1a1a]">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex min-h-[42px] w-full items-center justify-between rounded-sm border border-gray-200 bg-white px-3 py-2 text-left text-sm transition-colors focus:border-[#800000] focus:outline-none focus:ring-1 focus:ring-[#800000]',
          value.length > 0 ? 'text-[#1a1a1a]' : 'text-[#1a1a1a]/60'
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{displayText}</span>
        <svg
          className={cn('h-4 w-4 shrink-0 text-[#1a1a1a]/60 transition-transform', open && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-sm border border-gray-200 bg-white py-1"
        >
          {value.length > 0 && (
            <li
              role="option"
              onClick={() => {
                onChange([]);
                setOpen(false);
              }}
              className="flex cursor-pointer items-center gap-2 border-b border-gray-200 px-3 py-2 text-sm font-medium text-[#800000] hover:bg-[#800000]/5"
            >
              Clear all
            </li>
          )}
          {options.map((opt) => {
            const checked = value.includes(opt.value);
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={checked}
                onClick={() => toggle(opt.value)}
                className={cn(
                  'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-[#f9f9f9]',
                  checked && 'bg-[#800000]/5'
                )}
              >
                <span
                  className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border',
                    checked
                      ? 'border-[#800000] bg-[#800000] text-white'
                      : 'border-gray-200'
                  )}
                >
                  {checked && (
                    <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </span>
                <span className="text-[#1a1a1a]">{opt.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
