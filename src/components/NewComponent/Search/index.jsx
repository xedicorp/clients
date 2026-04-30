import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import SearchWrapper from "./style";
import { RiCloseFill } from "react-icons/ri";
import { FaSearch } from "react-icons/fa";

const Search = ({
    value,
    onChange,
    placeholder = "Search...",
    debounce = 300,
    autoFocus = false
}) => {
    const [input, setInput] = useState(value || "");

    useEffect(() => {
        const handler = setTimeout(() => {
            onChange(input);
        }, debounce);

        return () => clearTimeout(handler);
    }, [input]);

    useEffect(() => {
        if (value !== undefined) {
            setInput(value);
        }
    }, [value]);

    return (
        <SearchWrapper>
            <FaSearch className="search-icon" />
            <input
                type="text"
                data-input="search"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={placeholder}
                autoFocus={autoFocus}
                className="form-control"
            />
            {input && (
                <button className="clear-btn" onClick={() => setInput("")}>
                    <RiCloseFill size={20} />
                </button>
            )}
        </SearchWrapper>
    );
};

Search.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    debounce: PropTypes.number,
    autoFocus: PropTypes.bool
};

export default Search;
