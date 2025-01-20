"use client";

import React from "react";
import { useEffect } from "react";
import {
  useFileSuffixStore,
  useEssayStore,
  useFeedbackStore,
  useFeedbackCategoryDistributionStore,
  useFeedbackSummaryStore,
} from "@/lib/store";
import { eventTracker } from "@/lib/utils";
import { FileUploader } from "@/components/upload/FileUploader";
import { essay } from "@/lib/data/essay";
import { feedback } from "@/lib/data/feedback";

const Upload = () => {
  useEffect(() => {
    eventTracker({
      event: "view_home_page",
    });
  }, []);

  const onClick = async () => {
    eventTracker({
      event: "click_upload_button",
    });

    useEssayStore.setState({ essay: essay });
    useFeedbackStore.setState({ feedback: feedback });
    useFeedbackSummaryStore.setState({
      feedbackSummary:
        "Feedback highlights three key issues for potential revision: Evidence, with 17 comments suggesting improvements to 12 sentences; Reasoning, with 9 comments targeting 10 sentences; and Claim, with 6 comments addressing 6 sentences.",
    });

    const categories = [
      "claim",
      "reasoning",
      "evidence",
      "rebuttal",
      "others",
      "organization",
      "word-usage",
      "orthography",
    ];
    for (const category of categories) {
      const maxPossibleValue = essay.length;
      const distribution: { [key: number]: number } = {};

      // Initialize the distribution with all possible values set to 0
      for (let i = 1; i <= maxPossibleValue; i++) {
        distribution[i] = 0;
      }

      feedback.forEach((item) => {
        if (item.type.toLowerCase() === category) {
          item.plan.forEach((planItem) => {
            planItem.what.forEach((whatValue) => {
              if (distribution[whatValue] !== undefined) {
                distribution[whatValue]++;
              }
            });
          });
        }
      });

      console.log("category: ", category);
      console.log("distribution: ", distribution);

      useFeedbackCategoryDistributionStore.setState({
        [category]: distribution,
      });
    }
  };

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen w-full flex items-center justify-center">
      <FileUploader onClick={onClick} />
    </div>
  );
};

export default Upload;
