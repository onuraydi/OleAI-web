import { useState, useMemo, useEffect } from "react";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Search } from "lucide-react";

interface MultiSelectBoxProps {
  options: { id: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  emptyMessage?: string;
}

export const MultiSelectBox = ({
  options,
  value,
  onChange,
  onSearch,
  placeholder = "Ara...",
  emptyMessage = "Bulunamadı",
}: MultiSelectBoxProps) => {
  const [search, setSearch] = useState("");
  const [cachedOptions, setCachedOptions] = useState<{ id: string; label: string }[]>([]);
  
  useEffect(() => {
    setCachedOptions((prev) => {
      const selectedFromPrev = prev.filter((p) => value.includes(p.id));
      const newlySelected = options.filter(
        (o) => value.includes(o.id) && !selectedFromPrev.some((p) => p.id === o.id)
      );
      return [...selectedFromPrev, ...newlySelected];
    });
  }, [options, value]);

  const displayOptions = useMemo(() => {
    const all = [...options];
    cachedOptions.forEach((co) => {
      if (!all.some((a) => a.id === co.id)) {
        all.push(co);
      }
    });
    return all;
  }, [options, cachedOptions]);

  const filteredOptions = useMemo(() => {
    if (onSearch) return displayOptions; // If server-side search is enabled, assume options are already filtered
    return displayOptions.filter((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [displayOptions, search, onSearch]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (onSearch) {
      onSearch(val);
    }
  };

  const handleToggle = (id: string, checked: boolean) => {
    if (checked) {
      if (!value.includes(id)) {
        onChange([...value, id]);
      }
    } else {
      onChange(value.filter((v) => v !== id));
    }
  };

  return (
    <div className="flex flex-col border rounded-xl overflow-hidden bg-background">
      <div className="relative border-b">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="border-0 focus-visible:ring-0 rounded-none pl-9"
        />
      </div>
      <div className="h-[200px] overflow-y-auto p-2 space-y-1">
        {filteredOptions.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            {emptyMessage}
          </div>
        ) : (
          filteredOptions.map((opt) => {
            const isChecked = value.includes(opt.id);
            return (
              <label
                key={opt.id}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(checked) => handleToggle(opt.id, checked as boolean)}
                />
                <span className="text-sm font-medium leading-none">{opt.label}</span>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
};
