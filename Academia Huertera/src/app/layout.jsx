import '@/styles/globals.css';

export const metadata = {
  title: 'Academia Huertera | Curso de Horticultura Comercial Rentable',
  description: 'Aprende con Javier Soler a planificar, costear y operar un huerto comercial rentable en 1.000 m².',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
