import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";
import api from "../../api";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
  const navigate = useNavigate();
  const onSuccess = () => navigate('/', { replace: true });

  return (
    <AuthLayout>
      <SignInForm api={api} onSuccess={onSuccess}/>
    </AuthLayout>
  );
}
