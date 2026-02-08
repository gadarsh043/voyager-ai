"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Compass, Users, FolderOpen, PlusCircle, ChevronDown, Menu } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/AuthContext"

interface TopNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: "new-trip", label: "New Trip", icon: PlusCircle },
  { id: "existing-plans", label: "Existing Plans", icon: FolderOpen },
  { id: "join-trip", label: "Join Trip", icon: Users },
]

export function TopNav({ activeTab, onTabChange }: TopNavProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const initials = user?.full_name?.split(/\s+/).map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?"

  const handleTabSelect = (tabId: string) => {
    onTabChange(tabId)
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between gap-2 px-4 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-8">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex shrink-0 items-center gap-2 touch-manipulation"
            aria-label="Voyager AI home"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
              <Compass className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="truncate text-base font-semibold tracking-tight text-foreground font-display sm:text-lg">
              Voyager AI
            </span>
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all min-h-[44px]",
                    activeTab === tab.id
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {tab.label}
                </button>
              )
            })}
          </nav>

          <div className="flex md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-foreground hover:bg-muted touch-manipulation"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] p-0 sm:max-w-[280px]">
                <SheetHeader className="p-4 pb-2 text-left">
                  <SheetTitle className="text-base">Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-0 p-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleTabSelect(tab.id)}
                        className={cn(
                          "flex min-h-[48px] items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors touch-manipulation",
                          activeTab === tab.id
                            ? "bg-accent text-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        {tab.label}
                      </button>
                    )
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-muted touch-manipulation md:min-h-0 md:min-w-0">
                <Avatar className="h-8 w-8 shrink-0">
                  {user?.avatar_url ? (
                    <AvatarImage src={user.avatar_url} alt="" className="object-cover" />
                  ) : null}
                  <AvatarFallback className="bg-primary text-xs text-primary-foreground font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium text-foreground md:block">
                  {user?.full_name ?? "User"}
                </span>
                <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate("/profile")}>My Profile</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  logout()
                  navigate("/login")
                }}
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
