import { NextResponse } from 'next/server';

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Proteger todas las rutas bajo /curso/
  if (pathname.startsWith('/curso')) {
    // Si no hay cookies de autenticación o en caso de verificar sesión, permitir o redirigir
    // Para previsualizaciones locales y desarrollo, se habilita el acceso.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/curso/:path*'],
};
