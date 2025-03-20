import { cn } from "@/lib/utils";

import { createClient } from "@/lib/supabase/server";
import { ThemeSwitcher } from "./components/ThemeSwitcher";
import { SupabaseTestButton } from "./components/SupabaseTestButton";
import MilvusStatus from "./components/MilvusStatus";
import ApiTest from "./components/ApiTest"
import { secondary_font } from "@/lib/fonts";

export default async function Home() {
  const supabase = await createClient();
  const openai_key = process.env.OPENAI_KEY!;

  return (
    <div className="bg-background h-screen w-full flex flex-col justify-center items-center gap-8">
      <h1 className={cn("text-4xl font-semibold", secondary_font.className)}>Start Hack 2025</h1>
      {supabase ?
        <p>Supabase client successfully initialized!</p> :
        <p>Supabase did not respond yet...</p>
      }
      <ApiTest apikey={openai_key}/>
    </div>
  );
}

/**<ThemeSwitcher />
      <SupabaseTestButton />
      <MilvusStatus /> */