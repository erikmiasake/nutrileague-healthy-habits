import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type QuestionKey =
  | "improve_next"
  | "top_meal_week"
  | "why_low_score"
  | "meal_idea_goal"
  | "goal_progress";

const QUESTIONS: Record<QuestionKey, string> = {
  improve_next: "Como posso melhorar minha próxima refeição?",
  top_meal_week: "Qual foi meu prato com mais pontos essa semana?",
  why_low_score: "Por que esse prato pontuou baixo?",
  meal_idea_goal: "Me dá uma ideia de refeição que ajuda minha meta",
  goal_progress: "Como estou indo em relação ao meu objetivo?",
};

const ACTIONS: Record<QuestionKey, { label: string; route: string }> = {
  improve_next: { label: "Registrar refeição agora", route: "/registrar" },
  top_meal_week: { label: "Ver meu progresso do objetivo", route: "/perfil" },
  why_low_score: { label: "Registrar refeição agora", route: "/registrar" },
  meal_idea_goal: { label: "Registrar refeição agora", route: "/registrar" },
  goal_progress: { label: "Ver meu progresso do objetivo", route: "/perfil" },
};

const GOAL_LABEL: Record<string, string> = {
  emagrecer: "emagrecer",
  perder_peso: "emagrecer",
  manter: "manter o peso",
  ganhar_massa: "ganhar massa",
  ganhar: "ganhar massa",
  saude: "saúde geral",
  saude_geral: "saúde geral",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    const { question_key } = await req.json();
    if (!question_key || !(question_key in QUESTIONS)) {
      return new Response(JSON.stringify({ error: "Invalid question_key" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const key = question_key as QuestionKey;

    const [{ data: profile }, { data: recentMeals }, { data: weekMeals }] = await Promise.all([
      supabase.from("profiles").select("name, goal").eq("user_id", userId).maybeSingle(),
      supabase
        .from("meal_logs")
        .select("date, meal_type, detected_foods, meal_score, meal_classification, has_protein, has_vegetables, processing_level, junk_level, ai_report, calories, protein")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("meal_logs")
        .select("date, meal_type, detected_foods, meal_score, meal_classification")
        .eq("user_id", userId)
        .gte("date", new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0])
        .order("meal_score", { ascending: false }),
    ]);

    const hasHistory = (recentMeals?.length ?? 0) > 0;

    if (!hasHistory) {
      return new Response(
        JSON.stringify({
          reply:
            "Você ainda não registrou nenhuma refeição. Pra eu te dar um plano real e conectado com sua meta, preciso ver o que você come. Bora começar agora — registre sua primeira refeição e volta aqui.",
          action: { label: "Registrar minha primeira refeição", route: "/registrar" },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const goalRaw = (profile?.goal || "").toLowerCase().trim();
    const goal = GOAL_LABEL[goalRaw] || (goalRaw ? goalRaw : "saúde geral");
    const goalKnown = !!profile?.goal;

    const topWeek = (weekMeals || [])
      .filter((m) => m.meal_score != null)
      .sort((a, b) => (b.meal_score ?? 0) - (a.meal_score ?? 0))[0];

    const context = {
      user_name: profile?.name || "",
      goal,
      goal_known: goalKnown,
      recent_meals: recentMeals,
      top_meal_this_week: topWeek || null,
    };

    const systemPrompt = `Você é o Coach do NutriLeague, um coach de nutrição gamificado (estilo Duolingo/Strava) para jovens 18-35.

REGRA DE OURO — nunca quebre:
A pontuação das refeições NUNCA é o objetivo final. É evidência de progresso rumo à META PESSOAL do usuário (${goal}${goalKnown ? "" : " — meta ainda não definida, sugira definir no perfil"}).
NUNCA diga apenas "troque X por Y pra pontuar mais". Sempre conecte à meta: "troque X por Y porque ajuda sua meta de ${goal}, e sua pontuação também sobe".

TOM: Direto, prático, tipo colega de time. Nunca clínico, nunca terapêutico, nunca julgamento ("você errou", "não devia").

TODA resposta tem 3 partes fluidas (não use títulos, escreva corrido em 3-5 frases curtas):
(a) O que aconteceu — cite dado real do histórico do usuário (nome de prato, pontuação, dia). Nunca invente.
(b) Por quê — o fator nutricional (proteína, vegetais, processamento, junk).
(c) Como conecta à meta de ${goal}.

PROIBIDO: conselho clínico (dosagem, diagnóstico, restrição médica). Se perguntado, redirecione brevemente para "fale com seu nutricionista".

Responda em português BR. Máximo 4 frases. Sem markdown, sem listas, sem emojis excessivos (no máximo 1).`;

    const userPrompt = `Pergunta do usuário: "${QUESTIONS[key]}"

Dados reais do usuário (JSON):
${JSON.stringify(context, null, 2)}

Responda seguindo a regra de ouro e o formato de 3 partes.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente em instantes." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResponse.text();
      console.error("AI error", status, t);
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await aiResponse.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "Não consegui gerar uma resposta agora. Tenta de novo em instantes.";

    return new Response(
      JSON.stringify({ reply, action: ACTIONS[key] }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("coach-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
