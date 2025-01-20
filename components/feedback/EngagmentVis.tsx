"use client";
import React from "react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { eventTracker } from "@/lib/utils";
import { useGlobalSentenceStore } from "@/lib/store";

type EngagmentVisProps = {
  id: number;
  sentiment: number;
  actionability: number;
  justification: number;
  specificity: number;
  hideContent?: boolean;
};

export const EngagmentVis = (props: EngagmentVisProps) => {
  const [hoveredDimension, setHoveredDimension] = useState<string | null>(null);
  const [hoverTip, setHoverTip] = useState<{
    dimension: string | null;
    x: number;
    y: number;
    visible: boolean;
  } | null>(null);

  const globalSentence = useGlobalSentenceStore(
    (state) => state.globalSentence,
  );
  useEffect(() => {
    console.log("globalSentence:", globalSentence.id);
  }, []);

  const handleMouseEnter = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    const { clientX: x, clientY: y } = event;
    setHoverTip({ dimension: hoveredDimension, x, y, visible: true });
  };

  const handleMouseLeave = () => {
    setHoverTip(null);
  };

  return (
    <div>
      <div
        className="flex items-end"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className="h-4 bg-sky-500 transition-all duration-150 ease-in-out hover:scale-125 hover:-translate-y-[1px]"
          style={{ width: `${props.sentiment * 32}px` }}
          onMouseEnter={() => {
            eventTracker({
              event: "hover_feedback_engagement",
              feedback_item_id: props.id,
              dimension: "sentiment",
              sentence:
                Object.keys(globalSentence).length === 0
                  ? "all"
                  : globalSentence.id,
            });
            setHoveredDimension("sentiment");
          }}
        ></div>
        <div
          className="h-4 bg-pink-500 transition-all duration-150 ease-in-out hover:scale-125 hover:-translate-y-[1px]"
          style={{ width: `${props.actionability * 32}px` }}
          onMouseEnter={() => {
            eventTracker({
              event: "hover_feedback_engagement",
              feedback_item_id: props.id,
              dimension: "actionability",
              sentence:
                Object.keys(globalSentence).length === 0
                  ? "all"
                  : globalSentence.id,
            });
            setHoveredDimension("actionability");
          }}
        ></div>
        <div
          className="h-4 bg-emerald-500 transition-all duration-150 ease-in-out hover:scale-125 hover:-translate-y-[1px]"
          style={{ width: `${props.justification * 32}px` }}
          onMouseEnter={() => {
            eventTracker({
              event: "hover_feedback_engagement",
              feedback_item_id: props.id,
              dimension: "justification",
              sentence:
                Object.keys(globalSentence).length === 0
                  ? "all"
                  : globalSentence.id,
            });
            setHoveredDimension("justification");
          }}
        ></div>
        <div
          className="h-4 bg-purple-500 transition-all duration-150 ease-in-out hover:scale-125 hover:-translate-y-[1px]"
          style={{ width: `${props.specificity * 32}px` }}
          onMouseEnter={() => {
            eventTracker({
              event: "hover_feedback_engagement",
              feedback_item_id: props.id,
              dimension: "specificity",
              sentence:
                Object.keys(globalSentence).length === 0
                  ? "all"
                  : globalSentence.id,
            });
            setHoveredDimension("specificity");
          }}
        ></div>
      </div>

      {hoverTip && hoverTip.visible && (
        <div
          className="fixed whitespace-nowrap border rounded-lg bg-white text-[10px] shadow-lg p-2 flex flex-col gap-1 z-50"
          style={
            props.hideContent
              ? {
                  left: "80px",
                  top: "0px",
                }
              : {
                  left: "8px",
                  top: "44px",
                }
          }
        >
          {
            <>
              <p>
                {" "}
                This feedback is overall{" "}
                {Number(props.sentiment.toFixed(2)) > 0.6
                  ? "negative"
                  : Number(props.sentiment.toFixed(2)) < 0.4
                  ? "positive"
                  : "neutral"}{" "}
                <span
                  className={cn({
                    "font-semibold text-sky-600":
                      hoveredDimension === "sentiment",
                  })}
                >
                  ({props.sentiment.toFixed(2)})
                </span>
                ,{" "}
                {Number(props.actionability.toFixed(2)) > 0
                  ? "contains actionable suggestions"
                  : "does not contain actionable suggestions"}{" "}
                <span
                  className={cn({
                    "font-semibold text-pink-600":
                      hoveredDimension === "actionability",
                  })}
                >
                  ({props.actionability.toFixed(2)}),{" "}
                </span>
              </p>
              <p>
                {" "}
                {Number(props.justification.toFixed(2)) > 0.6
                  ? "is well justified"
                  : Number(props.justification.toFixed(2)) < 0.4
                  ? "lacks justification"
                  : "is moderately justified"}{" "}
                <span
                  className={cn({
                    "font-semibold text-emerald-600":
                      hoveredDimension === "justification",
                  })}
                >
                  ({props.justification.toFixed(2)})
                </span>
                , and{" "}
                {Number(props.specificity.toFixed(2)) > 0.6
                  ? "is specific"
                  : Number(props.specificity.toFixed(2)) < 0.4
                  ? "is vague"
                  : "is moderately specific"}{" "}
                <span
                  className={cn({
                    "font-semibold text-purple-600":
                      hoveredDimension === "specificity",
                  })}
                >
                  ({props.specificity.toFixed(2)})
                </span>
              </p>
            </>
          }
        </div>
      )}
    </div>
  );
};
