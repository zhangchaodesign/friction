"use client";

import React, { useMemo } from "react";
import { useEffect, useState } from "react";
import { FeedbackBigCard } from "@/components/feedback/FeedbackBigCard";
import {
  useEssayStore,
  useFeedbackStore,
  useGlobalFeedbackStore,
  useGlobalSentenceStore,
  useGlobalHumanPlanStore,
} from "@/lib/store";
import { eventTracker, getOpenAICompletion } from "@/lib/utils";
import { GlobalHumanPlanItem } from "@/lib/type";
import { Button } from "flowbite-react";
import { PlanBlock } from "@/components/plan/PlanBlock";
import Link from "next/link";
import { PlanProcessHeader } from "@/components/plan/PlanProcessHeader";
import { PlanProcessPrompt } from "@/components/plan/PlanProcessPrompt";
import { TbCircleKeyFilled } from "react-icons/tb";

const Plan = () => {
  const globalSentence = useGlobalSentenceStore(
    (state) => state.globalSentence,
  );
  const globalFeedback = useGlobalFeedbackStore(
    (state) => state.globalFeedback,
  );
  const globalHumanPlan = useGlobalHumanPlanStore(
    (state) => state.globalHumanPlan,
  );

  type FeedbackGroup = {
    id: number;
    feedback: number[];
  };
  const [feedbackGroup, setFeedbackGroup] = useState([] as FeedbackGroup[]);

  // create a group for each feedback to realize the drag and drop
  useMemo(() => {
    const feedbackGroup = globalFeedback.map((item, id) => {
      return {
        id: id,
        feedback: [item.id],
      };
    });

    setFeedbackGroup(feedbackGroup);
    // console.log('feedbackGroup', feedbackGroup);
    // console.log('globalFeedback', globalFeedback);
  }, []);

  type DragData = {
    id: number;
    initialGroup: FeedbackGroup;
  };

  // Data about a thing's id, origin, and destination
  const [dragData, setDragData] = useState({} as DragData);

  // onDragStart we setDragData.
  // useState instead of e.dataTransfer so we can transfer more data
  const handleDragStart = (id: number, group: FeedbackGroup) => {
    // console.log('handleDragStart', id, group);
    setDragData({ id: id, initialGroup: group });
  };

  // DND will not work without this.
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // 1. setNoDrop in case item was dropped in noDrop
  // 2. gets the item id
  // 3. doesn't allow drop in noDrop
  // 4. changeCategory (see above)
  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    group: FeedbackGroup,
  ) => {
    // remove the item from the initial group, add it to the new group
    const id = dragData["id"];
    const initialGroup = dragData["initialGroup"];

    if (initialGroup.id === group.id) return;

    // update the feedbackGroup
    const newFeedbackGroup = feedbackGroup.map((item) => {
      if (item.id === initialGroup.id) {
        return {
          id: item.id,
          feedback: item.feedback.filter((item) => item !== id),
        };
      }
      if (item.id === group.id) {
        eventTracker({
          event: "cluster_feedback",
          sentence:
            Object.keys(globalSentence).length === 0
              ? "all"
              : globalSentence.id,
          feedback: [...item.feedback, id],
        });
        return {
          id: item.id,
          feedback: [...item.feedback, id],
        };
      }
      return item;
    });

    setFeedbackGroup(newFeedbackGroup);

    console.log("group", group);
    console.log("newFeedbackGroup", newFeedbackGroup);
  };

  const getGlobalHumanPlanBySentenceId = useGlobalHumanPlanStore(
    (state) => state.getGlobalHumanPlanBySentenceId,
  );
  const [humanPlan, setHumanPlan] = useState<GlobalHumanPlanItem | undefined>(
    undefined,
  );

  const [planStage, setPlanStage] = useState(1);

  type ClusterSummary = {
    id: number;
    summary: string;
  };
  const [clusterSummary, setClusterSummary] = useState([] as ClusterSummary[]);

  useEffect(() => {
    if (planStage === 2) {
      const fetchSummaries = async () => {
        const summaries: (ClusterSummary | null)[] = await Promise.all(
          feedbackGroup.map(async (group) => {
            if (group.feedback.length > 1) {
              const feedbackContent = group.feedback
                .map((id) => {
                  const feedbackItem = globalFeedback.find(
                    (item) => item.id === id,
                  );
                  return feedbackItem?.content || ""; // Ensure undefined content is handled
                })
                .join("\n");

              const summary = (await getOpenAICompletion(
                "Summarize the following feedbacks in 30 words:",
                feedbackContent,
              )) as string;
              return {
                id: group.id,
                summary,
              } as ClusterSummary;
            } else {
              return null; // Or any other fallback for groups with less than 2 feedbacks
            }
          }),
        );

        // Filter out any null values if some groups had less than 2 feedbacks
        setClusterSummary(
          summaries.filter((summary) => summary !== null) as ClusterSummary[],
        );

        console.log("clusterSummary", clusterSummary);
      };

      fetchSummaries(); // Execute the async function
    }
  }, [planStage, feedbackGroup, globalFeedback]);

  useEffect(() => {
    const humanPlan = getGlobalHumanPlanBySentenceId(globalSentence.id);
    setHumanPlan(humanPlan);
    // console.log('humanPlan', humanPlan);

    eventTracker({
      event: "view_plan_page",
      sentence:
        Object.keys(globalSentence).length === 0 ? "all" : globalSentence.id,
    });
  }, [globalSentence]);

  return (
    <div>
      <div className="flex flex-col h-screen w-full py-4 px-8 bg-gray-50 text-gray-800">
        <div className="flex flex-col gap-2">
          <PlanProcessHeader
            feedbackId={1}
            planStage={planStage}
            setPlanStage={setPlanStage}
          />
          <PlanProcessPrompt planStage={planStage} />
          <PlanBlock title="What" id="what" content={globalSentence.content} />
          <div className="border-t border-dashed border-gray-200 w-full my-2" />
        </div>

        <div className="overflow-y-auto grow py-2">
          <div className="flex flex-col gap-2 mx-2">
            {" "}
            {feedbackGroup.map((group, key) =>
              group.feedback.length > 0 ? (
                <div key={key} className="flex flex-col gap-2">
                  {
                    // find the clusterSummary by the group id and display the summary
                    planStage > 1 &&
                      clusterSummary &&
                      clusterSummary
                        .filter((item) => item.id === group.id)
                        .map((item, id) => (
                          <div
                            key={id}
                            className="w-full border-2 p-4 bg-white rounded-lg text-sm"
                          >
                            <div className="flex flex-row gap-2 items-center pb-2 font-medium">
                              <TbCircleKeyFilled size={20} />
                              <p>Cluster Summary</p>
                            </div>
                            <span className="text-xs">
                              The essay needs robust evidence and specific
                              examples to support its claims about technology's
                              benefits.
                            </span>
                          </div>
                        ))
                  }

                  <div
                    key={key}
                    className="flex flex-col gap-2"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, group)}
                  >
                    {globalFeedback &&
                      globalFeedback
                        .filter((item) => group.feedback.includes(item.id))
                        .map((item, id) => (
                          <div key={id}>
                            <FeedbackBigCard
                              planStage={planStage}
                              hideContent={
                                group.feedback.length > 1 && planStage > 1
                                  ? true
                                  : false
                              }
                              feedbackItem={item}
                              classes=""
                              close={false}
                              // MAKES THE ITEM DRAGGABLE!!!!
                              draggable={planStage === 1 ? true : false}
                              // event handler
                              onDragStart={(e) =>
                                handleDragStart(item.id, group)
                              }
                            />
                          </div>
                        ))}

                    {group.feedback.length > 0 && planStage > 1 && (
                      <PlanBlock
                        feedbackId={group.feedback}
                        title="Why"
                        id="why"
                      />
                    )}
                    {group.feedback.length > 0 && planStage > 2 && (
                      <PlanBlock
                        feedbackId={group.feedback}
                        title="How"
                        id="how"
                      />
                    )}

                    {planStage === 1 && (
                      <div className="border-t border-dashed border-gray-200 w-full" />
                    )}

                    {planStage > 1 && group.feedback.length > 0 && (
                      <div className="border-t border-dashed border-gray-200 w-full" />
                    )}
                  </div>
                </div>
              ) : null,
            )}
          </div>

          <div className="h-48 w-full" />
        </div>
      </div>

      {planStage === 3 ? (
        <Link
          href="/revision"
          onClick={(e) => {
            // console.log('Go to Revision');
            // console.log('globalHumanPlan', globalHumanPlan);
          }}
        >
          <Button
            color="dark"
            className="z-50 fixed bottom-6 right-8 w-40 cursor-pointer enabled:hover:ring-white enabled:ring-white hover:ring-white transition-all duration-150 hover:scale-105"
          >
            Go to Revision
          </Button>
        </Link>
      ) : null}
    </div>
  );
};

export default Plan;
