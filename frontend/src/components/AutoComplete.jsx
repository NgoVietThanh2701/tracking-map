import { memo, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNominatimSearch } from "../hooks/useNominatimSearch";
import { useDebounce } from "../hooks/useDebounce";
import { NOMINATIM_CONFIG } from "../constants";

const AutoComplete = memo(function AutoComplete({
  label,
  placeholder,
  onSelect,
  initialValue = "",
  minChars = NOMINATIM_CONFIG.MIN_CHARS,
  onClear,
}) {
  const [query, setQuery] = useState(initialValue);
  const [focused, setFocused] = useState(false);
  const [dropdownRect, setDropdownRect] = useState(null);
  const anchorRef = useRef(null);
  const skipNextSearchRef = useRef(false);
  const closedAfterSelectRef = useRef(false);

  const debounced = useDebounce(query, NOMINATIM_CONFIG.DEBOUNCE_MS);
  const { loading, error, items, search } = useNominatimSearch();
  const canSearch = debounced.trim().length >= minChars;

  const showDropdown = focused && canSearch && !closedAfterSelectRef.current;

  useEffect(() => {
    if (!focused || !canSearch) {
      return;
    }

    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }

    search(debounced).catch(() => {});
  }, [debounced, canSearch, focused, search]);

  const statusText = useMemo(() => {
    if (loading) return "Đang tìm…";
    if (!canSearch) return `Nhập tối thiểu ${minChars} ký tự`;
    if (error) return error;
    if (items.length === 0) return "Không có kết quả";
    return null;
  }, [loading, canSearch, minChars, error, items.length]);

  const selectItem = (place) => {
    skipNextSearchRef.current = true;
    closedAfterSelectRef.current = true;
    setQuery(place.name);
    onSelect?.(place);
  };

  const clear = () => {
    closedAfterSelectRef.current = false;
    setQuery("");
    setDropdownRect(null);
    onClear?.();
  };

  useEffect(() => {
    if (!showDropdown) return;

    const update = () => {
      const el = anchorRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setDropdownRect({
        left: r.left,
        top: r.bottom + 8,
        width: r.width,
      });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [showDropdown]);

  const dropdown =
    showDropdown && dropdownRect ? (
      <div
        style={{
          position: "fixed",
          left: dropdownRect.left,
          top: dropdownRect.top,
          width: dropdownRect.width,
          zIndex: 5000,
        }}
        className="rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden"
      >
        {statusText ? (
          <div className="px-3 py-2 text-sm text-gray-500">{statusText}</div>
        ) : (
          <ul className="max-h-64 overflow-y-auto">
            {items.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectItem(p)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm text-gray-900"
                >
                  <div className="font-medium line-clamp-2">{p.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5 font-mono">
                    {p.lat.toFixed(6)}, {p.lng.toFixed(6)}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    ) : null;

  return (
    <div className="relative">
      {label ? (
        <span className="text-xs uppercase tracking-wide text-gray-500">
          {label}
        </span>
      ) : null}

      <div className="relative mt-2">
        <input
          ref={anchorRef}
          type="text"
          value={query}
          onChange={(e) => {
            closedAfterSelectRef.current = false;
            setQuery(e.target.value);
          }}
          onFocus={() => {
            setFocused(true);
            closedAfterSelectRef.current = false;
          }}
          onBlur={() => {
            setFocused(false);
            window.setTimeout(
              () => (closedAfterSelectRef.current = false),
              120,
            );
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-lg border border-gray-300 pl-3 pr-10 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400"
        />

        {query ? (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={clear}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center justify-center"
            aria-label="Xóa"
            title="Xóa"
          >
            ×
          </button>
        ) : null}
      </div>

      {dropdown ? createPortal(dropdown, document.body) : null}
    </div>
  );
});

AutoComplete.displayName = "AutoComplete";
export default AutoComplete;
