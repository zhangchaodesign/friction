"use client";

import React from "react";
import { PageContext } from "./contexts";
import { useEffect, useState, useContext } from "react";
import { FeedbackBigCard } from "@/components/feedback/FeedbackBigCard";
import {
  useEssayStore,
  useFeedbackStore,
  useGlobalSentenceStore,
  useGlobalFeedbackStore,
  useGlobalHumanPlanStore,
  useFeedbackSummaryStore,
} from "@/lib/store";
import { FeedbackFilter } from "@/components/feedback/FeedbackFilter";
import { Button } from "flowbite-react";
import Link from "next/link";
import { eventTracker } from "@/lib/utils";
import { FeedbackItem, GlobalHumanReflectionItem } from "@/lib/type";
import { TbCircleKeyFilled } from "react-icons/tb";

const HighlightSummary = ({ text }: { text: string }) => {
  const typeMap = {
    claim: "Claims/Ideas",
    reasoning: "Warrant/Reasoning/Backing",
    evidence: "Evidence",
    rebuttal: "Rebuttal/Reservation",
    others: "General Content",
    orthography: "Conventions/Grammar/Spelling",
    organization: "Organization",
    "word-usage": "Word Usage/Clarity",
  };

  // Keywords that should be highlighted
  const keywords = ["Claim", "Reasoning", "Evidence", "Rebuttal", "Others"];

  // Split the text into parts and process each part to check if it contains any keyword
  const parts = text.split(/(\s+)/).map((part: string, index: number) => {
    // Check if the part includes any keyword, if yes, highlight it by making it bold
    const keyword = keywords.find((keyword) => part.includes(keyword));
    if (keyword) {
      return (
        <span key={index}>
          <span className="font-semibold">
            {typeMap[keyword.toLowerCase() as keyof typeof typeMap]}
          </span>
          ,{/* {part} */}
        </span>
      );
    } else {
      return part;
    }
  });

  // Render the processed parts with the specific ones highlighted
  return <span className="text-xs">{parts}</span>;
};

