'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function UserAvatar({
  username,
  imageUrl,
}: {
  username?: string | null
  imageUrl?: string | null
}) {
  // Trim whitespace and guard against null
  const safeName = username?.trim() || ''
  const initial = safeName ? safeName[0].toUpperCase() : '?'

  return (
    <Avatar className="h-9 w-9 border bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-700">
      {imageUrl ? (
        <AvatarImage src={imageUrl} alt={safeName || 'User avatar'} />
      ) : (
        <AvatarFallback className="font-semibold text-sm text-gray-700 dark:text-gray-200">
          {initial}
        </AvatarFallback>
      )}
    </Avatar>
  )
}
