import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/prisma";
import { chatModel, parseModel } from "@/lib/gemini/config";
import {
  TRANSACTION_PARSER_PROMPT,
  GOAL_PARSER_PROMPT,
  ASSISTANT_SYSTEM_PROMPT,
} from "@/lib/gemini/prompts";

// Função helper para verificar se a meta atingiu o objetivo e atualizar o status
async function checkAndUpdateGoalStatus(goalId: string) {
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
  });

  if (!goal || goal.status === "COMPLETED") {
    return goal;
  }

  // Se o valor atual atingiu ou ultrapassou o objetivo, marcar como concluída
  if (Number(goal.currentAmount) >= Number(goal.targetAmount)) {
    return await prisma.goal.update({
      where: { id: goalId },
      data: { status: "COMPLETED" },
    });
  }

  return goal;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { message, history } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Mensagem obrigatória" },
        { status: 400 }
      );
    }

    // Salvar mensagem do usuário
    await prisma.chatMessage.create({
      data: {
        userId: session.user.id,
        role: "USER",
        content: message,
      },
    });

    // Verificar se é resposta a uma pergunta sobre criar meta (contexto)
    const recentMessages = await prisma.chatMessage.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3, // Pegar 3 últimas para ter certeza
    });

    // A última é a do usuário que acabamos de salvar, a penúltima é do bot
    const lastBotMessage = recentMessages[1]?.content || "";
    const isCreatingGoalContext = lastBotMessage.includes(
      "Quer que eu crie uma meta"
    );

    console.log("Context check:", { lastBotMessage, isCreatingGoalContext });

    // Se está respondendo sobre criar meta
    if (isCreatingGoalContext) {
      const hasConfirmation = /^(sim|1|criar|quero|\d+)/i.test(message.trim());
      const valueMatch = message.match(/(\d+)/);

      console.log("Creating goal:", { hasConfirmation, valueMatch });

      if (hasConfirmation && valueMatch) {
        // Extrair nome da meta da mensagem anterior do bot
        const goalNameMatch = lastBotMessage.match(/para "(\w+)"/i);
        const targetAmount = parseFloat(valueMatch[1]);

        console.log("Goal data:", { goalNameMatch, targetAmount });

        if (goalNameMatch && targetAmount > 0) {
          const goalName = goalNameMatch[1];

          // Criar a meta
          const goal = await prisma.goal.create({
            data: {
              userId: session.user.id,
              name: goalName,
              targetAmount: targetAmount,
              status: "ACTIVE",
            },
          });

          console.log("Goal created:", goal);

          // Verificar se havia uma reserva pendente (na mensagem antes da pergunta)
          const reservationMessage = recentMessages[2]?.content || "";
          const reservationInfo = extractReservationInfo(reservationMessage);

          console.log("Checking pending reservation:", {
            reservationMessage,
            reservationInfo,
          });

          // Se havia reserva pendente, processar agora
          if (
            reservationInfo &&
            reservationInfo.goalKeyword.toLowerCase() === goalName.toLowerCase()
          ) {
            // Calcular saldo
            const [income, expense] = await Promise.all([
              prisma.transaction.aggregate({
                where: { userId: session.user.id, type: "INCOME" },
                _sum: { amount: true },
              }),
              prisma.transaction.aggregate({
                where: { userId: session.user.id, type: "EXPENSE" },
                _sum: { amount: true },
              }),
            ]);

            const balance =
              Number(income._sum.amount || 0) -
              Number(expense._sum.amount || 0);
            const reservationAmount = reservationInfo.amount;

            // Se tem saldo suficiente, criar a transação
            if (balance >= reservationAmount) {
              const category = await prisma.category.findFirst({
                where: { name: "Outros" },
              });

              const transaction = await prisma.transaction.create({
                data: {
                  userId: session.user.id,
                  amount: reservationAmount,
                  type: "EXPENSE",
                  description: `Reserva para ${goal.name}`,
                  categoryId: category?.id,
                  goalId: goal.id,
                  date: new Date(),
                },
              });

              // Atualizar progresso da meta
              await prisma.goal.update({
                where: { id: goal.id },
                data: {
                  currentAmount: {
                    increment: reservationAmount,
                  },
                },
              });

              // Verificar se a meta foi concluída
              const updatedGoal = await checkAndUpdateGoalStatus(goal.id);

              const progress = (reservationAmount / targetAmount) * 100;

              const responseMessage = `🎯 Perfeito! Criei sua meta "${goalName}" com objetivo de R$ ${targetAmount.toFixed(
                2
              )}.\n\n✅ E já reservei R$ ${reservationAmount.toFixed(
                2
              )} para essa meta!\n\n📊 Progresso: ${progress.toFixed(
                0
              )}% • R$ ${reservationAmount.toFixed(
                2
              )} de R$ ${targetAmount.toFixed(2)}\n\nContinue assim! 💪`;

              await prisma.chatMessage.create({
                data: {
                  userId: session.user.id,
                  role: "ASSISTANT",
                  content: responseMessage,
                },
              });

              return NextResponse.json({
                message: responseMessage,
                goalCreated: true,
                transactionCreated: true,
                goal,
                transaction,
              });
            } else {
              // Saldo insuficiente após criar meta
              const responseMessage = `🎯 Meta "${goalName}" criada com objetivo de R$ ${targetAmount.toFixed(
                2
              )}!\n\n⚠️ Mas você não tem saldo suficiente para reservar R$ ${reservationAmount.toFixed(
                2
              )} agora. Seu saldo é R$ ${balance.toFixed(
                2
              )}.\n\nAssim que tiver saldo, diga: "Reservar [valor] para ${goalName}"`;

              await prisma.chatMessage.create({
                data: {
                  userId: session.user.id,
                  role: "ASSISTANT",
                  content: responseMessage,
                },
              });

              return NextResponse.json({
                message: responseMessage,
                goalCreated: true,
                goal,
              });
            }
          } else {
            // Sem reserva pendente, apenas confirmar criação da meta
            const responseMessage = `🎯 Perfeito! Criei sua meta "${goalName}" com objetivo de R$ ${targetAmount.toFixed(
              2
            )}.\n\nAgora você já pode fazer reservas para essa meta! 💪`;

            await prisma.chatMessage.create({
              data: {
                userId: session.user.id,
                role: "ASSISTANT",
                content: responseMessage,
              },
            });

            return NextResponse.json({
              message: responseMessage,
              goalCreated: true,
              goal,
            });
          }
        }
      }
    }

    // IMPORTANTE: Verificar na ordem de especificidade (mais específico primeiro)
    const isWithdrawal = detectWithdrawal(message);
    const isReservation = !isWithdrawal && detectReservation(message);
    const isGoal =
      !isWithdrawal && !isReservation && (await detectGoal(message));
    const isTransaction =
      !isWithdrawal &&
      !isReservation &&
      !isGoal &&
      (await detectTransaction(message));

    console.log("Detecção:", {
      message,
      isWithdrawal,
      isReservation,
      isGoal,
      isTransaction,
    });

    // Se for retirada de meta
    if (isWithdrawal) {
      const withdrawalInfo = extractWithdrawalInfo(message);

      console.log("Withdrawal Info:", withdrawalInfo);

      if (withdrawalInfo) {
        const { amount, goalKeyword } = withdrawalInfo;

        // Buscar meta relacionada
        const goal = await prisma.goal.findFirst({
          where: {
            userId: session.user.id,
            status: "ACTIVE",
            name: {
              contains: goalKeyword,
              mode: "insensitive",
            },
          },
        });

        if (!goal) {
          const responseMessage = `⚠️ Não encontrei uma meta ativa chamada "${goalKeyword}".`;

          await prisma.chatMessage.create({
            data: {
              userId: session.user.id,
              role: "ASSISTANT",
              content: responseMessage,
            },
          });

          return NextResponse.json({ message: responseMessage });
        }

        // Verificar se tem saldo suficiente na meta
        const currentAmount = Number(goal.currentAmount);

        if (currentAmount < amount) {
          const responseMessage = `⚠️ Você só tem R$ ${currentAmount.toFixed(
            2
          )} reservado na meta "${
            goal.name
          }".\n\nNão é possível retirar R$ ${amount.toFixed(2)}.`;

          await prisma.chatMessage.create({
            data: {
              userId: session.user.id,
              role: "ASSISTANT",
              content: responseMessage,
            },
          });

          return NextResponse.json({ message: responseMessage });
        }

        // Criar transação de retirada (receita)
        const category = await prisma.category.findFirst({
          where: { name: "Outros" },
        });

        const transaction = await prisma.transaction.create({
          data: {
            userId: session.user.id,
            amount: amount,
            type: "INCOME",
            description: `Retirada da meta ${goal.name}`,
            categoryId: category?.id,
            goalId: goal.id,
            date: new Date(),
          },
        });

        // Atualizar progresso da meta (decrementar)
        await prisma.goal.update({
          where: { id: goal.id },
          data: {
            currentAmount: {
              decrement: amount,
            },
          },
        });

        const newAmount = currentAmount - amount;
        const progress = (newAmount / Number(goal.targetAmount)) * 100;

        const responseMessage = `✅ Retirei R$ ${amount.toFixed(2)} da meta "${
          goal.name
        }".\n\n📊 Novo saldo da meta: R$ ${newAmount.toFixed(2)} de R$ ${Number(
          goal.targetAmount
        ).toFixed(2)} (${progress.toFixed(
          0
        )}%)\n\n💰 O valor voltou para seu saldo disponível!`;

        await prisma.chatMessage.create({
          data: {
            userId: session.user.id,
            role: "ASSISTANT",
            content: responseMessage,
          },
        });

        return NextResponse.json({
          message: responseMessage,
          transactionCreated: true,
          transaction,
        });
      } else {
        const responseMessage = `⚠️ Não consegui entender. Tente: "Retirar 400 da viagem"`;

        await prisma.chatMessage.create({
          data: {
            userId: session.user.id,
            role: "ASSISTANT",
            content: responseMessage,
          },
        });

        return NextResponse.json({ message: responseMessage });
      }
    }

    // Se for reserva para meta, processar com validação de saldo
    if (isReservation) {
      const reservationInfo = extractReservationInfo(message);

      console.log("Reservation Info:", reservationInfo);

      if (reservationInfo) {
        const { amount, goalKeyword } = reservationInfo;

        // Calcular saldo disponível
        const [income, expense] = await Promise.all([
          prisma.transaction.aggregate({
            where: { userId: session.user.id, type: "INCOME" },
            _sum: { amount: true },
          }),
          prisma.transaction.aggregate({
            where: { userId: session.user.id, type: "EXPENSE" },
            _sum: { amount: true },
          }),
        ]);

        const balance =
          Number(income._sum.amount || 0) - Number(expense._sum.amount || 0);

        // Buscar meta relacionada
        let goal = await prisma.goal.findFirst({
          where: {
            userId: session.user.id,
            status: "ACTIVE",
            name: {
              contains: goalKeyword,
              mode: "insensitive",
            },
          },
        });

        // Se não encontrar meta, sugerir criação
        if (!goal) {
          const responseMessage = `⚠️ Você está tentando reservar R$ ${amount.toFixed(
            2
          )} para "${goalKeyword}", mas não encontrei essa meta.\n\n💡 Quer que eu crie uma meta de "${goalKeyword}" agora?\n\nResponda:\n1️⃣ "Sim, criar meta de [valor]" (ex: Sim, criar meta de 5000)\n2️⃣ Ou simplesmente: "Quero juntar [valor] para ${goalKeyword}"`;

          await prisma.chatMessage.create({
            data: {
              userId: session.user.id,
              role: "ASSISTANT",
              content: responseMessage,
            },
          });

          return NextResponse.json({
            message: responseMessage,
            needsGoalCreation: true,
            suggestedGoal: goalKeyword,
            reservationAmount: amount,
          });
        }

        // Validar saldo disponível
        if (balance < amount) {
          const responseMessage = `⚠️ Você quer reservar R$ ${amount.toFixed(
            2
          )} para "${
            goal.name
          }", mas seu saldo atual é apenas R$ ${balance.toFixed(
            2
          )}.\n\n💡 Você precisa de mais R$ ${(amount - balance).toFixed(
            2
          )} para fazer essa reserva.\n\nDeseja:\n1️⃣ Reservar o valor disponível (R$ ${balance.toFixed(
            2
          )})\n2️⃣ Aguardar até ter o valor total\n\nResponda com o número da opção.`;

          await prisma.chatMessage.create({
            data: {
              userId: session.user.id,
              role: "ASSISTANT",
              content: responseMessage,
            },
          });

          return NextResponse.json({
            message: responseMessage,
            needsConfirmation: true,
            pendingReservation: {
              goalId: goal.id,
              goalName: goal.name,
              requestedAmount: amount,
              availableBalance: balance,
            },
          });
        }

        // Criar transação de reserva
        const category = await prisma.category.findFirst({
          where: { name: "Outros" },
        });

        const transaction = await prisma.transaction.create({
          data: {
            userId: session.user.id,
            amount: amount,
            type: "EXPENSE",
            description: `Reserva para ${goal.name}`,
            categoryId: category?.id,
            goalId: goal.id,
            date: new Date(),
          },
        });

        // Atualizar progresso da meta
        await prisma.goal.update({
          where: { id: goal.id },
          data: {
            currentAmount: {
              increment: amount,
            },
          },
        });

        // Verificar se a meta foi concluída
        const updatedGoal = await checkAndUpdateGoalStatus(goal.id);
        const isCompleted = updatedGoal?.status === "COMPLETED";

        const progress =
          ((Number(goal.currentAmount) + amount) / Number(goal.targetAmount)) *
          100;

        const responseMessage = isCompleted
          ? `🎉 PARABÉNS! Você concluiu sua meta "${
              goal.name
            }"! 🎊\n\n✅ Meta alcançada: R$ ${(
              Number(goal.currentAmount) + amount
            ).toFixed(2)} de R$ ${Number(goal.targetAmount).toFixed(
              2
            )}\n\n🏆 Objetivo conquistado! Continue assim! 💪`
          : `✅ Perfeito! Reservei R$ ${amount.toFixed(2)} para sua meta "${
              goal.name
            }".\n\n🎯 Progresso: ${progress.toFixed(0)}% • R$ ${(
              Number(goal.currentAmount) + amount
            ).toFixed(2)} de R$ ${Number(goal.targetAmount).toFixed(
              2
            )}\n\nContinue assim! 💪`;

        await prisma.chatMessage.create({
          data: {
            userId: session.user.id,
            role: "ASSISTANT",
            content: responseMessage,
          },
        });

        return NextResponse.json({
          message: responseMessage,
          transactionCreated: true,
          transaction,
        });
      } else {
        // Não conseguiu extrair informações da reserva
        const responseMessage = `⚠️ Não consegui entender sua reserva. Tente algo como:\n• "Reservei 500 para viagem"\n• "Guardei 100 para presente"\n• "Separei 1000 para carro"`;

        await prisma.chatMessage.create({
          data: {
            userId: session.user.id,
            role: "ASSISTANT",
            content: responseMessage,
          },
        });

        return NextResponse.json({ message: responseMessage });
      }
    }

    if (isTransaction) {
      // Processar como transação
      const transactionData = await parseTransaction(message);

      console.log("Transaction Data:", transactionData);

      if (transactionData) {
        // Se for despesa, verificar saldo disponível
        if (transactionData.type === "EXPENSE") {
          const [income, expense] = await Promise.all([
            prisma.transaction.aggregate({
              where: { userId: session.user.id, type: "INCOME" },
              _sum: { amount: true },
            }),
            prisma.transaction.aggregate({
              where: { userId: session.user.id, type: "EXPENSE" },
              _sum: { amount: true },
            }),
          ]);

          const balance =
            Number(income._sum.amount || 0) - Number(expense._sum.amount || 0);

          // Se não tiver saldo suficiente, perguntar ao usuário
          if (balance < transactionData.amount) {
            const responseMessage = `⚠️ Opa! Você está tentando gastar R$ ${transactionData.amount.toFixed(
              2
            )}, mas seu saldo atual é de R$ ${balance.toFixed(
              2
            )}.\n\nDeseja:\n1️⃣ Registrar mesmo assim (ficará com saldo negativo)\n2️⃣ Registrar apenas o valor disponível (R$ ${balance.toFixed(
              2
            )})\n3️⃣ Cancelar esta despesa\n\nResponda com o número da opção.`;

            await prisma.chatMessage.create({
              data: {
                userId: session.user.id,
                role: "ASSISTANT",
                content: responseMessage,
              },
            });

            return NextResponse.json({
              message: responseMessage,
              needsConfirmation: true,
              pendingTransaction: transactionData,
            });
          }
        }

        // Verificar se existe meta relacionada
        let linkedGoal = null;
        const goals = await prisma.goal.findMany({
          where: {
            userId: session.user.id,
            status: "ACTIVE",
          },
        });

        // Buscar meta por similaridade no nome
        for (const goal of goals) {
          const goalNameLower = goal.name.toLowerCase();
          const descLower = transactionData.description.toLowerCase();
          const msgLower = message.toLowerCase();

          if (
            descLower.includes(goalNameLower) ||
            msgLower.includes(goalNameLower)
          ) {
            linkedGoal = goal;
            break;
          }
        }

        // Buscar ou criar categoria
        let category = await prisma.category.findFirst({
          where: {
            name: transactionData.category,
            OR: [{ userId: null }, { userId: session.user.id }],
          },
        });

        if (!category) {
          category = await prisma.category.create({
            data: {
              name: transactionData.category,
              isCustom: false,
            },
          });
        }

        // Criar transação
        const transaction = await prisma.transaction.create({
          data: {
            userId: session.user.id,
            amount: transactionData.amount,
            type: transactionData.type,
            description: transactionData.description,
            categoryId: category.id,
            goalId: linkedGoal?.id,
            date: transactionData.date,
          },
        });

        // Se vinculou a uma meta e for despesa, atualizar progresso
        if (linkedGoal && transactionData.type === "EXPENSE") {
          await prisma.goal.update({
            where: { id: linkedGoal.id },
            data: {
              currentAmount: {
                increment: transactionData.amount,
              },
            },
          });

          // Verificar se a meta foi concluída
          await checkAndUpdateGoalStatus(linkedGoal.id);
        }

        const responseMessage = `✅ Entendi! Registrei ${
          transactionData.type === "EXPENSE" ? "uma despesa" : "uma receita"
        } de R$ ${transactionData.amount.toFixed(2)} em ${category.name}.${
          linkedGoal ? ` 🎯 Vinculei à sua meta "${linkedGoal.name}".` : ""
        }`;

        // Salvar resposta do assistente
        await prisma.chatMessage.create({
          data: {
            userId: session.user.id,
            role: "ASSISTANT",
            content: responseMessage,
          },
        });

        return NextResponse.json({
          message: responseMessage,
          transactionCreated: true,
          transaction,
        });
      } else {
        // Não conseguiu parsear a transação
        console.error("Falha ao parsear transação:", message);

        const responseMessage = `⚠️ Desculpe, não consegui processar essa transação. Pode tentar de outra forma? Por exemplo:\n• "Gastei 50 no mercado"\n• "Recebi 1000 de salário"\n• "Paguei 200 de conta de luz"`;

        await prisma.chatMessage.create({
          data: {
            userId: session.user.id,
            role: "ASSISTANT",
            content: responseMessage,
          },
        });

        return NextResponse.json({ message: responseMessage });
      }
    }

    // Verificar se é uma meta
    if (isGoal) {
      const goalData = await parseGoal(message);

      if (goalData) {
        // Verificar se já existe meta similar
        const existingGoal = await prisma.goal.findFirst({
          where: {
            userId: session.user.id,
            status: "ACTIVE",
            name: {
              contains: goalData.name,
              mode: "insensitive",
            },
          },
        });

        if (existingGoal) {
          const responseMessage = `ℹ️ Você já tem uma meta ativa chamada "${
            existingGoal.name
          }" de R$ ${Number(existingGoal.targetAmount).toFixed(
            2
          )}.\n\nQuer criar uma nova meta ou usar essa?`;

          await prisma.chatMessage.create({
            data: {
              userId: session.user.id,
              role: "ASSISTANT",
              content: responseMessage,
            },
          });

          return NextResponse.json({ message: responseMessage });
        }

        // Criar meta
        const goal = await prisma.goal.create({
          data: {
            userId: session.user.id,
            name: goalData.name,
            targetAmount: goalData.targetAmount,
            deadline: goalData.deadline,
            status: "ACTIVE",
          },
        });

        const responseMessage = `🎯 Que legal! Criei sua meta "${
          goalData.name
        }" com o objetivo de R$ ${goalData.targetAmount.toFixed(2)}${
          goalData.deadline
            ? ` até ${new Date(goalData.deadline).toLocaleDateString("pt-BR")}`
            : ""
        }. Vamos juntos alcançar esse objetivo! 💪`;

        // Salvar resposta do assistente
        await prisma.chatMessage.create({
          data: {
            userId: session.user.id,
            role: "ASSISTANT",
            content: responseMessage,
          },
        });

        return NextResponse.json({
          message: responseMessage,
          goalCreated: true,
          goal,
        });
      }
    }

    // Se não for transação nem meta, processar como conversa normal
    const response = await generateChatResponse(
      message,
      history,
      session.user.id
    );

    // Salvar resposta do assistente
    await prisma.chatMessage.create({
      data: {
        userId: session.user.id,
        role: "ASSISTANT",
        content: response,
      },
    });

    return NextResponse.json({ message: response, transactionCreated: false });
  } catch (error) {
    console.error("Erro no chat:", error);
    return NextResponse.json(
      { error: "Erro ao processar mensagem" },
      { status: 500 }
    );
  }
}

