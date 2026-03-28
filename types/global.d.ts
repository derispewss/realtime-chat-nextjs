import { ReactNode } from "react";

declare global {
    interface PageProps<T extends string = string> {
        params: Promise<{ [key: string]: string }>;
        searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
    }

    interface LayoutProps<T extends string = string> {
        params: Promise<{ [key: string]: string }>;
        children: ReactNode;
    }
}
