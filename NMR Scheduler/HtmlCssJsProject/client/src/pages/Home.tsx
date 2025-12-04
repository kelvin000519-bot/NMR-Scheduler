import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { TimeTable } from "@/components/TimeTable";
import { DateNavigator } from "@/components/DateNavigator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Reservation } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateString = format(selectedDate, "yyyy-MM-dd");

  const { data: reservations = [], isLoading } = useQuery<Reservation[]>({
    queryKey: ["/api/reservations", dateString],
    queryFn: async () => {
      const res = await fetch(`/api/reservations?date=${dateString}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch reservations");
      return res.json();
    },
  });

  if (!user?.isApproved) {
    return (
      <div className="min-h-screen bg-background">
        <Header selectedDate={selectedDate} />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="max-w-md mx-4">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <CardTitle>승인 대기 중</CardTitle>
              <CardDescription>
                관리자의 승인을 기다리고 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  승인이 완료되면 기기 예약 기능을 사용할 수 있습니다.
                  승인 요청은 관리자에게 자동으로 전송되었습니다.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  승인 대기
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header selectedDate={selectedDate} />
      
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden lg:flex flex-col w-80 border-r bg-card">
          <div className="p-4 border-b">
            <h2 className="font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              예약 현황
            </h2>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))
            ) : reservations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">예약이 없습니다</p>
              </div>
            ) : (
              reservations.map((reservation) => (
                <Card
                  key={reservation.id}
                  className={reservation.userId === user?.id ? "border-primary/50" : ""}
                  data-testid={`reservation-card-${reservation.id}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-xs font-medium text-primary">
                            {reservation.userName[0]}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {reservation.userName}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {reservation.startTime} - {reservation.endTime}
                          </p>
                        </div>
                      </div>
                      {reservation.userId === user?.id && (
                        <Badge variant="outline" size="sm">내 예약</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
          <div className="p-4 border-t bg-muted/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">총 예약</span>
              <span className="font-medium">{reservations.length}건</span>
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden">
          <DateNavigator
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
          <div className="flex-1 overflow-hidden">
            <TimeTable
              selectedDate={selectedDate}
              reservations={reservations}
              isLoading={isLoading}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
