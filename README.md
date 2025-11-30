# 💸 GesFinPro - Assistente Financeiro Conversacional

> App de organização financeira pessoal que funciona através de conversas em linguagem natural.

Este projeto foi desenvolvido com base em princípios de **Design Universal**, tornando o controle financeiro mais intuitivo, acessível e livre de burocracias como planilhas ou formulários complexos.

## 📝 Visão Geral

Criar um aplicativo de organização de finanças pessoais que funcione por meio de conversas em linguagem natural.  
O objetivo é tornar o controle financeiro mais intuitivo, acessível e livre de burocracias como planilhas ou formulários complexos.

### Problema a Resolver

Muitas pessoas abandonam o controle financeiro por acharem os aplicativos atuais complicados, exigindo entradas manuais e oferecendo pouca personalização.  
Queremos resolver isso com uma experiência conversacional fluida e recomendações automáticas que se adaptam ao perfil do usuário.

### Público-Alvo

Pessoas que desejam começar a organizar suas finanças de forma prática e sem complicações — especialmente iniciantes que não têm familiaridade com apps financeiros tradicionais.

## 🚀 Stack Tecnológica

- **Frontend**: Next.js 15+ (App Router), React 19, TypeScript
- **Estilização**: Tailwind CSS v4, shadcn/ui
- **Backend**: Next.js API Routes, Server Actions
- **Banco de Dados**: PostgreSQL, Prisma ORM
- **Autenticação**: Better Auth
- **IA**: Google Gemini API
- **Validação**: Zod

## 📋 Pré-requisitos

- Node.js 20+
- PostgreSQL instalado e rodando
- Conta no Google AI Studio (para Gemini API)

## ⚙️ Configuração

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd gesfinpro
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo `.env.local.example` para `.env.local` ou `.env` e preencha as variáveis:

```bash
cp .env.local.example .env.local
```

Edite `.env.local`:

```env
# Database - Configure sua string de conexão PostgreSQL
DATABASE_URL="postgresql://usuario:senha@localhost:5432/gesfinpro?schema=public"

# Better Auth - Gere um secret com: openssl rand -base64 32
BETTER_AUTH_SECRET="seu-secret-aleatorio-aqui"
BETTER_AUTH_URL="http://localhost:3000"

# Google Gemini API - Obtenha em: https://makersuite.google.com/app/apikey
GEMINI_API_KEY="sua-chave-gemini-api"

# Brave Search (Opcional)
BRAVE_SEARCH_API_KEY="sua-chave-brave-search-api"
```

### 4. Configure o banco de dados

```bash
# Gerar o Prisma Client
npm run db:generate

# Criar as tabelas no banco
npm run db:push

# Ou usar migrations (recomendado para produção)
npm run db:migrate
```

### 5. Execute o servidor de desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 🗂️ Estrutura do Projeto

```
gesfinpro/
├── app/
│   ├── (auth)/              # Rotas de autenticação
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/         # Rotas protegidas
│   │   ├── dashboard/       # Página principal
│   │   ├── chat/            # Chat com IA
│   │   ├── goals/           # Metas financeiras
│   │   ├── reports/         # Relatórios
│   │   └── settings/        # Configurações
│   ├── api/                 # API Routes
│   │   └── auth/            # Better Auth
│   └── layout.tsx
├── components/
│   ├── ui/                  # Componentes shadcn/ui
│   └── dashboard/           # Componentes do dashboard
├── lib/
│   ├── auth/                # Configuração Better Auth
│   ├── gemini/              # Integração Gemini API
│   ├── prisma.ts            # Cliente Prisma
│   └── utils.ts             # Utilidades
├── prisma/
│   └── schema.prisma        # Schema do banco de dados
└── package.json
```

## 🎯 Funcionalidades Implementadas

### 1. 💳 Dashboard Financeiro

Exibe um panorama claro das finanças pessoais:

- **Receitas**: Total de ganhos registrados
- **Despesas**: Total de gastos (excluindo reservas)
- **Reservas**: Dinheiro separado em metas
- **Saldo**: Diferença entre receitas, despesas e reservas
- Interface simples e direta com cards informativos

### 2. 🤖 Assistente Financeiro (FinBot)

- Personagem conversacional que interage com o usuário
- Registra transações via linguagem natural
- Detecta automaticamente tipo de transação (receita/despesa)
- Classifica transações em categorias
- Oferece suporte e motivação

### 3. 💬 Registro de Transações via Chat

- Campo de entrada para mensagens em linguagem natural
- Exemplos: "Gastei 50 no mercado", "Cliente João pagou 500", "Recebi salário de 3000"
- Detecção inteligente de:
  - Valores (inclusive "mil" = 1000)
  - Tipo (INCOME/EXPENSE)
  - Descrição e categoria automática
  - Datas (hoje, ontem, etc)

