import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Category,
  Sentence,
  FeedbackItem,
  FeedbackSourceItem,
  DistributionItem,
  HumanPlanItem,
  GPTPlan,
  Revision,
  RevisionItem,
  GlobalHumanPlanItem,
} from "./type";
import { fetchData } from "./utils";

export type OpenAIAPIState = {
  API: string;
};

export type OpenAIAPIActions = {
  setAPI: (API: string) => void;
};

export const useOpenAIAPIStore = create<OpenAIAPIState & OpenAIAPIActions>()(
  persist(
    (set) => ({
      API: "",
      setAPI: (API: string) => set({ API: API }),
    }),
    { name: "openai-api", skipHydration: true },
  ),
);

export type FileSuffixState = {
  fileSuffix: string;
};

export type FileSuffixActions = {
  setFileSuffix: (suffix: string) => void;
};

export const useFileSuffixStore = create<FileSuffixState & FileSuffixActions>()(
  persist(
    (set) => ({
      fileSuffix: "p0_2",
      setFileSuffix: (suffix: string) => set({ fileSuffix: suffix }),
    }),
    { name: "file-suffix", skipHydration: false },
  ),
);

export type EssayState = {
  essay: Sentence[];
};

export type EssayActions = {
  setEssay: (essay: Sentence[]) => void;
  replaceSentenceContentById: (id: number, content: string) => void;
};

export const useEssayStore = create<EssayState & EssayActions>()(
  persist(
    (set) => ({
      essay: [],
      setEssay: (essay: Sentence[]) => set({ essay }),
      replaceSentenceContentById: (id: number, content: string) =>
        set((state) => {
          let index = state.essay.find((item) => item.id === id);
          if (index) {
            index.content = content;
          }
          return { essay: state.essay };
        }),
    }),
    { name: "essay", skipHydration: false },
  ),
);

export type FeedbackState = {
  feedback: FeedbackItem[];
};

export type FeedbackActions = {
  setFeedback: (feedback: FeedbackItem[]) => void;
  setAddressed: (id: number, addressed: boolean) => void;
  getFeedbackById: (id: number) => FeedbackItem | undefined;
  getGPTPlanById: (id: number) => GPTPlan[] | undefined;
  getFeedbackBySentenceId: (id: number) => FeedbackItem[] | undefined;
  getGPTPlanByIdAndSentence: (
    id: number,
    sentence: string,
  ) => GPTPlan | undefined;
};

export const useFeedbackStore = create<FeedbackState & FeedbackActions>()(
  persist(
    (set, get) => ({
      feedback: [],
      setFeedback: (feedback: FeedbackItem[]) => set({ feedback }),
      setAddressed: (id: number, addressed: boolean) =>
        set((state) => ({
          feedback: state.feedback.map((item) =>
            item.id === id ? { ...item, addressed } : item,
          ),
        })),
      getFeedbackById: (id: number) =>
        get().feedback.find((item) => item.id === id),
      getGPTPlanById: (id: number) => {
        const index = get().feedback.findIndex((item) => item.id === id);
        // console.log(index);
        if (index !== -1) {
          // console.log('GPTPlan', get().feedback[index].plan);
          return get().feedback[index].plan;
        }
      },
      getFeedbackBySentenceId: (id: number) => {
        return get().feedback.filter((item) =>
          // identify if what in any plan in the item.plan contains the id
          item.plan?.some((plan) => plan.what.includes(id)),
        );
      },
      getGPTPlanByIdAndSentence: (id: number, sentence: string) => {
        // find the feedback item by id
        const feedbackItem = get().feedback.find((item) => item.id === id);
        // find the plan in the feedback['plan'] by sentence
        return feedbackItem?.plan.find((plan) => plan.sentence === sentence);
      },
    }),
    { name: "feedback", skipHydration: false },
  ),
);

export type FeedbackSourceState = {
  feedback_source: FeedbackSourceItem[];
};

export type FeedbackSourceActions = {
  setFeedbackSource: (feedback_source: FeedbackSourceItem[]) => void;
};

export const useFeedbackSourceStore = create<
  FeedbackSourceState & FeedbackSourceActions
>()(
  persist(
    (set) => ({
      feedback_source: [],
      setFeedbackSource: (feedback_source: FeedbackSourceItem[]) =>
        set({ feedback_source }),
    }),
    { name: "feedback_source", skipHydration: false },
  ),
);

