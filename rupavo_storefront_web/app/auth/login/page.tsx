import { LoginForm } from "@/components/login-form";
import { Suspense } from "react";

function LoginFormFallback() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-md">
      <div className="animate-pulse bg-muted rounded-lg h-64 w-full" />
    </div>
  );
}

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
