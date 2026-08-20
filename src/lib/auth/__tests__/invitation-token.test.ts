import { describe, expect, it } from "vitest";
import { createInvitationToken, hashInvitationToken } from "@/lib/auth/invitation-token";

describe("invitation tokens", () => {
  it("only stores a one-way hash of the generated token", () => {
    const first = createInvitationToken();
    const second = createInvitationToken();

    expect(first.token).not.toBe(first.tokenHash);
    expect(first.tokenHash).toBe(hashInvitationToken(first.token));
    expect(first.token).not.toBe(second.token);
    expect(first.tokenHash).not.toBe(second.tokenHash);
  });
});