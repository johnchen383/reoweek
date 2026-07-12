/** Deleting all data from /admin is enabled unless ENABLE_DELETE=false. */
export function isDeleteEnabled() {
  return process.env.ENABLE_DELETE?.trim().toLowerCase() !== 'false'
}
