interface AuthLoadingScreenProps {
  readonly message: string
}

export function AuthLoadingScreen({ message }: Readonly<AuthLoadingScreenProps>) {
  return (
    <div className="
      flex h-screen items-center justify-center bg-slate-50 font-sans
    "
    >
      <div className="font-medium text-slate-400">{message}</div>
    </div>
  );
}
