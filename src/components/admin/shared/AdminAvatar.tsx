interface AdminAvatarProps {
  name?: string | null
}

export default function AdminAvatar({ name }: AdminAvatarProps) {
  const initials = (name ?? '-')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '-'

  return (
    <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-[#eee8ff] text-[13px] font-semibold text-[#6741f5]">
      {initials}
    </div>
  )
}
