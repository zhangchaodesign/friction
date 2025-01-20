"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  useFeedbackStore,
  useGlobalHumanPlanStore,
  useGlobalFeedbackStore,
  useGlobalSentenceStore,
} from "@/lib/store";
import {
  TbPuzzleFilled,
  TbCircleKeyFilled,
  TbAffiliateFilled,
} from "react-icons/tb";
import { blockColorMap } from "@/lib/utils";
import { eventTracker } from "@/lib/utils";
import { Tip } from "./Tip";
import { GPTPlan } from "@/lib/type";

type PlanBlockProps = {
  id: string;
  title: string;
  content?: string | null;
  // feedback?: string;
  feedbackId?: number[];
  isNotModifiable?: boolean;
  planStage?: number;
};

export const PlanBlock = (props: PlanBlockProps) => {
  const [inputValue, setInputValue] = useState("");

  const globalSentence = useGlobalSentenceStore(
    (state) => state.globalSentence,
  );

  const globalFeedback = useGlobalFeedbackStore(
    (state) => state.globalFeedback,
  );

  const feedbackGroup = useMemo(() => {
    // find all feedbacks by feedback id
    return props.feedbackId?.map((feedbackId) =>
      globalFeedback.find((item) => item.id === feedbackId),
    );
  }, [globalFeedback]);

  const globalHumanPlan = useGlobalHumanPlanStore(
    (state) => state.globalHumanPlan,
  );

  const getGlobalHumanPlanBySentenceId = useGlobalHumanPlanStore(
    (state) => state.getGlobalHumanPlanBySentenceId,
  );

  useEffect(() => {
    if (props.content) {
      setInputValue(props.content);
      return;
    }

    const humanPlan = getGlobalHumanPlanBySentenceId(globalSentence.id);
    if (humanPlan === undefined) return;
    // iterate each feedback id to find if the reflection of the human plan already has the feedback; if yes, return the first one, if not, return null
    const reflection = feedbackGroup?.map((feedback) =>
      humanPlan.reflection.find((item) => item.feedback === feedback?.content),
    )[0];

    if (props.title === "Why") {
      if (reflection?.why) setInputValue(reflection?.why);
      else setInputValue("");
    } else if (props.title === "How") {
      if (reflection?.how) setInputValue(reflection?.how);
      else setInputValue("");
    }
  }, [globalSentence]);

  const getGPTPlanByIdAndSentence = useFeedbackStore(
    (state) => state.getGPTPlanByIdAndSentence,
  );

  const GPTPlan = useMemo(() => {
    // iterate each feedback id to find the GPT plans by feedback id and sentence
    // return a list of GPTPlan
    if (
      props.feedbackId !== undefined &&
      globalSentence.content !== undefined
    ) {
      return props.feedbackId?.map((feedbackId) => {
        if (globalSentence.content === undefined) return null;
        return getGPTPlanByIdAndSentence(feedbackId, globalSentence.content);
      });
    } else return [];
  }, [props.feedbackId, globalSentence.content]);

  const addHowToGlobalHumanPlanBySentenceIdAndFeedback =
    useGlobalHumanPlanStore(
      (state) => state.addHowToGlobalHumanPlanBySentenceIdAndFeedback,
    );
  const addWhyToGlobalHumanPlanBySentenceIdAndFeedback =
    useGlobalHumanPlanStore(
      (state) => state.addWhyToGlobalHumanPlanBySentenceIdAndFeedback,
    );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  return (
    <div
      className="w-full border-l-8 rounded-lg flex flex-row gap-2 p-4 bg-white items-start"
      style={{
        borderColor: blockColorMap[props.title],
      }}
    >
      <div className="flex flex-row gap-2 items-center text-sm py-2">
        {props.id === "summary" ? (
          <TbCircleKeyFilled size={20} />
        ) : props.id === "revision" ? (
          <TbAffiliateFilled size={20} />
        ) : (
          <TbPuzzleFilled size={20} />
        )}

        {props.title === "What" ? (
          <h1 className="font-semibold">Sentence</h1>
        ) : props.title === "Why" ? (
          <h1 className="font-semibold">Problem</h1>
        ) : props.title === "How" ? (
          <h1 className="font-semibold">Solution</h1>
        ) : props.title === "Summary" ? (
          <h1 className="font-semibold">Summary</h1>
        ) : props.title === "Revision" ? (
          <h1 className="font-semibold">Revision</h1>
        ) : null}
      </div>

      {
        // If content is not provided, don't render it
        props.id === "what" ? (
          <p className="rounded-lg px-3 py-2 text-sm select-none">
            {props.content}
          </p>
        ) : props.isNotModifiable ? (
          <p className="rounded-lg px-3 py-2 text-sm select-none">
            {inputValue}
          </p>
        ) : (
          <div className="w-full flex flex-row justify-between items-center">
            <input
              type="text"
              className="rounded-lg border-0 text-sm w-full bg-gray-50 focus:ring-gray-400 mx-3"
              style={{
                borderWidth:
                  (props.planStage === 2 && props.title === "Why") ||
                  (props.planStage === 3 && props.title === "How")
                    ? 2
                    : 0,
                borderColor:
                  (props.planStage === 2 && props.title === "Why") ||
                  (props.planStage === 3 && props.title === "How")
                    ? "skyblue"
                    : "gray",
              }}
              value={inputValue}
              onChange={handleInputChange}
              onBlur={() => {
                if (props.title === "Why") {
                  if (
                    props.feedbackId !== undefined &&
                    feedbackGroup !== undefined &&
                    globalSentence.id !== undefined
                  ) {
                    // iterate each feedback id to add why to global human plan by sentence id and feedback
                    props.feedbackId?.forEach((feedbackId) => {
                      addWhyToGlobalHumanPlanBySentenceIdAndFeedback(
                        globalSentence.id,
                        // find feedback content from feedback by id
                        feedbackGroup.find((item) => item?.id === feedbackId)
                          ?.content,
                        inputValue,
                      );
                      eventTracker({
                        event: "change_plan",
                        sentence:
                          Object.keys(globalSentence).length === 0
                            ? "all"
                            : globalSentence.id,
                        feedback: feedbackId,
                        stage: "why",
                        content: inputValue,
                      });
                      // console.log('globalHumanPlan', globalHumanPlan);
                    });
                  }
                }
                if (props.title === "How") {
                  if (
                    props.feedbackId !== undefined &&
                    feedbackGroup !== undefined &&
                    globalSentence.id !== undefined
                  ) {
                    // iterate each feedback id to add how to global human plan by sentence id and feedback
                    props.feedbackId?.forEach((feedbackId) => {
                      addHowToGlobalHumanPlanBySentenceIdAndFeedback(
                        globalSentence.id,
                        // find feedback content from feedback by id
                        feedbackGroup.find((item) => item?.id === feedbackId)
                          ?.content,
                        inputValue,
                      );
                      eventTracker({
                        event: "change_plan",
                        sentence:
                          Object.keys(globalSentence).length === 0
                            ? "all"
                            : globalSentence.id,
                        feedback: props.feedbackId,
                        stage: "how",
                        content: inputValue,
                      });
                      // console.log('globalHumanPlan', globalHumanPlan);
                    });
                  }
                }
              }}
            />
            {props.id === "why" ? (
              <Tip
                why={
                  'This sentence uses general adjectives like "very" and "many," but doesn\'t specify the extent of the positive impact or which specific aspects are affected.'
                }
                feedbackId={props.feedbackId}
              />
            ) : (
              <Tip
                how={
                  // concat all how list into one list from GPTPlan
                  [
                    {
                      title: "xxx",
                      strategy:
                        "Clarify 'many aspects of our lives' by identifying specific domains or areas where the positive impact of hi-tech devices is most felt.",
                    },
                    {
                      title: "xxx",
                      strategy:
                        "Provide concrete examples of how hi-tech devices positively impact different aspects of our lives, such as education, health, or communication.",
                    },
                  ]
                }
                feedbackId={props.feedbackId}
              />
            )}
          </div>
        )
      }

      {/* <p className="text-sm">{props.content}</p> */}
    </div>
  );
};