export type FeedbackCategoryDistributionState = {
  claim: DistributionItem;
  reasoning: DistributionItem;
  evidence: DistributionItem;
  rebuttal: DistributionItem;
  others: DistributionItem;
};

export type FeedbackCategoryDistributionActions = {
  setFeedbackCategoryDistributionByCategory: (
    category: Category,
    distribution: DistributionItem,
  ) => void;
  getFeedbackCategoryDistributionByCategory: (
    category: Category,
  ) => DistributionItem | undefined;
  decreaseOneByFeedbackCategoryAndSentenceID: (
    category: Category,
    id: number,
  ) => void;
};

export const useFeedbackCategoryDistributionStore = create<
  FeedbackCategoryDistributionState & FeedbackCategoryDistributionActions
>()(
  persist(
    (set, get) => ({
      claim: {},
      reasoning: {},
      evidence: {},
      rebuttal: {},
      others: {},
      setFeedbackCategoryDistributionByCategory: (
        category: Category,
        distribution: DistributionItem,
      ) =>
        set((state) => ({
          ...state, // Spread the existing state
          [category]: distribution,
        })),
      getFeedbackCategoryDistributionByCategory: (category: Category) =>
        get()[category],
      decreaseOneByFeedbackCategoryAndSentenceID: (
        category: Category,
        id: number,
      ) =>
        set((state) => {
          // console.log('state', state);
          const distribution = state[category];
          // console.log('category', category);
          // console.log('distribution', distribution);
          if (distribution[id.toString()] > 0) {
            distribution[id.toString()] -= 1;
          }
          return {
            ...state,
            [category]: distribution,
          };
        }),
    }),

    { name: "feedback_category_distribution", skipHydration: false },
  ),
);

export type HumanPlanState = {
  humanPlan: HumanPlanItem[];
};

export type HumanPlanActions = {
  addHumanPlan: (plan: HumanPlanItem) => void;
  addSentenceToHumanPlan: (
    id: number,
    sentence: string,
    sentence_id: number,
  ) => void;
  setHumanPlanbyId: (id: number, plan: HumanPlanItem) => void;
  getHumanPlanById: (id: number) => HumanPlanItem | undefined;
  removeHumanPlanById: (id: number) => void;
  removeSentenceFromHumanPlan: (id: number, sentence: string) => void;
  addWhyToHumanPlan: (id: number, sentence: string, why: string) => void;
  addHowToHumanPlan: (id: number, sentence: string, item: string) => void;
  getDistributionAcrossSentences: () => DistributionItem;
};

