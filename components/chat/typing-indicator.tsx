"use client";

import { motion } from "framer-motion";

export const TypingIndicator = ({ usernames }: { usernames: string[] }) => {
    if (usernames.length === 0) return null;

    const text =
        usernames.length === 1
            ? `${usernames[0]} is typing...`
            : usernames.length === 2
            ? `${usernames[0]} and ${usernames[1]} are typing...`
            : "Several people are typing...";

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="flex items-center gap-2 px-1 py-1"
        >
            <span className="text-xs font-medium text-muted-foreground">{text}</span>
            <div className="flex gap-1" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60"
                        animate={{ y: ["0%", "-50%", "0%"] }}
                        transition={{
                            duration: 0.8,
                            ease: "easeInOut",
                            repeat: Infinity,
                            delay: i * 0.15,
                        }}
                    />
                ))}
            </div>
        </motion.div>
    );
};
