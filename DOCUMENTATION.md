# 🌿 Obojima Utilities - Sistema de Forrageamento

## 📋 Visão Geral

O **Obojima Utilities** é um sistema completo de forrageamento de ingredientes inspirado no universo Studio Ghibli. O sistema permite que os usuários explorem diferentes regiões, realizem testes de forrageamento e coletem ingredientes únicos para suas poções.

## ✨ Funcionalidades Principais

### 🎯 Sistema de Forrageamento
- **Regiões**: 5 regiões únicas com ingredientes específicos
- **Tipos de Teste**: Natureza e Sobrevivência
- **Dificuldade**: Sistema de DC (Difficulty Class) com faixas:
  - Comum (Nativo): DC 10-15
  - Incomum (Nativo): DC 16-20
  - Incomum (Não-Nativo): DC 21-25
- **Dados Bônus**: d4, d6, d8, d10, d12
- **Vantagem/Desvantagem**: Sistema de rolagem dupla

### 🎲 Mecânicas de Jogo
- **Limite Diário**: 3 tentativas por dia por usuário
- **Acumulação**: Ingredientes iguais se acumulam
- **Uso de Ingredientes**: Sistema de quantidade com marcação de uso
- **Histórico Completo**: Log de todas as tentativas

### 🎨 Interface Studio Ghibli
- **Tema de Cores**: Gradientes emerald, teal e cyan
- **Animações Suaves**: Transições e efeitos flutuantes
- **Modais Elegantes**: Efeito de blur e sombras flutuantes
- **Responsivo**: Funciona em desktop e mobile

## 🏗️ Arquitetura do Sistema

### 📁 Estrutura de Pastas

```
src/
├── components/           # Componentes React
│   ├── ui/              # Componentes de interface reutilizáveis
│   ├── forage/          # Componentes específicos de forrageamento
│   └── filters/         # Componentes de filtros
├── services/            # Serviços de lógica de negócio
├── hooks/               # Hooks personalizados
├── types/               # Definições TypeScript
├── config/              # Configurações do jogo
└── app/                 # Páginas Next.js
```

### 🔧 Serviços Principais

#### `ingredientsService.ts`
- Carrega dados de ingredientes dos JSONs
- Calcula dificuldades (DC)
- Gerencia regiões e ingredientes

#### `diceService.ts`
- Sistema de rolagem de dados
- Cálculo de vantagem/desvantagem
- Dados bônus

#### `storageService.ts`
- Persistência no localStorage
- Gerenciamento de ingredientes coletados
- Histórico de tentativas

#### `settingsService.ts`
- Configurações padrão do usuário
- Modificador padrão
- Dados bônus padrão

### ⚙️ Configurações do Jogo

#### `gameConfig.ts`
```typescript
export const GAME_CONFIG = {
  DAILY_FORAGE_LIMIT: 3,        // Limite de tentativas por dia
  DIFFICULTY: {                  // Faixas de dificuldade
    COMUM_NATIVO: { min: 10, max: 15 },
    INCOMUM_NATIVO: { min: 16, max: 20 },
    INCOMUM_NAO_NATIVO: { min: 21, max: 25 }
  },
  DICE: {                        // Configurações de dados
    BONUS_DICE_TYPES: ['d4', 'd6', 'd8', 'd10', 'd12'],
    MAX_BONUS_QUANTITY: 10
  }
}
```

## 🎮 Como Usar

### 1. **Forrageamento**
1. Selecione uma região
2. Escolha o tipo de teste (Natureza/Sobrevivência)
3. Defina o modificador (+X)
4. Adicione dados bônus (opcional)
5. Escolha vantagem/desvantagem
6. Clique em "Forragear"

### 2. **Gerenciamento de Coleção**
- **Visualizar**: Clique no nome do ingrediente para ver detalhes
- **Usar**: Clique em "Usar 1" para consumir um ingrediente
- **Filtrar**: Use os filtros para encontrar ingredientes específicos
- **Buscar**: Digite o nome do ingrediente na barra de busca

### 3. **Configurações**
- **Valores Padrão**: Configure modificador e dados bônus padrão
- **Limite Diário**: Sistema automático de 3 tentativas por dia

## 🔧 Personalização

### Alterando o Limite Diário
Para modificar o limite de tentativas por dia, edite o arquivo `src/config/gameConfig.ts`:

```typescript
export const GAME_CONFIG = {
  DAILY_FORAGE_LIMIT: 5,  // Mude de 3 para 5
  // ... outras configurações
}
```

