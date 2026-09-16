# Passo a passo: migracao para Firebase

## 1. Criar o projeto Firebase

1. Abra https://console.firebase.google.com/ e entre com sua conta Google.
2. Clique em **Adicionar projeto**.
3. Dê um nome ao projeto, por exemplo `admin-varoes`.
4. Conclua a criacao. O Google Analytics pode ser desativado nesta etapa.

## 2. Criar o banco Firestore

1. No menu esquerdo, abra **Build > Firestore Database**.
2. Clique em **Criar banco de dados**.
3. Escolha uma regiao proxima dos seus usuarios, como `southamerica-east1`.
4. Para iniciar os testes, escolha **Modo de teste** e confirme.
5. Depois de validar o app, substitua as regras de teste pelas regras de producao descritas na etapa 6.

O app grava o estado atual no documento `grupoapp/main`. Isso inclui membros, mensalidades, entradas, despesas, modelos de mensagens e configuracoes.

## 3. Registrar o app Web

1. Abra **Configuracoes do projeto** pelo icone de engrenagem.
2. Na aba **Geral**, encontre **Seus apps** e clique no icone `</>` Web.
3. Informe um apelido, por exemplo `admin-varoes-web`.
4. Nao e necessario configurar Firebase Hosting nesta tela ainda.
5. Clique em **Registrar app**.
6. Copie o objeto `firebaseConfig` exibido pelo Firebase.

## 4. Colar a configuracao no projeto

1. Abra `js/firebase-config.js` no VS Code.
2. Substitua os valores de exemplo pelos valores copiados do Firebase.
3. Salve o arquivo.

O arquivo deve ficar parecido com este formato:

```js
const firebaseConfig = {
	apiKey: 'AIza...',
	authDomain: 'admin-varoes.firebaseapp.com',
	projectId: 'admin-varoes',
	storageBucket: 'admin-varoes.firebasestorage.app',
	messagingSenderId: '123456789',
	appId: '1:123456789:web:abc123'
};
```

A configuracao Web nao e uma senha. Mesmo assim, as regras do Firestore precisam proteger os dados.

## 5. Testar a conexao

1. Abra o app usando um servidor HTTP, e nao diretamente pelo arquivo `index.html`.
2. Entre usando os dados de demonstracao:
	 - E-mail: `admin@grupoapp.com`
	 - Senha: `admin123`
3. Crie ou edite um membro.
4. No Firebase Console, abra **Firestore Database > Dados**.
5. Confirme que apareceu a colecao `grupoapp` e o documento `main`.
6. Abra o app em outro navegador. O registro salvo deve aparecer tambem nele.

Se o Firestore estiver indisponivel, o app usa o cache local e registra o erro no console do navegador.

## 6. Regras do Firestore

### Somente para teste local

O modo de teste pode ser usado apenas enquanto voce valida a integracao. Ele deixa os dados acessiveis sem autenticacao e nao deve ser usado com dados reais.

### Antes de publicar dados reais

A versao atual ainda usa um login proprio salvo dentro do documento do app. Esse login nao protege o Firestore: um usuario com acesso ao documento poderia ler os dados diretamente.

Antes de publicar dados reais, migre o login para **Build > Authentication > Sign-in method > E-mail/senha**. Depois altere o codigo para usar Firebase Authentication e publique regras que exijam usuario autenticado, por exemplo:

```text
rules_version = '2';
service cloud.firestore {
	match /databases/{database}/documents {
		match /grupoapp/{document} {
			allow read, write: if request.auth != null;
		}
	}
}
```

Essa regra exige login Firebase, mas ainda permite que qualquer usuario autenticado altere o mesmo grupo. Para varios grupos, a estrutura deve ser separada por `uid` ou por `groupId` e as regras devem verificar a permissao do usuario.

## 7. Publicar online com Firebase Hosting

1. Instale o Node.js LTS em https://nodejs.org/.
2. Abra o PowerShell na pasta do projeto.
3. Instale a CLI do Firebase:

```powershell
npm install -g firebase-tools
```

4. Entre na sua conta:

```powershell
firebase login
```

5. Inicialize o Hosting dentro da pasta do projeto:

```powershell
firebase init hosting
```

6. Selecione o projeto criado, use `.` como pasta publica e responda `No` quando perguntar sobre uma SPA.
7. Publique:

```powershell
firebase deploy --only hosting
```

8. Abra a URL exibida pela CLI, normalmente algo como `https://seu-projeto.web.app`.

## 8. Checklist final

- [ ] `js/firebase-config.js` foi preenchido.
- [ ] O Firestore foi criado na regiao correta.
- [ ] O documento `grupoapp/main` apareceu depois de salvar um registro.
- [ ] O app foi testado em dois navegadores.
- [ ] O Firebase Authentication foi ativado antes de usar dados reais.
- [ ] As regras de producao foram publicadas.
- [ ] O app foi publicado em HTTPS.
