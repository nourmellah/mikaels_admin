import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function SignIn() {
  const navigate = useNavigate();
  const onSuccess = () => navigate('/', { replace: true });
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    if (token) {
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  return (
    <AuthLayout>
      <SignInForm api={api} onSuccess={onSuccess}/>
    </AuthLayout>
  );
}