async function detectTransaction(message: string): Promise<boolean> {
  const transactionKeywords = [
    "gastei",
    "paguei",
    "pagou",
    "comprei",
    "comprou",
    "recebi",
    "recebeu",
    "ganhei",
    "ganhou",
    "salário",
    "despesa",
    "receita",
    "pagar",
    "receber",
  ];

  const lowerMessage = message.toLowerCase();

  // Não deve começar com verbos de reserva
  const hasReservationVerb = /^(reservei|guardei|separei|quero)/i.test(
    message.trim()
  );

  if (hasReservationVerb) return false;

  return transactionKeywords.some((keyword) => lowerMessage.includes(keyword));
}

async function detectGoal(message: string): Promise<boolean> {
  const goalKeywords = [
    "meta",
    "objetivo",
    "economizar",
    "poupar",
    "quero juntar", // Frase completa para meta
    "planejar",
    "sonho",
  ];

  const lowerMessage = message.toLowerCase();

  // Deve ter palavra-chave de meta E valor numérico alto (indicando objetivo futuro)
  // Não deve começar com verbos de ação completada (reservei, guardei)
  const hasGoalWord = goalKeywords.some((keyword) =>
    lowerMessage.includes(keyword)
  );

  const hasActionVerb = /^(reservei|guardei|separei|coloquei)/i.test(
    message.trim()
  );

  return hasGoalWord && !hasActionVerb;
}

