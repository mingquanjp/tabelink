import { UserProfileView } from "@/components/user/profile/UserProfileView";

export default function MyProfilePage() {
    // Không truyền accountId -> API sẽ gọi đến /user-profile/me
    return <UserProfileView />;
}