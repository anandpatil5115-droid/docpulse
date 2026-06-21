import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { MainLayout } from "./pages/MainLayout";

type AuthView = "login" | "signup";

function App() {
  const { isAuthenticated } = useAuth();
  const [authView, setAuthView] = useState<AuthView>("login");
  const [signupMessage, setSignupMessage] = useState("");

  if (isAuthenticated) {
    return <MainLayout />;
  }

  const handleSignupSuccess = () => {
    setSignupMessage("Account created! Please sign in.");
    setAuthView("login");
  };

  if (authView === "signup") {
    return (
      <SignupPage
        onNavigateLogin={() => {
          setSignupMessage("");
          setAuthView("login");
        }}
        onSignupSuccess={handleSignupSuccess}
      />
    );
  }

  return (
    <LoginPage
      onNavigateSignup={() => {
        setSignupMessage("");
        setAuthView("signup");
      }}
      onLoginSuccess={() => {}}
      message={signupMessage}
    />
  );
}

export default App;
