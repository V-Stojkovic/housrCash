/**
 * Invite code utilities
 * Must match the backend implementation for consistency
 */

export function generateInviteCode(groupId: number): string {
  // Convert to base36 and add a simple checksum
  const base36 = groupId.toString(36).toUpperCase();
  const checksum = (groupId * 7 + 13) % 36;
  const checksumChar = checksum.toString(36).toUpperCase();
  return `GRP-${base36}${checksumChar}`;
}

export function decodeInviteCode(inviteCode: string): number | null {
  // Remove GRP- prefix
  const code = inviteCode.replace(/^GRP-/i, '');
  
  if (code.length < 2) return null;
  
  // Extract checksum (last character) and base36 number
  const checksumChar = code.slice(-1);
  const base36 = code.slice(0, -1);
  
  // Decode base36 to number
  const groupId = parseInt(base36, 36);
  
  if (isNaN(groupId)) return null;
  
  // Verify checksum
  const expectedChecksum = (groupId * 7 + 13) % 36;
  const expectedChecksumChar = expectedChecksum.toString(36).toUpperCase();
  
  if (checksumChar !== expectedChecksumChar) return null;
  
  return groupId;
}
