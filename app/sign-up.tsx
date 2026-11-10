import { AuthForm } from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';

export default function SignUpScreen() {
  const { signUp } = useAuth();
  return <AuthForm mode="sign-up" onSubmit={signUp} />;
}
