import { keywordState } from "@/state";
import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Input } from "zmp-ui";
import { InputProps } from "zmp-ui/input";

const SearchBar = (props: InputProps) => {
  const [localKeyword, setLocalKeyword] = useState("");
  const [keyword, setKeyword] = useAtom(keywordState);
  const inputRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (location.pathname === "/search" && inputRef.current) {
      inputRef.current.focus();
    }
    return () => {
      setKeyword("");
    };
  }, [location]);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setKeyword(localKeyword);
    }, 300);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [localKeyword]);

  return (
    <Input.Search
      size="small"
      placeholder="Tìm kiếm..."
      className="border-none outline-none m-0"
      style={{
        viewTransitionName: "search-bar",
      }}
      value={localKeyword}
      onChange={(e) => setLocalKeyword(e.currentTarget.value)}
      onKeyUp={(e) => {
        if (e.key === "Enter") {
          if (debounceRef.current) window.clearTimeout(debounceRef.current);
          setKeyword(localKeyword);
        }
      }}
      onBlur={() => {
        if (debounceRef.current) window.clearTimeout(debounceRef.current);
        setKeyword(localKeyword);
      }}
      clearable
      {...props}
    />
  );
};

export default SearchBar;
