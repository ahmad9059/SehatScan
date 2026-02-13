/**
 * Optional UploadThing integration for storing original face images.
 * If UploadThing is not configured/installed, this helper no-ops.
 */

interface UploadedFaceImage {
  url: string;
  key?: string;
  name?: string;
  size?: number;
}

interface UTUploadResponseData {
  url?: string;
  ufsUrl?: string;
  key?: string;
  name?: string;
  size?: number;
}

interface UTUploadResponse {
  data?: UTUploadResponseData | null;
  error?: unknown;
}

interface UTApiLike {
  uploadFiles: (file: File) => Promise<UTUploadResponse | UTUploadResponse[]>;
}

interface UTApiModule {
  UTApi?: new (opts?: { token?: string }) => UTApiLike;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeUploadedFaceImage(result: unknown): UploadedFaceImage | null {
  if (!isRecord(result)) return null;

  const dataValue = result["data"];
  const data = isRecord(dataValue) ? dataValue : null;
  if (!data) return null;

  const urlValue = data["url"] ?? data["ufsUrl"];
  const url = typeof urlValue === "string" ? urlValue : "";
  if (!url) return null;

  const keyValue = data["key"];
  const nameValue = data["name"];
  const sizeValue = data["size"];

  return {
    url,
    key: typeof keyValue === "string" ? keyValue : undefined,
    name: typeof nameValue === "string" ? nameValue : undefined,
    size: typeof sizeValue === "number" ? sizeValue : undefined,
  };
}

/**
 * Upload original face image to UploadThing (if configured).
 */
export async function uploadFaceImageCopy(
  file: File
): Promise<UploadedFaceImage | null> {
  const token = process.env.UPLOADTHING_TOKEN;
  if (!token) {
    return null;
  }

  try {
    // Use non-literal dynamic import so app still builds when the package
    // isn't installed in restricted/offline environments.
    const modulePath = "uploadthing/server";
    const uploadThingModule = (await import(modulePath)) as UTApiModule;

    if (typeof uploadThingModule.UTApi !== "function") {
      console.warn("UploadThing UTApi is unavailable in uploadthing/server.");
      return null;
    }

    const utapi = new uploadThingModule.UTApi({ token });
    const uploadResult = await utapi.uploadFiles(file);
    const firstResult = Array.isArray(uploadResult)
      ? uploadResult[0]
      : uploadResult;

    const normalized = normalizeUploadedFaceImage(firstResult);
    if (!normalized) {
      console.warn("UploadThing upload did not return a usable file URL.");
      return null;
    }

    return normalized;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      message.includes("Cannot find module") ||
      message.includes("Failed to resolve module")
    ) {
      console.warn(
        "UPLOADTHING_TOKEN is set, but the `uploadthing` package is not installed. Run `npm install uploadthing` to enable cloud image storage."
      );
      return null;
    }

    console.error("UploadThing face image upload failed:", error);
    return null;
  }
}

