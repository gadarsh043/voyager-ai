"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const collaborators = [
  { name: "Alex K.", initials: "AK", color: "bg-primary" },
  { name: "Sarah M.", initials: "SM", color: "bg-emerald-500" },
  { name: "James L.", initials: "JL", color: "bg-amber-500" },
]

export function CollaborativeAvatars() {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {collaborators.map((user) => (
            <Tooltip key={user.name}>
              <TooltipTrigger asChild>
                <Avatar className="h-7 w-7 border-2 border-card ring-0">
                  <AvatarFallback
                    className={`${user.color} text-[10px] font-semibold text-primary-foreground`}
                  >
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">{user.name} is editing</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs text-muted-foreground">3 editing now</span>
        </div>
      </div>
    </TooltipProvider>
  )
}
