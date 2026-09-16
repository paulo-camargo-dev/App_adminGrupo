# GrupoApp

Aplicacao web de gestao de membros, mensalidades e financeiro, integrada ao Cloud Firestore.

## Executar localmente

Abra o projeto com um servidor HTTP, como o Live Server do VS Code. Nao abra o `index.html` diretamente pelo sistema de arquivos.

## Firebase

A configuracao Web fica em `js/firebase-config.js`. As credenciais Web do Firebase nao sao senhas, mas as regras do Firestore devem proteger os dados. Consulte [FIREBASE_SETUP.md](FIREBASE_SETUP.md) para configurar o banco e publicar o app.

Antes de usar dados reais, migre o login de demonstracao para Firebase Authentication e altere as regras do Firestore. O app atual contem usuarios de demonstracao para testes locais.
