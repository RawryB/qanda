export const QANDA_STARTED_TYPE = "qanda.started" as const;
export const QANDA_COMPLETED_TYPE = "qanda.completed" as const;
export const SWIMFAST_PRODUCTION_PARENT_ORIGIN = "https://icanswimfast.com";

export type QandaStartedEvent = {
  type: typeof QANDA_STARTED_TYPE;
  slug: string;
  submissionId: string;
};

export type QandaCompletedEvent = {
  type: typeof QANDA_COMPLETED_TYPE;
  slug: string;
  submissionId: string;
  segmentKey?: string;
};

export type QandaParentEvent = QandaStartedEvent | QandaCompletedEvent;

export type ParentMessageTarget = {
  postMessage: (message: unknown, targetOrigin: string) => void;
};

export type ParentEventBridgeDeps = {
  parent: ParentMessageTarget | null;
  isEmbedded: boolean;
  origins: string[];
};

type AnswerCompletionData = {
  completed?: unknown;
  routing?: {
    segmentKey?: unknown;
  } | null;
};

/**
 * Production parent is always https://icanswimfast.com.
 * One extra origin may be supplied via NEXT_PUBLIC_SWIMFAST_PARENT_ORIGIN
 * (local SwimFast, staging). In NODE_ENV=development only, localhost:3000
 * and 127.0.0.1:3000 are also allowed. Never uses "*".
 */
export function resolveParentMessageOrigins(options: {
  nodeEnv: string;
  extraOrigin?: string;
}): string[] {
  const origins: string[] = [SWIMFAST_PRODUCTION_PARENT_ORIGIN];
  const extra = sanitizeOrigin(options.extraOrigin);
  if (extra && !origins.includes(extra)) origins.push(extra);

  if (options.nodeEnv === "development") {
    for (const devOrigin of ["http://localhost:3000", "http://127.0.0.1:3000"] as const) {
      if (!origins.includes(devOrigin)) origins.push(devOrigin);
    }
  }

  return origins;
}

export function sanitizeOrigin(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "*") return undefined;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" && url.protocol !== "http:") return undefined;
    if (url.username || url.password) return undefined;
    return url.origin;
  } catch {
    return undefined;
  }
}

export function buildStartedEvent(slug: string, submissionId: unknown): QandaStartedEvent | null {
  if (!isNonEmptyString(slug) || !isNonEmptyString(submissionId)) return null;
  return {
    type: QANDA_STARTED_TYPE,
    slug,
    submissionId,
  };
}

export function buildCompletedEvent(
  slug: string,
  submissionId: unknown,
  segmentKey?: unknown,
): QandaCompletedEvent | null {
  if (!isNonEmptyString(slug) || !isNonEmptyString(submissionId)) return null;
  const event: QandaCompletedEvent = {
    type: QANDA_COMPLETED_TYPE,
    slug,
    submissionId,
  };
  if (isNonEmptyString(segmentKey)) event.segmentKey = segmentKey;
  return event;
}

export function createQandaParentBridge(getDeps: () => ParentEventBridgeDeps) {
  const startedSubmissionIds = new Set<string>();
  const completedSubmissionIds = new Set<string>();

  function post(event: QandaParentEvent) {
    const deps = getDeps();
    if (!deps.isEmbedded || !deps.parent) return;
    for (const origin of deps.origins) {
      if (!origin || origin === "*") continue;
      deps.parent.postMessage(event, origin);
    }
  }

  return {
    notifyStarted(slug: string, submissionId: unknown) {
      const event = buildStartedEvent(slug, submissionId);
      if (!event) return;
      if (startedSubmissionIds.has(event.submissionId)) return;
      startedSubmissionIds.add(event.submissionId);
      post(event);
    },
    notifyCompleted(slug: string, submissionId: unknown, data: AnswerCompletionData) {
      if (data.completed !== true) return;
      const event = buildCompletedEvent(slug, submissionId, data.routing?.segmentKey);
      if (!event) return;
      if (completedSubmissionIds.has(event.submissionId)) return;
      completedSubmissionIds.add(event.submissionId);
      post(event);
    },
  };
}

function getWindowBridgeDeps(): ParentEventBridgeDeps {
  if (typeof window === "undefined") {
    return { parent: null, isEmbedded: false, origins: [] };
  }
  return {
    parent: window.parent,
    isEmbedded: window.parent !== window,
    origins: resolveParentMessageOrigins({
      nodeEnv: process.env.NODE_ENV ?? "production",
      extraOrigin: process.env.NEXT_PUBLIC_SWIMFAST_PARENT_ORIGIN,
    }),
  };
}

const defaultBridge = createQandaParentBridge(getWindowBridgeDeps);

export function notifyQandaStarted(slug: string, submissionId: unknown) {
  defaultBridge.notifyStarted(slug, submissionId);
}

export function notifyQandaCompleted(
  slug: string,
  submissionId: unknown,
  data: AnswerCompletionData,
) {
  defaultBridge.notifyCompleted(slug, submissionId, data);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}
