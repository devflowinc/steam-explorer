import { IconBrandApple, IconBrandWindows } from "@tabler/icons-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { cn } from "@/lib/utils";
import { Chunk } from "@/lib/types";

export const Systems = ({ metadata }: { metadata: Chunk["metadata"] }) => {
  return (
    <div className="flex gap-2">
      <Tooltip>
        <TooltipTrigger>
          <IconBrandWindows
            className={cn({
              "text-green-600": metadata.windows,
              "text-red-600": !metadata.windows,
              "w-4": true,
            })}
          />
        </TooltipTrigger>
        <TooltipContent>
          {!metadata.windows ? "Not Available" : "Available"} on Windows
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger>
          <IconBrandApple
            className={cn({
              "text-green-600": metadata.mac,
              "text-red-600": !metadata.mac,
              "w-4": true,
            })}
          />
        </TooltipTrigger>
        <TooltipContent>
          {!metadata.mac ? "Not Available" : "Available"} on Mac
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={cn({
              "text-green-600": metadata.mac,
              "text-red-600": !metadata.mac,
              "w-4": true,
            })}
            viewBox="0 0 32 32"
          >
            <path
              d="M30.34 24.73a.77.77 0 01-.19-.79A2.75 2.75 0 0027 20.38a16 16 0 00-3.48-8.62c-1.12-1.61-1.8-2.63-1.53-3.44A6.55 6.55 0 0021 2.53 6 6 0 0016 0a6 6 0 00-5 2.53 6.55 6.55 0 00-.94 5.79c.27.81-.4 1.83-1.53 3.44A16 16 0 005 20.38a2.75 2.75 0 00-3.19 3.56.77.77 0 01-.19.79l-.35.35a2.75 2.75 0 00-.76 2.45 2.79 2.79 0 001.57 2l4.63 2.1a4.79 4.79 0 002 .43 5 5 0 00.95-.06 4.82 4.82 0 001.71-.72A14.11 14.11 0 0016 32a14.06 14.06 0 004.63-.72 4.82 4.82 0 001.71.72 5 5 0 00.94.09 4.79 4.79 0 002-.43l4.63-2.1a2.82 2.82 0 001.58-2 2.78 2.78 0 00-.77-2.45zM12.61 3.7A4.06 4.06 0 0116 2a4 4 0 013.39 1.7 4.53 4.53 0 01.66 4 3.4 3.4 0 00-.15.92 1.23 1.23 0 00-.19-.31A5.32 5.32 0 0016 7a5.35 5.35 0 00-3.71 1.29 1.23 1.23 0 00-.19.31 3.4 3.4 0 00-.1-.92 4.56 4.56 0 01.61-3.98zM17 9.11l-1 .69-1-.68a5.24 5.24 0 012-.01zM9.27 30a2.73 2.73 0 01-1.69-.19L3 27.74a.77.77 0 01-.22-1.25l.35-.35a2.77 2.77 0 00.67-2.83.75.75 0 01.18-.79.78.78 0 01.54-.23.81.81 0 01.25 0 2.78 2.78 0 001.28.1h.06l.31-.07h.07a2.63 2.63 0 001.11-.66l.35-.35a.77.77 0 01.69-.21.78.78 0 01.56.44l2.1 4.62a2.84 2.84 0 01.2 1.7A2.77 2.77 0 019.27 30zm3.62-.38a4.81 4.81 0 00.52-1.4 4.69 4.69 0 00-.34-2.91L11 20.71a2.74 2.74 0 00-3.84-1.27 15.07 15.07 0 013-6.53 9.8 9.8 0 001.9-3.65.92.92 0 00.39.57l3 2A1 1 0 0016 12a1 1 0 00.56-.17l3-2a.94.94 0 00.38-.57 9.8 9.8 0 001.9 3.65 15.07 15.07 0 013 6.53 2.76 2.76 0 00-1.81-.31 2.81 2.81 0 00-2 1.58l-2.1 4.63a4.74 4.74 0 00.18 4.31 14 14 0 01-6.22 0zm16.16-1.91l-4.63 2.1a2.72 2.72 0 01-1.69.19 2.77 2.77 0 01-2.18-2.17 2.84 2.84 0 01.2-1.7l2.1-4.62a.78.78 0 01.56-.44h.15a.79.79 0 01.54.22l.35.35a2.69 2.69 0 001.11.66h.07l.31.07a2.58 2.58 0 001.29-.09.78.78 0 011 1 2.75 2.75 0 00.66 2.83l.35.35a.75.75 0 01.22.68.78.78 0 01-.41.6z"
              fill="currentColor"
            ></path>
          </svg>
        </TooltipTrigger>
        <TooltipContent>
          {!metadata.linux ? "Not Available" : "Available"} on Linux
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
