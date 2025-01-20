"use client";
import React, { useEffect, useMemo } from "react";
import { RevisePanel } from "@/components/revision/RevisePanel";
import {
  useRevisionStore,
  useGlobalSentenceStore,
  useGlobalHumanPlanStore,
} from "@/lib/store";
import { eventTracker } from "@/lib/utils";
import { useEssayStore } from "@/lib/store";

const Revison = () => {
  const getGlobalHumanPlanBySentenceId = useGlobalHumanPlanStore(
    (state) => state.getGlobalHumanPlanBySentenceId,
  );
  const globalSentence = useGlobalSentenceStore(
    (state) => state.globalSentence,
  );

  useEffect(() => {
    eventTracker({
      event: "view_revision_page",
      sentence:
        Object.keys(globalSentence).length === 0 ? "all" : globalSentence.id,
    });
  }, []);

  const humanPlan = useMemo(() => {
    return getGlobalHumanPlanBySentenceId(globalSentence.id);
  }, [globalSentence]);

  return (
    <main className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <div className="flex flex-col text-gray-800">
          <RevisePanel humanPlanForThisSentence={humanPlan} />
        </div>
      </div>
    </main>
  );
};

export default Revison;