const Feedback = () => {
  const { selectedType, setSelectedType } = useContext(PageContext);

  const feedbackSummary = useFeedbackSummaryStore(
    (state) => state.feedbackSummary,
  );

  // const fileSuffix = useFileSuffixStore((state) => state.fileSuffix);
  const globalSentence = useGlobalSentenceStore(
    (state) => state.globalSentence,
  );

  const setGlobalFeedback = useGlobalFeedbackStore(
    (state) => state.setGlobalFeedback,
  );

  const globalHumanPlan = useGlobalHumanPlanStore(
    (state) => state.globalHumanPlan,
  );
  const initiateOneGlobalHumanPlan = useGlobalHumanPlanStore(
    (state) => state.initiateOneGlobalHumanPlan,
  );
  const ifSinglePlanCompletedBySentenceIdAndFeedback = useGlobalHumanPlanStore(
    (state) => state.ifSinglePlanCompletedBySentenceIdAndFeedback,
  );

  const getFeedbackBySentenceId = useFeedbackStore(
    (state) => state.getFeedbackBySentenceId,
  );

  const allFeedback = useFeedbackStore((state) => state.feedback);
  const [selectedFeedback, setSelectedFeedback] = useState<
    FeedbackItem[] | undefined
  >([]);

  useEffect(() => {
    if (Object.keys(globalSentence).length === 0) {
      setSelectedFeedback(allFeedback);
    } else {
      if (
        globalHumanPlan.find((item) => item.sentence === globalSentence.content)
      ) {
        setSelectedFeedback(
          getFeedbackBySentenceId(globalSentence.id)?.filter(
            // filter feedback existing in globalHumanPlan
            (item) =>
              globalHumanPlan
                .find((plan) => plan.sentence === globalSentence.content)
                ?.reflection.find((ref) => ref.feedback === item.content),
          ),
        );
      } else {
        let feedbackForThisSentence = getFeedbackBySentenceId(
          globalSentence.id,
        );
        setSelectedFeedback(feedbackForThisSentence);

        let reflection: GlobalHumanReflectionItem[] = [];
        feedbackForThisSentence?.forEach((item) => {
          reflection.push({
            feedback: item.content,
            why: "",
            how: "",
          });
        });
        initiateOneGlobalHumanPlan({
          id: globalSentence.id,
          sentence: globalSentence.content,
          reflection,
        });
      }
      // console.log(selectedFeedback);
    }
  }, [globalSentence]);

  const [searchText, setSearchText] = useState("");
  const [selectedFile, setSelectedFile] = useState("All");
  const [selectedEngagementRange, setSelectedEngagementRange] = useState("All");
  const [sentiment, setSentiment] = useState(0);
  const [actionability, setActionability] = useState(0);
  const [justification, setJustification] = useState(0);
  const [specificity, setSpecificity] = useState(0);
  const [engagement, setEngagement] = useState(0);

  useEffect(() => {
    if (Object.keys(globalSentence).length === 0) {
      eventTracker({
        event: "view_feedback_page",
        sentence: "all",
      });
    } else {
      eventTracker({
        event: "view_feedback_page",
        sentence:
          Object.keys(globalSentence).length === 0 ? "all" : globalSentence.id,
      });
    }

    console.log("globalSentence:", globalSentence.id);
  }, []);

  // Sort feedback by engagement
  const sortedFeedback = React.useMemo(() => {
    const contentFeedback = selectedFeedback?.filter(
      // (item) =>
      //   !['Organization', 'Word-usage', 'Orthography'].includes(item.type)
      (item) => ![""].includes(item.type),
    );

    return (
      contentFeedback &&
      [...contentFeedback]
        .sort((a, b) => b.engagement - a.engagement)
        .sort((b, a) => b.source - a.source)
    );
  }, [selectedFeedback]);

  // Compute unique files
  const uniqueFiles = React.useMemo(() => {
    const files = sortedFeedback?.map((item) => item.file);
    return ["All", ...Array.from(new Set(files))];
  }, [selectedFeedback]);

  // Compute unique types
  const uniqueTypes = React.useMemo(() => {
    const types = sortedFeedback?.map((item) => item.type);
    return ["All", ...Array.from(new Set(types))];
  }, [selectedFeedback]);

  const filteredFeedback = React.useMemo(() => {
    return sortedFeedback?.filter((item) => {
      // Existing filter conditions for search text, file, type, and engagement range.
      const matchesOtherFilters =
        item.content.toLowerCase().includes(searchText.toLowerCase()) &&
        (selectedFile === "All" || item.file === selectedFile) &&
        (selectedType === "All" || item.type === selectedType) &&
        (selectedEngagementRange === "All" ||
          (item.engagement >= (parseInt(selectedEngagementRange) - 1) * 1 &&
            item.engagement < parseInt(selectedEngagementRange) * 1)) &&
        item.actionability >= actionability &&
        item.justification >= justification &&
        item.specificity >= specificity &&
        item.sentiment >= sentiment &&
        item.actionability +
          item.justification +
          item.specificity +
          item.sentiment >=
          engagement;

      return matchesOtherFilters;
    });
  }, [
    sortedFeedback,
    searchText,
    selectedFile,
    selectedType,
    selectedEngagementRange,
    sentiment,
    actionability,
    justification,
    specificity,
    engagement,
  ]);

  useEffect(() => {
    if (filteredFeedback?.length === 0) return;

    filteredFeedback && setGlobalFeedback(filteredFeedback);

    eventTracker({
      event: "view_feedback",
      sentence:
        Object.keys(globalSentence).length === 0 ? "all" : globalSentence.id,
      keywords: searchText.toLowerCase(),
      file: selectedFile.toLowerCase(),
      type: selectedType.toLowerCase(),
      engagement: selectedEngagementRange.toLowerCase(),
    });
  }, [filteredFeedback]);

  return (
    <div className="flex flex-col h-screen w-full py-4 px-8 bg-gray-50 text-gray-800">
      <div className="flex flex-col gap-2">
        {" "}
        <div className="border-2 p-4 bg-white rounded-lg text-sm">
          <div className="flex flex-row gap-2 items-center pb-2 font-medium">
            <TbCircleKeyFilled size={20} />
            <p>Feedback Overview</p>
          </div>

          <HighlightSummary text={feedbackSummary} />
        </div>
        <FeedbackFilter
          searchText={searchText}
          setSearchText={setSearchText}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          uniqueFiles={uniqueFiles}
          selectedType={selectedType}
          setSelectedType={setSelectedType}
          uniqueTypes={uniqueTypes}
          selectedEngagementRange={selectedEngagementRange}
          setSelectedEngagementRange={setSelectedEngagementRange}
          sentiment={sentiment}
          setSentiment={setSentiment}
          actionability={actionability}
          setActionability={setActionability}
          justification={justification}
          setJustification={setJustification}
          specificity={specificity}
          setSpecificity={setSpecificity}
          engagement={engagement}
          setEngagement={setEngagement}
        />
        <div className="border-t border-dashed border-gray-200 w-full my-2" />
      </div>

      <div className="overflow-y-auto grow py-2 pb-40">
        <div className="flex flex-col gap-2 mx-2">
          {filteredFeedback &&
            (filteredFeedback.length > 0 ? (
              filteredFeedback.map((item) => (
                <div key={item.id} className="flex flex-col gap-2">
                  <FeedbackBigCard
                    feedbackItem={item}
                    // if feedback is already addressed, add green ring
                    classes={`relative rounded-lg hover:scale-[1.01] transition-all duration-150 ${
                      ifSinglePlanCompletedBySentenceIdAndFeedback(
                        globalSentence.id,
                        item.content,
                      )
                        ? "overflow-hidden ring-2 ring-emerald-500 ring-offset-2 ring-offset-emerald-100 before:content-[''] before:absolute before:-m-5 before:w-10 before:h-10 before:rotate-45 before:bg-emerald-500"
                        : ""
                    }`}
                    // classes="mx-2 hover:scale-[1.01] transition-all duration-150"
                    close={true}
                    selectedFeedback={selectedFeedback}
                    setSelectedFeedback={setSelectedFeedback}
                  />
                  <div className="border-t border-dashed border-gray-200 w-full" />
                </div>
              ))
            ) : (
              <p className="mx-6 text-sm text-gray-400 select-none">
                No feedback available.
              </p>
            ))}
        </div>
      </div>

      {Object.keys(globalSentence).length !== 0 && (
        <Link
          href="/plan"
          onClick={(e) => {
            if (filteredFeedback == undefined || filteredFeedback.length == 0) {
              e.preventDefault();
              alert(
                "Please keep at least a feedback item before proceeding to reflection.",
              );
            }
          }}
        >
          <Button
            color="dark"
            className="z-50 fixed bottom-6 right-8 w-40 cursor-pointer enabled:hover:ring-white enabled:ring-white hover:ring-white transition-all duration-150 hover:scale-105"
          >
            Go to Plan
          </Button>
        </Link>
      )}
    </div>
  );
};

export default Feedback;
