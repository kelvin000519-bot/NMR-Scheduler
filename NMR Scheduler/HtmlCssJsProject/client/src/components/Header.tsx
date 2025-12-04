import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, LogOut, Settings, User, Shield } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Link } from "wouter";

interface HeaderProps {
  selectedDate: Date;
}

export function Header({ selectedDate }: HeaderProps) {
  const { user } = useAuth();

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.email || "사용자";
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
              <Calendar className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold" data-testid="text-app-title">
              NMR Scheduler
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 rounded-md bg-muted px-4 py-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-sm font-medium" data-testid="text-current-date">
              {format(selectedDate, "yyyy년 M월 d일 (EEEE)", { locale: ko })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user?.isAdmin && (
            <Link href="/admin">
              <Button variant="outline" size="sm" data-testid="button-admin-dashboard">
                <Shield className="h-4 w-4 mr-2" />
                관리자
              </Button>
            </Link>
          )}
          
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full" data-testid="button-user-menu">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.profileImageUrl || undefined} alt={getDisplayName()} style={{ objectFit: "cover" }} />
                  <AvatarFallback className="text-xs">{getInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImageUrl || undefined} style={{ objectFit: "cover" }} />
                  <AvatarFallback className="text-xs">{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium" data-testid="text-user-name">{getDisplayName()}</span>
                  <span className="text-xs text-muted-foreground" data-testid="text-user-email">{user?.email}</span>
                </div>
              </div>
              <DropdownMenuSeparator />
              <div className="p-2">
                {user?.isApproved ? (
                  <Badge variant="default" className="w-full justify-center">승인됨</Badge>
                ) : (
                  <Badge variant="secondary" className="w-full justify-center">승인 대기중</Badge>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <a href="/api/logout" className="flex items-center cursor-pointer" data-testid="button-logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  로그아웃
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
