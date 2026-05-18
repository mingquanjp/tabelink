import { UserProfileView } from "@/components/user/profile";
export default async function UserProfilePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const accountId = parseInt(id);

    if (isNaN(accountId)) {
        return <div>不正なユーザーIDです</div>;
    }

    return <UserProfileView accountId={accountId} />;
}