import React from "react";
import { CiSearch } from "react-icons/ci";
import { HiChevronDown } from "react-icons/hi";

export const Search: React.FC = ({}) => {
  return (
    <div className="flex flex-col space-y-4 p-10">
      <div className="mb-3 flex w-full items-center space-x-5">
        <label
          htmlFor="search"
          className="relative w-full rounded-3xl border border-gray-800"
        >
          <div className="absolute left-2 flex h-full items-center">
            <CiSearch />
          </div>
          <input
            type="text"
            name="search"
            id="search"
            className="w-full rounded-3xl px-4 py-2 pl-7 text-sm outline-none placeholder:text-xs placeholder:text-gray-300"
            placeholder="Search..."
          />
        </label>
        <div className="flex w-full items-center justify-end space-x-4">
          <div>My topics:</div>
          <div className="flex items-center space-x-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-3xl bg-gray-200/50 px-4 py-3">
                {i} tag
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex w-full items-center justify-between border-b border-b-gray-300 pb-10">
        <div>Articles</div>
        <div>
          <button className="flex items-center space-x-2 rounded-3xl border border-gray-800 px-4 py-1.5 font-semibold">
            <div>Following</div>
            <div>
              <HiChevronDown className="text-xl" />
            </div>
            <div></div>
          </button>
        </div>
      </div>
    </div>
  );
};
