CREATE TYPE "ListMemberRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

CREATE TABLE "list_members" (
    "id" UUID NOT NULL,
    "list_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "ListMemberRole" NOT NULL DEFAULT 'VIEWER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "list_members_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "list_invitations" (
    "id" UUID NOT NULL,
    "list_id" UUID NOT NULL,
    "inviter_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "role" "ListMemberRole" NOT NULL DEFAULT 'EDITOR',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "accepted_by_user_id" UUID,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "list_invitations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "list_members_list_id_user_id_key" ON "list_members"("list_id", "user_id");
CREATE INDEX "list_members_user_id_role_idx" ON "list_members"("user_id", "role");
CREATE UNIQUE INDEX "list_invitations_token_hash_key" ON "list_invitations"("token_hash");
CREATE INDEX "list_invitations_list_id_revoked_at_expires_at_idx" ON "list_invitations"("list_id", "revoked_at", "expires_at");

ALTER TABLE "list_members" ADD CONSTRAINT "list_members_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "shopping_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "list_invitations" ADD CONSTRAINT "list_invitations_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "shopping_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "list_members" ("id", "list_id", "user_id", "role")
SELECT gen_random_uuid(), "id", "user_id", 'OWNER'::"ListMemberRole"
FROM "shopping_lists"
ON CONFLICT ("list_id", "user_id") DO NOTHING;

ALTER TABLE "shopping_lists" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "shopping_items" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members can read shared lists"
ON "shopping_lists" FOR SELECT
USING (EXISTS (
    SELECT 1 FROM "list_members"
    WHERE "list_members"."list_id" = "shopping_lists"."id"
        AND "list_members"."user_id" = auth.uid()
));

CREATE POLICY "members can read shared items"
ON "shopping_items" FOR SELECT
USING (EXISTS (
    SELECT 1 FROM "list_members"
    WHERE "list_members"."list_id" = "shopping_items"."shopping_list_id"
        AND "list_members"."user_id" = auth.uid()
));

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_rel
        JOIN pg_publication ON pg_publication.oid = pg_publication_rel.prpubid
        WHERE pg_publication.pubname = 'supabase_realtime'
            AND pg_publication_rel.prrelid = 'public.shopping_lists'::regclass
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE "shopping_lists";
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_rel
        JOIN pg_publication ON pg_publication.oid = pg_publication_rel.prpubid
        WHERE pg_publication.pubname = 'supabase_realtime'
            AND pg_publication_rel.prrelid = 'public.shopping_items'::regclass
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE "shopping_items";
    END IF;
END $$;

CREATE POLICY "list members can join private list channels"
ON realtime.messages FOR SELECT TO authenticated
USING (
    split_part(topic, ':', 1) = 'shopping-list'
    AND EXISTS (
        SELECT 1 FROM public."list_members"
        WHERE public."list_members"."list_id" = split_part(topic, ':', 2)::uuid
            AND public."list_members"."user_id" = auth.uid()
    )
);