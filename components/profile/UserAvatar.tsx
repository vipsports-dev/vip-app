'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function UserAvatar({
  username,
  imageUrl,
}: {
  username: string
  imageUrl?: string | null
}) {
  return (
    <Avatar className="h-10 w-10 border">
      {imageUrl ? (
        <AvatarImage src={imageUrl} alt={username} />
      ) : (
        <AvatarFallback>{username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
      )}
    </Avatar>
  )
}
