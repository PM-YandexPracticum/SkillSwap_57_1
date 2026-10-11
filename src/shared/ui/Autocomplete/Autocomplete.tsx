import React, { FC, useState, useRef, useEffect } from 'react';
import styles from './Autocomplete.module.css';
import { Popover } from '../Popover';
import ArrowIcon from '@/shared/assets/icons/chevron.svg?react';
import CloseIcon from '@/shared/assets/icons/close.svg?react';

type TOption = {
  value: string
  label: string
}

type TAutocompleteProps = {
  options: TOption[]
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  className?: string
}

export const Autocomplete: FC<TAutocompleteProps> = ({
  options,
  value,
  onChange,
  label,
  placeholder,
  className,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [previousValue, setPreviousValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label;
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().startsWith(inputValue.toLowerCase())
  );
  const shouldShowList = isOpen && filteredOptions.length > 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setInputValue(newText);
    setIsOpen(true);
    setPreviousValue(value);
  }

  const handleSelectedOption = (optionValue: string) => {
    onChange(optionValue);
    setInputValue('');
    setIsOpen(false);
    setPreviousValue(optionValue);
  }

  const handleClear = () => {
    onChange('');
    setInputValue('');
    setIsOpen(false);
    setPreviousValue('');
    inputRef.current?.focus();
  }

  const handleFocus = () => {
    setIsOpen(true);
    if(inputValue && !selectedLabel) {
      setInputValue('');
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
        if (inputValue && !filteredOptions.some(opt => opt.label === inputValue)) {
          setInputValue('');
          if (previousValue) {
            onChange(previousValue);
          }
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [inputValue, filteredOptions, previousValue, onChange]);

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className || ''}`}
    >
      {label && <label className={styles.label}>{label}</label>}
      <Popover
        open={shouldShowList}
        onClose={() => setIsOpen(false)}
        className={styles.popover}
        trigger={
          <div
            className={`${styles.inputWrapper} ${isOpen ? styles.open : ''}`}
            onClick={() => inputRef.current?.focus()}
          >
            <input
              ref={inputRef}
              type="text"
              className={styles.input}
              value={inputValue || selectedLabel || ''}
              onChange={handleInputChange}
              onFocus={handleFocus}
              placeholder={placeholder || ''}
              />

              <div className={styles.rightIcon}>
                {(inputValue || selectedLabel) ? (
                  <button
                    type="button"
                    className={styles.clearButton}
                    onClick={handleClear}
                    aria-label="Очистить"
                  >
                    <CloseIcon />
                  </button>
                ) : (
                  <span className={`${styles.arrow} ${isOpen ? styles.open : ''}`}>
                    <ArrowIcon />
                  </span>
                )}
              </div>
          </div>
        }
      >
        <ul
          className={styles.optionsList}
          role="listbox"
        >
          {filteredOptions.map((option) => (
            <li
              key={option.value}
              className={`${styles.option} ${value === option.value ? styles.active : ''}`}
              onClick={() => handleSelectedOption(option.value)}
              role="option"
              aria-selected={value === option.value}
            >
              {option.label}
            </li>
          ))}
        </ul>
      </Popover>
    </div>
  )
}
