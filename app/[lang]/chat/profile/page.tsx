import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";

const LegacyChatProfilePage = async (props: PageProps<"/[lang]/chat/profile">) => {
    const { lang } = await props.params;
    await requireAuth(lang);

    redirect(`/${lang}/profile`);
};

export default LegacyChatProfilePage;
