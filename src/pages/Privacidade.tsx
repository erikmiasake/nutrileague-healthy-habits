export default function Privacidade() {
  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-12 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Política de Privacidade</h1>
      <p className="text-sm text-muted-foreground mb-8">Última atualização: 07/07/2026</p>

      <section className="space-y-6 text-sm leading-relaxed">
        <div>
          <h2 className="text-xl font-semibold mb-2">1. Informações que coletamos</h2>
          <p>
            Ao usar o NutriLeague, coletamos: nome, e-mail e foto de perfil (via login com Google
            ou cadastro por e-mail); dados das refeições que você registra (fotos, descrições e
            análises nutricionais); sua participação em ligas e desafios.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">2. Como usamos seus dados</h2>
          <p>
            Utilizamos seus dados para autenticar seu acesso, exibir seu progresso, calcular
            rankings dentro das ligas, gerar análises nutricionais das refeições e enviar
            notificações relacionadas ao app.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">3. Compartilhamento</h2>
          <p>
            Não vendemos seus dados. Compartilhamos apenas com serviços necessários ao
            funcionamento do app (autenticação, banco de dados, análise de IA). Outros membros
            de uma liga que você participa podem ver seu nome, foto e pontuação.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">4. Login com Google</h2>
          <p>
            Ao entrar com Google, recebemos apenas seu nome, e-mail e foto de perfil pública.
            Não acessamos seus contatos, e-mails ou qualquer outro dado da sua conta Google.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">5. Seus direitos</h2>
          <p>
            Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento
            entrando em contato pelo e-mail abaixo.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">6. Contato</h2>
          <p>
            Dúvidas sobre esta política? Entre em contato: contato@nutrileague.live
          </p>
        </div>
      </section>
    </div>
  );
}
