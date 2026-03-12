

## Estruturar Desafios da Liga

### Problema atual
Os desafios da liga usam o mesmo `ChallengeCard` genérico, sem mostrar ranking entre amigos. O hook `useLeagueChallengeRanking` já existe mas não é usado na UI. Além disso, os desafios de liga precisam ser filtrados pela liga do usuário.

### Plano

**1. Hook `useChallenges.ts` -- filtrar desafios da liga corretamente**
- Buscar as ligas do usuário via `league_members` para saber o `league_id`
- Filtrar desafios `type=league` que pertencem às ligas do usuário
- Automaticamente inscrever o usuário em desafios da liga (auto-join) ao invés de exigir clique em "Participar"

**2. Novo componente `LeagueChallengeCard`**
- Mostra o card do desafio com progresso (barra animada como os outros)
- Abaixo do progresso, mostra mini-ranking dos membros da liga:
  - Posição, avatar (iniciais), nome, dias de progresso
  - Destaque na linha do usuário atual com borda primary
  - Medalhas para top 3 (ouro, prata, bronze)
- Usa o hook `useLeagueChallengeRanking` já existente
- Mostra contagem de participantes (ex: "6 participantes")

**3. Atualizar tab Liga em `Challenges.tsx`**
- Substituir o `ChallengeCard` genérico pelo novo `LeagueChallengeCard` na tab Liga
- Se o usuário não está em nenhuma liga, mostrar empty state com botão para ir a `/ligas`

**4. Seed de dados -- inserir desafio de liga de exemplo**
- Inserir um desafio tipo `league` vinculado a uma liga existente (se houver) para testar

### Arquivos modificados
- `src/hooks/useChallenges.ts` -- adicionar query de ligas do usuário, filtrar desafios da liga
- `src/pages/Challenges.tsx` -- novo `LeagueChallengeCard` com ranking inline, empty state com CTA para ligas

