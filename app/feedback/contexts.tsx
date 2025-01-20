import React from "react";

// Define a type for your context state to improve type checking and readability
export type PageContextType = {
  selectedType: string;
  setSelectedType: React.Dispatch<React.SetStateAction<string>>;
};

export const PageContext = React.createContext<PageContextType>({
  selectedType: 'All', // This is a default value.
  setSelectedType: () => {} // This matches the expected type but does nothing.
});
