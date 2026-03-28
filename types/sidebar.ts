import type React from "react";
import type { Sidebar } from "@/components/ui/sidebar";
import type { IProfile, IRoom } from "@/db/schema";
import type { IDMPartnerWithLastMessage } from "@/db/queries/direct-messages";

export type TSidebarSection = "groups" | "dms";

export interface INavItem {
    key: TSidebarSection;
    title: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export interface IAppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    lang: string;
    groups: IRoom[];
    dmPartners: IDMPartnerWithLastMessage[];
    currentUser: Pick<IProfile, "id" | "username" | "avatarUrl">;
}
