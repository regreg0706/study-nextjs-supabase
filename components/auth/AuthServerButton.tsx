import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import AuthClientButton from "./AuthClientButton";

const AuthServerButton = async () => {
  const supabase = createServerComponentClient( { cookies } );
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <AuthClientButton session={user} />
  );
}

export default AuthServerButton;