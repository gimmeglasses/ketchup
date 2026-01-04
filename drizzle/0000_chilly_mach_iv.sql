CREATE TABLE "profiles" (
  "id" uuid PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "profiles"
  ADD CONSTRAINT "profiles_id_fk"
  FOREIGN KEY ("id") REFERENCES "auth"."users"("id")
  ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE POLICY "profiles_select_own"
  ON "profiles"
  AS PERMISSIVE FOR SELECT
  TO "authenticated"
  USING (auth.uid() = "profiles"."id");
--> statement-breakpoint

-- メール確認済みになったときに profiles を作成する関数
create or replace function public.handle_verified_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'name'
  );
  return new;
end;
$$;
--> statement-breakpoint

-- email_confirmed_at が NULL → NOT NULL になったときだけ発火
create trigger on_email_verified
  after update on auth.users
  for each row
  when (
    old.email_confirmed_at is null
    and new.email_confirmed_at is not null
  )
  execute procedure public.handle_verified_user();