export const useHumanPlanStore = create<HumanPlanState & HumanPlanActions>()(
  persist(
    (set, get) => ({
      humanPlan: [],
      addHumanPlan: (plan: HumanPlanItem) => {
        set((state) => {
          state.humanPlan.push(plan);
          // fetchData('http://127.0.0.1:5000/api/save/plans', {
          //   suffix: useFileSuffixStore.getState().fileSuffix,
          //   plans: state.humanPlan
          // });
          return { humanPlan: state.humanPlan };
        });
      },
      addSentenceToHumanPlan: (
        id: number,
        sentence: string,
        sentence_id: number,
      ) =>
        set((state) => {
          const index = state.humanPlan.findIndex(
            (item) => item.feedbackId === id,
          );
          if (index !== -1) {
            if (
              state.humanPlan[index].plan.find(
                (item) => item.sentence === sentence,
              )
            ) {
              return { humanPlan: state.humanPlan };
            }

            state.humanPlan[index].plan.push({
              sentence,
              what: [sentence_id],
              why: null,
              how: null,
            });
          }

          // fetchData("http://127.0.0.1:5000/api/save/plans", {
          //   suffix: useFileSuffixStore.getState().fileSuffix,
          //   plans: state.humanPlan
          // });

          return { humanPlan: state.humanPlan };
        }),
      setHumanPlanbyId: (id: number, plan: HumanPlanItem) =>
        set((state) => {
          const index = state.humanPlan.findIndex(
            (item) => item.feedbackId === id,
          );
          if (index !== -1) {
            state.humanPlan[index] = plan;
          } else {
            state.humanPlan.push(plan);
          }
          // fetchData("http://127.0.0.1:5000/api/save/plans", {
          //   suffix: useFileSuffixStore.getState().fileSuffix,
          //   plans: state.humanPlan
          // });
          return { humanPlan: state.humanPlan };
        }),
      getHumanPlanById: (id: number) =>
        get().humanPlan.find((item) => item.feedbackId === id),
      removeHumanPlanById: (id: number) =>
        set((state) => {
          state.humanPlan = state.humanPlan.filter(
            (item) => item.feedbackId !== id,
          );
          // fetchData("http://127.0.0.1:5000/api/save/plans", {
          //   suffix: useFileSuffixStore.getState().fileSuffix,
          //   plans: state.humanPlan
          // });
          return {
            humanPlan: state.humanPlan,
          };
        }),
      removeSentenceFromHumanPlan: (id: number, sentence: string) =>
        set((state) => {
          const index = state.humanPlan.findIndex(
            (item) => item.feedbackId === id,
          );
          if (index !== -1) {
            state.humanPlan[index].plan = state.humanPlan[index].plan.filter(
              (item) => item.sentence !== sentence,
            );
          }
          // fetchData("http://127.0.0.1:5000/api/save/plans", {
          //   suffix: useFileSuffixStore.getState().fileSuffix,
          //   plans: state.humanPlan
          // });
          return { humanPlan: state.humanPlan };
        }),
      addWhyToHumanPlan: (id: number, sentence: string, why: string) =>
        set((state) => {
          const index = state.humanPlan.findIndex(
            (item) => item.feedbackId === id,
          );
          if (index !== -1) {
            const sentenceIndex = state.humanPlan[index].plan.findIndex(
              (item) => item.sentence === sentence,
            );
            if (sentenceIndex !== -1) {
              state.humanPlan[index].plan[sentenceIndex].why = why;
            }
          }
          // fetchData("http://127.0.0.1:5000/api/save/plans", {
          //   suffix: useFileSuffixStore.getState().fileSuffix,
          //   plans: state.humanPlan
          // });
          return { humanPlan: state.humanPlan };
        }),
      addHowToHumanPlan: (id: number, sentence: string, item: string) =>
        set((state) => {
          const index = state.humanPlan.findIndex(
            (item) => item.feedbackId === id,
          );
          if (index !== -1) {
            const sentenceIndex = state.humanPlan[index].plan.findIndex(
              (item) => item.sentence === sentence,
            );
            if (sentenceIndex !== -1) {
              state.humanPlan[index].plan[sentenceIndex].how = item;
            }
          }
          // fetchData("http://127.0.0.1:5000/api/save/plans", {
          //   suffix: useFileSuffixStore.getState().fileSuffix,
          //   plans: state.humanPlan
          // });
          return { humanPlan: state.humanPlan };
        }),
      getDistributionAcrossSentences: () => {
        const whatList: any[] = []; // Accumulate 'what' values here, adjust the type as necessary
        const essayLength = useEssayStore.getState().essay.length;
        const items = useHumanPlanStore.getState().humanPlan;

        // Iterate over items to extract 'what' values
        items.forEach((item) => {
          item.plan?.forEach((plan) => {
            if (plan.what) {
              whatList.push(...plan.what);
            }
          });
        });

        // Count occurrences of each 'what' value
        const distribution: Record<string, number> = {};
        whatList.forEach((what) => {
          distribution[what] = (distribution[what] || 0) + 1;
        });

        // Fill the distribution to ensure all keys from 1 to essayLength exist
        const filledDistribution: Record<number, number> = {};
        for (let i = 1; i <= essayLength; i++) {
          filledDistribution[i] = distribution[i.toString()] ?? 0;
        }

        return filledDistribution as DistributionItem;
      },
    }),
    { name: "feedback-plan", skipHydration: false },
  ),
);

export type RevisionStoreState = {
  revision: Revision[];
};

export type RevisionStoreActions = {
  addRevision: (revision: Revision) => void;
  addRevisionItem: (
    id: number,
    sentence: string,
    revision: RevisionItem,
  ) => void;
  getRevisionBySentence: (sentence: string) => Revision | undefined;
  getRevisionById: (id: number) => Revision | undefined;
  // removeRevisionItem: (sentence: string, revision: string) => void;
  isRevisionBetter: (revision: string) => boolean;
};

