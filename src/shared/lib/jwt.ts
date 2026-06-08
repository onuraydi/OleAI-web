export function decodeRoleFromToken(token: string): string {
  try {
    const payload = token.split('.')[1];
    if (!payload) return 'User';
    
    // Base64 decode, handle possible characters
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    const decoded = JSON.parse(jsonPayload);
    console.log("Decoded Token Payload:", decoded);
    
    // .NET Identity standard role claim
    const roleKey = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
    const roleClaim = decoded[roleKey] || decoded.role;
    
    if (Array.isArray(roleClaim)) {
      if (roleClaim.includes('Admin')) return 'Admin';
      return roleClaim[0] || 'User';
    }
    
    return roleClaim || 'User';
  } catch (error) {
    console.error("Token decoding failed", error);
    return 'User';
  }
}
