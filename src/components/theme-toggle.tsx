import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "./theme-provider";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full relative overflow-hidden group focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer"
          aria-label="Toggle theme"
        >
          <AnimatePresence mode="wait">
            {resolvedTheme === "light" ? (
              <motion.div
                key="sun"
                initial={{ scale: 0.5, rotate: -45, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0.5, rotate: 45, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                <Sun className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ scale: 0.5, rotate: 45, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0.5, rotate: -45, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center"
              >
                <Moon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36 rounded-xl border border-border/50 bg-card/95 backdrop-blur-md">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="cursor-pointer flex items-center justify-between py-2 text-xs font-semibold"
        >
          <span className="flex items-center gap-2">
            <Sun className="h-3.5 w-3.5 text-muted-foreground" />
            Light
          </span>
          {theme === "light" && <Check className="h-3.5 w-3.5 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="cursor-pointer flex items-center justify-between py-2 text-xs font-semibold"
        >
          <span className="flex items-center gap-2">
            <Moon className="h-3.5 w-3.5 text-muted-foreground" />
            Dark
          </span>
          {theme === "dark" && <Check className="h-3.5 w-3.5 text-primary" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="cursor-pointer flex items-center justify-between py-2 text-xs font-semibold"
        >
          <span className="flex items-center gap-2">
            <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
            System
          </span>
          {theme === "system" && <Check className="h-3.5 w-3.5 text-primary" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
