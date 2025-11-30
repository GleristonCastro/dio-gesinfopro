"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StickyNote, Loader2 } from "lucide-react";
import { useNotes } from "@/hooks/use-notes";

export function NotesWidget() {
  const { content, setContent, isLoading, isSaving } = useNotes();

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-yellow-600" />
            <CardTitle className="text-base">Bloco de Notas</CardTitle>
          </div>
          {isSaving && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Salvando...
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
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
