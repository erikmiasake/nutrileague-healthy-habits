import { ArrowLeft, Leaf } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24 px-4 pt-5 max-w-[430px] mx-auto">
      <motion.header
        className="mb-6 flex items-center gap-3"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-display font-extrabold text-foreground">Sobre o NutriLeague</h1>
      </motion.header>

      <motion.section
        className="rounded-2xl border border-border bg-card p-5 card-elevated space-y-4"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Leaf size={18} className="text-primary" />
          <h2 className="text-base font-display font-bold text-foreground">Sobre o NutriLeague</h2>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          O NutriLeague é um aplicativo que transforma hábitos alimentares saudáveis em uma experiência social, divertida e motivadora. A ideia é simples: tornar a construção de bons hábitos algo mais envolvente, utilizando desafios, rankings e interação entre amigos.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          No aplicativo, os usuários registram suas refeições de forma rápida, tirando uma foto do alimento consumido. A partir disso, o sistema utiliza inteligência artificial para analisar a refeição e estimar seus macronutrientes, oferecendo uma visão simples e prática da qualidade nutricional da alimentação.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Mas o NutriLeague vai além do registro alimentar. O aplicativo cria um ambiente de competição saudável entre amigos por meio de ligas privadas, rankings e desafios. Dessa forma, manter consistência na alimentação se torna mais fácil, pois o progresso é compartilhado e acompanhado em grupo.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Nosso objetivo é ajudar as pessoas a transformar boas intenções em hábitos duradouros. Ao unir tecnologia, nutrição e gamificação, o NutriLeague busca incentivar escolhas alimentares mais conscientes e promover um estilo de vida mais saudável.
        </p>
        <p className="text-sm text-foreground font-medium leading-relaxed italic">
          Porque cuidar da alimentação não precisa ser algo difícil, e sim pode ser um jogo que você joga junto com seus amigos.
        </p>
      </motion.section>
    </div>
  );
};

export default About;
