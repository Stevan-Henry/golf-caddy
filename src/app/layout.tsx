import './globals.css'

export const metadata = {
  title: 'Golf Caddy',
  description: 'Your smart golf companion',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}