import { getCustomOrderUploadSignature, getUploadSignature } from "@workspace/api-client-react";

const MAX_BYTES = 10 * 1024 * 1024;

export async function uploadImageFileToCloudinary(
  file: File,
): Promise<{ imageUrl: string; cloudinaryPublicId: string }> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 10 MB or smaller");
  }

  const sig = await getUploadSignature();
  if (!sig.cloudName || !sig.apiKey) {
    throw new Error("Cloudinary is not configured on the server");
  }
  if (!sig.signature) {
    throw new Error("Could not get upload signature — check CLOUDINARY_* in .env");
  }

  const folder = sig.folder ?? "label-dvisha";
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", String(sig.timestamp));
  form.append("signature", sig.signature);
  form.append("folder", folder);

  const url = `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`;
  const res = await fetch(url, { method: "POST", body: form });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text.slice(0, 280) || "Cloudinary upload failed");
  }
  const data = JSON.parse(text) as { secure_url: string; public_id: string };
  return { imageUrl: data.secure_url, cloudinaryPublicId: data.public_id };
}

/** Public signed upload (folder `…/custom-orders`) for guest custom-order flow. */
export async function uploadCustomOrderInspirationToCloudinary(
  file: File,
): Promise<{ imageUrl: string; cloudinaryPublicId: string }> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be 10 MB or smaller");
  }

  const sig = await getCustomOrderUploadSignature();
  if (!sig.cloudName || !sig.apiKey) {
    throw new Error("Cloudinary is not configured on the server");
  }
  if (!sig.signature) {
    throw new Error("Could not get upload signature — check CLOUDINARY_* in .env");
  }

  const folder = sig.folder ?? "label-dvisha/custom-orders";
  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sig.apiKey);
  form.append("timestamp", String(sig.timestamp));
  form.append("signature", sig.signature);
  form.append("folder", folder);

  const url = `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`;
  const res = await fetch(url, { method: "POST", body: form });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text.slice(0, 280) || "Cloudinary upload failed");
  }
  const data = JSON.parse(text) as { secure_url: string; public_id: string };
  return { imageUrl: data.secure_url, cloudinaryPublicId: data.public_id };
}
