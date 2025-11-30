"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StickyNote, Loader2 } from "lucide-react";
import { useNotes } from "@/hooks/use-notes";

export function NotesWidget() {
  const { content, setContent, isLoading, isSaving } = useNotes();

  return (
    <Card className="h-full bg-white dark:bg-linear-to-br dark:from-gray-900/90 dark:to-gray-950/80 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 shadow-2xl hover:shadow-3xl transition-all duration-300">
      <CardHeader className="pb-3 border-b border-gray-200 dark:border-gray-800/50 bg-gray-50 dark:bg-linear-to-r dark:from-yellow-600/10 dark:to-amber-600/10 dark:from-yellow-500/20 dark:to-amber-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <CardTitle className="text-base bg-gradient-to-r from-yellow-600 to-amber-600 dark:from-yellow-400 dark:to-amber-400 bg-clip-text text-transparent">
              Bloco de Notas
            </CardTitle>
          </div>
          {isSaving && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Salvando...
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-[200px]">
            <Loader2
              className="h-6 w-6 animate-spin text-muted-foreground"
              aria-hidden="true"
            />
          </div>
        ) : (
          <>
            <label htmlFor="notes-textarea" className="sr-only">
              Digite suas anotações
            </label>
            <textarea
              id="notes-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Digite suas anotações aqui... 📝"
              className="w-full h-[200px] p-3 rounded-lg border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
