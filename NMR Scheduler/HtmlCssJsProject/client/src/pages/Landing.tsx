import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Calendar, Clock, Users, Shield, CheckCircle } from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Clock,
      title: "10분 단위 예약",
      description: "정밀한 시간 관리를 위해 10분 단위로 예약이 가능합니다.",
    },
    {
      icon: Calendar,
      title: "24시간 운영",
      description: "하루 종일 언제든지 기기를 예약하고 사용할 수 있습니다.",
    },
    {
      icon: Users,
      title: "팀 협업",
      description: "연구실 구성원들과 효율적으로 기기 사용 일정을 공유합니다.",
    },
    {
      icon: Shield,
      title: "관리자 승인",
      description: "승인된 사용자만 예약할 수 있어 체계적인 관리가 가능합니다.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
              <Calendar className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">NMR Scheduler</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild data-testid="button-login">
              <a href="/api/login">로그인</a>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6" data-testid="text-hero-title">
              실험실 기기 예약 시스템
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              NMR 분석기 및 연구 장비를 간편하게 예약하고 관리하세요.
              엑셀 스타일의 직관적인 인터페이스로 효율적인 시간 관리가 가능합니다.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild data-testid="button-get-started">
                <a href="/api/login">시작하기</a>
              </Button>
              <Button size="lg" variant="outline">
                더 알아보기
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-muted/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold text-center mb-12">주요 기능</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-center mb-12">사용 방법</h2>
            <div className="space-y-6">
              {[
                { step: 1, title: "로그인", description: "계정으로 로그인하세요." },
                { step: 2, title: "관리자 승인", description: "관리자의 사용 승인을 받으세요." },
                { step: 3, title: "시간 선택", description: "원하는 날짜와 시간 슬롯을 선택하세요." },
                { step: 4, title: "예약 완료", description: "예약을 확인하고 기기를 사용하세요." },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                    {item.step}
                  </div>
                  <div className="pt-1">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-muted/50">
          <div className="max-w-2xl mx-auto text-center">
            <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4">지금 바로 시작하세요</h2>
            <p className="text-muted-foreground mb-6">
              연구실 기기 예약 관리를 더욱 효율적으로 만들어보세요.
            </p>
            <Button size="lg" asChild>
              <a href="/api/login">무료로 시작하기</a>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">NMR Scheduler</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Laboratory Equipment Reservation System
          </p>
        </div>
      </footer>
    </div>
  );
}
