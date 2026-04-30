import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import DropdownWrapper from './style';

const DropdownSearch = ({
    label,
    required = false,
    placeholder = 'Start typing...',
    displayValue = '',
    options = [],
    onSelect,
    onClear,
    wrapperClassName = '',
    readOnly = false,
    disabled = false,
    multiSelect = false,
    selectedValues = [],
    showSelectAll = false,
    errorMessage,
}) => {
    const [searchText, setSearchText] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const inputRef = useRef(null);
    const wrapperRef = useRef(null);
    useEffect(() => {
        if (!multiSelect && !isDropdownOpen) {
            setSearchText(displayValue || '');
        }
    }, [displayValue, multiSelect, isDropdownOpen]);


    const formattedOptions = useMemo(() => {
        const base = options.map((option) =>
            typeof option === 'string'
                ? { label: option, value: option }
                : option,
        );

        if (multiSelect && showSelectAll) {
            return [{ label: 'Select All', value: '__ALL__' }, ...base];
        }

        return base;
    }, [options, multiSelect, showSelectAll]);

    const selectedOptions = useMemo(() => {
        if (!multiSelect) return [];
        return formattedOptions.filter((o) => selectedValues.includes(o.value));
    }, [formattedOptions, selectedValues, multiSelect]);

    const visibleOptions = useMemo(() => {
        if (!isDropdownOpen) return [];
        if (!searchText) return formattedOptions;

        const search = searchText.toLowerCase();
        return formattedOptions.filter((option) =>
            option.label.toLowerCase().includes(search),
        );
    }, [searchText, formattedOptions, isDropdownOpen]);

    const handleClear = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setSearchText('');
        setIsDropdownOpen(true);
        onClear?.();
        requestAnimationFrame(() => {
            inputRef.current?.focus();
        });
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleFocusIn = (e) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(e.target)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('focusin', handleFocusIn);
        return () =>
            document.removeEventListener('focusin', handleFocusIn);
    }, []);


    return (
        <DropdownWrapper>
            <div
                ref={wrapperRef}
                className={`dropdown-box ${wrapperClassName}`}
                tabIndex={0}
            >
                <div className="dropdown-input-wrapper">
                    {multiSelect && selectedOptions.length > 0 && (
                        <div className="chips">
                            {selectedOptions.map((option) => (
                                <span key={option.value} className="chip">
                                    {option.label}
                                    <FaTimes
                                        className="chip-remove"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            onSelect(option);
                                        }}
                                    />
                                </span>
                            ))}
                        </div>
                    )}

                    <input
                        ref={inputRef}
                        readOnly={readOnly}
                        type="text"
                        className="form-control"
                        placeholder={label ? ' ' : placeholder}
                        value={searchText}
                        disabled={disabled}
                        onChange={(e) => {
                            setSearchText(e.target.value);
                            setIsDropdownOpen(true);
                        }}
                        onFocus={() => !disabled && !readOnly && setIsDropdownOpen(true)}
                        autoComplete="new-password"
                    />
                </div>

                {/* Hidden input to trigger existing floating-label CSS (input + label).
                Required due to dropdown/chips DOM structure. Do not remove. */}
                {/* Hidden input for floating-label CSS trigger. Do not remove. */}
                <input
                    className="visually-hidden"
                    placeholder=" "
                    value={searchText}
                    readOnly
                    aria-hidden="true"
                    tabIndex={-1}
                />

                {label && (
                    <label className={required ? 'required' : ''}>
                        {label}
                    </label>
                )}

                {searchText && !disabled && !readOnly && !multiSelect && (
                    <FaTimes className="clear-icon" onMouseDown={handleClear} />
                )}

                {isDropdownOpen && (
                    <ul className="dropdown-list">
                        {visibleOptions.length > 0 ? (
                            visibleOptions.map((option) => {
                                const allValues = options.map((o) =>
                                    typeof o === 'string' ? o : o.value,
                                );
                                const isChecked =
                                    multiSelect &&
                                    (option.value === '__ALL__'
                                        ? selectedValues.length ===
                                        allValues.length &&
                                        allValues.length > 0
                                        : selectedValues.includes(
                                            option.value,
                                        ));
                                return (
                                    <li
                                        key={option.value}
                                        className="dropdown-item"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            onSelect(option);

                                            if (multiSelect) {
                                                setSearchText('');
                                                setIsDropdownOpen(true);
                                            } else {
                                                setSearchText(option.label);
                                                setIsDropdownOpen(false);
                                            }
                                        }}
                                    >
                                        <span className="dropdown-name">
                                            <span className="role-name">
                                                {option.label}
                                            </span>

                                            {option.groupName ? (
                                                <span className="group-name">
                                                    {option.groupName.replace(
                                                        '_',
                                                        ' ',
                                                    )}
                                                </span>
                                            ) : (
                                                multiSelect && (
                                                    <span className="checkbox-wrapper">
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            readOnly
                                                            className="checkbox"
                                                        />
                                                    </span>
                                                )
                                            )}
                                        </span>
                                    </li>
                                );
                            })
                        ) : (
                            <li className="dropdown-item no-result">
                                {errorMessage || "No result found"}
                            </li>
                        )}
                    </ul>
                )}
            </div>
        </DropdownWrapper>
    );
};

export default DropdownSearch;
