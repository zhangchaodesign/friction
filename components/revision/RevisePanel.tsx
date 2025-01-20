import React, { useEffect, useMemo, useState } from "react";
import { PlanBlock } from "@/components/plan/PlanBlock";
import { ReviseBlock } from "@/components/revision/ReviseBlock";
import { Button } from "flowbite-react";
import {
  useGlobalHumanPlanStore,
  useRevisionStore,
  useGlobalSentenceStore,
} from "@/lib/store";
import { eventTracker, getOpenAICompletion } from "@/lib/utils";
import { TbCircleKeyFilled, TbAffiliateFilled } from "react-icons/tb";
import {
  RevisionItem,
  GlobalHumanPlanItem,
  GlobalHumanReflectionItem,
} from "@/lib/type";
import { cn } from "@/lib/utils";
import { set } from "firebase/database";

type RevisePanelProps = {
  humanPlanForThisSentence: GlobalHumanPlanItem | undefined;
};

export const RevisePanel = (props: RevisePanelProps) => {
  const [uniqueBlocks, setUniqueBlocks] = useState<GlobalHumanReflectionItem[]>(
    [] as GlobalHumanReflectionItem[],
  );

  useEffect(() => {
    const newUniqueBlocks = [] as GlobalHumanReflectionItem[];

    props.humanPlanForThisSentence?.reflection.forEach((block) => {
      // Check if the block is already in newUniqueBlocks based on 'why' and 'how'
      const isExist = newUniqueBlocks.some(
        (uniqueBlock) =>
          uniqueBlock.why === block.why && uniqueBlock.how === block.how,
      );

      // If block is not in the list, add it
      if (!isExist) {
        newUniqueBlocks.push(block);
      }
    });

    // Set the state once after all unique blocks are identified
    setUniqueBlocks(newUniqueBlocks);
    // console.log(
    //   'props.humanPlanForThisSentence',
    //   props.humanPlanForThisSentence?.reflection
    // );
    // console.log('uniqueBlocks', newUniqueBlocks);
  }, [props.humanPlanForThisSentence]); // Only re-run if this prop changes

  const globalSentence = useGlobalSentenceStore(
    (state) => state.globalSentence,
  );

  const [isSummaryDisplay, setIsSummaryDisplay] = useState(false);
  const [isRevisionHistoryDisplay, setIsRevisionHistoryDisplay] =
    useState(false);

  const [revision, setRevision] = useState<RevisionItem[]>([]);
  const getRevisionById = useRevisionStore((state) => state.getRevisionById);

  const [counter, setCounter] = useState(0);

  useEffect(() => {
    setIsSummaryDisplay(false);
    setIsRevisionHistoryDisplay(false);
  }, [globalSentence.content]);

  useEffect(() => {
    setRevision(getRevisionById(globalSentence.id)?.revision || []);
    setCounter(getRevisionById(globalSentence.id)?.revision.length || 0);
  }, [globalSentence.content, counter]);

  useEffect(() => {
    if (isSummaryDisplay) {
      eventTracker({
        event: "check_ai_summary",
        sentence:
          Object.keys(globalSentence).length === 0 ? "all" : globalSentence.id,
      });
    } else {
      eventTracker({
        event: "close_ai_summary",
        sentence:
          Object.keys(globalSentence).length === 0 ? "all" : globalSentence.id,
      });
    }
  }, [isSummaryDisplay]);

  useEffect(() => {
    if (isRevisionHistoryDisplay) {
      eventTracker({
        event: "check_revision_history",
        sentence:
          Object.keys(globalSentence).length === 0 ? "all" : globalSentence.id,
      });
    } else {
      eventTracker({
        event: "close_revision_history",
        sentence:
          Object.keys(globalSentence).length === 0 ? "all" : globalSentence.id,
      });
    }
  }, [isRevisionHistoryDisplay]);

  const summary = useMemo(async () => {
    // console.log(
    //   'props.humanPlanForThisSentence',
    //   props.humanPlanForThisSentence
    // );
    // if all reflection's why and how is not provided, return empty string
    if (
      props.humanPlanForThisSentence?.reflection.every(
        (block) => block.why === "" && block.how === "",
      )
    )
      return "Please return to the reflection page, diagnose the sentence, and provide a strategy for revision.";

    let system_prompt =
      "Summarize my revision plan provided for a specific sentence in an argumentative essay in 50 words. Ensure that the summary captures the essence of the rationale and provides clear guidance on how to revise the sentence.";
    let input =
      `Revision Plan:\n${props.humanPlanForThisSentence?.reflection.map(
        (block) => `why: ${block.why}\nhow: ${block.how}\n`,
      )}` + "\nSummary:";
    return await getOpenAICompletion(system_prompt, input);
    // console.log(summary);
  }, [props.humanPlanForThisSentence]);

  return (
    <div className="flex flex-col h-screen w-full py-4 px-8 bg-gray-50 text-gray-800">
      <div className="flex flex-col gap-2">
        <ReviseBlock
          setCounter={setCounter}
          counter={counter}
          isSummaryDisplay={isSummaryDisplay}
          setIsSummaryDisplay={setIsSummaryDisplay}
          setIsRevisionHistoryDisplay={setIsRevisionHistoryDisplay}
          humanPlan={uniqueBlocks}
        />
        <div className="flex flex-row gap-2">
          <Button
            color="light"
            className="w-48 enabled:hover:ring-gray-800 enabled:ring-gray-800 hover:ring-gray-800"
            onClick={() => {
              setIsSummaryDisplay(!isSummaryDisplay);
              setIsRevisionHistoryDisplay(false);
            }}
          >
            Plan Summary
          </Button>
          <Button
            color="light"
            className="w-48 enabled:hover:ring-gray-800 enabled:ring-gray-800 hover:ring-gray-800"
            onClick={() => {
              setIsRevisionHistoryDisplay(!isRevisionHistoryDisplay);
              setIsSummaryDisplay(false);
            }}
          >
            Revision History
          </Button>
        </div>

        {isSummaryDisplay && (
          <div className="w-full border-2 p-4 border-purple-500 bg-purple-50 rounded-lg text-sm">
            <div className="flex flex-row gap-2 items-center pb-2 font-medium">
              <TbCircleKeyFilled size={20} />
              <p>Plan Summary</p>
            </div>
            <span className="text-xs">{summary}</span>
          </div>
        )}

        {isRevisionHistoryDisplay && (
          <div className="flex flex-col gap-2 overflow-y-auto max-h-[200px] w-full">
            {revision.reverse().map((revisionItem, index) => (
              <div
                key={index}
                className={cn(
                  {
                    "border-green-500": revisionItem.better,
                    "bg-green-50": revisionItem.better,
                    "": !revisionItem.better,
                    "bg-white": !revisionItem.better,
                  },
                  "border-2 p-4 rounded-lg text-sm",
                )}
              >
                <div className="flex flex-row gap-2 items-center pb-2 font-medium">
                  <TbAffiliateFilled size={20} />
                  <p>
                    Revision{" "}
                    <span className="font-semibold">
                      v{revision.length - index + 4}.0
                    </span>
                  </p>
                </div>
                <div className="text-xs flex flex-col gap-2">
                  {" "}
                  <p>{revisionItem.revision}</p>
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold">
                      {/* why {revisionItem.better ? "better" : "not better"}?:
                       */}
                      Plan Implementation:
                    </p>{" "}
                    <p>{revisionItem.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
            <div className="border-2 p-4 rounded-lg text-sm border-green-500 bg-green-50">
              <div className="flex flex-row gap-2 items-center pb-2 font-medium">
                <TbAffiliateFilled size={20} />
                <p>
                  Revision <span className="font-semibold">v6.0</span>
                </p>
              </div>
              <div className="text-xs flex flex-col gap-2">
                {" "}
                <p>
                  In addition, hi-tech devices also have a very positive impact
                  on healthcare. For example, wearable health monitors can
                  reduce hospital readmission rates by 20%, and telemedicine
                  services have increased access to medical care by 30% in rural
                  areas.
                </p>
                <div className="flex flex-col gap-1">
                  <p className="font-semibold">Plan Implementation:</p>{" "}
                  <p>
                    The revision effectively incorporates academic statistics,
                    quantifying the positive impact of high-tech devices on
                    healthcare, thereby enhancing clarity and credibility in the
                    statement.
                  </p>
                </div>
              </div>
            </div>
            <div className="border-2 p-4 rounded-lg text-sm bg-white">
              <div className="flex flex-row gap-2 items-center pb-2 font-medium">
                <TbAffiliateFilled size={20} />
                <p>
                  Revision <span className="font-semibold">v4.0</span>
                </p>
              </div>
              <div className="text-xs flex flex-col gap-2">
                {" "}
                <p>
                  Also, high-tech devices are really good for healthcare, like
                  because of a 30% increase in recovery, like with better
                  diagnostic things and monitoring patients more efficiently.
                </p>
                <div className="flex flex-col gap-1">
                  <p className="font-semibold">Plan Implementation:</p>{" "}
                  <p>
                    The revision lacks a clear presentation of statistics, using
                    vague language ("really good" and "like") instead of precise
                    terms. The phrase "30% increase in recovery" lacks context,
                    and "better diagnostic things" is informal.
                  </p>
                </div>
              </div>
            </div>
            <div className="border-2 p-4 rounded-lg text-sm bg-white">
              <div className="flex flex-row gap-2 items-center pb-2 font-medium">
                <TbAffiliateFilled size={20} />
                <p>
                  Revision <span className="font-semibold">v3.0</span>
                </p>
              </div>
              <div className="text-xs flex flex-col gap-2">
                {" "}
                <p>
                  Also, high-tech devices are really good for healthcare, like
                  because of a 30% increase in recovery, like with better
                  diagnostic things and monitoring patients more efficiently.
                </p>
                <div className="flex flex-col gap-1">
                  <p className="font-semibold">Plan Implementation:</p>{" "}
                  <p>
                    The revision lacks a clear presentation of statistics, using
                    vague language ("really good" and "like") instead of precise
                    terms. The phrase "30% increase in recovery" lacks context,
                    and "better diagnostic things" is informal.
                  </p>
                </div>
              </div>
            </div>
            <div className="border-2 p-4 rounded-lg text-sm bg-white">
              <div className="flex flex-row gap-2 items-center pb-2 font-medium">
                <TbAffiliateFilled size={20} />
                <p>
                  Revision <span className="font-semibold">v2.0</span>
                </p>
              </div>
              <div className="text-xs flex flex-col gap-2">
                {" "}
                <p>
                  Also, high-tech devices are really good for healthcare, like
                  because of a 30% increase in recovery, like with better
                  diagnostic things and monitoring patients more efficiently.
                </p>
                <div className="flex flex-col gap-1">
                  <p className="font-semibold">Plan Implementation:</p>{" "}
                  <p>
                    The revision lacks a clear presentation of statistics, using
                    vague language ("really good" and "like") instead of tone
                    necessary for impactful writing.
                  </p>
                </div>
              </div>
            </div>
            <div className="border-2 p-4 rounded-lg text-sm bg-white">
              <div className="flex flex-row gap-2 items-center pb-2 font-medium">
                <TbAffiliateFilled size={20} />
                <p>
                  Revision <span className="font-semibold">v1.0</span>
                </p>
              </div>
              <div className="text-xs flex flex-col gap-2">
                {" "}
                <p>
                  Also, high-tech devices are really good for healthcare, like
                  because of a 30% increase in recovery, like with better
                  diagnostic things and monitoring patients more efficiently.
                </p>
                <div className="flex flex-col gap-1">
                  <p className="font-semibold">Plan Implementation:</p>{" "}
                  <p>
                    The revision lacks a clear presentation of statistics, using
                    vague language ("really good" and "like") instead of precise
                    terms. The phrase "30% increase in recovery" lacks context,
                    and "better diagnostic things" is informal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-dashed border-gray-200 w-full my-2" />
      </div>

      <div className="overflow-y-auto grow py-2">
        <div className="flex flex-col gap-2 mx-2">
          {uniqueBlocks.map(
            (block, index) =>
              block.why &&
              block.how && (
                <div key={index} className="flex flex-col gap-2">
                  <PlanBlock
                    title="Why"
                    id="why"
                    content={block.why}
                    isNotModifiable={true}
                  />
                  <PlanBlock
                    title="How"
                    id="how"
                    content={block.how}
                    isNotModifiable={true}
                  />
                  <div className="border-t border-dashed border-gray-200 w-full my-2" />
                </div>
              ),
          )}

          <div className="h-48 w-full" />
        </div>
      </div>
    </div>
  );
};