function detectReservation(message: string): boolean {
  const reservationKeywords = [
    "reserve",
    "reservar",
    "reservei",
    "separe",
    "separar",
    "separei",
    "guarde",
    "guardar",
    "guardei",
  ];

  const lowerMessage = message.toLowerCase();

  // Deve conter palavra de reserva E ter um valor numérico E mencionar destino
  const hasReservationWord = reservationKeywords.some((keyword) =>
    lowerMessage.includes(keyword)
  );
  const hasAmount = /\d+/.test(message);
  const hasDestination = /(?:para|pra|na|no|da|do)\s+\w+/i.test(message);

  return hasReservationWord && hasAmount && hasDestination;
}

function extractReservationInfo(message: string): {
  amount: number;
  goalKeyword: string;
} | null {
  // Extrair valor (procura por padrões como "500", "1000", "50.00", etc)
  const amountMatch = message.match(/(\d+(?:[.,]\d{1,2})?)/);
  if (!amountMatch) {
    console.log("extractReservationInfo: Valor não encontrado");
    return null;
  }

  const amount = parseFloat(amountMatch[1].replace(",", "."));

  // Extrair palavra-chave da meta (múltiplos padrões)
  // Padrões: "para viagem", "pra troca de carro", "para a meta casa", etc
  // Captura múltiplas palavras até pontuação ou fim da frase
  const patterns = [
    /(?:para|pra)\s+(?:a\s+)?(?:meta\s+)?(?:de\s+)?([\w\s]+?)(?=[.,!?]|$)/i,
    /(?:na|no)\s+(?:meta\s+)?([\w\s]+?)(?=[.,!?]|$)/i,
    /(?:da|do)\s+([\w\s]+?)(?=[.,!?]|$)/i,
  ];

  let goalKeyword = null;
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      goalKeyword = match[1].trim().toLowerCase();
      break;
    }
  }

  if (!goalKeyword) {
    console.log("extractReservationInfo: Palavra-chave da meta não encontrada");
    return null;
  }

  console.log("extractReservationInfo: Sucesso!", { amount, goalKeyword });
  return { amount, goalKeyword };
}

