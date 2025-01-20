"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  useEssayStore,
  useFileSuffixStore,
  useFeedbackCategoryDistributionStore,
  useHumanPlanStore,
  useGlobalSentenceStore,
  useRevisionStore,
} from "@/lib/store";
import { Category, Sentence, DistributionItem } from "@/lib/type";
import { FeedbackDistributionVis } from "@/components/essay/FeedbackDistributionVis";
import { FeedbackDistributionTag } from "@/components/essay/FeedbackDistributionTag";
import { useRouter } from "next/navigation";

interface EssayProps {
  classes: string;
  feedback?: string;
  reviseSentence?: string | null;
  selectedType?: string;
  setSelectedType?: (selectedType: string) => void;
}

const Essay = (props: EssayProps) => {
  const router = useRouter();

  const isRevisionBetter = useRevisionStore((state) => state.isRevisionBetter);

  // Global sentence for highlighting
  const globalSentence = useGlobalSentenceStore(
    (state) => state.globalSentence,
  );
  const setGlobalSentence = useGlobalSentenceStore(
    (state) => state.setGlobalSentence,
  );

  const essay = useEssayStore((state) => state.essay);
  const feedbackDistribution = useFeedbackCategoryDistributionStore(
    (state) => state,
  );

  const paragraphs = useMemo(() => {
    return essay.reduce((acc, curr) => {
      acc[curr.paragraph] = acc[curr.paragraph] || [];
      acc[curr.paragraph].push(curr);
      return acc;
    }, {} as Record<number, Sentence[]>);
  }, [essay]);

  // Highlighting effect on hover on the plan pages
  const pathname = usePathname();
  const [hoveredSection, setHoveredSection] = useState<number | null>(null);

  const handleMouseEnter = (id: number) => {
    setHoveredSection(id);
    // console.log('hoveredSection', hoveredSection);
  };

  const handleMouseLeave = () => {
    setHoveredSection(null);
  };

  const handleClickedSentence = (section: Sentence) => {
    if (globalSentence.content === section.content) {
      setGlobalSentence({} as Sentence);
    } else {
      setGlobalSentence(section);
    }

    // if current path is /plan, redirect to /feedback
    if (pathname === "/plan") {
      console.log("redirecting to /feedback");
      router.push("/feedback");
    }
    // console.log('globalSentence', globalSentence);
  };

  // Visualize the feedback distribution of the essay
  interface SpanData {
    category: string;
    height: number;
    y: number;
    density: number;
  }

  const [claimSpans, setClaimSpans] = useState<SpanData[]>([]);
  const [reasoningSpans, setReasoningSpans] = useState<SpanData[]>([]);
  const [evidenceSpans, setEvidenceSpans] = useState<SpanData[]>([]);
  const [rebuttalSpans, setRebuttalSpans] = useState<SpanData[]>([]);
  const [othersSpans, setOthersSpans] = useState<SpanData[]>([]);
  const getDistributionAcrossSentences = useHumanPlanStore(
    (state) => state.getDistributionAcrossSentences,
  );

  const spanRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const categories: Category[] = [
    "claim",
    "evidence",
    "reasoning",
    "rebuttal",
    "others",
  ];

  useEffect(() => {
    const updateSpansPosition = (category?: Category) => {
      let distributionData: DistributionItem | undefined;

      if (category) {
        distributionData =
          feedbackDistribution.getFeedbackCategoryDistributionByCategory(
            category,
          );
      } else {
        distributionData = getDistributionAcrossSentences();
      }

      if (!distributionData) return;
      const distributionKeys = Object.keys(distributionData);
      if (distributionKeys.length === 0 || distributionData === undefined)
        return;

      // Ensure the scroll container ref is set and not null
      const scrollContainer = scrollContainerRef.current;
      if (!scrollContainer) return;

      const containerRect = scrollContainer.getBoundingClientRect();

      const spansData: SpanData[] = spanRefs.current
        .filter(Boolean)
        .map((span, index) => {
          if (!span || !scrollContainer) return null;
          const rect = span.getBoundingClientRect();
          const densityKey = distributionKeys[index];
          const density = distributionData![densityKey] || 0;
          const quotient = Math.floor(rect.height / 32);
          const remainder = rect.height % 32;
          const lineNum = remainder === 0 ? quotient : quotient + 1;
          return {
            height: 32 * lineNum,
            y: rect.top - containerRect.top + scrollContainer.scrollTop,
            density,
          };
        })
        .filter(Boolean) as SpanData[];

      // console.log(spansData);
      if (category === "claim") setClaimSpans(spansData);
      if (category === "reasoning") setReasoningSpans(spansData);
      if (category === "evidence") setEvidenceSpans(spansData);
      if (category === "rebuttal") setRebuttalSpans(spansData);
      if (category === "others") setOthersSpans(spansData);
    };

    // Update the spans position for each category
    categories.forEach((category) => {
      updateSpansPosition(category);
    });
    updateSpansPosition();

    // Setup scroll event listener
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", () => {
        categories.forEach((category) => {
          updateSpansPosition(category);
        });
        updateSpansPosition();
      });
    }

    // Cleanup
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", () => {
          categories.forEach((category) => {
            updateSpansPosition(category);
          });
        });
      }
    };
  }, [essay]); // Empty dependency array means this runs once on mount

  return (
    <div
      className={cn(
        props.classes +
          " font-normal border-l border-gray-100 text-gray-800 flex flex-col select-none bg-white relative h-screen",
      )}
    >
      <div className="h-16 font-semibold pl-8 text-xl bg-white border-gray-100 text-gray-800 py-4 flex flex-row items-center gap-2">
        <p>My Essay</p>
      </div>
      <div
        ref={scrollContainerRef}
        className="text-base leading-8 pl-8 pr-40 overflow-y-auto relative grow"
      >
        {Object.entries(paragraphs).map(
          ([paragraph, sections], index, array) => (
            <div
              key={paragraph}
              className={
                (index < array.length - 1 ? "mb-6 " : "") + "cursor-pointer"
              }
            >
              {sections.map((section) => (
                <React.Fragment key={`section-${section.id}`}>
                  <span
                    id={section.id.toString()}
                    ref={(el) => {
                      spanRefs.current[section.id] = el;
                    }}
                    onMouseEnter={() => handleMouseEnter(section.id)}
                    onMouseLeave={handleMouseLeave}
                    className={cn({
                      "bg-green-100": isRevisionBetter(section.content),
                      "bg-sky-100":
                        hoveredSection === section.id ||
                        (globalSentence.id && globalSentence.id === section.id),
                    })}
                    onClick={() => handleClickedSentence(section)}
                  >
                    {section.content + " "}
                  </span>
                  {
                    <span
                      onMouseEnter={() => handleMouseEnter(section.id)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => {
                        setGlobalSentence(section);
                      }}
                    >
                      {" "}
                      <FeedbackDistributionVis
                        id={section.id}
                        claimSpans={claimSpans}
                        reasoningSpans={reasoningSpans}
                        evidenceSpans={evidenceSpans}
                        rebuttalSpans={rebuttalSpans}
                        othersSpans={othersSpans}
                        setSelectedType={props.setSelectedType}
                        selectedType={props.selectedType}
                      />
                    </span>
                  }
                </React.Fragment>
              ))}
            </div>
          ),
        )}
        <div className="h-24 w-full" />
      </div>
      <FeedbackDistributionTag />
    </div>
  );
};

export default Essay;
