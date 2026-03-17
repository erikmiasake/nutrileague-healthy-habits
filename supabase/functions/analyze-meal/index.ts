import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function calculateMealScore(criteria: {
  has_protein: boolean;
  has_vegetables: boolean;
  processing_level: string;
  junk_level: string;
}) {
  let score = 0;
  score += criteria.has_protein ? 25 : 10;
  score += criteria.has_vegetables ? 25 : 5;

  if (criteria.processing_level === "baixo") score += 25;
  else if (criteria.processing_level === "medio") score += 15;
  else score += 5;

  if (criteria.junk_level === "moderado") score -= 10;
  else if (criteria.junk_level === "alto") score -= 25;

  return Math.max(0, Math.min(100, score));
}

function classifyScore(score: number) {
  if (score >= 80) return "Excelente";
  if (score >= 60) return "Boa";
  if (score >= 40) return "Regular";
  return "Ruim";
}

function scoreToXp(score: number) {
  if (score >= 80) return 30;
  if (score >= 60) return 20;
  if (score >= 40) return 10;
  return 5;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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

    const { meal_id, image_url } = await req.json();
    if (!meal_id || !image_url) {
      return new Response(JSON.stringify({ error: "meal_id and image_url are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a nutrition analysis AI. Analyze food images and estimate macronutrients and meal quality.
Always respond by calling the report_nutrition function with your analysis.
Be realistic with estimates. If you can't identify the food clearly, make your best estimate.
All values should be reasonable for a single meal portion.
For processing_level: use "baixo" for whole/natural foods, "medio" for lightly processed, "alto" for highly processed/ultra-processed.
For junk_level: use "nenhum" if no junk food, "moderado" if some unhealthy items, "alto" if mostly junk food.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this meal photo. Identify the foods and estimate the macronutrients (calories, protein, carbs, fat). Also evaluate: does it contain a good protein source? Does it contain vegetables/greens? What is the processing level? Is there junk food?",
              },
              {
                type: "image_url",
                image_url: { url: image_url },
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "report_nutrition",
              description: "Report the detected foods, estimated macronutrients, and meal quality criteria.",
              parameters: {
                type: "object",
                properties: {
                  detected_foods: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of foods identified in the image, in Portuguese.",
                  },
                  calories: {
                    type: "integer",
                    description: "Estimated total calories (kcal).",
                  },
                  protein: {
                    type: "number",
                    description: "Estimated protein in grams.",
                  },
                  carbs: {
                    type: "number",
                    description: "Estimated carbohydrates in grams.",
                  },
                  fat: {
                    type: "number",
                    description: "Estimated fat in grams.",
                  },
                  has_protein: {
                    type: "boolean",
                    description: "Whether the meal contains a meaningful protein source (meat, fish, eggs, legumes, dairy).",
                  },
                  has_vegetables: {
                    type: "boolean",
                    description: "Whether the meal contains vegetables, greens, or salad.",
                  },
                  processing_level: {
                    type: "string",
                    enum: ["baixo", "medio", "alto"],
                    description: "Level of food processing: baixo (whole/natural), medio (lightly processed), alto (ultra-processed).",
                  },
                  junk_level: {
                    type: "string",
                    enum: ["nenhum", "moderado", "alto"],
                    description: "Presence of junk food: nenhum (none), moderado (some), alto (mostly junk).",
                  },
                },
                required: ["detected_foods", "calories", "protein", "carbs", "fat", "has_protein", "has_vegetables", "processing_level", "junk_level"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "report_nutrition" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", status, errText);
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const nutrition = JSON.parse(toolCall.function.arguments);

    // Calculate meal score
    const mealScore = calculateMealScore({
      has_protein: nutrition.has_protein,
      has_vegetables: nutrition.has_vegetables,
      processing_level: nutrition.processing_level,
      junk_level: nutrition.junk_level,
    });
    const classification = classifyScore(mealScore);
    const xp = scoreToXp(mealScore);

    // Update the meal_log with nutrition data + score
    const { error: updateError } = await supabase
      .from("meal_logs")
      .update({
        calories: nutrition.calories,
        protein: nutrition.protein,
        carbs: nutrition.carbs,
        fat: nutrition.fat,
        detected_foods: nutrition.detected_foods,
        has_protein: nutrition.has_protein,
        has_vegetables: nutrition.has_vegetables,
        processing_level: nutrition.processing_level,
        junk_level: nutrition.junk_level,
        meal_score: mealScore,
        meal_classification: classification,
        meal_xp: xp,
      })
      .eq("id", meal_id);

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error("Failed to save nutrition data");
    }

    return new Response(JSON.stringify({
      success: true,
      nutrition: {
        ...nutrition,
        meal_score: mealScore,
        meal_classification: classification,
        meal_xp: xp,
      },
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-meal error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
