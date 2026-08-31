import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  SWIMFAST_PRODUCTION_PARENT_ORIGIN,
  buildCompletedEvent,
  buildStartedEvent,
  createQandaParentBridge,
  resolveParentMessageOrigins,
  sanitizeOrigin,
  type QandaParentEvent,
} from "./parent-events.ts";

function createMockParent() {
  const messages: Array<{ data: QandaParentEvent; origin: string }> = [];
  return {
    messages,
    parent: {
      postMessage(message: unknown, targetOrigin: string) {
        messages.push({ data: message as QandaParentEvent, origin: targetOrigin });
      },
    },
  };
}

describe("parent origin", () => {
  it("always includes the production SwimFast origin and never uses *", () => {
    const production = resolveParentMessageOrigins({ nodeEnv: "production" });
    assert.deepEqual(production, [SWIMFAST_PRODUCTION_PARENT_ORIGIN]);
    assert.equal(production.includes("*"), false);
  });

  it("allows one extra configured origin", () => {
    const origins = resolveParentMessageOrigins({
      nodeEnv: "production",
      extraOrigin: "http://localhost:4000/path",
    });
    assert.deepEqual(origins, [SWIMFAST_PRODUCTION_PARENT_ORIGIN, "http://localhost:4000"]);
  });

  it("adds only explicit localhost origins in development", () => {
    const origins = resolveParentMessageOrigins({ nodeEnv: "development" });
    assert.deepEqual(origins, [
      SWIMFAST_PRODUCTION_PARENT_ORIGIN,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ]);
  });

  it("rejects wildcard and invalid extra origins", () => {
    assert.equal(sanitizeOrigin("*"), undefined);
    assert.equal(sanitizeOrigin("not a url"), undefined);
    assert.equal(sanitizeOrigin("ftp://icanswimfast.com"), undefined);
  });
});

describe("payloads", () => {
  it("builds started events with only slug and submissionId", () => {
    const event = buildStartedEvent("sf-coaching-global", "sub_123");
    assert.deepEqual(event, {
      type: "qanda.started",
      slug: "sf-coaching-global",
      submissionId: "sub_123",
    });
    assert.equal("email" in (event ?? {}), false);
    assert.equal("name" in (event ?? {}), false);
    assert.equal("answers" in (event ?? {}), false);
    assert.equal("values" in (event ?? {}), false);
  });

  it("omits started events without a submission id", () => {
    assert.equal(buildStartedEvent("sf-coaching-global", undefined), null);
    assert.equal(buildStartedEvent("sf-coaching-global", ""), null);
  });

  it("includes segmentKey on completed events only when present", () => {
    const withSegment = buildCompletedEvent("start-here", "sub_123", "beginner_technique");
    assert.deepEqual(withSegment, {
      type: "qanda.completed",
      slug: "start-here",
      submissionId: "sub_123",
      segmentKey: "beginner_technique",
    });

    const withoutSegment = buildCompletedEvent("start-here", "sub_123", null);
    assert.deepEqual(withoutSegment, {
      type: "qanda.completed",
      slug: "start-here",
      submissionId: "sub_123",
    });
    assert.equal("segmentKey" in (withoutSegment ?? {}), false);
    assert.equal("email" in (withoutSegment ?? {}), false);
    assert.equal("answers" in (withoutSegment ?? {}), false);
  });
});

