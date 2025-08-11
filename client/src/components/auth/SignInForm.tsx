import { useState } from "react";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { AxiosInstance } from 'axios';

interface SignInFormProps {
  api: AxiosInstance;
  onSuccess: () => void;
}

export default function SignInForm({ api, onSuccess }: SignInFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ username?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const errors: typeof validationErrors = {};
    if (!username) {
      errors.username = 'L\'Email est requis.';
    }
    if (!password) {
      errors.password = 'Le mot de passe est requis.';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    try {
      const { data } = await api.post('/auth/login', { username, password });
      localStorage.setItem('accessToken', data.accessToken);
      onSuccess();
    } catch (err: unknown) {
      // Check if error is an AxiosError with a response
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof (err as { response?: { status?: number } }).response === "object" &&
        (err as { response?: { status?: number } }).response?.status === 401
      ) {
        setSubmitError('Identifiants invalides, veuillez réessayer.');
      } else {
        setSubmitError('Une erreur est survenue. Veuillez réessayer plus tard.');
      }
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Connexion
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Entrez votre nom et votre mot de passe pour vous connecter !
            </p>
          </div>
          <div>
            
            <form onSubmit={handleSubmit}>
              {submitError ? <p className="text-red-600 text-center">{submitError}</p> : <br/>}
              <div className="space-y-6">
                <div>
                  <Label>
                    Nom d'utilisateur <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    placeholder="Entrez votre nom"
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  {validationErrors.username != '' && (
                    <p className="mt-1 text-sm text-red-600">{validationErrors.username}</p>
                  )}

                </div>
                <div>
                  <Label>
                    Mot de passe <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Entrez votre mot de passe"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                    {validationErrors.password != '' && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
                    )}
                  </div>
                </div>
                <div>
                    <Button
                        className="w-full"
                        size="sm"
                        disabled={!username || !password}
                        type="submit"
                    >
                     Connexion
                    </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