function detectWithdrawal(message: string): boolean {
  const withdrawalKeywords = [
    "retirar",
    "retirei",
    "retire",
    "sacar",
    "saquei",
    "saque",
    "pegar",
    "peguei",
    "pegue",
  ];

  const lowerMessage = message.toLowerCase();

  // Deve conter palavra de retirada E ter um valor numérico E mencionar origem (da/do meta)
  const hasWithdrawalWord = withdrawalKeywords.some((keyword) =>
    lowerMessage.includes(keyword)
  );
  const hasAmount = /\d+/.test(message);
  const hasOrigin = /(?:da|do)\s+\w+/i.test(message);

  return hasWithdrawalWord && hasAmount && hasOrigin;
}

function extractWithdrawalInfo(message: string): {
  amount: number;
  goalKeyword: string;
} | null {
  // Extrair valor (procura por padrões como "500", "1000", "50.00", etc)
  const amountMatch = message.match(/(\d+(?:[.,]\d{1,2})?)/);
  if (!amountMatch) {
    console.log("extractWithdrawalInfo: Valor não encontrado");
    return null;
  }

  const amount = parseFloat(amountMatch[1].replace(",", "."));

  // Extrair palavra-chave da meta (padrões para retirada: "da viagem", "do carro", etc)
  // Captura múltiplas palavras até pontuação ou fim da frase
  const patterns = [
    /(?:da|do)\s+(?:meta\s+)?(?:de\s+)?([\w\s]+?)(?=[.,!?]|$)/i,
    /(?:da|do)\s+(?:reserva\s+)?(?:da\s+)?([\w\s]+?)(?=[.,!?]|$)/i,
  ];

  let goalKeyword = null;
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      goalKeyword = match[1].trim().toLowerCase();
      break;
    }
  }

  if (!goalKeyword) {
    console.log("extractWithdrawalInfo: Palavra-chave da meta não encontrada");
    return null;
  }

  console.log("extractWithdrawalInfo: Sucesso!", { amount, goalKeyword });
  return { amount, goalKeyword };
}

