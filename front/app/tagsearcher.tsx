"use client";

import { useState } from "react";
import {
  PillsInput,
  Pill,
  Combobox,
  CheckIcon,
  Group,
  useCombobox,
} from "@mantine/core";

type TagSearcherProps = {
  data: string[];                     // The list of all available tags/options
  value: string[];                   // Currently selected values
  onChange: (newTags: string[]) => void; // Called when selection changes
  placeholder?: string;              // Optional input placeholder
};

export default function TagSearcher({
  data,
  value,
  onChange,
  placeholder = "Search...",
}: TagSearcherProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex("active"),
  });

  const [search, setSearch] = useState("");

  const handleValueSelect = (val: string) => {
    const newVal = value.includes(val)
      ? value.filter((v) => v !== val)
      : [...value, val];
    onChange(newVal);
  };

  const handleValueRemove = (val: string) => {
    const newVal = value.filter((v) => v !== val);
    onChange(newVal);
  };

  const values = value.map((item) => (
    <Pill key={item} withRemoveButton onRemove={() => handleValueRemove(item)}>
      {item}
    </Pill>
  ));

  const options = data
    .filter((item) => item.toLowerCase().includes(search.trim().toLowerCase()))
    .map((item) => (
      <Combobox.Option
        value={item}
        key={item}
        active={value.includes(item)}
      >
        <Group gap="sm">
          {value.includes(item) ? <CheckIcon size={12} /> : null}
          <span>{item}</span>
        </Group>
      </Combobox.Option>
    ));

  return (
    <Combobox store={combobox} onOptionSubmit={handleValueSelect}>
      <Combobox.DropdownTarget>
        <PillsInput onClick={() => combobox.openDropdown()}>
          <Pill.Group>
            {values}

            <Combobox.EventsTarget>
              <PillsInput.Field
                onFocus={() => combobox.openDropdown()}
                onBlur={() => combobox.closeDropdown()}
                value={search}
                placeholder={placeholder}
                onChange={(event) => {
                  combobox.updateSelectedOptionIndex();
                  setSearch(event.currentTarget.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    const match = data.find((tag) =>
                      tag.toLowerCase() === search.trim().toLowerCase()
                    );
                    if (match && !value.includes(match)) {
                      handleValueSelect(match);
                      setSearch('');
                    }
                  }
                  if (event.key === 'Tab') {
                    const filtered = data.filter((item) =>
                      item.toLowerCase().includes(search.trim().toLowerCase())
                    );
                    if (filtered.length > 0) {
                      event.preventDefault();
                      setSearch(filtered[0]);
                    }
                  }

                  if (event.key === 'Backspace' && search.length === 0 && value.length > 0) {
                    event.preventDefault();
                    handleValueRemove(value[value.length - 1]);
                  }
                }}
              />
            </Combobox.EventsTarget>
          </Pill.Group>
        </PillsInput>
      </Combobox.DropdownTarget>

      <Combobox.Dropdown>
        <Combobox.Options>
          {options.length > 0 ? options : <Combobox.Empty>Nothing found...</Combobox.Empty>}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}
