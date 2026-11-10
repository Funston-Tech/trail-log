import { AuthForm } from '../components/AuthForm';
import { useAuth } from '../context/AuthContext';

export default function SignInScreen() {
  const { signIn } = useAuth();
  return <AuthForm mode="sign-in" onSubmit={signIn} />;
}
