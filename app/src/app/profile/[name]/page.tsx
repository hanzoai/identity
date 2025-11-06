import ProfileClientPage from './client-page'

// For static export, generate empty params (will be handled client-side)
export function generateStaticParams() {
  return []
}

export const dynamicParams = true

export default function ProfilePage() {
  return <ProfileClientPage />
}