describe("start emission", () => {
  it("does not treat skip-intro page load as a start", () => {
    const mock = createMockParent();
    const bridge = createQandaParentBridge(() => ({
      parent: mock.parent,
      isEmbedded: true,
      origins: [SWIMFAST_PRODUCTION_PARENT_ORIGIN],
    }));
    // Showing question 1 without creating a submission must not emit.
    assert.equal(mock.messages.length, 0);
    bridge.notifyStarted("sf-coaching-dxb", undefined);
    assert.equal(mock.messages.length, 0);
  });

  it("emits exactly one qanda.started after a successful start", () => {
    const mock = createMockParent();
    const bridge = createQandaParentBridge(() => ({
      parent: mock.parent,
      isEmbedded: true,
      origins: [SWIMFAST_PRODUCTION_PARENT_ORIGIN],
    }));

    bridge.notifyStarted("sf-coaching-global", "sub_123");
    bridge.notifyStarted("sf-coaching-global", "sub_123");

    assert.equal(mock.messages.length, 1);
    assert.deepEqual(mock.messages[0]?.data, {
      type: "qanda.started",
      slug: "sf-coaching-global",
      submissionId: "sub_123",
    });
    assert.equal(mock.messages[0]?.origin, SWIMFAST_PRODUCTION_PARENT_ORIGIN);
  });

  it("does not emit if start never succeeds", () => {
    const mock = createMockParent();
    const bridge = createQandaParentBridge(() => ({
      parent: mock.parent,
      isEmbedded: true,
      origins: [SWIMFAST_PRODUCTION_PARENT_ORIGIN],
    }));
    bridge.notifyStarted("sf-coaching-global", undefined);
    assert.equal(mock.messages.length, 0);
  });

  it("does not emit when not embedded", () => {
    const mock = createMockParent();
    const bridge = createQandaParentBridge(() => ({
      parent: mock.parent,
      isEmbedded: false,
      origins: [SWIMFAST_PRODUCTION_PARENT_ORIGIN],
    }));
    bridge.notifyStarted("sf-coaching-global", "sub_123");
    assert.equal(mock.messages.length, 0);
  });
});

describe("completion emission", () => {
  it("does not emit qanda.completed for an intermediate answer", () => {
    const mock = createMockParent();
    const bridge = createQandaParentBridge(() => ({
      parent: mock.parent,
      isEmbedded: true,
      origins: [SWIMFAST_PRODUCTION_PARENT_ORIGIN],
    }));
    bridge.notifyCompleted("sf-coaching-global", "sub_123", {
      completed: false,
      routing: { segmentKey: "should_not_leak" },
    });
    assert.equal(mock.messages.length, 0);
  });

  it("emits exactly one qanda.completed when the server reports completion", () => {
    const mock = createMockParent();
    const bridge = createQandaParentBridge(() => ({
      parent: mock.parent,
      isEmbedded: true,
      origins: [SWIMFAST_PRODUCTION_PARENT_ORIGIN],
    }));
    const answerResponse = {
      completed: true,
      redirectUrl: "https://icanswimfast.com/thanks",
      routing: { segmentKey: "beginner_technique" },
      values: { email: "hidden@example.com", name: "Hidden" },
    };

    bridge.notifyCompleted("start-here", "sub_123", answerResponse);
    bridge.notifyCompleted("start-here", "sub_123", answerResponse);

    assert.equal(mock.messages.length, 1);
    assert.deepEqual(mock.messages[0]?.data, {
      type: "qanda.completed",
      slug: "start-here",
      submissionId: "sub_123",
      segmentKey: "beginner_technique",
    });
    assert.equal("email" in mock.messages[0].data, false);
    assert.equal("name" in mock.messages[0].data, false);
    assert.equal("values" in mock.messages[0].data, false);
    assert.equal("answers" in mock.messages[0].data, false);
  });

  it("does not emit completion when the answer request failed to complete", () => {
    const mock = createMockParent();
    const bridge = createQandaParentBridge(() => ({
      parent: mock.parent,
      isEmbedded: true,
      origins: [SWIMFAST_PRODUCTION_PARENT_ORIGIN],
    }));
    bridge.notifyCompleted("sf-coaching-global", "sub_123", {});
    assert.equal(mock.messages.length, 0);
  });

  it("emits completion independently of redirect handling", () => {
    const mock = createMockParent();
    const redirects: string[] = [];
    const bridge = createQandaParentBridge(() => ({
      parent: mock.parent,
      isEmbedded: true,
      origins: [SWIMFAST_PRODUCTION_PARENT_ORIGIN],
    }));
    const data = {
      completed: true as const,
      redirectUrl: "https://icanswimfast.com/thanks",
      routing: { segmentKey: "beginner_technique" },
    };

    bridge.notifyCompleted("start-here", "sub_123", data);
    assert.equal(mock.messages.length, 1);
    assert.equal(redirects.length, 0);
    if (data.redirectUrl) redirects.push(data.redirectUrl);
    assert.equal(redirects.length, 1);
    assert.equal(mock.messages[0]?.data.type, "qanda.completed");
  });
});
