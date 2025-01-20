import React, { useMemo } from "react";
import { useState } from "react";
import {
  TbBulbFilled,
  TbViewfinder,
  TbCardsFilled,
  TbRefresh,
} from "react-icons/tb";
import { BsFillLightbulbFill } from "react-icons/bs";
import { cn } from "@/lib/utils";
import { HowItem } from "@/lib/type";
import { useGlobalHumanPlanStore, useGlobalSentenceStore } from "@/lib/store";
import { eventTracker } from "@/lib/utils";

type TipProps = {
  why?: string | undefined;
  how?: HowItem[] | undefined;
  feedbackId?: number[];
};

export const Tip = (props: TipProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [strategyId, setStrategyId] = useState(0);

  const globalSentence = useGlobalSentenceStore(
    (state) => state.globalSentence,
  );

  return (
    <div className="relative">
      <div
        className={cn(
          {
            "bg-rose-500": isOpen,
            "bg-gray-400": !isOpen,
          },
          "rounded-md w-6 h-6 items-center justify-center flex cursor-pointer transition-all duration-150 ease-in-out hover:scale-110 hover:-translate-y-[1px] hover:shadow-lg hover:bg-rose-500",
        )}
        onClick={() => {
          if (globalSentence.id === undefined || props.feedbackId === undefined)
            return;

          if (isOpen) setIsOpen(false);
          else setIsOpen(true);

          if (props.why !== undefined) {
            // props.setInputValue(props.why || '');
            eventTracker({
              event: "check_hint",
              sentence:
                Object.keys(globalSentence).length === 0
                  ? "all"
                  : globalSentence.id,
              feedbackId: props.feedbackId,
              stage: "why",
              content: props.why,
            });
          } else if (props.how !== undefined) {
            // props.setInputValue(props.how[strategyId].strategy || '');
            eventTracker({
              event: "check_hint",
              sentence:
                Object.keys(globalSentence).length === 0
                  ? "all"
                  : globalSentence.id,
              feedbackId: props.feedbackId,
              stage: "how",
              content: props.how[strategyId].strategy,
            });

            if (isOpen) return;
            else setStrategyId((strategyId + 1) % props.how.length);
          }
        }}
      >
        {props.why !== undefined ? (
          <BsFillLightbulbFill size={14} className="text-white" />
        ) : null}
        {props.how !== undefined && props.how.length > 0 && !isOpen ? (
          <TbCardsFilled size={16} className="text-white" />
        ) : null}
        {props.how !== undefined && props.how.length > 0 && isOpen ? (
          <TbRefresh size={16} className="text-white" />
        ) : null}
      </div>

      {
        // If the tooltip is open, render the content
        isOpen && (
          <p className="absolute right-0 bottom-8 z-[10000] w-64 bg-white rounded-lg p-4 text-xs leading-5 shadow-lg flex gap-2 select-text border">
            <b className="select-none">Tip: </b>
            {props.why}
            {props.how &&
              props.how.length > 0 &&
              props.how[strategyId].strategy}
          </p>
        )
      }
    </div>
  );
};
