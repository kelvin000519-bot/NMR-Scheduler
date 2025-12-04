import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar, Users, Clock, CheckCircle, XCircle, Shield, ArrowLeft, UserCheck, Trash2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import type { User, Reservation } from "@shared/schema";

export default function Admin() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      toast({
        title: "접근 권한 없음",
        description: "관리자만 접근할 수 있습니다.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, authLoading, navigate, toast]);

  const { data: pendingUsers = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users/pending"],
    enabled: !!user?.isAdmin,
  });

  const { data: allUsers = [], isLoading: allUsersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!user?.isAdmin,
  });

  const { data: allReservations = [], isLoading: reservationsLoading } = useQuery<Reservation[]>({
    queryKey: ["/api/admin/reservations"],
    enabled: !!user?.isAdmin,
  });

  const approveUser = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("POST", `/api/admin/users/${userId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "사용자 승인됨",
        description: "사용자가 성공적으로 승인되었습니다.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "인증 오류",
          description: "다시 로그인해주세요.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "승인 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectUser = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("POST", `/api/admin/users/${userId}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "사용자 거부됨",
        description: "사용자 요청이 거부되었습니다.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "거부 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteReservation = useMutation({
    mutationFn: async (reservationId: string) => {
      return await apiRequest("DELETE", `/api/reservations/${reservationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reservations"] });
      setShowDeleteDialog(false);
      setSelectedReservation(null);
      toast({
        title: "예약 삭제됨",
        description: "예약이 성공적으로 삭제되었습니다.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "삭제 실패",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return null;
  }

  const getInitials = (u: User) => {
    if (u.firstName && u.lastName) {
      return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
    }
    return u.email?.[0]?.toUpperCase() || "U";
  };

  const getDisplayName = (u: User) => {
    if (u.firstName && u.lastName) {
      return `${u.firstName} ${u.lastName}`;
    }
    return u.email || "사용자";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">관리자 대시보드</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-sm font-medium">전체 사용자</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-users">
                {allUsersLoading ? <Skeleton className="h-8 w-16" /> : allUsers.length}
              </div>
              <p className="text-xs text-muted-foreground">등록된 사용자 수</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-sm font-medium">승인 대기</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-pending-users">
                {usersLoading ? <Skeleton className="h-8 w-16" /> : pendingUsers.length}
              </div>
              <p className="text-xs text-muted-foreground">승인 대기 중인 사용자</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-sm font-medium">전체 예약</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-reservations">
                {reservationsLoading ? <Skeleton className="h-8 w-16" /> : allReservations.length}
              </div>
              <p className="text-xs text-muted-foreground">전체 예약 건수</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2" data-testid="tab-pending">
              승인 대기
              {pendingUsers.length > 0 && (
                <Badge variant="secondary" size="sm">{pendingUsers.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">사용자 관리</TabsTrigger>
            <TabsTrigger value="reservations" data-testid="tab-reservations">예약 관리</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>승인 대기 사용자</CardTitle>
                <CardDescription>
                  새로 가입한 사용자의 예약 권한을 승인하거나 거부할 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : pendingUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>승인 대기 중인 사용자가 없습니다.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>사용자</TableHead>
                        <TableHead>이메일</TableHead>
                        <TableHead>가입일</TableHead>
                        <TableHead className="text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingUsers.map((u) => (
                        <TableRow key={u.id} data-testid={`pending-user-${u.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={u.profileImageUrl || undefined} style={{ objectFit: "cover" }} />
                                <AvatarFallback className="text-xs">{getInitials(u)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{getDisplayName(u)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{u.email}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {u.createdAt && format(new Date(u.createdAt), "yyyy.MM.dd", { locale: ko })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => approveUser.mutate(u.id)}
                                disabled={approveUser.isPending}
                                data-testid={`button-approve-${u.id}`}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                승인
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectUser.mutate(u.id)}
                                disabled={rejectUser.isPending}
                                data-testid={`button-reject-${u.id}`}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                거부
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>전체 사용자</CardTitle>
                <CardDescription>
                  등록된 모든 사용자를 관리합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allUsersLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>사용자</TableHead>
                        <TableHead>이메일</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead>역할</TableHead>
                        <TableHead>가입일</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allUsers.map((u) => (
                        <TableRow key={u.id} data-testid={`user-${u.id}`}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={u.profileImageUrl || undefined} style={{ objectFit: "cover" }} />
                                <AvatarFallback className="text-xs">{getInitials(u)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{getDisplayName(u)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{u.email}</TableCell>
                          <TableCell>
                            {u.isApproved ? (
                              <Badge variant="default">승인됨</Badge>
                            ) : (
                              <Badge variant="secondary">대기중</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {u.isAdmin ? (
                              <Badge variant="outline">
                                <Shield className="h-3 w-3 mr-1" />
                                관리자
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">일반</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {u.createdAt && format(new Date(u.createdAt), "yyyy.MM.dd", { locale: ko })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reservations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>전체 예약</CardTitle>
                <CardDescription>
                  모든 예약을 조회하고 관리합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reservationsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : allReservations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>등록된 예약이 없습니다.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>예약자</TableHead>
                        <TableHead>날짜</TableHead>
                        <TableHead>시간</TableHead>
                        <TableHead>예약일</TableHead>
                        <TableHead className="text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allReservations.map((reservation) => (
                        <TableRow key={reservation.id} data-testid={`reservation-${reservation.id}`}>
                          <TableCell className="font-medium">{reservation.userName}</TableCell>
                          <TableCell>
                            {format(new Date(reservation.date), "yyyy.MM.dd (EEE)", { locale: ko })}
                          </TableCell>
                          <TableCell className="font-mono">
                            {reservation.startTime} - {reservation.endTime}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {reservation.createdAt && format(new Date(reservation.createdAt), "MM.dd HH:mm")}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedReservation(reservation);
                                setShowDeleteDialog(true);
                              }}
                              data-testid={`button-delete-reservation-${reservation.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>예약을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedReservation && (
                <>
                  {selectedReservation.userName}님의{" "}
                  {format(new Date(selectedReservation.date), "yyyy.MM.dd")}{" "}
                  {selectedReservation.startTime} - {selectedReservation.endTime} 예약을 삭제합니다.
                  이 작업은 되돌릴 수 없습니다.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedReservation && deleteReservation.mutate(selectedReservation.id)}
              className="bg-destructive text-destructive-foreground"
            >
              {deleteReservation.isPending ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
