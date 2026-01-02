"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";

export const LampContainer = ({ children, className }) => {
  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#020617] w-full z-0",
        className
      )}
    >
      {/* LAMP BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 flex items-start justify-center isolate z-0">
        {/* LEFT cone */}
        <motion.div
          initial={{ opacity: 0, width: "15rem", y: -40 }}
          animate={{ opacity: 1, width: "30rem", y: 0 }}
          transition={{
            delay: 0.2,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute top-16 right-1/2 h-56 w-[30rem] bg-gradient-conic from-cyan-500 via-transparent to-transparent [--conic-position:from_70deg_at_center_top]"
        >
          <div className="absolute bottom-0 left-0 z-20 h-40 w-full bg-[#020617] [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute bottom-0 left-0 z-20 h-full w-40 bg-[#020617] [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>

        {/* RIGHT cone */}
        <motion.div
          initial={{ opacity: 0, width: "15rem", y: -40 }}
          animate={{ opacity: 1, width: "30rem", y: 0 }}
          transition={{
            delay: 0.2,
            duration: 0.8,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute top-16 left-1/2 h-56 w-[30rem] bg-gradient-conic from-transparent via-transparent to-cyan-500 [--conic-position:from_290deg_at_center_top]"
        >
          <div className="absolute bottom-0 right-0 z-20 h-full w-40 bg-[#020617] [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute bottom-0 right-0 z-20 h-40 w-full bg-[#020617] [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>

        {/* dark strip behind lamp */}
        <div className="absolute top-1/2 h-48 w-full translate-y-12 scale-x-150 bg-[#020617] blur-2xl" />
        <div className="absolute top-1/2 z-50 h-48 w-full bg-transparent opacity-10 backdrop-blur-md" />

        {/* cyan glow under tube */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
          className="absolute top-32 z-40 h-36 w-[28rem] rounded-full bg-cyan-500 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.8, ease: "easeInOut" }}
          className="absolute top-32 z-30 h-36 w-64 rounded-full bg-cyan-400 blur-2xl"
        />

        {/* tube light line */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0.3 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.35, duration: 0.7, ease: "easeOut" }}
          className="absolute top-[4.5rem] z-50 h-0.5 w-[30rem] bg-cyan-400 origin-center"
        />

        {/* hide top of lamp a bit so it looks embedded */}
        <div className="absolute top-0 z-40 h-24 w-full bg-[#020617]" />
      </div>

      {/* CONTENT – your auth card */}
      <div className="relative z-50 flex w-full items-center justify-center px-4">
        {children}
      </div>
    </div>
  );
};
