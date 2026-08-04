import { supabase } from "./supabase";

const WEBSITE_MEDIA_BUCKET = "website-media";

type UploadWebsiteImageOptions = {
  file: File;
  folder: string;
};

type UploadedWebsiteImage = {
  path: string;
  publicUrl: string;
};

function createSafeFileName(fileName: string): string {
  const extension =
    fileName.split(".").pop()?.toLowerCase() ?? "jpg";

  const baseName = fileName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${baseName || "image"}-${crypto.randomUUID()}.${extension}`;
}

export async function uploadWebsiteImage({
  file,
  folder,
}: UploadWebsiteImageOptions): Promise<UploadedWebsiteImage> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose a valid image file.");
  }

  const safeFolder = folder
    .toLowerCase()
    .replace(/[^a-z0-9/-]+/g, "-")
    .replace(/^\/+|\/+$/g, "");

  const fileName = createSafeFileName(file.name);
  const filePath = `${safeFolder}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(WEBSITE_MEDIA_BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage
    .from(WEBSITE_MEDIA_BUCKET)
    .getPublicUrl(filePath);

  return {
    path: filePath,
    publicUrl: data.publicUrl,
  };
}

export async function replaceWebsiteImage({
  file,
  oldPath,
  folder,
}: UploadWebsiteImageOptions & {
  oldPath?: string | null;
}): Promise<UploadedWebsiteImage> {
  const uploadedImage = await uploadWebsiteImage({
    file,
    folder,
  });

  if (oldPath) {
    try {
      await deleteWebsiteImage(oldPath);
    } catch (error) {
      console.error(
        "New image uploaded, but old image could not be deleted:",
        error
      );
    }
  }

  return uploadedImage;
}

export async function deleteWebsiteImage(
  filePath: string
): Promise<void> {
  const { error } = await supabase.storage
    .from(WEBSITE_MEDIA_BUCKET)
    .remove([filePath]);

  if (error) {
    throw new Error(error.message);
  }
}

export function getWebsiteImagePublicUrl(
  filePath: string
): string {
  const { data } = supabase.storage
    .from(WEBSITE_MEDIA_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}