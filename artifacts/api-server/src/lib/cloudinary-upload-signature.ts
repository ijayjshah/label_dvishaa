import crypto from "node:crypto";

export type CloudinaryUploadSignatureResult = {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
};

/**
 * Build a signed payload for direct browser → Cloudinary uploads.
 * @param subfolder optional segment under CLOUDINARY_UPLOAD_FOLDER (e.g. "custom-orders")
 */
export function createCloudinaryUploadSignature(subfolder?: string): CloudinaryUploadSignatureResult | null {
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim() ?? "";
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim() ?? "";
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim() ?? "";
  if (!apiSecret || !cloudName || !apiKey) {
    return null;
  }

  const baseFolder = process.env.CLOUDINARY_UPLOAD_FOLDER?.trim() || "label-dvisha";
  const folder = subfolder ? `${baseFolder}/${subfolder}`.replace(/\/{2,}/g, "/") : baseFolder;
  const timestamp = Math.round(Date.now() / 1000);
  const toSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto.createHash("sha1").update(toSign + apiSecret).digest("hex");

  return { signature, timestamp, cloudName, apiKey, folder };
}
