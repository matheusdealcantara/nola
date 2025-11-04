# Documentação de Arquitetura - Nola Analytics

## Índice

1. [Visão Geral](#visão-geral)
2. [Decisões Arquiteturais](#decisões-arquiteturais)
3. [Stack Tecnológica](#stack-tecnológica)
4. [Estrutura do Projeto](#estrutura-do-projeto)
5. [Fluxo de Dados](#fluxo-de-dados)
6. [Considerações de Performance](#considerações-de-performance)

## Visão Geral

O Nola Analytics é uma plataforma de análise de dados desenvolvida para fornecer insights sobre vendas, produtos, clientes e operações de e-commerce. O projeto foi estruturado como uma aplicação monolítica com front-end e back-end integrados, priorizando manutenibilidade e confiabilidade.

### Objetivo

Criar uma interface não-técnica e intuitiva para visualização e análise de dados de vendas, permitindo que usuários de negócio tomem decisões baseadas em dados sem necessidade de conhecimento técnico.

## Decisões Arquiteturais

### 1. Arquitetura Monolítica

**Decisão:** Implementação de uma arquitetura monolítica com componentes claramente separados.

**Justificativa:**

- **Contexto de Uso:** Aplicação de uso interno sem expectativa de alto volume de requisições simultâneas
- **Manutenibilidade:** Facilita a manutenção do código com todos os componentes em um único repositório
- **Confiabilidade:** Reduz pontos de falha ao eliminar comunicação entre múltiplos serviços
- **Simplicidade:** Deployment simplificado com uma única aplicação
- **Desenvolvimento Ágil:** Facilita mudanças que atravessam front-end e back-end
- **Debugging:** Rastreamento de erros mais simples em ambiente unificado

**Trade-offs Considerados:**

- ✅ Menor complexidade operacional
- ✅ Melhor performance (sem overhead de rede entre serviços)
- ✅ Transações mais simples
- ⚠️ Escalabilidade horizontal limitada (aceitável para uso interno)
- ⚠️ Deploy all-or-nothing (mitigado por baixa frequência de deploys)

### 2. Ecossistema JavaScript

**Decisão:** Utilização de JavaScript/TypeScript em todas as camadas da aplicação.

**Justificativa:**

- **Compatibilidade:** Compartilhamento de tipos e modelos entre front-end e back-end
- **Processamento Assíncrono:** JavaScript possui excelente suporte nativo para operações assíncronas via async/await
- **Ecossistema Rico:** Ampla disponibilidade de bibliotecas e frameworks maduros
- **Curva de Aprendizado:** Equipe única pode trabalhar em toda a stack
- **Performance:** Node.js oferece ótima performance para I/O-bound operations (queries ao banco)
- **JSON Nativo:** Manipulação natural de dados JSON, comum em APIs modernas

**Vantagens Técnicas:**

```typescript
// Compartilhamento de tipos entre front-end e back-end
interface MetricData {
  value: number;
  change: number;
  label: string;
}

// Processamento assíncrono eficiente
async function fetchAnalytics() {
  const [sales, customers, revenue] = await Promise.all([
    getSales(),
    getCustomers(),
    getRevenue(),
  ]);
}
```

### 3. CubeJS como Framework de Analytics

**Decisão:** Implementação do Cube.js como camada de analytics e agregação de dados.

**Justificativa:**

- **Semântica de Negócio:** Definição de dimensões e métricas em modelos reutilizáveis
- **Cache Inteligente:** Sistema de cache pré-agregado que melhora drasticamente a performance
- **Query Optimization:** Otimização automática de queries SQL complexas
- **API Unificada:** Interface consistente para diferentes tipos de visualizações
- **Segurança:** Controle de acesso a dados em nível de schema
- **Separação de Conceitos:** Lógica de analytics isolada da lógica de aplicação

**Estrutura de Cubes:**

```javascript
// apps/backend/model/cubes/sales.js
cube(`Sales`, {
  sql: `SELECT * FROM sales`,

  dimensions: {
    id: {
      sql: `id`,
      type: `number`,
      primaryKey: true,
    },
    createdAt: {
      sql: `created_at`,
      type: `time`,
    },
  },

  measures: {
    count: {
      type: `count`,
    },
    totalAmount: {
      sql: `total_amount`,
      type: `sum`,
    },
  },
});
```

**Benefícios:**

- 📊 **Pré-agregações:** Reduz tempo de query de segundos para milissegundos
- 🔄 **Refresh Incremental:** Atualização eficiente de dados agregados
- 🎯 **Métricas Consistentes:** Garantia de cálculos padronizados em toda aplicação
- 🚀 **Performance:** Cache multi-layer (Redis + Database)

### 4. NestJS para Back-end

**Decisão:** Utilização do framework NestJS para construção do back-end.

**Justificativa:**

- **Arquitetura Robusta:** Estrutura baseada em módulos, injetção de dependências e decorators
- **TypeScript First:** Tipagem forte e suporte completo ao TypeScript
- **Desenvolvimento Veloz:** CLI poderosa para geração de código boilerplate
- **Testabilidade:** Estrutura preparada para testes unitários e e2e
- **Documentação:** Geração automática de documentação com Swagger
- **Escalabilidade:** Arquitetura preparada para crescimento futuro
- **Integração:** Suporte nativo para diversos ORMs, WebSockets, GraphQL, etc.

**Estrutura Modular:**

```typescript
// apps/backend/src/analytics/analytics.module.ts
@Module({
  imports: [HttpModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
```

**Vantagens:**

- 🏗️ **Arquitetura Limpa:** Separação clara de responsabilidades
- 💉 **Dependency Injection:** Facilita testes e manutenção
- 🛡️ **Guards & Interceptors:** Middleware robusto para autenticação e transformação
- 📝 **Decorators:** Código mais limpo e declarativo
- 🔧 **CLI Produtiva:** `nest generate` acelera desenvolvimento

### 5. Next.js para Front-end

**Decisão:** Utilização do Next.js com React para desenvolvimento do front-end.

**Justificativa:**

- **Roteamento Simplificado:** Sistema de file-based routing intuitivo
- **Server Components:** Renderização no servidor para melhor performance
- **SEO Ready:** Server-side rendering out-of-the-box
- **Developer Experience:** Hot reload, TypeScript support, otimização automática
- **Performance:** Otimizações automáticas de imagens, fonts e bundles
- **Interface Não-Técnica:** React permite criar componentes reutilizáveis e interativos

**Estrutura de Rotas:**

```
src/app/
├── page.tsx                          # Dashboard principal
├── analytics/
│   ├── page.tsx                     # Overview de analytics
│   ├── [dataSourceId]/
│   │   └── page.tsx                 # Detalhes de fonte de dados
│   └── relationships/
│       └── page.tsx                 # Visualização de relacionamentos
```

**Componentes Reutilizáveis:**

```typescript
// Componentes específicos de analytics
<MetricCard title="Total Sales" value={1000} change={5.2} />
<TimeFrameSelector onSelect={handleTimeframe} />
<BarChart data={salesData} />
```

**Benefícios:**

- 🎨 **UI/UX Moderna:** Interfaces responsivas e interativas
- 📱 **Mobile-First:** Design adaptável para diferentes dispositivos
- ⚡ **Fast Refresh:** Desenvolvimento ágil com feedback instantâneo
- 🎯 **Type Safety:** TypeScript em componentes e rotas
- 📦 **Code Splitting:** Carregamento otimizado por rota

## Stack Tecnológica

### Back-end

- **Runtime:** Node.js 18+
- **Framework:** NestJS 10.x
- **Analytics Engine:** Cube.js 0.35+
- **Language:** TypeScript 5.x
- **Database:** PostgreSQL 15+

### Front-end

- **Framework:** Next.js 14.x (App Router)
- **UI Library:** React 18.x
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS
- **Charts:** Recharts / Chart.js

### DevOps

- **Container:** Docker
- **Orchestration:** Docker Compose
- **Package Manager:** npm workspaces

## Estrutura do Projeto

```
nola/
├── apps/
│   ├── backend/                    # Aplicação NestJS
│   │   ├── model/                  # Cube.js models
│   │   │   ├── cubes/             # Definições de dimensões e métricas
│   │   │   └── views/             # Views agregadas
│   │   ├── schema/                # Schemas Cube.js legados
│   │   └── src/                   # Código fonte NestJS
│   │       ├── analytics/         # Módulo de analytics
│   │       └── main.ts           # Entry point
│   │
│   └── frontend/                   # Aplicação Next.js
│       └── src/
│           ├── app/               # App Router (Next.js 14)
│           ├── components/        # Componentes React
│           └── lib/              # Utilitários e API client
│
├── docker-compose.yml             # Orquestração de serviços
├── database-schema.sql            # Schema do banco de dados
└── package.json                   # Workspace root
```

## Fluxo de Dados

### 1. Request Flow

```
User Browser
    ↓
Next.js Frontend (port 3000)
    ↓
NestJS Backend API (port 3001)
    ↓
Cube.js Analytics Layer (port 4000)
    ↓
PostgreSQL Database (port 5432)
```

### 2. Analytics Query Flow

```typescript
// 1. Frontend faz requisição
const response = await fetch('/api/analytics/sales');

// 2. NestJS Controller recebe
@Get('sales')
async getSales() {
  return this.analyticsService.queryCube({
    measures: ['Sales.totalAmount'],
    timeDimensions: [{ dimension: 'Sales.createdAt', granularity: 'day' }]
  });
}

// 3. Cube.js processa
// - Verifica cache
// - Gera SQL otimizado
// - Retorna dados agregados

// 4. Frontend renderiza
<LineChart data={response.data} />
```

### 3. Data Aggregation

```
Raw Data (PostgreSQL)
    ↓
Cube.js Pre-aggregations (Cache)
    ↓
API Response (JSON)
    ↓
React Components (Visualization)
```

## Considerações de Performance

### Estratégias Implementadas

1. **Cache em Múltiplas Camadas**
   - Cube.js pre-aggregations (Redis)
   - Query result cache
   - Next.js static generation (quando aplicável)

2. **Query Optimization**
   - Índices no banco de dados
   - Agregações pré-calculadas
   - Lazy loading de componentes

3. **Bundle Optimization**
   - Code splitting por rota
   - Tree shaking automático
   - Compressão de assets

4. **Database Performance**
   - Connection pooling
   - Prepared statements
   - Índices otimizados

### Métricas Esperadas

- **Time to First Byte (TTFB):** < 200ms
- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **API Response Time:** < 500ms (cached), < 2s (uncached)
- **Cube.js Query Time:** < 100ms (pre-aggregated)

## Segurança

### Medidas Implementadas

1. **Backend Security**
   - CORS configurado
   - Rate limiting
   - Input validation (class-validator)
   - SQL injection prevention (parameterized queries)

2. **Frontend Security**
   - Environment variables para secrets
   - HTTPS enforced
   - XSS prevention (React built-in)

3. **Database Security**
   - Least privilege principle
   - Encrypted connections
   - Regular backups

## Manutenção e Evolução

### Preparação para Crescimento

Embora a arquitetura atual seja monolítica, o projeto foi estruturado para facilitar evolução futura:

1. **Modularização:** Código organizado em módulos independentes
2. **Interfaces Claras:** APIs bem definidas entre camadas
3. **Separação de Conceitos:** Analytics layer isolada
4. **Type Safety:** TypeScript previne muitos erros em runtime

### Possíveis Evoluções

- Migração para microserviços (se necessário)
- Implementação de autenticação/autorização
- Adição de real-time analytics (WebSockets)
- Integração com mais fontes de dados
- Machine Learning para insights preditivos

## Conclusão

A arquitetura escolhida prioriza:

- ✅ **Simplicidade operacional** sobre complexidade distribuída
- ✅ **Manutenibilidade** sobre escalabilidade prematura
- ✅ **Developer Experience** sobre otimização prematura
- ✅ **Confiabilidade** sobre features avançadas

Essas decisões são adequadas para uma aplicação de uso interno com volume moderado de requisições, onde estabilidade e facilidade de manutenção são mais importantes que escalabilidade horizontal ilimitada.

---

**Autor:** Matheus de Alcantara  
**Data:** Novembro 2025  
**Versão:** 1.0
