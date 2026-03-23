"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { signOut } from "@/app/actions/auth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  CheckCheckIcon,
  CheckIcon,
  ClipboardCopy,
  HashIcon,
  LogOutIcon,
  MessageCircle,
  MessageSquareIcon,
  MessagesSquareIcon,
  PanelLeftIcon,
  Trash2,
  UserIcon,
  UsersIcon,
} from "lucide-react"

import { leaveGroup } from "@/app/actions/groups"
import { clearDMConversation } from "@/app/actions/direct-messages"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import type { IProfile, IRoom } from "@/db/schema"
import type { IDMPartnerWithLastMessage } from "@/db/queries/direct-messages"
import type { TSidebarSection, INavItem, IAppSidebarProps } from "@/types/sidebar"

const formatMessageTime = (value: Date) => {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

const getLastMessageStatus = (partner: IDMPartnerWithLastMessage, currentUserId: string) => {
  const lastMessage = partner.lastMessage
  if (!lastMessage || lastMessage.senderId !== currentUserId) {
    return null
  }

  if (lastMessage.readAt) {
    return {
      text: "Read",
      icon: <CheckCheckIcon className="h-3 w-3" />,
    }
  }

  if (lastMessage.deliveredAt) {
    return {
      text: "Delivered",
      icon: <CheckCheckIcon className="h-3 w-3" />,
    }
  }

  return {
    text: "Sent",
    icon: <CheckIcon className="h-3 w-3" />,
  }
}

export const AppSidebar = ({
  lang,
  groups,
  dmPartners,
  currentUser,
  ...props
}: IAppSidebarProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const { open, setOpen, toggleSidebar } = useSidebar()
  const [query, setQuery] = React.useState("")
  const [optimisticPathname, setOptimisticPathname] = React.useState<string | null>(null)
  const [pendingPathname, setPendingPathname] = React.useState<string | null>(null)
  const navMain = React.useMemo<INavItem[]>(
    () => [
      { key: "groups", title: "Groups", icon: UsersIcon },
      { key: "dms", title: "Direct Messages", icon: MessagesSquareIcon },
    ],
    []
  )
  const [activeItem, setActiveItem] = React.useState<INavItem>(navMain[0])

  React.useEffect(() => {
    setOptimisticPathname(null)
    setPendingPathname(null)

    const nextKey: TSidebarSection = pathname.includes("/dms/") ? "dms" : "groups"
    const nextItem = navMain.find((item) => item.key === nextKey)

    if (nextItem) {
      setActiveItem(nextItem)
    }
  }, [navMain, pathname])

  React.useEffect(() => {
    const chatRootPath = `/${lang}/chat`
    const profilePath = `/${lang}/profile`
    router.prefetch(chatRootPath)
    router.prefetch(profilePath)

    for (const group of groups) {
      router.prefetch(`/${lang}/chat/groups/${group.id}`)
    }

    for (const partner of dmPartners) {
      router.prefetch(`/${lang}/chat/dms/${partner.id}`)
    }
  }, [dmPartners, groups, lang, router])

  const activePathname = optimisticPathname ?? pathname
  const profilePath = `/${lang}/profile`

  const filteredGroups = React.useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) {
      return groups
    }

    return groups.filter(
      (group) =>
        group.name.toLowerCase().includes(keyword) ||
        (group.description?.toLowerCase().includes(keyword) ?? false)
    )
  }, [groups, query])

  const filteredDMPartners = React.useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) {
      return dmPartners
    }

    return dmPartners.filter((partner) =>
      partner.username.toLowerCase().includes(keyword)
    )
  }, [dmPartners, query])

  const handleSignOut = async () => {
    await signOut(lang)
  }

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
      {...props}
    >
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar
        collapsible="none"
        className="w-[calc(var(--sidebar-width-icon)+1px)]! border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <Link href={`/${lang}/chat`}>
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <MessageSquareIcon className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">RealtimeChat</span>
                    <span className="truncate text-xs">Workspace</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {navMain.map((item) => (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      onClick={() => {
                        setActiveItem(item)
                        setOpen(true)
                      }}
                      isActive={activeItem.key === item.key}
                      className="px-2.5 md:px-2"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={activePathname === profilePath}
                onMouseEnter={() => {
                  router.prefetch(profilePath)
                }}
              >
                <Link
                  href={profilePath}
                  prefetch
                  onClick={() => {
                    setOptimisticPathname(profilePath)
                    setPendingPathname(profilePath)
                  }}
                >
                  <Avatar className="h-5 w-5 shrink-0">
                    <AvatarFallback className="text-[10px]">
                      {currentUser.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{currentUser.username}</span>
                  <UserIcon className="ml-auto h-3.5 w-3.5" />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleSignOut}>
                <LogOutIcon className="h-4 w-4" />
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-base font-medium text-foreground">{activeItem.title}</div>
            <SidebarMenuButton
              tooltip={{
                children: open ? "Collapse sidebar" : "Expand sidebar",
                hidden: false,
              }}
              onClick={toggleSidebar}
              aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
              className="h-8 w-8 shrink-0 justify-center p-0"
            >
              <PanelLeftIcon className="h-4 w-4" />
            </SidebarMenuButton>
          </div>
          <SidebarInput
            placeholder={activeItem.key === "groups" ? "Search groups..." : "Search users..."}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              {activeItem.key === "groups" && filteredGroups.length === 0 && (
                <p className="px-4 py-3 text-sm text-muted-foreground">
                  {groups.length === 0 ? "No groups yet" : "No groups match your search"}
                </p>
              )}

              {activeItem.key === "groups" &&
                filteredGroups.map((group) => {
                  const targetPath = `/${lang}/chat/groups/${group.id}`
                  const isActive = activePathname === targetPath
                  const isPending = pendingPathname === targetPath && pathname !== targetPath

                  return (
                    <ContextMenu key={group.id}>
                      <ContextMenuTrigger asChild>
                        <Link
                          href={targetPath}
                          prefetch
                          onMouseEnter={() => {
                            router.prefetch(targetPath)
                          }}
                          onClick={() => {
                            setOptimisticPathname(targetPath)
                            setPendingPathname(targetPath)
                          }}
                          className="flex items-start gap-2 border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                          <HashIcon className="mt-0.5 h-4 w-4 shrink-0" />
                          <div className="grid min-w-0 gap-1">
                            {isPending ? (
                              <>
                                <span className="h-3 w-24 animate-pulse rounded bg-muted" />
                                <span className="h-3 w-32 animate-pulse rounded bg-muted" />
                              </>
                            ) : (
                              <>
                                <span className={`truncate font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                                  {group.name}
                                </span>
                                <span className="line-clamp-2 text-xs text-muted-foreground">
                                  {group.description ?? "No description"}
                                </span>
                              </>
                            )}
                          </div>
                        </Link>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-52">
                        <ContextMenuItem onSelect={() => router.push(targetPath)}>
                          <HashIcon className="h-4 w-4" />
                          Open group
                        </ContextMenuItem>
                        <ContextMenuItem
                          onSelect={() => {
                            navigator.clipboard.writeText(group.name).catch(() => {})
                          }}
                        >
                          <ClipboardCopy className="h-4 w-4" />
                          Copy name
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={async () => {
                            const isOwner = group.ownerId === currentUser.id
                            const label = isOwner ? "delete this group" : "leave this group"
                            if (!window.confirm(`Are you sure you want to ${label}?`)) return
                            await leaveGroup(group.id)
                            if (activePathname === targetPath) router.push(`/${lang}/chat`)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          {group.ownerId === currentUser.id ? "Delete group" : "Leave group"}
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  )
                })}

              {activeItem.key === "dms" && filteredDMPartners.length === 0 && (
                <p className="px-4 py-3 text-sm text-muted-foreground">
                  {dmPartners.length === 0 ? "No conversations yet" : "No users match your search"}
                </p>
              )}

              {activeItem.key === "dms" &&
                filteredDMPartners.map((partner) => {
                  const targetPath = `/${lang}/chat/dms/${partner.id}`
                  const isActive = activePathname === targetPath
                  const isPending = pendingPathname === targetPath && pathname !== targetPath
                  const status = getLastMessageStatus(partner, currentUser.id)
                  const isUnreadIncoming = Boolean(
                    partner.lastMessage &&
                    partner.lastMessage.senderId !== currentUser.id &&
                    !partner.lastMessage.readAt
                  )
                  const messagePreview = partner.lastMessage?.content ?? "No messages yet"
                  const messageTime = partner.lastMessage?.createdAt

                  return (
                    <ContextMenu key={partner.id}>
                      <ContextMenuTrigger asChild>
                        <Link
                          href={targetPath}
                          prefetch
                          onMouseEnter={() => {
                            router.prefetch(targetPath)
                          }}
                          onClick={() => {
                            setOptimisticPathname(targetPath)
                            setPendingPathname(targetPath)
                          }}
                          className="flex items-start gap-3 border-b p-4 text-sm leading-tight last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                          <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                            <AvatarFallback className="text-[10px]">
                              {partner.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              {isPending ? (
                                <>
                                  <span className="h-3 w-28 animate-pulse rounded bg-muted" />
                                  <span className="h-3 w-10 animate-pulse rounded bg-muted" />
                                </>
                              ) : (
                                <>
                                  <div className="flex min-w-0 items-center gap-2">
                                    {isUnreadIncoming && (
                                      <span className="h-2 w-2 shrink-0 rounded-full bg-foreground" aria-hidden="true" />
                                    )}
                                    <span className={`truncate font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                                      {partner.username}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    {partner.unreadCount > 0 && (
                                      <span className="inline-flex min-w-4 items-center justify-center rounded-full bg-foreground px-1.5 py-0.5 text-[10px] font-semibold text-background">
                                        {partner.unreadCount > 99 ? "99+" : partner.unreadCount}
                                      </span>
                                    )}
                                    {messageTime && (
                                      <span className="shrink-0 text-[10px] text-muted-foreground">
                                        {formatMessageTime(messageTime)}
                                      </span>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                            {isPending ? (
                              <span className="h-3 w-40 animate-pulse rounded bg-muted" />
                            ) : (
                              <div className="flex items-center gap-1.5">
                                {status && (
                                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                                    {status.icon}
                                    {status.text}
                                  </span>
                                )}
                                <span
                                  className={`truncate text-xs ${isUnreadIncoming ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                                >
                                  {messagePreview}
                                </span>
                              </div>
                            )}
                          </div>
                        </Link>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-52">
                        <ContextMenuItem onSelect={() => router.push(targetPath)}>
                          <MessageCircle className="h-4 w-4" />
                          Open conversation
                        </ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={async () => {
                            if (!window.confirm(`Clear all messages with ${partner.username}?`)) return
                            await clearDMConversation(partner.id)
                            if (activePathname === targetPath) router.push(`/${lang}/chat`)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Clear conversation
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  )
                })}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  )
}