### 4. 🎯 Metas Financeiras

- Criação de metas via conversa natural
- Sistema de reservas: separe dinheiro para suas metas
- Sistema de retiradas: retire dinheiro das reservas quando precisar
- Acompanhamento visual com barras de progresso
- Lista de transações vinculadas a cada meta
- Grid responsivo (2 colunas em desktop)
- Modal com histórico completo de transações

### 5. 📊 Transações Recentes

- Lista das 5 últimas movimentações
- Ícones diferenciados:
  - 🟢 Seta para cima = Receita (verde)
  - 🔵 Cofrinho = Reserva para meta (azul)
  - 🔴 Seta para baixo = Despesa (vermelho)
- Mostra categoria, data e valor

### 6. 📝 Bloco de Notas

- Widget lateral para anotações livres
- Salvamento automático (debounce de 1 segundo)
- Persistência no banco de dados
- Indicador visual de salvamento

### 7. 🎨 Design Universal

Interface acessível e inclusiva:

- Linguagem simples e clara
- Navegação intuitiva
- Feedback visual e auditivo
- Tema dark/light
- Layout responsivo
- Componentes shadcn/ui com acessibilidade

### 8. 🔐 Sistema de Autenticação

- Login e registro com Better Auth
- Proteção de rotas
- Sessões seguras
- Hash de senhas

## 📝 Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia servidor de produção
npm run lint         # Executa o linter
npm run db:generate  # Gera o Prisma Client
npm run db:push      # Sincroniza schema com o banco
npm run db:migrate   # Cria e aplica migrations
npm run db:studio    # Abre Prisma Studio
```

## 🌐 Variáveis de Ambiente

| Variável               | Descrição                    | Obrigatória |
| ---------------------- | ---------------------------- | ----------- |
| `DATABASE_URL`         | String de conexão PostgreSQL | Sim         |
| `BETTER_AUTH_SECRET`   | Secret para Better Auth      | Sim         |
| `BETTER_AUTH_URL`      | URL base da aplicação        | Sim         |
| `GEMINI_API_KEY`       | Chave API do Google Gemini   | Sim         |
| `BRAVE_SEARCH_API_KEY` | Chave API Brave Search       | Não         |

## 🔒 Segurança

- Senhas hash com Better Auth
- CSRF protection habilitada
- SQL injection prevention via Prisma
- XSS protection com validação Zod
- Variáveis de ambiente nunca expostas no client

## 📚 Documentação Adicional

- [PRD Completo](./initial_PRD.md) - Product Requirements Document
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Better Auth Docs](https://www.better-auth.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Google Gemini API](https://ai.google.dev/gemini-api/docs)

## 🧠 Reflexões sobre IA Generativa

### O que funcionou bem?

- A integração do Gemini API com `responseMimeType: "application/json"` garante respostas estruturadas
- Uso de detecção interna (regex) para validações simples economiza chamadas de API
- Context-aware: o chat lembra das últimas 3 mensagens para entender o contexto
- Prompts específicos e concisos geram melhores resultados

### Desafios Enfrentados

- **JSON incompleto**: Gemini às vezes cortava a resposta; solução: adicionar correção automática
- **Detecção de intenção**: Precisou de ordem de prioridade (withdrawal → reservation → goal → transaction)
- **Ambiguidade**: "pagou" pode ser "eu paguei" ou "me pagaram"; solução: prompt detalhado com exemplos

### Aprendizados

- Quanto mais específico o prompt, melhor o resultado
- Validação e fallbacks são essenciais ao trabalhar com IA
- Combinar IA (parsing complexo) com lógica tradicional (detecção simples) é mais eficiente
- Logs detalhados são cruciais para debug de integrações com LLMs

## 🎯 Próximos Passos

- [ ] Relatórios com gráficos (Chart.js/Recharts)
- [ ] Filtros por período (mês, ano)
- [ ] Categorias customizáveis pelo usuário
- [ ] Exportação de dados (CSV, PDF)
- [ ] Notificações de metas próximas ao objetivo
- [ ] Análise de padrões de gastos com IA
- [ ] Sugestões proativas de economia
- [ ] Integração com bancos (Open Banking)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 👨‍💻 Autor

Gleriston Castro e Desenvolvido com ❤️ utilizando IA Generativa e boas práticas de desenvolvimento.

## 📄 Licença

Este projeto está sob a licença MIT.

---

⭐ Se este projeto foi útil, considere dar uma estrela no repositório!
