"use client";

import AuthPageLayout from "~/components/layout/AuthPageLayout";
import RegisterForm from "~/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthPageLayout variant="register">
      <RegisterForm />
    </AuthPageLayout>
  );
}
