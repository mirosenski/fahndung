"use client";

import Header from "~/components/layout/Header";
import Footer from "~/components/layout/Footer";
import RegisterForm from "~/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header variant="register" />
      <RegisterForm />
      <Footer variant="register" />
    </div>
  );
}
