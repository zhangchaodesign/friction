import React from "react";
import { TbBalloonFilled } from "react-icons/tb";

type PlanProcessPromptProps = {
  planStage: number;
};

export const PlanProcessPrompt = (props: PlanProcessPromptProps) => {
  return (
    <div className="w-full border-l-8 rounded-lg flex flex-col gap-2 p-4 bg-white border-gray-800">
      {props.planStage === 1 ? (
        <>
          <div className="flex flex-row gap-2 items-center">
            <TbBalloonFilled size={20} />
            <h1 className="font-semibold">Cluster Relevant Feedback</h1>
          </div>
          <p className="text-sm">
            Group relevant feedback items together to identify common problems
            and devise a solution to address them
          </p>
        </>
      ) : props.planStage === 2 ? (
        <>
          <div className="flex flex-row gap-2 items-center">
            <TbBalloonFilled size={20} />
            <h1 className="font-semibold">Diagnose Specific Problems</h1>
          </div>
          <p className="text-sm">
            Reflect on each feedback cluster to diagnose the specific problem
            within this sentence
          </p>
        </>
      ) : (
        <>
          <div className="flex flex-row gap-2 items-center">
            <TbBalloonFilled size={20} />
            <h1 className="font-semibold">Propose Revision Strategies</h1>
          </div>
          <p className="text-sm">
            Reflect on each feedback cluster to devise a strategy that can
            address the diagnosed problem
          </p>
        </>
      )}
    </div>
  );
};
