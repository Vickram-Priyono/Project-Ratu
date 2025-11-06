import React, { useState, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { HistoryItem } from '../types';
import { ItemTypes } from '../types';
import { ChevronLeftIcon, SparklesIcon } from './icons/StaticIcons';

interface ResultDisplayProps {
  item: HistoryItem;
  onBack: () => void;
  history: HistoryItem[];
  onViewItem: (item: HistoryItem) => void;
}

const SummaryContent: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n').filter(line => line.trim() !== '');
  const listItems = lines.map(line => 
    line.trim().startsWith('*') || line.trim().startsWith('•') 
      ? line.trim().substring(1).trim() 
      : line.trim()
  );

  return (
    <ul className="list-disc list-inside space-y-2 text-gray-300">
      {listItems.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
};


const ResultDisplay: React.FC<ResultDisplayProps> = ({ item, onBack, history, onViewItem }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [relatedClues, setRelatedClues] = useState<HistoryItem[]>([]);
  const [isFindingClues, setIsFindingClues] = useState<boolean>(false);
  const [findCluesError, setFindCluesError] = useState<string | null>(null);

  const handleGetSummary = async () => {
    if (!item.content) return;
    setIsSummaryLoading(true);
    setSummary(null);
    setSummaryError(null);
    setRelatedClues([]); // Clear previous related clues
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Summarize the key points from this witness statement in 2-3 bullet points for a detective's case file. Keep it concise and factual:\n\n---\n\n${item.content}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setSummary(response.text);
    } catch (error) {
      console.error("Gemini API Error (Summary):", error);
      setSummaryError("Failed to generate summary. Please try again.");
    } finally {
      setIsSummaryLoading(false);
    }
  };
  
  const handleFindRelatedClues = async () => {
    setIsFindingClues(true);
    setFindCluesError(null);
    setRelatedClues([]);

    const availableClues = history
      .filter(h => h.id !== item.id)
      .map(h => ({ id: h.id, title: h.title, type: h.type }));
      
    if (availableClues.length === 0) {
        setFindCluesError("No other clues have been scanned yet to cross-reference.");
        setIsFindingClues(false);
        return;
    }
      
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `You are a detective's assistant. Your task is to find connections between clues. Analyze the following witness statement. Then, look at the list of available case files. Identify the 2-3 most relevant files that are directly mentioned or strongly implied in the statement. Return ONLY a JSON array containing the string IDs of the relevant files.

Witness Statement:
"""
${item.content}
"""

Available Case Files:
${JSON.stringify(availableClues)}

Respond with only a JSON array of strings, for example: ["EVIDENCE_001", "LOCATION_PLUIT"].`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        }
      });
      
      const relatedIds = JSON.parse(response.text);
      const foundClues = history.filter(h => relatedIds.includes(h.id));
      setRelatedClues(foundClues);
      if (foundClues.length === 0) {
        setFindCluesError("AI could not find any direct connections in the clues you have.");
      }

    } catch (error) {
       console.error("Gemini API Error (Cross-Reference):", error);
       setFindCluesError("AI analysis failed. Please try again.");
    } finally {
       setIsFindingClues(false);
    }
  };

  const canShowSummaryFeatures = useMemo(() => item.type === ItemTypes.WITNESS, [item.type]);

  return (
    <div className="w-full h-full bg-gray-800 flex flex-col animate-fade-in">
      <header className="p-4 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700 flex items-center sticky top-0 z-10">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
          <ChevronLeftIcon className="w-6 h-6 text-white" />
        </button>
        <div className="flex items-center gap-3 ml-4">
          <item.icon className="w-8 h-8 text-amber-400" />
          <div>
            <h2 className="text-xl font-bold text-white">{item.title}</h2>
            <p className="text-sm text-gray-400">{item.subtitle}</p>
          </div>
        </div>
      </header>

      <div className="flex-grow p-4 sm:p-6 overflow-y-auto">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-auto rounded-lg shadow-lg object-cover mb-6"
        />

        {canShowSummaryFeatures && (
            <div className="mb-6 space-y-3">
                <button 
                    onClick={handleGetSummary} 
                    disabled={isSummaryLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-500 disabled:bg-indigo-400 disabled:cursor-wait transition-all duration-200"
                >
                    <SparklesIcon className="w-5 h-5" />
                    {isSummaryLoading ? 'Generating Summary...' : 'Get AI Summary'}
                </button>
            </div>
        )}

        {summaryError && <p className="text-red-400 text-center mb-4">{summaryError}</p>}
        
        {summary && (
            <div className="mb-6 p-4 bg-gray-900/50 rounded-lg animate-fade-in">
                <h3 className="text-lg font-bold text-amber-300 mb-2">AI Summary</h3>
                <SummaryContent content={summary} />
                
                 <div className="mt-4 pt-4 border-t border-gray-700">
                     <button
                        onClick={handleFindRelatedClues}
                        disabled={isFindingClues}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg shadow-md hover:bg-teal-500 disabled:bg-teal-400 disabled:cursor-wait transition-all duration-200"
                     >
                         <SparklesIcon className="w-5 h-5" />
                         {isFindingClues ? 'Analyzing Connections...' : 'Find Related Clues'}
                     </button>
                 </div>
            </div>
        )}
        
        {findCluesError && <p className="text-red-400 text-center my-4">{findCluesError}</p>}

        {relatedClues.length > 0 && (
             <div className="mb-8 p-4 bg-gray-900/50 rounded-lg animate-fade-in">
                <h3 className="text-lg font-bold text-amber-300 mb-3">Related Clues Found:</h3>
                <ul className="space-y-2">
                    {relatedClues.map(clue => (
                        <li key={clue.id}>
                            <button onClick={() => onViewItem(clue)} className="w-full text-left flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 transition-colors">
                                <clue.icon className="w-6 h-6 text-amber-400 flex-shrink-0" />
                                <span>{clue.title}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        )}


        <div
          className="prose prose-invert prose-lg max-w-none text-gray-300 whitespace-pre-wrap"
          style={{ fontFamily: 'serif' }}
          dangerouslySetInnerHTML={{ __html: item.content.replace(/\n/g, '<br /><br />') }}
        />
      </div>
    </div>
  );
};

export default ResultDisplay;