export const useRevisionStore = create<
  RevisionStoreState & RevisionStoreActions
>()(
  persist(
    (set, get) => ({
      revision: [],
      addRevision: (revision: Revision) =>
        set((state) => {
          state.revision.push(revision);
          // fetchData("http://127.0.0.1:5000/api/save/revisions", {
          //   suffix: useFileSuffixStore.getState().fileSuffix,
          //   revisions: state.revision
          // });
          return { revision: state.revision };
        }),
      addRevisionItem: (id: number, sentence: string, revision: RevisionItem) =>
        set((state) => {
          const index = state.revision.findIndex(
            (item) => item.sentence === sentence,
          );
          if (index !== -1) {
            state.revision[index].revision.push(revision);
          } else {
            state.revision.push({ id, sentence, revision: [revision] });
          }
          // fetchData("http://127.0.0.1:5000/api/save/revisions", {
          //   suffix: useFileSuffixStore.getState().fileSuffix,
          //   revisions: state.revision
          // });
          return { revision: state.revision };
        }),
      getRevisionBySentence: (sentence: string) =>
        get().revision.find((item: Revision) => item.sentence === sentence),
      getRevisionById: (id: number) =>
        get().revision.find((item: Revision) => item.id === id),
      isRevisionBetter: (revision: string) => {
        let better = false;
        get().revision.forEach((item) => {
          item.revision.forEach((revisionItem) => {
            if (revisionItem.revision === revision) {
              better = revisionItem.better;
            }
          });
        });
        return better;
      },
    }),
    { name: "revision", skipHydration: false },
  ),
);

export type FeedbackSummaryState = {
  feedbackSummary: string;
};

export type FeedbackSummaryActions = {
  setFeedbackSummary: (suffix: string) => void;
};

export const useFeedbackSummaryStore = create<
  FeedbackSummaryState & FeedbackSummaryActions
>()(
  persist(
    (set) => ({
      feedbackSummary: "",
      setFeedbackSummary: (summary: string) =>
        set({ feedbackSummary: summary }),
    }),
    { name: "feedback-summary", skipHydration: false },
  ),
);

export type GlobalSentenceState = {
  globalSentence: Sentence;
};

export type GlobalSentenceActions = {
  setGlobalSentence: (sentence: Sentence) => void;
};

export const useGlobalSentenceStore = create<
  GlobalSentenceState & GlobalSentenceActions
>()(
  persist(
    (set) => ({
      globalSentence: {} as Sentence,
      setGlobalSentence: (sentence: Sentence) =>
        set({ globalSentence: sentence }),
    }),
    { name: "global-sentence", skipHydration: false },
  ),
);

export type GlobalFeedbackState = {
  globalFeedback: FeedbackItem[];
};

export type GlobalFeedbackActions = {
  setGlobalFeedback: (feedback: FeedbackItem[]) => void;
};

export const useGlobalFeedbackStore = create<
  GlobalFeedbackState & GlobalFeedbackActions
>()(
  persist(
    (set) => ({
      globalFeedback: [],
      setGlobalFeedback: (feedback: FeedbackItem[]) =>
        set({ globalFeedback: feedback }),
    }),
    { name: "global-feedback", skipHydration: false },
  ),
);

export type GlobalHumanPlanState = {
  globalHumanPlan: GlobalHumanPlanItem[];
};

export type GlobalHumanPlanActions = {
  initiateOneGlobalHumanPlan: (plan: GlobalHumanPlanItem) => void;
  removeReflectionBySentenceIdAndFeedback: (
    id: number,
    feedback: string,
  ) => void;
  getGlobalHumanPlanBySentenceId: (
    id: number,
  ) => GlobalHumanPlanItem | undefined;
  addWhyToGlobalHumanPlanBySentenceIdAndFeedback: (
    id: number,
    feedback: string | undefined,
    why: string,
  ) => void;
  addHowToGlobalHumanPlanBySentenceIdAndFeedback: (
    id: number,
    feedback: string | undefined,
    how: string,
  ) => void;
  ifSinglePlanCompletedBySentenceIdAndFeedback: (
    id: number,
    feedback: string,
  ) => boolean;
};

export const useGlobalHumanPlanStore = create<
  GlobalHumanPlanState & GlobalHumanPlanActions
