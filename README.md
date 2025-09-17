# 🌿 Obojima Utilities - Sistema de Forrageamento

Um sistema completo de forrageamento de ingredientes para o mundo de Obojima, inspirado no tema Studio Ghibli.

## ✨ Funcionalidades

### 🎲 Sistema de Forrageamento
- **7 regiões únicas** de Obojima para explorar
- **Sistema de dificuldade** baseado na tabela oficial:
  - Ingredientes comuns nativos: DC 10-15
  - Ingredientes incomuns nativos: DC 16-20
  - Ingredientes incomuns não-nativos: DC 21-25
- **Tipos de teste**: Natureza ou Sobrevivência
- **Sistema de vantagem/desvantagem** completo
- **Dados de bônus** (d4, d6, d8, d10, d12)
- **Modificadores personalizáveis**

### 🎒 Gerenciamento de Coleção
- **Cache local** para ingredientes coletados
- **Sistema de uso** - marcar ingredientes como usados
- **Filtros avançados** por disponibilidade, nome, raridade
- **Estatísticas detalhadas** de coleta
- **Exportação/importação** de dados

### 📋 Log de Atividades
- **Histórico completo** de tentativas de forrageamento
- **Filtros por resultado**, região e período
- **Estatísticas de performance** (taxa de sucesso, rolagem média)
- **Detalhes completos** de cada tentativa

## 🗂️ Estrutura do Projeto

```
src/
├── types/
│   └── ingredients.ts          # Tipos TypeScript
├── services/
│   ├── ingredientsService.ts   # Consulta aos dados JSON
│   ├── storageService.ts       # Gerenciamento de cache/localStorage
│   └── diceService.ts          # Sistema de rolagem de dados
├── hooks/
│   ├── useIngredients.ts       # Hook para gerenciar ingredientes
│   ├── useFilters.ts           # Hooks para filtros e ordenação
│   └── index.ts                # Exportações dos hooks
├── components/
│   ├── ui/                     # Componentes reutilizáveis
│   │   ├── Button.tsx          # Botão customizado
│   │   ├── Input.tsx           # Input customizado
│   │   ├── Select.tsx          # Select customizado
│   │   ├── RadioGroup.tsx      # Grupo de radio buttons
│   │   ├── StatsGrid.tsx       # Grid de estatísticas
│   │   ├── IngredientCard.tsx  # Card de ingrediente
│   │   ├── PageLayout.tsx      # Layout de página
│   │   ├── PageHeader.tsx      # Cabeçalho de página
│   │   ├── ContentCard.tsx     # Card de conteúdo
│   │   ├── EmptyState.tsx      # Estado vazio
│   │   ├── FilterSection.tsx   # Seção de filtros
│   │   └── index.ts            # Exportações dos componentes UI
│   ├── filters/                # Componentes de filtro
│   │   ├── IngredientFilters.tsx # Filtros para ingredientes
│   │   ├── ActivityFilters.tsx   # Filtros para atividades
│   │   └── index.ts            # Exportações dos filtros
│   ├── forage/                 # Componentes de forrageamento
│   │   ├── ForageForm.tsx      # Formulário de forrageamento
│   │   ├── ForageResult.tsx    # Resultado do forrageamento
│   │   └── index.ts            # Exportações do forrageamento
│   ├── ForageSystem.tsx        # Interface principal de forrageamento
│   ├── IngredientCollection.tsx # Gerenciamento da coleção
│   └── ActivityLog.tsx         # Log de atividades
└── app/
    └── page.tsx                # Página principal com navegação
```

## 📊 Dados Utilizados

O sistema utiliza os arquivos JSON da pasta `public/`:

- **Ingredientes Comuns**: 69 ingredientes únicos
- **Ingredientes Incomuns**: 45 ingredientes únicos  
- **Organização por Região**: 7 regiões com distribuição específica
- **Sistema de Raridade**: Comum, Incomum, Raro, Especial

### Regiões Disponíveis:
1. **Terras Altas Costeiras** (Coastal Highlands)
2. **Campos de Vendaval** (Gale Fields)
3. **Dom de Shuritashi** (Gift of Shuritashi)
4. **Terra da Água Quente** (Land of Hot Water)
5. **Monte Arbora** (Mount Arbora)
6. **Raso** (Shallows)
7. **Pântanos de Água Salobra** (Brackwater Wetlands)

## 🎨 Design

- **Tema Studio Ghibli**: Cores suaves e gradientes naturais
- **Interface responsiva** para desktop e mobile
- **Animações suaves** e transições
- **Feedback visual** claro para sucessos e falhas
- **Emojis temáticos** para melhor experiência

## 🚀 Como Usar

1. **Escolha uma região** para forragear
2. **Configure o teste** (Natureza ou Sobrevivência)
3. **Adicione modificadores** e dados de bônus
4. **Selecione vantagem/desvantagem** se aplicável
5. **Clique em "Tentar Forragear"** e veja o resultado!
6. **Gerencie sua coleção** na aba "Coleção"
7. **Acompanhe seu progresso** no "Log de Atividades"

## 💾 Persistência de Dados

- **LocalStorage**: Todos os dados são salvos localmente
- **Backup**: Sistema de exportação/importação de dados
- **Estatísticas**: Histórico completo de atividades
- **Sincronização**: Dados persistem entre sessões

## 🛠️ Tecnologias

- **Next.js 14** com App Router
- **TypeScript** para tipagem segura
- **Tailwind CSS** para estilização
- **React Hooks** customizados para lógica de estado
- **Componentes reutilizáveis** com design system
- **LocalStorage** para persistência
- **JSON** para dados dos ingredientes

## 🏗️ Arquitetura

### **Hooks Customizados**
- `useIngredients`: Gerencia estado dos ingredientes e tentativas
- `useIngredientFilters`: Filtros e ordenação para ingredientes
- `useActivityFilters`: Filtros e ordenação para atividades

### **Componentes UI Reutilizáveis**
- **Layout**: `PageLayout`, `ContentCard`, `PageHeader`
- **Formulários**: `Button`, `Input`, `Select`, `RadioGroup`
- **Exibição**: `StatsGrid`, `IngredientCard`, `EmptyState`
- **Seções**: `FilterSection`

### **Componentes Específicos**
- **Filtros**: `IngredientFilters`, `ActivityFilters`
- **Forrageamento**: `ForageForm`, `ForageResult`

### **Benefícios da Arquitetura**
- ✅ **Reutilização de código** - Componentes modulares
- ✅ **Manutenibilidade** - Lógica separada em hooks
- ✅ **Consistência visual** - Design system unificado
- ✅ **Tipagem segura** - TypeScript em todos os componentes
- ✅ **Performance** - Hooks otimizados com useMemo
- ✅ **Escalabilidade** - Fácil adição de novos recursos

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- 💻 Desktop
- 📱 Mobile
- 📟 Tablet

## 🎯 Próximas Funcionalidades

- [ ] Sistema de poções (usando ingredientes coletados)
- [ ] Receitas de alquimia
- [ ] Sistema de níveis e progressão
- [ ] Multiplayer/compartiamento de coleções
- [ ] Modo offline completo
- [ ] Mais regiões e ingredientes

---

**Desenvolvido com ❤️ para a comunidade de Obojima**