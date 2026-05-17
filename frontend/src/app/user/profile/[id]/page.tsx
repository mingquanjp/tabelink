import { UserProfileView } from "@/components/user/profile";

export default function UserProfilePage({ params }: { params: { id: string } }) {
    const accountId = params.id ? parseInt(params.id) : undefined;
    if (!accountId) {
        return <div>Invalid user ID</div>;
    }
    return <UserProfileView accountId={accountId} />;
}