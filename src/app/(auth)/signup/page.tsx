import { Suspense } from "react";
import SignUpForm from "./signup-form";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function SignUpPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SignUpForm />
    </Suspense>
  );
}
