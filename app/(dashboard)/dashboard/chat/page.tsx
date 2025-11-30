"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Send, Bot, User } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Olá! 👋 Sou o FinBot, seu assistente financeiro. Como posso te ajudar hoje? Você pode me contar sobre suas despesas, receitas ou perguntar sobre suas finanças!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          history: messages.slice(-10), // Últimas 10 mensagens para contexto
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar mensagem");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Se foi criada uma transação, recarregar a página para atualizar o dashboard
      if (data.transactionCreated) {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    "Gastei 50 reais no mercado",
    "Quanto gastei este mês?",
    "Recebi meu salário de 3000 reais",
    "Criar uma meta de economia",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
          Chat com FinBot
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Converse naturalmente sobre suas finanças
        </p>
      </div>

      <Card className="flex-1 flex flex-col bg-linear-to-br from-white/50 to-gray-50/30 dark:from-gray-900/40 dark:to-gray-950/60 backdrop-blur-sm border-white/20 dark:border-gray-800/50 shadow-xl overflow-hidden">
        <CardHeader className="pb-3 shrink-0 border-b border-white/10 dark:border-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600 text-white shadow-lg">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold bg-linear-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Conversa com FinBot
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                Digite suas transações ou faça perguntas sobre suas finanças
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-6 space-y-4 overflow-hidden">
          {/* Área de mensagens */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500/20 to-purple-600/20 dark:from-blue-500/30 dark:to-purple-600/30 text-blue-600 dark:text-blue-400">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`rounded-lg px-4 py-2.5 max-w-[80%] shadow-sm ${
                    message.role === "user"
                      ? "bg-linear-to-br from-blue-500 to-purple-600 text-white shadow-md"
                      : "bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 backdrop-blur-sm border border-gray-300 dark:border-gray-700/50"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <span
                    className={`text-xs mt-1 block ${
                      message.role === "user"
                        ? "opacity-80"
                        : "opacity-60 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {message.role === "user" && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 text-gray-700 dark:text-gray-300">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-blue-500/20 to-purple-600/20 dark:from-blue-500/30 dark:to-purple-600/30 text-blue-600 dark:text-blue-400">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-lg px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-300 dark:border-gray-700/50">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Ações rápidas */}
          {messages.length === 1 && (
            <div className="space-y-2 shrink-0">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Sugestões:
              </p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setInput(action)}
                    className="text-xs bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-800/70 text-gray-700 dark:text-gray-300 backdrop-blur-sm"
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Formulário de input */}
          <form onSubmit={handleSubmit} className="flex gap-2 shrink-0">
            <label htmlFor="chat-page-input" className="sr-only">
              Digite sua mensagem
            </label>
            <Input
              id="chat-page-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              disabled={isLoading}
              className="flex-1 bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50"
              autoFocus
              aria-label="Campo de mensagem do chat"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Enviar mensagem"
              className="bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-md"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Enviar</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
