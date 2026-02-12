import { AskMeAgent } from "@/agent";
import { describe, expect, it, vi } from "vitest";

describe("AskMeAgent cleanup", () => {
  function createAgent(hasConnections: boolean) {
    const agent = Object.create(AskMeAgent.prototype) as AskMeAgent;

    const connections = hasConnections
      ? [{ id: "conn-1" }]
      : [];

    vi.spyOn(agent, "getConnections").mockReturnValue(
      connections as unknown as ReturnType<typeof agent.getConnections>,
    );
    vi.spyOn(agent, "destroy").mockResolvedValue(undefined);

    return agent;
  }

  it("should call destroy when no connections remain", async () => {
    const agent = createAgent(false);

    await agent.cleanup();

    expect(agent.destroy).toHaveBeenCalled();
  });

  it("should not call destroy when connections exist", async () => {
    const agent = createAgent(true);

    await agent.cleanup();

    expect(agent.destroy).not.toHaveBeenCalled();
  });
});