async function parseTransaction(message: string) {
  try {
    console.log("=== PARSE TRANSACTION ===");
    console.log("Input message:", message);

    const prompt = TRANSACTION_PARSER_PROMPT.replace("{userMessage}", message);
    console.log("Prompt:", prompt);

    const result = await parseModel.generateContent(prompt);
    const response = result.response.text();
    console.log("Gemini raw response:", response);

    // Remover markdown e espaços em branco
    let jsonText = response
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    console.log("JSON text after cleanup:", jsonText);

    // Se estiver vazio, retornar null
    if (!jsonText) {
      console.error("Resposta vazia do Gemini");
      return null;
    }

    // Tentar corrigir JSON incompleto (Gemini às vezes corta a resposta)
    if (!jsonText.endsWith("}")) {
      jsonText += '\n  "date": "today"\n}';
      console.log("JSON corrigido:", jsonText);
    }

    const parsed = JSON.parse(jsonText);
    console.log("Parsed JSON:", parsed);

    // Validar campos obrigatórios
    if (!parsed.amount || !parsed.type || !parsed.description) {
      console.error("Campos obrigatórios faltando:", parsed);
      return null;
    }

    // Validar que amount é um número válido
    const amount = parseFloat(parsed.amount);
    if (isNaN(amount) || amount <= 0) {
      console.error("Valor inválido:", parsed.amount);
      return null;
    }

    // Processar data
    let date = new Date();
    if (parsed.date === "yesterday") {
      date = new Date(Date.now() - 24 * 60 * 60 * 1000);
    } else if (parsed.date !== "today" && parsed.date) {
      date = new Date(parsed.date);
    }

    return {
      amount: amount,
      type: parsed.type as "INCOME" | "EXPENSE",
      description: parsed.description,
      category: parsed.category || "Outros",
      date,
    };
  } catch (error) {
    console.error("Erro ao fazer parse da transação:", error);
    return null;
  }
}

