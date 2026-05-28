import Image from "next/image";
import { initials, cn } from "@/lib/utils";

const sizes = {
  sm: "w-6 h-6 text-[10px]",
  md: "w-8 h-8 text-xs",
  lg: "w-10 h-10 text-sm",
};

interface AvatarProps {
  firstName: string;
  lastName?: string | null;
  avatarUrl?: string | null;
  size?: keyof typeof sizes;
  className?: string;
}

export function Avatar({
  firstName,
  lastName,
  avatarUrl,
  size = "md",
  className,
}: AvatarProps) {
  const label = initials(firstName, lastName);

  return (
    <div
      title={`${firstName} ${lastName ?? ""}`.trim()}
      className={cn(
        "relative rounded-full flex items-center justify-center shrink-0",
        "bg-accent-dim text-accent font-medium border border-[--border-md]",
        sizes[size],
        className,
      )}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={label}
          fill
          className="rounded-full object-cover"
        />
      ) : (
        label
      )}
    </div>
  );
}

interface AvatarGroupProps {
  users: Array<{
    id: string;
    firstName: string;
    lastName?: string | null;
    avatarUrl?: string | null;
  }>;
  max?: number;
  size?: keyof typeof sizes;
}

export function AvatarGroup({ users, max = 3, size = "sm" }: AvatarGroupProps) {
  const visible = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <div className="flex items-center">
      {visible.map((user, i) => (
        <Avatar
          key={user.id}
          firstName={user.firstName}
          lastName={user.lastName}
          avatarUrl={user.avatarUrl}
          size={size}
          className={cn(i !== 0 && "-ml-1.5")}
        />
      ))}

      {overflow > 0 && (
        <div
          className={cn(
            "-ml-1.5 rounded-full flex items-center justify-center shrink-0",
            "bg-overlay text-muted font-medium border border-[--border-md] text-[10px]",
            sizes[size],
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
