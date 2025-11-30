"use client";

import { useState, useEffect, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";

interface UseNotesResult {
  content: string;
  setContent: (value: string) => void;
  isLoading: boolean;
  isSaving: boolean;
}

export function useNotes(): UseNotesResult {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const debouncedContent = useDebounce(content, 1000);

  const saveNote = useCallback(async (text: string) => {
    setIsSaving(true);
    try {
      await fetch("/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: text }),
      });
    } catch (error) {
      console.error("Erro ao salvar nota:", error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  useEffect(() => {
    async function loadNote() {
      try {
        const response = await fetch("/api/notes");
        if (response.ok) {
          const data = await response.json();
          setContent(data.content || "");
        }
      } catch (error) {
        console.error("Erro ao carregar nota:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadNote();
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    saveNote(debouncedContent);
  }, [debouncedContent, isLoading, saveNote]);

  return { content, setContent, isLoading, isSaving };
}
