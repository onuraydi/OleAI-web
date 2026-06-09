import { useState, useMemo } from "react";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { Search } from "lucide-react";

interface MultiSelectBoxProps {
  options: { id: string; label: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
}

export const MultiSelectBox = ({
  options,
  value,
  onChange,
  placeholder = "Ara...",
  emptyMessage = "Bulunamadı",
}: MultiSelectBoxProps) => {
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

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
          onChange={(e) => setSearch(e.target.value)}
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
