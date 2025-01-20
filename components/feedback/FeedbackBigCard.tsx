"use client";

import React, { useEffect } from "react";
import { useState } from "react";
import { useFileSuffixStore, useGlobalSentenceStore } from "@/lib/store";
import { FeedbackSourceItem, FeedbackItem } from "@/lib/type";
import { noto_serif } from "@/app/fonts";
import { Rating } from "flowbite-react";
import { EngagmentVis } from "@/components/feedback/EngagmentVis";
import { TbX, TbClipboardText } from "react-icons/tb";
import {
  cn,
  fetchData,
  isSimilarSentence,
  categoryColorMap,
  eventTracker,
} from "@/lib/utils";
import { feedbackSource } from "@/lib/data/source";

type FeedbackBigCardProps = {
  planStage?: number;
  classes: string;
  feedbackItem: FeedbackItem;
  close?: boolean;
  selectedFeedback?: FeedbackItem[];
  setSelectedFeedback?: (feedback: FeedbackItem[] | undefined) => void;
  draggable?: boolean;
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
  hideContent?: boolean;
};

export const FeedbackBigCard = (props: FeedbackBigCardProps) => {
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
  const fileSuffix = useFileSuffixStore((state) => state.fileSuffix);
  const [newFeedbackContent, setNewFeedbackContent] = useState("");
  // console.log('fileSuffix:', fileSuffix);

  const globalSentence = useGlobalSentenceStore(
    (state) => state.globalSentence,
  );

  // const handleMouseEnterCheckSource = () => {
  //   const fetchfeedbackSourceContent = async (fileSuffix: string) => {
  //     await fetchData(
  //       'http://127.0.0.1:5000/api/source',
  //       {
  //         suffix: fileSuffix,
  //         id: props.feedbackItem.source
  //       },
  //       (data: FeedbackSourceItem) => setNewFeedbackContent(data.content)
  //     );
  //   };

  //   fetchfeedbackSourceContent(fileSuffix);
  // };

  const handleMouseEnterCheckSource = () => {
    // find id = props.feedbackItem.source in feedbackSource
    const data = feedbackSource.find(
      (item: FeedbackSourceItem) => item.id === props.feedbackItem.source,
    );

    if (data) setNewFeedbackContent(data.content);
  };

  const handleMouseLeaveCheckSource = () => {
    setNewFeedbackContent("");
  };

  const renderContentWithHighlights = (
    newContent: string,
    originalContent: string,
  ): JSX.Element[] => {
    const newContentSentences = newContent.split(/(?<=[.?!])\s+/);
    const originalContentSentences = originalContent.split(/(?<=[.?!])\s+/);

    return newContentSentences.map((sentence, index) => {
      if (isSimilarSentence(sentence, originalContentSentences)) {
        return <b key={index}>{sentence} </b>;
      } else {
        return (
          <span key={index} className="text-gray-300 font-normal">
            {sentence}{" "}
          </span>
        );
      }
    });
  };

  const handleDismiss = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const menu = window.confirm("Dismiss this feedback item?");
    if (menu) {
      props.setSelectedFeedback &&
        props.setSelectedFeedback(
          props.selectedFeedback?.filter(
            (feedback) => feedback.id !== props.feedbackItem.id,
          ),
        );

      eventTracker({
        event: "dismiss_feedback",
        feedback_item_id: props.feedbackItem.id,
        sentence:
          Object.keys(globalSentence).length === 0
            ? "all"
            : globalSentence.id
            ? globalSentence.id
            : "all",
      });
    }
  };

  return (
    <div
      className={cn(
        props.classes + " bg-gray-50 overflow-auto text-gray-800 h-full",
      )}
      draggable={props.draggable}
      onDragStart={props.onDragStart}
    >
      <div
        className="flex flex-col gap-2 px-4 py-1 font-medium bg-white border-2 rounded-lg select-none"
        style={{
          borderColor: categoryColorMap[props.feedbackItem.type],
        }}
      >
        <div className="flex flex-col gap-2 items-start select-none">
          <div className="flex flex-row justify-between items-center w-full">
            <div className="flex flex-row gap-2 items-center hover:translate-y-0 hover:scale-1 pt-3 pr-3">
              <EngagmentVis
                id={props.feedbackItem.id}
                sentiment={props.feedbackItem.sentiment}
                actionability={props.feedbackItem.actionability}
                justification={props.feedbackItem.justification}
                specificity={props.feedbackItem.specificity}
                hideContent={props.hideContent}
              />
              <h1 className="text-xl font-semibold">
                {
                  typeMap[
                    props.feedbackItem.type.toLowerCase() as keyof typeof typeMap
                  ]
                }
              </h1>
            </div>

            <div className="flex flex-row gap-2 items-center pt-3">
              <div
                className="hover:underline text-gray-400 text-xs font-normal hover:text-gray-800 cursor-pointer"
                onMouseEnter={() => {
                  eventTracker({
                    event: "check_original_feedback",
                    feedback_item_id: props.feedbackItem.id,
                    sentence:
                      Object.keys(globalSentence).length === 0
                        ? "all"
                        : globalSentence.id,
                  });
                  handleMouseEnterCheckSource();
                }}
                onMouseLeave={handleMouseLeaveCheckSource}
              >
                <div className="flex flex-row gap-2 items-center">
                  <TbClipboardText size={20} />
                  <p>Original Feedback: {props.feedbackItem.file}</p>
                </div>
              </div>
              {!props.planStage && props.close && (
                <div onClick={handleDismiss} className="cursor-pointer">
                  <TbX size={24} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-2 text-base">
            {newFeedbackContent ? (
              <p
                className={
                  noto_serif.className + " italic text-sm leading-6 pb-3"
                }
              >
                {renderContentWithHighlights(
                  newFeedbackContent,
                  props.feedbackItem.content,
                )}
              </p>
            ) : props.hideContent ? null : (
              <p
                className={
                  noto_serif.className + " italic text-sm leading-6 pb-3"
                }
              >
                {props.feedbackItem.content}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
