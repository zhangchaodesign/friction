import React, { useState, useEffect } from "react";
import Link from "next/link";
import { TbReplaceFilled, TbTextScan2, TbX } from "react-icons/tb";
import { Button } from "flowbite-react";
import {
  useEssayStore,
  useRevisionStore,
  useGlobalSentenceStore,
} from "@/lib/store";
import {
  cn,
  getOpenAIBetterOrNot,
  eventTracker,
  getOpenAICompletion,
} from "@/lib/utils";
import { GlobalHumanReflectionItem } from "@/lib/type";

type ReviseBlockProps = {
  classes?: string;
  setCounter: (counter: number) => void;
  counter: number;
  setIsRevisionHistoryDisplay: (isRevisionHistoryDisplay: boolean) => void;
  isSummaryDisplay: boolean;
  setIsSummaryDisplay: (isSummaryDisplay: boolean) => void;
  humanPlan: GlobalHumanReflectionItem[];
};

export const ReviseBlock = (props: ReviseBlockProps) => {
  const globalSentence = useGlobalSentenceStore(
    (state) => state.globalSentence,
  );
  const [originalSentence, setOriginalSentence] = useState<string>("");

  const [inputValue, setInputValue] = useState<string>("");
  const [isBetter, setIsBetter] = useState<boolean>(false);

  const getRevisionById = useRevisionStore((state) => state.getRevisionById);
  const addRevisionItem = useRevisionStore((state) => state.addRevisionItem);

  const essay = useEssayStore((state) => state.essay);
  const replaceSentenceContentById = useEssayStore(
    (state) => state.replaceSentenceContentById,
  );

  const handleInputChange = async (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setInputValue(event.target.value);
  };

  useEffect(() => {
    let revision = getRevisionById(globalSentence.id);
    if (revision) {
      setInputValue(revision.sentence);
      setOriginalSentence(revision.sentence);
    } else {
      setInputValue(globalSentence.content || "");
      setOriginalSentence(globalSentence.content || "");
    }
  }, [globalSentence]);

  return (
    <div
      className={cn(
        props.classes,
        "w-full border-l-8 rounded-lg flex flex-col gap-2 p-4 bg-white",
      )}
      style={
        isBetter
          ? {
              borderColor: "#059669",
            }
          : {
              borderColor: "#F3F4F6",
            }
      }
    >
      <div className="flex flex-row gap-2 justify-between items-center">
        <div className="flex flex-row gap-2 items-center">
          {" "}
          <TbTextScan2 size={20} />
          <h1 className="font-semibold">Revise</h1>
        </div>
        <Link
          href="/feedback"
          onClick={() => {
            eventTracker({
              event: "close_revision",
              sentence:
                Object.keys(globalSentence).length === 0
                  ? "all"
                  : globalSentence.id,
            });
          }}
        >
          <TbX size={24} />
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <textarea
          // type="text"
          className="rounded-lg border-0 text-sm bg-gray-50 focus:ring-gray-400"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={() => {
            if (inputValue !== originalSentence) {
              eventTracker({
                event: "edit_revision",
                sentence:
                  Object.keys(globalSentence).length === 0
                    ? "all"
                    : globalSentence.id,
                revision: inputValue,
              });
            }
          }}
        ></textarea>

        <Button
          color="light"
          className="w-full border-0 bg-gray-100 enabled:hover:ring-green-600 enabled:ring-green-600 hover:ring-green-600 enabled:hover:bg-green-600 enabled:hover:text-white hover:bg-green-600 hover:text-white"
          onClick={async () => {
            replaceSentenceContentById(globalSentence.id, inputValue);
            props.setCounter(props.counter + 1);
            props.setIsRevisionHistoryDisplay(true);

            let result = await getOpenAIBetterOrNot(
              originalSentence,
              inputValue,
            );
            let better = false;
            if (result === "Yes") {
              setIsBetter(true);
              better = true;
            } else {
              setIsBetter(false);
            }

            let explanation = "";
            let prompt = `You are an English writing teacher. Your job is to analyze how the student ${
              better ? "succeeded" : "failed"
            } in using the following strategies in revision and therefore, makes ${
              better ? "" : "no"
            } improvements to the original sentence. Keep your analysis within 30 words. Start with "The revision ..." \nStrategies: ${
              // concatenate all the strategies (how) from humanPlan into a single string
              props.humanPlan
                .map((item) => item.how)
                .reduce((acc: string, item) => acc + item + "\n", "")
            }`;
            console.log("prompt", prompt);
            explanation = (await getOpenAICompletion(
              prompt,
              "original sentence: " +
                originalSentence +
                "\n" +
                "revised sentence: " +
                inputValue +
                "\nanalysis:",
            )) as string;

            addRevisionItem(globalSentence.id, originalSentence, {
              revision: inputValue,
              better,
              explanation,
            });

            eventTracker({
              event: "submit_revision",
              sentence:
                Object.keys(globalSentence).length === 0
                  ? "all"
                  : globalSentence.id,
              revision: inputValue,
              better,
            });

            if (props.isSummaryDisplay) props.setIsSummaryDisplay(false);
          }}
        >
          <TbReplaceFilled size={20} className="mr-2 h-5 w-5" />
          Submit Revision
        </Button>
      </div>
    </div>
  );
};
