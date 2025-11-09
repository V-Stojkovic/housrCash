// NextAuth route removed — frontend now performs authentication by calling
// the backend endpoint `/api/v0/user/login` directly. Keeping a no-op
// handler to avoid build-time route errors in case this file is still referenced.

export const GET = () => new Response('Not Found', { status: 404 });
export const POST = () => new Response('Not Found', { status: 404 });