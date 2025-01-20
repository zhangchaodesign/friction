"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import DragAndDrop from "./DragAndDrop";
import { Button } from "flowbite-react";
import { FeedbackSourceItem } from "@/lib/type";
import { useOpenAIAPIStore } from "@/lib/store";
import { noto_serif } from "@/app/fonts";

type FileUploaderProps = {
  onClick: (feedback: FeedbackSourceItem[], essay: string) => void;
};

export function FileUploader(props: FileUploaderProps) {
  const [feedback, setFeedBack] = useState<FileList | null>();
  const [essay, setEssay] = useState<FileList | null>();

  const [feedbackText, setFeedbackText] = useState<FeedbackSourceItem[]>([]);
  const [essayText, setEssayText] = useState<string>("");

  const API = useOpenAIAPIStore((state) => state.API);
  const setAPI = useOpenAIAPIStore((state) => state.setAPI);

  const handleAPIInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAPI(event.target.value);
  };

  const readText = (
    feedback: FileList | null | undefined,
    essay: FileList | null | undefined,
  ) => {
    console.log("Reading text...");
    if (!feedback || !essay) return;
    const reader = new FileReader();
    reader.readAsText(essay[0], "UTF-8");
    reader.onload = (e) => {
      const essay = reader.result;
      console.log("Essay text", essay?.toString() || "");
      setEssayText(essay?.toString() || "");
    };
    for (let i = 0; i < feedback.length; i++) {
      const reader = new FileReader();
      reader.readAsText(feedback[i], "UTF-8");
      reader.onload = (e) => {
        const feed = reader.result;
        console.log("Feedback text", feedback?.toString() || "");
        setFeedbackText((prevState) => [
          ...prevState,
          {
            id: i,
            content: feed?.toString() || "",
            file: feedback[i].name || "",
          },
        ]);
      };
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2 p-8 bg-white rounded-lg border border-gray-800 w-[512px] select-none mb-32">
      <div className="col-span-2 flex flex-col gap-4">
        <p className={noto_serif.className}>Hi there! Welcome to Friction!</p>
        {/* <Button
          color="light"
          className="w-full"
          onClick={() => {
            const link = document.createElement("a");
            link.href = "/test.zip";
            link.download = "test.zip";
            link.click();
          }}
        >
          Download Sample Files
        </Button> */}
      </div>
      {/* 
      <div>
        <p className="text-sm mb-1 text-gray-400">Feedback</p>
        <DragAndDrop filesSetter={setFeedBack} />
      </div>

      <div>
        <p className="text-sm mb-1 text-gray-400">Essay</p>
        <DragAndDrop filesSetter={setEssay} />
      </div> */}

      <div className="flex flex-col gap-2 col-span-2">
        <input
          type="text"
          value={API}
          placeholder="Your OpenAI API Key..."
          onChange={handleAPIInputChange}
          className="w-full p-2 border text-sm border-gray-300 rounded-lg grow-0"
          // placeholder="Enter essay text here"
        />

        {API !== "" && (
          <Link
            href="/feedback"
            className="grow"
            // onClick={}
            onClick={() => {
              // readText(feedback, essay);
              props.onClick(feedbackText, essayText);
            }}
          >
            <Button color="dark" className="w-full">
              Load Example Files and Start Friction
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