>()(
  persist(
    (set, get) => ({
      globalHumanPlan: [],
      initiateOneGlobalHumanPlan: (plan: GlobalHumanPlanItem) => {
        set((state) => {
          state.globalHumanPlan.push(plan);
          // fetchData("http://127.0.0.1:5000/api/save/plans", {
          //   suffix: useFileSuffixStore.getState().fileSuffix,
          //   plans: state.globalHumanPlan
          // });
          return { globalHumanPlan: state.globalHumanPlan };
        });
      },
      removeReflectionBySentenceIdAndFeedback: (
        id: number,
        feedback: string,
      ) => {
        set((state) => {
          const index = state.globalHumanPlan.findIndex(
            (item) => item.id === id,
          );
          if (index !== -1) {
            state.globalHumanPlan[index].reflection = state.globalHumanPlan[
              index
            ].reflection.filter((item) => item.feedback !== feedback);
          }
          // fetchData("http://127.0.0.1:5000/api/save/plans", {
          //   suffix: useFileSuffixStore.getState().fileSuffix,
          //   plans: state.globalHumanPlan
          // });
          return { globalHumanPlan: state.globalHumanPlan };
        });
      },
      getGlobalHumanPlanBySentenceId: (id: number) =>
        get().globalHumanPlan.find((item) => item.id === id),
      addWhyToGlobalHumanPlanBySentenceIdAndFeedback: (
        id: number,
        feedback: string | undefined,
        why: string,
      ) =>
        set((state) => {
          if (feedback === undefined)
            return { globalHumanPlan: state.globalHumanPlan };
          const index = state.globalHumanPlan.findIndex(
            (item) => item.id === id,
          );
          if (index !== -1) {
            const feedbackIndex = state.globalHumanPlan[
              index
            ].reflection.findIndex((item) => item.feedback === feedback);
            if (feedbackIndex !== -1) {
              state.globalHumanPlan[index].reflection[feedbackIndex].why = why;
            }
          }
          // fetchData("http://127.0.0.1:5000/api/save/plans", {
          //   suffix: useFileSuffixStore.getState().fileSuffix,
          //   plans: state.globalHumanPlan
          // });
          return { globalHumanPlan: state.globalHumanPlan };
        }),
      addHowToGlobalHumanPlanBySentenceIdAndFeedback: (
        id: number,
        feedback: string | undefined,
        how: string,
      ) =>
        set((state) => {
          // create a varaible to store if the plan is already completed
          const planCompleted =
            get().ifSinglePlanCompletedBySentenceIdAndFeedback(
              id,
              feedback || "",
            );

          if (feedback === undefined)
            return { globalHumanPlan: state.globalHumanPlan };
          const index = state.globalHumanPlan.findIndex(
            (item) => item.id === id,
          );
          if (index !== -1) {
            const feedbackIndex = state.globalHumanPlan[
              index
            ].reflection.findIndex((item) => item.feedback === feedback);
            if (feedbackIndex !== -1) {
              state.globalHumanPlan[index].reflection[feedbackIndex].how = how;
            }
          }
          // fetchData("http://127.0.0.1:5000/api/save/plans", {
          //   suffix: useFileSuffixStore.getState().fileSuffix,
          //   plans: state.globalHumanPlan
          // });

          // if the plan is initially not completed, and now it is completed
          // update the feedback distribution
          // find the category of the feedback by feedback content
          // decrease one from the category by sentence id

          if (!planCompleted) {
            const feedbackItem = useFeedbackStore
              .getState()
              .feedback.find((item) => item.content === feedback);
            if (feedbackItem) {
              const category = feedbackItem.type;
              useFeedbackCategoryDistributionStore
                .getState()
                .decreaseOneByFeedbackCategoryAndSentenceID(
                  category.toLowerCase() as Category,
                  id,
                );
            }
          }

          return { globalHumanPlan: state.globalHumanPlan };
        }),
      ifSinglePlanCompletedBySentenceIdAndFeedback: (
        id: number,
        feedback: string,
      ) => {
        const plan = get().globalHumanPlan.find((item) => item.id === id);
        if (plan) {
          const reflection = plan.reflection.find(
            (item) => item.feedback === feedback,
          );
          if (reflection) {
            return reflection.why !== "" && reflection.how !== "";
          }
        }
        return false;
      },
    }),
    { name: "global-feedback-plan", skipHydration: false },
  ),
);
