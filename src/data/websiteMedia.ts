import { supabase } from "../lib/supabase";

export async function getWebsiteMedia() {
  const { data, error } = await supabase
    .from("website_media")
    .select(`
      id,
      section,
      slot_key,
      title,
      image_url,
      desktop_url,
      mobile_url,
      display_order,
      is_active,
      settings
    `)
    .order("display_order", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Failed to load website media: ${error.message}`
    );
  }

  return data ?? [];
}