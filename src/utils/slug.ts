export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // remove non-word chars
    .replace(/[\s_]+/g, '-')  // replace spaces/underscores with -
    .replace(/^-+|-+$/g, ''); // trim starting/trailing -
}