### Adicionando Novas Regiões
1. Adicione a região no arquivo `public/ingredientes/ingredientes-por-regiao.json`
2. Atualize o tipo `RegionKey` em `src/types/ingredients.ts`
3. Adicione o nome de exibição no `ingredientsService.ts`

### Modificando Dificuldades
Edite as faixas de DC no `gameConfig.ts`:

```typescript
DIFFICULTY: {
  COMUM_NATIVO: { min: 8, max: 12 },      // Mais fácil
  INCOMUM_NATIVO: { min: 13, max: 17 },   // Mais fácil
  INCOMUM_NAO_NATIVO: { min: 18, max: 22 } // Mais fácil
}
```

## 🎨 Tema Visual

### Paleta de Cores
- **Primária**: Emerald (verde)
- **Secundária**: Teal (azul-verde)
- **Acentos**: Cyan (ciano)
- **Neutros**: Slate (cinza)

### Componentes Estilizados
- **Gradientes**: Transições suaves entre cores
- **Sombras**: Efeitos de profundidade
- **Blur**: Efeitos de desfoque para modais
- **Animações**: Transições de 300ms

## 🚀 Tecnologias Utilizadas

- **Next.js 14**: Framework React com App Router
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização utilitária
- **LocalStorage**: Persistência de dados
- **React Hooks**: Gerenciamento de estado

## 📊 Dados do Sistema

### Estrutura dos Ingredientes
```typescript
interface Ingredient {
  id: string;
  nome_portugues: string;
  nome_ingles: string;
  descricao: string;
  combat: number;      // 1-5
  utility: number;     // 1-5
  whimsy: number;      // 1-5
}
```

### Tentativas de Forrageamento
```typescript
interface ForageAttempt {
  id: string;
  timestamp: Date;
  region: RegionKey;
  testType: TestType;
  modifier: number;
  bonusDice?: { type: DiceType; value: number };
  advantage: AdvantageType;
  dc: number;
  dcRange: string;
  roll: number;
  success: boolean;
  ingredient?: Ingredient;
  rarity: 'comum' | 'incomum';
}
```

## 🔍 Funcionalidades Avançadas

### Sistema de Hidratação
- **HydrationBoundary**: Previne erros de hidratação SSR
- **ClientOnly**: Renderização condicional no cliente
- **useHydration**: Hook para gerenciar estado de hidratação

### Gerenciamento de Estado
- **useIngredients**: Hook principal para ingredientes
- **useFilters**: Hooks para filtros e ordenação
- **Persistência**: Dados salvos automaticamente

### Componentes Reutilizáveis
- **DataTable**: Tabela com filtros e paginação
- **Modal**: Modal com animações Studio Ghibli
- **PageLayout**: Layout consistente
- **StatsGrid**: Grid de estatísticas

## 🐛 Solução de Problemas

### Erro de Hidratação
Se aparecer erro de hidratação, verifique:
1. Componentes usando `localStorage` estão dentro de `ClientOnly`
2. Estados iniciais são consistentes entre servidor e cliente

### Dados Não Salvos
Verifique:
1. `localStorage` está habilitado no navegador
2. Não há erros no console
3. Dados não excedem limite do `localStorage`

### Limite Diário Não Funciona
Verifique:
1. Data do sistema está correta
2. `localStorage` está funcionando
3. Configuração em `gameConfig.ts` está correta

## 📈 Melhorias Futuras

### Funcionalidades Sugeridas
- [ ] Sistema de conquistas
- [ ] Ranking de jogadores
- [ ] Ingredientes raros especiais
- [ ] Sistema de crafting de poções
- [ ] Modo multiplayer
- [ ] Exportação de dados

### Otimizações Técnicas
- [ ] Cache de dados com React Query
- [ ] Compressão de dados no localStorage
- [ ] Lazy loading de componentes
- [ ] Service Worker para offline

## 📝 Changelog

### v1.0.0 - Lançamento Inicial
- ✅ Sistema completo de forrageamento
- ✅ 5 regiões com ingredientes únicos
- ✅ Sistema de dificuldade com DC
- ✅ Limite diário de 3 tentativas
- ✅ Interface Studio Ghibli
- ✅ Persistência de dados
- ✅ Modal de detalhes de ingredientes
- ✅ Configurações personalizáveis
- ✅ Sistema de filtros e busca
- ✅ Histórico completo de atividades

---

**Desenvolvido com ❤️ inspirado no universo Studio Ghibli**

*"A magia está nos detalhes, e os detalhes estão em cada ingrediente que você coleta."*
