import { LoginFooter } from "./login-footer";
import { LoginForm } from "./login-form";
import { LoginHeader } from "./login-header";

export function LoginPanel() {
  return (
    <section className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-24">
      <div className="w-full max-w-md">
        <LoginHeader />
        <LoginForm />
        <LoginFooter />
      </div>
    </section>
  );
}
