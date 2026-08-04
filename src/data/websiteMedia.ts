import { supabase } from "../lib/supabase";

export async function getWebsiteMedia() {
  const { data, error } = await supabase
    .from("website_media")
    .select("*")
    .order("display_order", {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}