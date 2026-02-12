import { AskMCP } from "@/mcp";
import { describe, expect, it, vi } from "vitest";

describe("AskMCP cleanup", () => {
  it("should clear all storage on alarm", async () => {
    const deleteAll = vi.fn().mockResolvedValue(undefined);
    const deleteAlarm = vi.fn().mockResolvedValue(undefined);

    const agent = Object.create(AskMCP.prototype) as AskMCP;
    Object.defineProperty(agent, "ctx", {
      value: {
        storage: { deleteAll, deleteAlarm },
      },
    });

    await agent.alarm();

    expect(deleteAll).toHaveBeenCalled();
    expect(deleteAlarm).toHaveBeenCalled();
  });
});
