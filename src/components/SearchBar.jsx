import React from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";

const SearchBar = ({ value, onChange, handleSearch, onClearSearch }) => {



  return (
    <div className="flex w-80 items-center px-2 bg-slate-100 rounded-3xl shadow-sm hover:shadow-lg hover:border-gray-400">
      <input
        type="text"
        placeholder="Search"
        className="w-full text-xs bg-transparent py-[11px]  outline-none px-2 "
        value={value}
        onChange={onChange}
      />
      {value && (
        <IoMdClose
          className="text-xl text-slate-500 cursor-pointer hover:text-black  mr-3"
          onClick={onClearSearch}
        />
      )}

      <FaMagnifyingGlass
        className="text-slate-400 cursor-pointer hover:text-slate-900"
        onClick={handleSearch}
      />
    </div>
  );
};

export default SearchBar;
