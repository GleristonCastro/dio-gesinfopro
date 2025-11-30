"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Lightbulb,
  TrendingUp,
  AlertCircle,
  Target,
  Sparkles,
  Loader2,
} from "lucide-react";

interface Insights {
  summary: string;
  highlights: string[];
  concerns: string[];
  recommendations: string[];
  forecast: string;
}

interface FinancialInsightsProps {
  months: number;
}

export function FinancialInsights({ months }: FinancialInsightsProps) {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, [months]);

  const fetchInsights = async () => {
    setLoading(true);
    setError(false);

    try {
      const res = await fetch(`/api/reports/insights?months=${months}`);
      if (res.ok) {
        const data = await res.json();
        setInsights(data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error("Error fetching insights:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Insights Financeiros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <span className="ml-3 text-gray-600 dark:text-gray-400">
              Analisando seus dados financeiros...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !insights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Insights Financeiros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">
            Não foi possível gerar insights no momento. Tente novamente mais
            tarde.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-200 dark:border-purple-800">
      <CardHeader className="bg-linear-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          Insights Financeiros Inteligentes
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Análise automática gerada por IA
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Resumo */}
        <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800">
          <p className="text-gray-700 dark:text-gray-300">{insights.summary}</p>
        </div>

        {/* Pontos Positivos */}
        {insights.highlights.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-green-700 dark:text-green-400 mb-3">
              <TrendingUp className="h-5 w-5" />
              Pontos Positivos
            </h3>
            <ul className="space-y-2">
              {insights.highlights.map((highlight, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                >
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pontos de Atenção */}
        {insights.concerns.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-orange-700 dark:text-orange-400 mb-3">
              <AlertCircle className="h-5 w-5" />
              Pontos de Atenção
            </h3>
            <ul className="space-y-2">
              {insights.concerns.map((concern, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                >
                  <span className="text-orange-500 mt-0.5">!</span>
                  <span>{concern}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recomendações */}
        {insights.recommendations.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-400 mb-3">
              <Lightbulb className="h-5 w-5" />
              Recomendações
            </h3>
            <ul className="space-y-2">
              {insights.recommendations.map((recommendation, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-gray-700 dark:text-gray-300"
                >
                  <span className="text-blue-500 mt-0.5">→</span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Previsão */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-400 mb-2">
            <Target className="h-5 w-5" />
            Previsão
          </h3>
          <p className="text-gray-700 dark:text-gray-300">
            {insights.forecast}
          </p>
        </div>

        <p className="text-xs text-center text-gray-500 pt-2">
          💡 Os insights são gerados automaticamente com base nos seus dados
          financeiros
        </p>
      </CardContent>
    </Card>
  );
}
