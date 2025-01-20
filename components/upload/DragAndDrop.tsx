// adaptation of implmentation from article: https://innocentanyaele.medium.com/create-a-drag-and-drop-file-component-in-reactjs-nextjs-tailwind-6ae70ba06e4b

"use client";

import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { TbUpload } from "react-icons/tb";

interface DragAndDropProps {
  filesSetter: Dispatch<SetStateAction<FileList | null | undefined>>;
}

export default function DragAndDrop({ filesSetter }: DragAndDropProps) {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const inputRef = useRef<any>(null);
  const [files, setFiles] = useState<any>([]);

  function handleChange(e: any) {
    e.preventDefault();
    console.log("File has been added");
    if (e.target.files && e.target.files[0]) {
      console.log(e.target.files);
      for (let i = 0; i < e.target.files["length"]; i++) {
        setFiles((prevState: any) => [...prevState, e.target.files[i]]);
      }
    }
  }

  useEffect(() => {
    filesSetter(files);
  }, [files]);

  function handleDrop(e: any) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      for (let i = 0; i < e.dataTransfer.files["length"]; i++) {
        setFiles((prevState: any) => [...prevState, e.dataTransfer.files[i]]);
      }
    }
  }

  function handleDragLeave(e: any) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  function handleDragOver(e: any) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function handleDragEnter(e: any) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  // keep implementation for later in case we have time to implement the remove file feature
  function removeFile(fileName: any, idx: any) {
    const newArr = [...files];
    newArr.splice(idx, 1);
    setFiles([]);
    setFiles(newArr);
  }

  function openFileExplorer() {
    inputRef.current.value = "";
    inputRef.current.click();
  }

  return (
    <div className="flex items-center justify-center aspect-square border border-gray-200 bg-gray-50 border-dashed rounded-lg">
      <form
        className={`${
          dragActive ? "bg-white" : "bg-grey-50"
        } rounded-lg text-center flex flex-col items-center justify-center w-full aspect-square cursor-pointer`}
        onDragEnter={handleDragEnter}
        onSubmit={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onClick={openFileExplorer}
      >
        <input
          placeholder="fileInput"
          className="hidden"
          ref={inputRef}
          type="file"
          multiple={true}
          onChange={handleChange}
          accept=".docx"
        />

        {files.length === 0 && (
          <div className="absolute">
            <div className="flex flex-col gap-2 items-center justify-center text-xs font-light">
              <TbUpload size={40} className="text-gray-400" />
              <div className="flex flex-col gap-2">
                <p>
                  <span className="font-bold cursor-pointer">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p>.docx (MAX. 25MB)</p>
              </div>
            </div>
          </div>
        )}

        {files.length !== 0 && (
          <div className="flex flex-col items-center p-3 text-xs">
            {files.map((file: any, idx: any) => (
              <p key={idx} className="col-span-2 truncate text-yellow-400">
                {file.name}
              </p>
            ))}
            <p>
              <span className="font-bold cursor-pointer">Click to upload</span>{" "}
              or drag and drop
            </p>
            <p>.docx (MAX. 25MB)</p>
          </div>
        )}
      </form>
    </div>
  );
}
