"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { TbChevronsRight } from "react-icons/tb";
import { useGlobalFeedbackStore, useGlobalSentenceStore } from "@/lib/store";
import { Sentence } from "@/lib/type";

const NavBar = () => {
  const pathname = usePathname();

  const globalSentence = useGlobalSentenceStore(
    (state) => state.globalSentence,
  );
  const setGlobalSentence = useGlobalSentenceStore(
    (state) => state.setGlobalSentence,
  );
  const setGlobalFeedback = useGlobalFeedbackStore(
    (state) => state.setGlobalFeedback,
  );

  const getLinkClassName = (path: string): string => {
    return pathname.includes(path)
      ? "font-semibold underline underline-offset-8 text-gray-800"
      : "font-medium text-gray-400 hover:text-gray-800";
  };

  return (
    <div className="flex flex-row bg-white gap-2 items-center font-medium text-base text-gray-400 w-full justify-center p-4 border-b border-gray-100 select-none">
      <Link
        href="\feedback"
        className={cn(getLinkClassName("/feedback") + " w-20")}
        onClick={() => {
          setGlobalSentence({} as Sentence);
          setGlobalFeedback([]);
        }}
      >
        Feedback
      </Link>
      <TbChevronsRight size={16} />
      <Link
        href="\plan"
        className={cn(getLinkClassName("/plan") + " w-12 text-center")}
        onClick={(e) => {
          // if globalSentence is empty, prevent navigation
          if (Object.keys(globalSentence).length === 0) {
            alert("Please select a sentence before proceeding to reflection.");
            e.preventDefault(); // This prevents the navigation
          }
        }}
      >
        Plan
      </Link>
      <TbChevronsRight size={16} />
      <Link
        href="\revision"
        className={cn(getLinkClassName("/revision") + " w-20")}
        onClick={(e) => {
          // if globalSentence is empty, prevent navigation
          if (Object.keys(globalSentence).length === 0) {
            alert("Please select a sentence before proceeding to revision.");
            e.preventDefault(); // This prevents the navigation
          }
        }}
      >
        Revision
      </Link>
    </div>
  );
};

export default NavBar;
