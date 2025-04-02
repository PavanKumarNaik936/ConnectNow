"use client";
import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import { X } from "lucide-react"; // Close Icon

const Toaster = ({ ...props }) => {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  return (
    <Sonner
      theme={theme}
      className="toaster"
      toastOptions={{
        duration: 4000, // Auto-close after 4s
        dismissible: true, // Enable close button
        classNames: {
          toast: `border rounded-lg shadow-lg p-4 transition-all ${
            isDarkMode ? "bg-gray-900 text-white border-gray-700" : "bg-white text-black border-gray-300"
          }`,
          description: isDarkMode ? "text-gray-400" : "text-gray-700",
          actionButton: isDarkMode
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-blue-600 text-white hover:bg-blue-700",
          cancelButton: isDarkMode
            ? "bg-gray-700 text-gray-300 hover:bg-gray-800"
            : "bg-gray-200 text-gray-800 hover:bg-gray-300",
        },
      }}
      {...props}
    />
  );
};


export { Toaster };
