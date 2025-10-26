import { GithubIcon, Image, LockIcon, MessageCircle, MessageCircleIcon } from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/common/components/ui/button";
import { Separator } from "~/common/components/ui/separator";

export default function AuthButtons() {
  return (
    <div className="w-full flex flex-col items-center gap-10">
      <div className="w-full flex flex-col items-center gap-2">
        <Separator className="w-full" />      
        <span className=" text-xs text-muted-foreground uppercase font-medium">
          Or continue with
        </span>
        <Separator className="w-full" />
      </div>
      <div className="w-full flex flex-col gap-2">
        <Button variant="outline" className="w-full asChild">
          <Link to="/auth/social/kakao/start" className="flex gap-1">
            <MessageCircleIcon className="w-5 h-5" />
            KakaoTalk
          </Link>
        </Button>
        <Button variant="outline" className="w-full">
          <Link to="/auth/social/github/start" className="flex gap-1">
            <img src="../app/assets/github.png" alt="github" className="w-5 h-5" />
            Github        
          </Link>        
        </Button>
        <Button variant="outline" className="w-full">
          <Link to="/auth/otp/start" className="flex gap-1">
            <LockIcon className="w-5 h-5" />
            OTP        
          </Link>
        </Button>
      </div>
    </div>
  );
}