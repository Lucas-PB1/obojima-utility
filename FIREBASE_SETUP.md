# Configuração do Firebase

Este documento descreve como configurar o Firebase para o projeto Obojima Utilities.

## 1. Criar Projeto no Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Preencha o nome do projeto e siga as instruções
4. Desabilite o Google Analytics (opcional)

## 2. Configurar Autenticação

1. No console do Firebase, vá em "Authentication"
2. Clique em "Começar"
3. Habilite o método "Email/Password"
4. Salve as configurações

## 3. Configurar Firestore

1. No console do Firebase, vá em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha o modo de produção
4. Selecione a localização do servidor (recomendado: us-central1 ou southamerica-east1)
5. Clique em "Ativar"

## 4. Configurar Regras de Segurança

1. No console do Firestore, vá na aba "Regras"
2. Cole o conteúdo do arquivo `firestore.rules` neste repositório
3. Clique em "Publicar"

As regras garantem que cada usuário só possa acessar seus próprios dados.

## 5. Obter Credenciais

1. No console do Firebase, vá em "Configurações do projeto" (ícone de engrenagem)
2. Role até "Seus aplicativos" e clique em "Web" (ícone `</>`)
3. Registre o app com um nome (ex: "Obojima Utilities Web")
4. Copie as credenciais fornecidas

## 6. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

**IMPORTANTE:** Não commite o arquivo `.env.local` no repositório. Ele já está no `.gitignore`.

## 7. Estrutura de Dados no Firestore

O Firestore será organizado da seguinte forma:

```
users/
  {userId}/ (document)
    settings (campo no documento)
    collectedIngredients/ (subcollection)
      {ingredientId}/
    forageAttempts/ (subcollection)
      {attemptId}/
    recipes/ (subcollection)
      {recipeId}/
    createdPotions/ (subcollection)
      {potionId}/
```

## 8. Migração de Dados

Quando um usuário faz login pela primeira vez após a atualização, os dados do localStorage serão automaticamente migrados para o Firestore. O processo é transparente e não requer ação do usuário.

## 9. Testar a Configuração

1. Execute `npm run dev`
2. Acesse `http://localhost:3000`
3. Você será redirecionado para `/login`
4. Crie uma conta ou faça login
5. Os dados serão migrados automaticamente se houver dados no localStorage

## Troubleshooting

### Erro: "Firebase: Error (auth/configuration-not-found)"
- Verifique se todas as variáveis de ambiente estão configuradas corretamente
- Certifique-se de que o arquivo `.env.local` está na raiz do projeto

### Erro: "Missing or insufficient permissions"
- Verifique se as regras do Firestore foram publicadas corretamente
- Certifique-se de que o usuário está autenticado

### Dados não aparecem após login
- Verifique o console do navegador para erros
- Verifique se a migração foi executada (verifique o console)
- Verifique se os dados existem no Firestore através do console do Firebase

