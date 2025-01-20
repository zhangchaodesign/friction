import React from "react";
import { useState } from "react";
import { DensityRect } from "@/components/essay/DensityRect";

type FeedbackDistributionVisProps = {
  id: number;
  claimSpans: any;
  reasoningSpans: any;
  evidenceSpans: any;
  rebuttalSpans: any;
  othersSpans: any;
  selectedType?: string;
  setSelectedType?: (selectedType: string) => void;
};

export const FeedbackDistributionVis = (
  props: FeedbackDistributionVisProps,
) => {
  const [hoverTip, setHoverTip] = useState<{
    text: string;
    x: number;
    y: number;
    density?: number;
  } | null>(null);

  return (
    <>
      {props.claimSpans[props.id - 1] && (
        <span
          onClick={() => {
            if (!props.setSelectedType) return;
            if (props.setSelectedType !== undefined) {
              props.setSelectedType("Claim");
            }
          }}
        >
          <DensityRect
            id={props.id}
            spanData={props.claimSpans[props.id - 1]}
            rightOffset="112"
            category="Claim"
            text="Claims/Ideas"
            width={24}
            setHoverTip={setHoverTip}
          />
        </span>
      )}
      {props.reasoningSpans[props.id - 1] && (
        <span
          onClick={() => {
            if (!props.setSelectedType) return;
            if (props.setSelectedType !== undefined) {
              props.setSelectedType("Reasoning");
            }
          }}
        >
          <DensityRect
            id={props.id}
            spanData={props.reasoningSpans[props.id - 1]}
            rightOffset="88"
            category="Reasoning"
            text="Warrant/Reasoning/Backing"
            width={24}
            setHoverTip={setHoverTip}
          />
        </span>
      )}
      {props.evidenceSpans[props.id - 1] && (
        <span
          onClick={() => {
            if (!props.setSelectedType) return;
            if (props.setSelectedType !== undefined) {
              props.setSelectedType("Evidence");
            }
          }}
        >
          <DensityRect
            id={props.id}
            spanData={props.evidenceSpans[props.id - 1]}
            rightOffset="64"
            category="Evidence"
            text="Evidence"
            width={24}
            setHoverTip={setHoverTip}
          />
        </span>
      )}
      {props.rebuttalSpans[props.id - 1] && (
        <span
          onClick={() => {
            if (!props.setSelectedType) return;
            if (props.setSelectedType !== undefined) {
              props.setSelectedType("Rebuttal");
            }
          }}
        >
          <DensityRect
            id={props.id}
            spanData={props.rebuttalSpans[props.id - 1]}
            rightOffset="40"
            category="Rebuttal"
            text="Rebuttal/Reservation"
            width={24}
            setHoverTip={setHoverTip}
          />
        </span>
      )}
      {props.othersSpans[props.id - 1] && (
        <span
          onClick={() => {
            if (!props.setSelectedType) return;
            if (props.setSelectedType !== undefined) {
              props.setSelectedType("Others");
            }
          }}
        >
          <DensityRect
            id={props.id}
            spanData={props.othersSpans[props.id - 1]}
            rightOffset="16"
            category="Others"
            text="General Content"
            width={24}
            setHoverTip={setHoverTip}
          />
        </span>
      )}

      {hoverTip && (
        <div
          className="fixed whitespace-nowrap rounded-lg bg-white -translate-x-full -translate-y-full shadow-lg p-2 z-30 border text-[10px] leading-3 font-medium"
          style={{
            left: `${hoverTip.x}px`,
            top: `${hoverTip.y + 25}px`,
          }}
        >
          # {hoverTip.text}: ({hoverTip.density})
        </div>
      )}
    </>
  );
};
