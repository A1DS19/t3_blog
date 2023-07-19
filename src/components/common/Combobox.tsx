import React from "react";
import { Fragment, useState } from "react";
import { Combobox as ComboboxHUI, Transition } from "@headlessui/react";
import { HiCheck, HiChevronUp } from "react-icons/hi";
import { RouterOutputs } from "@/utils/api";
import { SelectedIds } from "../forms/WriteModalForm/Index";

export type TagQuery = {
  id: string;
  name: string;
};

interface IComboboxProps {
  data: RouterOutputs["tag"]["getTags"];
  setSelectedTagIds: React.Dispatch<React.SetStateAction<SelectedIds>>;
  selectedTagIds: SelectedIds;
}

export const Combobox: React.FC<IComboboxProps> = ({
  data,
  setSelectedTagIds,
  selectedTagIds,
}) => {
  const [selected, setSelected] = useState(data[0]);
  const [query, setQuery] = React.useState<TagQuery>({
    id: "",
    name: "",
  });
  const extractedIds = React.useMemo(() => {
    return selectedTagIds.map((tag) => tag.id);
  }, [selectedTagIds]);

  const filteredData = React.useMemo(() => {
    return query.name === ""
      ? data
      : data.filter((tag) =>
          tag.name
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.name.toLowerCase().replace(/\s+/g, ""))
        );
  }, [data, query]);

  React.useEffect(() => {
    if (selected && data.length > 0) {
      setSelectedTagIds(
        (prev: SelectedIds) =>
          [
            ...prev.filter((tag) => tag.id !== data[0]!.id),
            { id: data[0]!.id },
          ] as SelectedIds
      );
    }
  }, []);

  return (
    <ComboboxHUI
      value={selected}
      onChange={(tag) => {
        if (extractedIds.includes(tag.id)) {
          setSelectedTagIds((prev: SelectedIds) =>
            prev.filter((prevTag) => prevTag.id !== tag.id)
          );
        } else {
          setSelectedTagIds(
            (prev: SelectedIds) =>
              [
                ...prev.filter((prevTag) => prevTag.id !== tag.id),
                { id: tag.id },
              ] as SelectedIds
          );
          setSelected(tag);
        }
      }}
    >
      <div className="relative mt-1">
        <div className="relative w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
          <ComboboxHUI.Input
            className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 outline-none focus:ring-0"
            displayValue={(tag) => (tag as (typeof data)[0]).name}
            onChange={(event) => {
              setQuery({
                id: "",
                name: event.target.value,
              });
            }}
          />
          <ComboboxHUI.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <HiChevronUp className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </ComboboxHUI.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
          afterLeave={() => setQuery({ id: "", name: "" })}
        >
          <ComboboxHUI.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredData.length === 0 && query.name !== "" ? (
              <div className="relative cursor-default select-none px-4 py-2 text-gray-700">
                Nothing found.
              </div>
            ) : (
              filteredData.map((tag) => (
                <ComboboxHUI.Option
                  key={tag.id}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active ? "bg-gray-600 text-white" : "text-gray-900"
                    }`
                  }
                  value={tag}
                >
                  {({ selected, active }) => {
                    return (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {tag.name}
                        </span>
                        {extractedIds.includes(tag.id) ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? "text-white" : "text-gray-600"
                            }`}
                          >
                            <HiCheck className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    );
                  }}
                </ComboboxHUI.Option>
              ))
            )}
          </ComboboxHUI.Options>
        </Transition>
      </div>
    </ComboboxHUI>
  );
};
