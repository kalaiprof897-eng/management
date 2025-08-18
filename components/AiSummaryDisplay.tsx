import React from 'react';

interface AiSummaryDisplayProps {
  summary: string;
}

const AiSummaryDisplay: React.FC<AiSummaryDisplayProps> = ({ summary }) => {
  // Split the summary into blocks separated by one or more newlines
  const blocks = summary.trim().split(/\n\s*\n/);

  return (
    <div className="space-y-4 text-gray-300">
      {blocks.map((block, blockIndex) => {
        const lines = block.split('\n');
        // Heuristic to check if the entire block is a list
        const isList = lines.length > 0 && lines.every(line => line.trim().startsWith('* ') || line.trim().startsWith('- '));

        if (isList) {
          return (
            <ul key={blockIndex} className="space-y-2">
              {lines.map((line, lineIndex) => (
                <li key={lineIndex} className="flex items-start">
                  <span className="text-teal-400 font-semibold mr-3 mt-1">&#8226;</span>
                  <span>{line.trim().substring(2)}</span>
                </li>
              ))}
            </ul>
          );
        }

        // Otherwise, render as a paragraph, preserving internal line breaks
        return <p key={blockIndex} className="whitespace-pre-wrap">{block}</p>;
      })}
    </div>
  );
};

export default AiSummaryDisplay;
