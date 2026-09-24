/**
 * Support chat (customer <-> HQ) — shape + pure helpers. Rows come from the
 * `complaint_messages` table (docs/supabase-schema.sql §25): one thread per
 * order, readable/writable by that order's customer and by any admin, never
 * closed. RLS (`complaint_thread_participant`) is the only thing enforcing
 * who can see/send; nothing here duplicates it.
 */

export interface ComplaintMessageRow {
  id: string;
  order_id: string;
  sender_id: string;
  body: string;
  /** Key in the private `complaint-photos` bucket, not a URL — see signed URLs in SupportChat. */
  photo_path: string | null;
  created_at: string;
}

export const COMPLAINT_PHOTO_BUCKET = "complaint-photos";

/** Matches the bucket's file_size_limit (§26). Checked client-side only to give a clear error before uploading. */
export const COMPLAINT_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

/** Matches the bucket's allowed_mime_types (§26). */
export const COMPLAINT_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

/** How long a rendered evidence photo link stays valid. */
export const COMPLAINT_PHOTO_URL_TTL_SECONDS = 60 * 60;

/** Returns why a picked file can't be attached, or null if it's fine. */
export function validateComplaintPhoto(file: { type: string; size: number }): string | null {
  if (!COMPLAINT_PHOTO_TYPES.includes(file.type)) return "Please choose a JPEG, PNG, WebP or HEIC photo.";
  if (file.size > COMPLAINT_PHOTO_MAX_BYTES) return "That photo is over 5 MB — please choose a smaller one.";
  return null;
}

/**
 * Object key for an uploaded photo: `<order_id>/<uploader_id>/<random>.<ext>`.
 * The storage policies require exactly this layout (first folder = an order
 * the uploader can post to, second = the uploader), and the table's check
 * requires photo_path to sit under the message's own order.
 */
export function complaintPhotoPath(orderId: string, userId: string, fileName: string, id: string): string {
  const ext = /\.([a-z0-9]{1,5})$/i.exec(fileName)?.[1]?.toLowerCase() ?? "jpg";
  return `${orderId}/${userId}/${id}.${ext}`;
}

/**
 * A message needs text or a photo (the table's body check allows an empty
 * body only alongside a photo). Returns the trimmed body, or null when there's
 * nothing sendable.
 */
export function normalizeComplaintBody(raw: string, hasPhoto: boolean, maxLength: number): string | null {
  const body = raw.trim();
  if (body.length > maxLength) return null;
  if (!body && !hasPhoto) return null;
  return body;
}
