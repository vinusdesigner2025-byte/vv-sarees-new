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

const MAX_IMAGE_WIDTH = 1600;
const WEBP_QUALITY = 0.82;

/*
 * Original upload romba huge-a irundha
 * browser memory spike avoid panna.
 */
const MAX_ORIGINAL_FILE_SIZE =
  15 * 1024 * 1024; // 15 MB

function createSafeBaseName(
  fileName: string
): string {
  return fileName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function optimizeImage(
  file: File
): Promise<File> {
  if (!file.type.startsWith("image/")) {
    throw new Error(
      "Please choose a valid image file."
    );
  }

  if (
    file.size >
    MAX_ORIGINAL_FILE_SIZE
  ) {
    throw new Error(
      "Image is too large. Please upload an image smaller than 15 MB."
    );
  }

  /*
   * SVG / GIF direct upload avoid pannrom.
   * Website banners-ku JPG / PNG / WEBP safer.
   */
  if (
    file.type === "image/svg+xml" ||
    file.type === "image/gif"
  ) {
    throw new Error(
      "Please upload a JPG, PNG or WEBP image."
    );
  }

  const imageBitmap =
    await createImageBitmap(file);

  let targetWidth =
    imageBitmap.width;

  let targetHeight =
    imageBitmap.height;

  if (
    imageBitmap.width >
    MAX_IMAGE_WIDTH
  ) {
    const scale =
      MAX_IMAGE_WIDTH /
      imageBitmap.width;

    targetWidth =
      MAX_IMAGE_WIDTH;

    targetHeight =
      Math.round(
        imageBitmap.height *
          scale
      );
  }

  const canvas =
    document.createElement(
      "canvas"
    );

  canvas.width =
    targetWidth;

  canvas.height =
    targetHeight;

  const context =
    canvas.getContext("2d");

  if (!context) {
    imageBitmap.close();

    throw new Error(
      "Unable to process this image."
    );
  }

  context.drawImage(
    imageBitmap,
    0,
    0,
    targetWidth,
    targetHeight
  );

  imageBitmap.close();

  const optimizedBlob =
    await new Promise<Blob>(
      (resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(
                new Error(
                  "Unable to optimize this image."
                )
              );

              return;
            }

            resolve(blob);
          },
          "image/webp",
          WEBP_QUALITY
        );
      }
    );

  const baseName =
    createSafeBaseName(
      file.name
    ) || "image";

  return new File(
    [optimizedBlob],
    `${baseName}.webp`,
    {
      type: "image/webp",
      lastModified:
        Date.now(),
    }
  );
}

function createSafeFileName(
  fileName: string
): string {
  const baseName =
    createSafeBaseName(
      fileName
    ) || "image";

  return `${baseName}-${crypto.randomUUID()}.webp`;
}

export async function uploadWebsiteImage({
  file,
  folder,
}: UploadWebsiteImageOptions): Promise<UploadedWebsiteImage> {
  if (
    !file.type.startsWith(
      "image/"
    )
  ) {
    throw new Error(
      "Please choose a valid image file."
    );
  }

  const optimizedFile =
    await optimizeImage(file);

  const safeFolder =
    folder
      .toLowerCase()
      .replace(
        /[^a-z0-9/-]+/g,
        "-"
      )
      .replace(
        /^\/+|\/+$/g,
        ""
      );

  const fileName =
    createSafeFileName(
      optimizedFile.name
    );

  const filePath =
    safeFolder
      ? `${safeFolder}/${fileName}`
      : fileName;

  const {
    error: uploadError,
  } = await supabase.storage
    .from(
      WEBSITE_MEDIA_BUCKET
    )
    .upload(
      filePath,
      optimizedFile,
      {
        cacheControl:
          "31536000",

        contentType:
          "image/webp",

        upsert: false,
      }
    );

  if (uploadError) {
    throw new Error(
      uploadError.message
    );
  }

  const { data } =
    supabase.storage
      .from(
        WEBSITE_MEDIA_BUCKET
      )
      .getPublicUrl(
        filePath
      );

  return {
    path: filePath,
    publicUrl:
      data.publicUrl,
  };
}

export async function replaceWebsiteImage({
  file,
  oldPath,
  folder,
}: UploadWebsiteImageOptions & {
  oldPath?:
    | string
    | null;
}): Promise<UploadedWebsiteImage> {
  const uploadedImage =
    await uploadWebsiteImage({
      file,
      folder,
    });

  if (oldPath) {
    try {
      await deleteWebsiteImage(
        oldPath
      );
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
  const { error } =
    await supabase.storage
      .from(
        WEBSITE_MEDIA_BUCKET
      )
      .remove([
        filePath,
      ]);

  if (error) {
    throw new Error(
      error.message
    );
  }
}

export function getWebsiteImagePublicUrl(
  filePath: string
): string {
  const { data } =
    supabase.storage
      .from(
        WEBSITE_MEDIA_BUCKET
      )
      .getPublicUrl(
        filePath
      );

  return data.publicUrl;
}