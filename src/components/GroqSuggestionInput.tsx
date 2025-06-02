
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Wand2, ChevronDown } from "lucide-react";

interface GroqSuggestionInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestionPrompt: string;
  className?: string;
  type?: string;
}

export const GroqSuggestionInput: React.FC<GroqSuggestionInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  suggestionPrompt,
  className,
  type = "text"
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  const getSuggestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('groq-suggestions', {
        body: {
          prompt: suggestionPrompt,
          type: 'suggestions'
        }
      });

      if (error) throw error;
      
      if (Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
      } else if (data.suggestions.text) {
        setSuggestions([data.suggestions.text]);
      }
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-gray-700">{label}</Label>
      <div className="relative">
        <div className="flex gap-2">
          <Input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={className}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={getSuggestions}
            disabled={loading}
            className="px-3"
          >
            <Wand2 className="h-4 w-4" />
          </Button>
        </div>
        
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                onClick={() => selectSuggestion(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
