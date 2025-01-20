import React, { useState } from "react";
import { TextInput, Dropdown, Rating, Checkbox, Label } from "flowbite-react";
import { TbSearch } from "react-icons/tb";
import { eventTracker } from "@/lib/utils";
import useWindowSize from "@rooks/use-window-size";

type FeedbackFilterProps = {
  searchText: string;
  setSearchText: (text: string) => void;
  selectedFile: string;
  setSelectedFile: (file: string) => void;
  uniqueFiles: string[];
  selectedType: string;
  setSelectedType: (type: string) => void;
  uniqueTypes: string[];
  selectedEngagementRange: string;
  setSelectedEngagementRange: (range: string) => void;
  // showUnaddressed: boolean;
  // setShowUnaddressed: (show: boolean) => void;
  sentiment: number;
  setSentiment: (sentiment: number) => void;
  actionability: number;
  setActionability: (actionability: number) => void;
  justification: number;
  setJustification: (justification: number) => void;
  specificity: number;
  setSpecificity: (specificity: number) => void;
  engagement: number;
  setEngagement: (engagement: number) => void;
};

export const FeedbackFilter = (props: FeedbackFilterProps) => {
  const typeMap = {
    all: "All",
    claim: "Claims/Ideas",
    reasoning: "Warrant/Reasoning/Backing",
    evidence: "Evidence",
    rebuttal: "Rebuttal/Reservation",
    others: "General Content",
    orthography: "Conventions/Grammar/Spelling",
    organization: "Organization",
    "word-usage": "Word Usage/Clarity",
  };

  const { innerWidth, innerHeight, outerHeight, outerWidth } = useWindowSize();
  // const [sentiment, setSentiment] = useState(0.5);

  function renderStars(range: string) {
    return range !== "All" ? "🌟".repeat(Number(range)) : "All";
  }

  return (
    <div className="flex flex-row gap-2 select-none items-end">
      <TextInput
        id="search"
        type="text"
        placeholder="Search by keywords..."
        icon={TbSearch}
        value={props.searchText}
        onChange={(e) => {
          props.setSearchText(e.target.value);
        }}
        onBlur={(e) => {
          eventTracker({
            event: "feedback_filter_search",
            text: e.target.value,
          });
        }}
        className="min-w-48 grow"
        color="light"
      />

      <Dropdown
        label={props.selectedFile === "All" ? "Reviewer" : props.selectedFile}
        color="light"
        title="Provider"
        theme={{ floating: { target: "focus:ring-gray-800" } }}
        className="rounded-lg 2xl:mr-4"
      >
        <div className="font-semibold text-sm mx-2 my-2">Provider</div>
        <div className="border-t border-gray-100 my-2" />
        {props.uniqueFiles.map((file) => (
          <Dropdown.Item
            key={file}
            onClick={() => {
              eventTracker({
                event: "feedback_filter_file",
                file,
              });
              props.setSelectedFile(file);
            }}
          >
            {file}
          </Dropdown.Item>
        ))}
      </Dropdown>

      <Dropdown
        label={props.selectedType === "All" ? "Category" : props.selectedType}
        color="light"
        title="Type"
        theme={{ floating: { target: "focus:ring-gray-800" } }}
        className="rounded-lg"
      >
        <div className="font-semibold text-sm mx-2 my-2">Type</div>
        <div className="border-t border-gray-100 my-2" />
        {props.uniqueTypes.map((type) => (
          <Dropdown.Item
            key={type}
            onClick={() => {
              eventTracker({
                event: "feedback_filter_type",
                type,
              });
              props.setSelectedType(type);
            }}
          >
            {/* {type} */}
            {typeMap[type.toLowerCase() as keyof typeof typeMap]}
          </Dropdown.Item>
        ))}
      </Dropdown>

      <Dropdown
        label="Helpfulness"
        color="light"
        title="Helpfulness"
        theme={{ floating: { target: "focus:ring-gray-800" } }}
        className="rounded-lg"
      >
        <div className="font-semibold text-sm mx-2 my-2">Helpfulness</div>
        <div className="border-t border-gray-100 my-2" />

        <Dropdown.Item>
          <div
            className="flex flex-col gap-2 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <label htmlFor="all" className="font-medium">
              Total: {props.engagement}
            </label>
            <div className="flex flex-row items-center justify-center gap-2">
              <span>0</span>
              <input
                id="all"
                type="range"
                min="0"
                max="4"
                step="0.01"
                value={props.engagement}
                onChange={(e) => {
                  props.setEngagement(parseFloat(e.target.value));
                  eventTracker({
                    event: "feedback_filter_engagement",
                    range: e.target.value,
                  });
                }}
                className="w-fit h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 range-sm"
              />
              <span>4</span>
            </div>
          </div>
        </Dropdown.Item>

        <Dropdown.Item>
          <div
            className="flex flex-col gap-2 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <label htmlFor="sentiment" className="font-medium">
              Negativity: {props.sentiment}
            </label>
            <div className="flex flex-row items-center justify-center gap-2">
              <span>0</span>
              <input
                id="sentiment"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={props.sentiment}
                onChange={(e) => {
                  props.setSentiment(parseFloat(e.target.value));
                  eventTracker({
                    event: "feedback_filter_sentiment",
                    range: e.target.value,
                  });
                }}
                className="w-fit h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 range-sm"
              />
              <span>1</span>
            </div>
          </div>
        </Dropdown.Item>

        <Dropdown.Item>
          <div
            className="flex flex-col gap-2 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <label htmlFor="actionability" className="font-medium">
              Actionability: {props.actionability}
            </label>
            <div className="flex flex-row items-center justify-center gap-2">
              <span>0</span>
              <input
                id="actionability"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={props.actionability}
                onChange={(e) => {
                  props.setActionability(parseFloat(e.target.value));
                  eventTracker({
                    event: "feedback_filter_actionability",
                    range: e.target.value,
                  });
                }}
                className="w-fit h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 range-sm"
              />
              <span>1</span>
            </div>
          </div>
        </Dropdown.Item>

        <Dropdown.Item>
          <div
            className="flex flex-col gap-2 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <label htmlFor="justification" className="font-medium">
              Justification: {props.justification}
            </label>
            <div className="flex flex-row items-center justify-center gap-2">
              <span>0</span>
              <input
                id="justification"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={props.justification}
                onChange={(e) => {
                  props.setJustification(parseFloat(e.target.value));
                  eventTracker({
                    event: "feedback_filter_justification",
                    range: e.target.value,
                  });
                }}
                className="w-fit h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 range-sm"
              />
              <span>1</span>
            </div>
          </div>
        </Dropdown.Item>

        <Dropdown.Item>
          <div
            className="flex flex-col gap-2 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <label htmlFor="specificity" className="font-medium">
              Specificity: {props.specificity}
            </label>
            <div className="flex flex-row items-center justify-center gap-2">
              <span>0</span>
              <input
                id="specificity"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={props.specificity}
                onChange={(e) => {
                  props.setSpecificity(parseFloat(e.target.value));
                  eventTracker({
                    event: "feedback_filter_specificity",
                    range: e.target.value,
                  });
                }}
                className="w-fit h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 range-sm"
              />
              <span>1</span>
            </div>
          </div>
        </Dropdown.Item>
      </Dropdown>
    </div>
  );
};
