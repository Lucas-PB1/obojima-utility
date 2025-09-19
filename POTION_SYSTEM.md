# Sistema de Poções - Obojima Utilities

## Visão Geral

O sistema de poções permite aos jogadores criar poções mágicas combinando três ingredientes únicos coletados durante o forrageamento. O tipo de poção resultante é determinado pelos atributos dos ingredientes utilizados.

## Como Funciona

### 1. Seleção de Ingredientes
- Cada receita deve conter exatamente **3 ingredientes únicos**
- Os ingredientes são selecionados da coleção do jogador
- Ingredientes já utilizados não estão disponíveis para novas receitas

### 2. Cálculo dos Scores
Para cada receita, o sistema calcula três scores:
- **Score de Combate**: Soma dos valores de `combat` dos 3 ingredientes
- **Score de Utilidade**: Soma dos valores de `utility` dos 3 ingredientes  
- **Score Caprichoso**: Soma dos valores de `whimsy` dos 3 ingredientes

### 3. Determinação da Categoria
- O atributo com o **maior score** determina a categoria da poção
- Em caso de empate, a prioridade é: Combate > Utilidade > Caprichoso
- As categorias disponíveis são:
  - **Combate**: Poções para uso em batalha
  - **Utilidade**: Poções para situações práticas
  - **Caprichoso**: Poções com efeitos únicos e divertidos

### 4. Seleção da Poção Específica
- O score total do atributo vencedor determina qual poção específica será criada
- A fórmula é: `(score - 1) % total_de_poções_na_categoria`
- Isso garante que diferentes combinações possam resultar em poções diferentes

## Estrutura de Dados

### Tipos TypeScript
```typescript
interface Potion {
  id: number;
  nome_ingles: string;
  nome_portugues: string;
  raridade: string;
  descricao: string;
}

interface PotionRecipe {
  id: string;
  ingredients: Ingredient[];
  combatScore: number;
  utilityScore: number;
  whimsyScore: number;
  winningAttribute: 'combat' | 'utility' | 'whimsy';
  resultingPotion: Potion;
  createdAt: Date;
}
```

## Arquivos do Sistema

### Serviços
- `src/services/potionService.ts` - Lógica principal de criação de poções
- `src/services/recipeService.ts` - Gerenciamento de receitas salvas
- `src/services/createdPotionService.ts` - Gerenciamento de poções criadas
- `src/services/exportImportService.ts` - Sistema de backup e exportação

### Componentes
- `src/components/PotionBrewing.tsx` - Interface principal de criação
- `src/components/CreatedPotionCollection.tsx` - Inventário de poções criadas
- `src/components/RecipeCollection.tsx` - Coleção de receitas
- `src/components/BackupSection.tsx` - Seção de backup completo
- `src/components/ui/SimpleIngredientCard.tsx` - Card simplificado para ingredientes
- `src/components/ui/ExportImportSection.tsx` - Componente reutilizável de export/import

### Tipos
- `src/types/ingredients.ts` - Tipos TypeScript para o sistema

## Funcionalidades

### Interface de Criação
- Preview em tempo real dos scores ao selecionar ingredientes
- Validação de ingredientes únicos
- Feedback visual da categoria vencedora
- Modal de resultado com detalhes da poção criada
- Uso automático de ingredientes após criação da poção

### Persistência
- Receitas são salvas automaticamente no localStorage
- Histórico completo de todas as poções criadas
- Estatísticas de uso por categoria
- Nova aba "Receitas" para visualizar e gerenciar receitas criadas
- Nova aba "Inventário" para gerenciar poções criadas com sistema de quantidade

### Sistema de Uso de Poções
- Poções criadas são adicionadas ao inventário com quantidade 1
- Sistema de uso similar aos ingredientes (diminui quantidade)
- Poções com quantidade 0 são automaticamente filtradas das listas
- Marcação automática como "usada" quando quantidade chega a 0
- Histórico de quando cada poção foi usada

### Sistema de Backup e Exportação
- Exportação individual de cada tipo de dados (ingredientes, poções, receitas, logs)
- Exportação completa de todos os dados do sistema
- Importação de dados de arquivos TXT
- Validação de versão e formato de arquivos
- Backup automático em formato legível
- Restauração completa do sistema a partir de backup

### Integração
- Utiliza ingredientes coletados no sistema de forrageamento
- Integrado com a navegação principal da aplicação
- Compatível com o sistema de coleção existente
- Filtragem automática de ingredientes com quantidade 0
- Marcação automática de ingredientes como usados
- Sistema unificado de gerenciamento de itens (ingredientes e poções)

## Exemplo de Uso

1. **Coletar Ingredientes**: Use o sistema de forrageamento para coletar ingredientes
2. **Acessar Poções**: Navegue para a aba "Poções" na aplicação
3. **Selecionar Ingredientes**: Escolha 3 ingredientes únicos da sua coleção
4. **Preview**: Veja os scores calculados e a categoria vencedora
5. **Criar Poção**: Clique em "Criar Poção" para gerar a receita
6. **Resultado**: Visualize a poção criada e sua descrição
7. **Gerenciar Inventário**: Acesse a aba "Inventário" para ver suas poções criadas
8. **Usar Poções**: Clique em "Usar" para consumir uma poção (diminui a quantidade)
9. **Visualizar Receitas**: Acesse a aba "Receitas" para ver o histórico de criação
10. **Fazer Backup**: Acesse a aba "Backup" para exportar todos os dados
11. **Exportar Dados**: Use as seções de export/import em cada aba para backup específico
12. **Importar Dados**: Restaure dados de arquivos TXT exportados anteriormente

## Categorias de Poções

### Combate (60 poções)
Poções focadas em situações de batalha, como:
- Aumento de velocidade e agilidade
- Resistência a danos
- Ataques especiais
- Defesas mágicas

### Utilidade (60 poções)  
Poções para situações práticas, como:
- Melhoria de habilidades
- Cura e regeneração
- Detecção e percepção
- Manipulação de objetos

### Caprichoso (60 poções)
Poções com efeitos únicos e divertidos, como:
- Transformações temporárias
- Efeitos visuais especiais
- Habilidades incomuns
- Interações sociais

## Dicas para Jogadores

1. **Experimente Combinações**: Diferentes ingredientes podem resultar em poções surpreendentes
2. **Balanceie os Scores**: Ingredientes com scores altos em um atributo específico tendem a criar poções mais poderosas
3. **Colete Variedade**: Ter ingredientes diversos permite mais opções de criação
4. **Anote Receitas**: O sistema salva automaticamente, mas você pode anotar combinações favoritas
5. **Explore Categorias**: Tente criar poções de todas as categorias para descobrir efeitos únicos

## Desenvolvimento

O sistema foi projetado para ser:
- **Extensível**: Fácil adicionar novas poções ou categorias
- **Performático**: Cálculos otimizados e carregamento assíncrono
- **Responsivo**: Interface adaptável para diferentes dispositivos
- **Acessível**: Feedback claro e validações robustas
