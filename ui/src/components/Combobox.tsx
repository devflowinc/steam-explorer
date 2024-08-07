import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { IconCheck, IconSelector } from "@tabler/icons-react";
import { tags } from "@/lib/consts";
import { useState } from "react";

export function Combobox({
  selectedCategory,
  setSelectedCategory,
}: {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selectedCategory
            ? tags.find((tag) => tag.value === selectedCategory)?.label
            : "Select a game genre..."}
          <IconSelector className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Select a game genre..." />
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandGroup>
              {tags.map((tag) => (
                <CommandItem
                  key={tag.value}
                  value={tag.value}
                  onSelect={(currentValue) => {
                    setSelectedCategory(
                      currentValue === selectedCategory ? "" : currentValue
                    );
                    setOpen(false);
                  }}
                >
                  <IconCheck
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCategory === tag.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {tag.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
