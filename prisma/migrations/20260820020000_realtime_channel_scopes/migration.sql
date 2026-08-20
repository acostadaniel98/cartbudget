DROP POLICY IF EXISTS "list members can join private list channels" ON realtime.messages;

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