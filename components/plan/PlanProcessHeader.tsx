"use client";

import React, { useEffect } from "react";
import { TbArrowBigRightFilled, TbArrowBigLeftFilled } from "react-icons/tb";
import { Button } from "flowbite-react";
import { eventTracker } from "@/lib/utils";
import { useGlobalSentenceStore } from "@/lib/store";

type PlanProcessHeaderProps = {
  feedbackId: number;
  planStage: number;
  setPlanStage: (step: number) => void;
};

export const PlanProcessHeader = (props: PlanProcessHeaderProps) => {
  const globalSentence = useGlobalSentenceStore(
    (state) => state.globalSentence,
  );

  return (
    <div className="flex flex-row w-full justify-between items-center">
      <h1 className="text-2xl font-semibold text-gray-400">
        Step {props.planStage}/3
        <span className="text-gray-800">
          {props.planStage === 1
            ? " - Cluster"
            : props.planStage === 2
            ? " - Diagnose"
            : " - Strategize"}
        </span>
      </h1>
      <div className="flex flex-row gap-2">
        {props.planStage === 1 ? (
          <>
            <Button
              color="light"
              className="w-40 enabled:hover:ring-gray-800 enabled:ring-gray-800 hover:ring-gray-800"
              onClick={() => {
                props.setPlanStage(props.planStage + 1);
                eventTracker({
                  event: "forward_to_diagnose",
                  sentence:
                    Object.keys(globalSentence).length === 0
                      ? "all"
                      : globalSentence.id,
                });
              }}
            >
              <TbArrowBigRightFilled size={20} className="mr-2 h-5 w-5" />
              Next Step
            </Button>
          </>
        ) : null}

        {props.planStage === 2 ? (
          <>
            {" "}
            <Button
              color="light"
              className="w-40 enabled:hover:ring-gray-800 enabled:ring-gray-800 hover:ring-gray-800"
              onClick={() => {
                props.setPlanStage(props.planStage - 1);
                eventTracker({
                  event: "backward_to_cluster",
                  sentence:
                    Object.keys(globalSentence).length === 0
                      ? "all"
                      : globalSentence.id,
                });
              }}
            >
              <TbArrowBigLeftFilled size={20} className="mr-2 h-5 w-5" />
              Previous Step
            </Button>
            <Button
              color="light"
              className="w-40 enabled:hover:ring-gray-800 enabled:ring-gray-800 hover:ring-gray-800"
              onClick={() => {
                props.setPlanStage(props.planStage + 1);
                eventTracker({
                  event: "forward_to_strategize",
                  sentence:
                    Object.keys(globalSentence).length === 0
                      ? "all"
                      : globalSentence.id,
                });
              }}
            >
              <TbArrowBigRightFilled size={20} className="mr-2 h-5 w-5" />
              Next Step
            </Button>
          </>
        ) : null}

        {props.planStage === 3 ? (
          <>
            {" "}
            <Button
              color="light"
              className="w-40 enabled:hover:ring-gray-800 enabled:ring-gray-800 hover:ring-gray-800"
              onClick={() => {
                props.setPlanStage(props.planStage - 1);
                eventTracker({
                  event: "backward_to_diagnose",
                  sentence:
                    Object.keys(globalSentence).length === 0
                      ? "all"
                      : globalSentence.id,
                });
              }}
            >
              <TbArrowBigLeftFilled size={20} className="mr-2 h-5 w-5" />
              Previous Step
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
};
