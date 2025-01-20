import React from "react";
import { eventTracker } from "@/lib/utils";

interface DensityRectProps {
  id: number;
  width: number;
  spanData: SpanData;
  rightOffset: string;
  text: string;
  category: string;
  setHoverTip: (hoverTip: HoverTip | null) => void; // Assuming the type for setHoverTip's argument
}

interface SpanData {
  height: number;
  y: number;
  density: number;
}

interface HoverTip {
  text: string;
  x: number;
  y: number;
  density: number;
}

type ColorMap = {
  [key: string]: string[];
};

export const DensityRect = (props: DensityRectProps) => {
  // Function to get a color code based on a text key and an index.
  // If the index is 0, it returns #FFFFFF. For other indices, it returns a corresponding color code based on the depth of the color.
  // If the index exceeds the length of the color array for the given text, it returns the deepest color in the array.
  function getColorByTextAndIndex(text: string, index: number): string {
    // Mapping of text to arrays of color codes
    const colorMap: ColorMap = {
      Claim: ["#fdf2f8", "#fce7f3", "#f9a8d4", "#ec4899", "#be185d", "#831843"],
      Reasoning: [
        "#fef2f2",
        "#fee2e2",
        "#fca5a5",
        "#ef4444",
        "#b91c1c",
        "#7f1d1d",
      ],
      Evidence: [
        "#fff7ed",
        "#ffedd5",
        "#fdba74",
        "#f97316",
        "#c2410c",
        "#7c2d12",
      ],
      Rebuttal: [
        "#fffbeb",
        "#fef3c7",
        "#fcd34d",
        "#f59e0b",
        "#b45309",
        "#78350f",
      ],
      Others: [
        "#fafaf9",
        "#f5f5f4",
        "#d6d3d1",
        "#78716c",
        "#44403c",
        "#1c1917",
      ],
      Plan: ["#f0fdf4", "#dcfce7", "#86efac", "#22c55e", "#15803d", "#14532d"],
    };

    // Returns white for index 0
    if (index === 0) {
      return colorMap[text][0] || "#FFFFFF";
    }

    // Attempts to retrieve the array of colors for the given text
    const colors = colorMap[text] || [];

    // Ensures the index does not exceed the length of the color array,
    // and adjusts to 0-based indexing
    const density = Math.min(index, colors.length - 1);

    // Returns the color code at the adjusted index, or a default color (black) if the array is empty
    return colors[density];
  }

  return (
    <span
      className="block absolute border-[1px] border-white hover:border-[1px] hover:border-gray-300 transition-all duration-150 ease-in-out hover:scale-110 hover:-translate-y-[1px] hover:z-10"
      style={{
        height: `${props.spanData.height}px`, // Dynamic height
        top: `${props.spanData.y}px`, // Dynamic Y-position
        right: `${props.rightOffset}px`,
        width: `${props.width}px`,
        backgroundColor: getColorByTextAndIndex(
          props.category,
          props.spanData.density,
        ),
      }}
      onMouseEnter={(e) => {
        props.setHoverTip({
          text: props.text,
          x: e.clientX,
          y: e.clientY - 50,
          density: props.spanData.density,
        });
        eventTracker({
          event: "hover_density_rect",
          sentence: props.id,
          dimension: props.category.toLowerCase(),
          density: props.spanData.density,
        });
      }}
      onMouseLeave={() => props.setHoverTip(null)}
    />
  );
};
