import Image from "next/image";
import backgroundImage from "@/public/japanese-cuisine.png";

export default function LoginPage() {
  return (
    <Image src={backgroundImage} alt="image of japanese cuisine" width={512} height={512} className="object-cover" />
  )
}
