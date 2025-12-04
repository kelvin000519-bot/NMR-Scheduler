import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import type { Reservation } from "@shared/schema";
import { Clock, User, X, AlertTriangle } from "lucide-react";

interface TimeTableProps {
  selectedDate: Date;
  reservations: Reservation[];
  isLoading: boolean;
}

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 10) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      slots.push(timeString);
    }
  }
  return slots;
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const newHour = Math.floor(totalMinutes / 60) % 24;
  const newMinute = totalMinutes % 60;
  return `${newHour.toString().padStart(2, "0")}:${newMinute.toString().padStart(2, "0")}`;
}

export function TimeTable({ selectedDate, reservations, isLoading }: TimeTableProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const timeSlots = useMemo(() => generateTimeSlots(), []);
  
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [showReserveDialog, setShowReserveDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<Reservation | null>(null);

  const dateString = format(selectedDate, "yyyy-MM-dd");

  const reservationMap = useMemo(() => {
    const map: Record<string, Reservation> = {};
    reservations.forEach((res) => {
      const startMinutes = parseInt(res.startTime.split(":")[0]) * 60 + parseInt(res.startTime.split(":")[1]);
      const endMinutes = parseInt(res.endTime.split(":")[0]) * 60 + parseInt(res.endTime.split(":")[1]);
      
      for (let m = startMinutes; m < endMinutes; m += 10) {
        const hour = Math.floor(m / 60);
        const minute = m % 60;
        const key = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        map[key] = res;
      }
    });
    return map;
  }, [reservations]);

  const createReservation = useMutation({
    mutationFn: async (data: { date: string; startTime: string; endTime: string }) => {
      return await apiRequest("POST", "/api/reservations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reservations", dateString] });
      setSelectedSlots([]);
      setShowReserveDialog(false);
      toast({
        title: "예약 완료",
        description: "시간이 성공적으로 예약되었습니다.",
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
        title: "예약 실패",
        description: error.message || "예약 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const cancelReservation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/reservations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reservations", dateString] });
      setShowCancelDialog(false);
      setReservationToCancel(null);
      toast({
        title: "예약 취소됨",
        description: "예약이 성공적으로 취소되었습니다.",
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
        title: "취소 실패",
        description: error.message || "예약 취소 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleSlotClick = (time: string) => {
    if (!user?.isApproved) {
      toast({
        title: "예약 불가",
        description: "관리자 승인 후 예약이 가능합니다.",
        variant: "destructive",
      });
      return;
    }

    const existingReservation = reservationMap[time];
    
    if (existingReservation) {
      if (existingReservation.userId === user.id || user.isAdmin) {
        setReservationToCancel(existingReservation);
        setShowCancelDialog(true);
      }
      return;
    }

    if (selectedSlots.includes(time)) {
      setSelectedSlots(selectedSlots.filter((t) => t !== time));
      return;
    }

    const newSlots = [...selectedSlots, time].sort();
    
    if (newSlots.length > 3) {
      toast({
        title: "예약 제한",
        description: "최대 30분(3칸)까지만 연속 예약할 수 있습니다.",
        variant: "destructive",
      });
      return;
    }

    if (newSlots.length > 1) {
      const sortedMinutes = newSlots
        .map((t) => {
          const [h, m] = t.split(":").map(Number);
          return h * 60 + m;
        })
        .sort((a, b) => a - b);

      for (let i = 1; i < sortedMinutes.length; i++) {
        if (sortedMinutes[i] - sortedMinutes[i - 1] !== 10) {
          toast({
            title: "연속되지 않은 시간",
            description: "연속된 시간 슬롯만 선택할 수 있습니다.",
            variant: "destructive",
          });
          return;
        }
      }
    }

    setSelectedSlots(newSlots);
  };

  const handleReserve = () => {
    if (selectedSlots.length === 0) return;
    setShowReserveDialog(true);
  };

  const confirmReservation = () => {
    const sortedSlots = [...selectedSlots].sort();
    const startTime = sortedSlots[0];
    const endTime = addMinutes(sortedSlots[sortedSlots.length - 1], 10);

    createReservation.mutate({
      date: dateString,
      startTime,
      endTime,
    });
  };

  const confirmCancelReservation = () => {
    if (reservationToCancel) {
      cancelReservation.mutate(reservationToCancel.id);
    }
  };

  const getSlotClassName = (time: string) => {
    const reservation = reservationMap[time];
    const isSelected = selectedSlots.includes(time);
    const isOwn = reservation?.userId === user?.id;

    let baseClasses = "h-10 border-b border-r transition-colors cursor-pointer flex items-center justify-center text-xs font-medium";

    if (reservation) {
      if (isOwn) {
        baseClasses += " bg-primary/20 text-primary border-primary/30";
      } else {
        baseClasses += " bg-muted text-muted-foreground";
      }
    } else if (isSelected) {
      baseClasses += " bg-primary text-primary-foreground";
    } else {
      baseClasses += " hover-elevate";
    }

    return baseClasses;
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-2">
        {Array.from({ length: 20 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {selectedSlots.length > 0 && (
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-muted/80 backdrop-blur p-4 border-b">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                선택됨: {selectedSlots.length}칸 ({selectedSlots.length * 10}분)
              </span>
              {selectedSlots.length === 3 && (
                <span className="text-xs text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  최대
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSlots([])}
                data-testid="button-clear-selection"
              >
                <X className="h-4 w-4 mr-1" />
                취소
              </Button>
              <Button
                size="sm"
                onClick={handleReserve}
                disabled={createReservation.isPending}
                data-testid="button-reserve"
              >
                예약하기
              </Button>
            </div>
          </div>
        )}

        <ScrollArea className="flex-1">
          <div className="grid grid-cols-[80px_1fr] border-l">
            <div className="sticky left-0 bg-background border-r">
              {timeSlots.map((time) => (
                <div
                  key={time}
                  className="h-10 flex items-center justify-end pr-3 border-b font-mono text-xs text-muted-foreground"
                >
                  {time}
                </div>
              ))}
            </div>
            <div>
              {timeSlots.map((time) => {
                const reservation = reservationMap[time];
                const isFirstSlotOfReservation = reservation && reservation.startTime === time;

                return (
                  <div
                    key={time}
                    className={getSlotClassName(time)}
                    onClick={() => handleSlotClick(time)}
                    data-testid={`slot-${time}`}
                  >
                    {isFirstSlotOfReservation && (
                      <div className="flex items-center gap-1 px-2">
                        <User className="h-3 w-3" />
                        <span className="truncate">{reservation.userName}</span>
                      </div>
                    )}
                    {reservation && !isFirstSlotOfReservation && (
                      <div className="w-full h-full" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </div>

      <Dialog open={showReserveDialog} onOpenChange={setShowReserveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>예약 확인</DialogTitle>
            <DialogDescription>
              다음 시간을 예약하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-2 p-4 bg-muted rounded-md">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {format(selectedDate, "yyyy년 M월 d일")}
                </p>
                <p className="text-sm text-muted-foreground font-mono">
                  {selectedSlots.length > 0 && (
                    <>
                      {[...selectedSlots].sort()[0]} -{" "}
                      {addMinutes([...selectedSlots].sort()[selectedSlots.length - 1], 10)}
                    </>
                  )}
                  {" "}({selectedSlots.length * 10}분)
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReserveDialog(false)}>
              취소
            </Button>
            <Button
              onClick={confirmReservation}
              disabled={createReservation.isPending}
              data-testid="button-confirm-reservation"
            >
              {createReservation.isPending ? "예약 중..." : "예약 확인"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>예약을 취소하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              {reservationToCancel && (
                <>
                  {reservationToCancel.userName}님의{" "}
                  {reservationToCancel.startTime} - {reservationToCancel.endTime} 예약을 취소합니다.
                  이 작업은 되돌릴 수 없습니다.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>돌아가기</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelReservation}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-cancel"
            >
              {cancelReservation.isPending ? "취소 중..." : "예약 취소"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
