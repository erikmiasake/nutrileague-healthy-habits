import { supabase } from "@/integrations/supabase/client";

export const MAX_COVER_BYTES = 5 * 1024 * 1024;
export const ALLOWED_COVER_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function validateCoverFile(file: File): string | null {
  if (!ALLOWED_COVER_TYPES.includes(file.type)) {
    return "Formato inválido. Use JPG, PNG ou WEBP.";
  }
  if (file.size > MAX_COVER_BYTES) {
    return "Arquivo muito grande. Máximo 5MB.";
  }
  return null;
}

export async function uploadLeagueCover(leagueId: string, file: File): Promise<string> {
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${leagueId}/cover-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from("league-covers")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  return path;
}

export async function getCoverSignedUrl(path: string): Promise<string | null> {
  const { data } = await supabase.storage.from("league-covers").createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

export async function getCoverSignedUrls(paths: string[]): Promise<Record<string, string>> {
  if (paths.length === 0) return {};
  const { data } = await supabase.storage.from("league-covers").createSignedUrls(paths, 3600);
  const map: Record<string, string> = {};
  (data ?? []).forEach((entry) => {
    if (entry.path && entry.signedUrl) map[entry.path] = entry.signedUrl;
  });
  return map;
}
