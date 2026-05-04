// components/QuickQuestionButtons.tsx
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Briefcase,
  Star,
  Layers,
  Sparkles,
  MessageCircle,
  ArrowUp,
} from "lucide-react";
import { useState } from "react";
import { QUICK_ACTIONS } from "../constants/home";

type ActionItem = {
  icon: string | React.ReactNode;
  label: string;
  question: string;
};

interface QuickActionsProps {
  actions?: ActionItem[];
  onQuestionClick?: (question: string) => void;
  onActionClick?: (question: string) => void;
  className?: string;
}

const iconMap = {
  user: User,
  briefcase: Briefcase,
  star: Star,
  layers: Layers,
  sparkles: Sparkles,
  "message-circle": MessageCircle,
} as const;

const QuickActions = ({
  actions,
  onQuestionClick,
  onActionClick,
  className,
}: QuickActionsProps) => {
  const [expanded, setExpanded] = useState(true);

  const list: ActionItem[] =
    actions ?? (QUICK_ACTIONS as unknown as ActionItem[]);

  const handleClick = (q: string) => {
    const cb = onActionClick ?? onQuestionClick;
    if (cb) cb(q);
  };

  return (
    <motion.div
      className={"mb-6 " + (className ?? "")}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      {/* Toggle button */}
      <div className="flex items-center justify-center mb-4">
        <motion.button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center space-x-1 text-sm transition-colors cursor-pointer"
          style={{ color: "#000000" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-xs font-medium ml-1" style={{ color: "#000000" }}>
            My quick questions
          </span>
          <ArrowUp
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </motion.button>
      </div>

      {/* Buttons */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-3 justify-center pb-4">
              {list.map((action) => {
                const IconComponent =
                  typeof action.icon === "string"
                    ? (iconMap[action.icon as keyof typeof iconMap] as any)
                    : null;
                return (
                  <motion.button
                    key={action.label}
                    onClick={() => handleClick(action.question)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-full text-sm transition-colors"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      color: "#000000",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.14)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {IconComponent ? (
                      <IconComponent className="w-4 h-4" />
                    ) : typeof action.icon !== "string" ? (
                      action.icon
                    ) : null}
                    <span>{action.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuickActions;