async function parseGoal(message: string) {
  try {
    const prompt = GOAL_PARSER_PROMPT.replace("{userMessage}", message);
    const result = await parseModel.generateContent(prompt);
    const response = result.response.text();

    // Remover markdown e espaços em branco
    let jsonText = response
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Se estiver vazio, retornar null
    if (!jsonText) {
      return null;
    }

    const parsed = JSON.parse(jsonText);

    // Validar campos obrigatórios
    if (!parsed.name || !parsed.targetAmount) {
      return null;
    }

    return {
      name: parsed.name,
      targetAmount: parseFloat(parsed.targetAmount),
      deadline: parsed.deadline ? new Date(parsed.deadline) : null,
    };
  } catch (error) {
    console.error("Erro ao fazer parse da meta:", error);
    return null;
  }
}

async function generateChatResponse(
  message: string,
  history: any[],
  userId: string
): Promise<string> {
  try {
    // Buscar dados financeiros do usuário
    const [income, expense, goalsCount] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId,
          type: "INCOME",
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          userId,
          type: "EXPENSE",
          date: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { amount: true },
      }),
      prisma.goal.count({
        where: {
          userId,
          status: "ACTIVE",
        },
      }),
    ]);

    const totalIncome = Number(income._sum.amount) || 0;
    const totalExpense = Number(expense._sum.amount) || 0;
    const balance = totalIncome - totalExpense;

    // Preparar contexto
    const systemPrompt = ASSISTANT_SYSTEM_PROMPT.replace(
      "{currentBalance}",
      balance.toFixed(2)
    )
      .replace("{monthExpenses}", totalExpense.toFixed(2))
      .replace("{monthIncome}", totalIncome.toFixed(2))
      .replace("{activeGoals}", goalsCount.toString());

    // Construir histórico de conversa
    const conversationHistory = history
      .slice(-5)
      .map(
        (msg: any) =>
          `${msg.role === "user" ? "Usuário" : "Assistente"}: ${msg.content}`
      )
      .join("\n");

    const fullPrompt = `${systemPrompt}\n\nHistórico recente:\n${conversationHistory}\n\nUsuário: ${message}\n\nAssistente:`;

    const result = await chatModel.generateContent(fullPrompt);
    return result.response.text();
  } catch (error) {
    console.error("Erro ao gerar resposta:", error);
    return "Desculpe, tive um problema ao processar sua mensagem. Pode tentar novamente?";
  }
}
