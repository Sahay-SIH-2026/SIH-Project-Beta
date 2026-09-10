"use server";

import { revalidatePath } from "next/cache";
import {
  runScenarioA,
  runScenarioB,
  runScenarioC,
  runScenarioD,
  resetDemoCase,
  type ScenarioExecutionResult,
} from "@/lib/scenarios/demo-scenarios";

export async function runDemoScenarioAction(
  scenarioId: "A" | "B" | "C" | "D",
  targetCaseId?: string
): Promise<ScenarioExecutionResult> {
  let result: ScenarioExecutionResult;

  switch (scenarioId) {
    case "A":
      result = await runScenarioA(targetCaseId);
      break;
    case "B":
      result = await runScenarioB(targetCaseId);
      break;
    case "C":
      result = await runScenarioC(targetCaseId);
      break;
    case "D":
      result = await runScenarioD(targetCaseId);
      break;
  }

  revalidatePath("/counselor");
  revalidatePath("/counselor/alerts");
  revalidatePath("/counselor/cases");
  revalidatePath("/counselor/follow-ups");
  revalidatePath("/counselor/reports");
  revalidatePath("/counselor/channels");
  revalidatePath("/counselor/demo");
  if (result.caseId) {
    revalidatePath(`/counselor/cases/${result.caseId}`);
  }

  return result;
}

export async function resetDemoCaseAction(
  targetCaseId?: string
): Promise<{ success: boolean; message: string }> {
  const result = await resetDemoCase(targetCaseId);

  revalidatePath("/counselor");
  revalidatePath("/counselor/alerts");
  revalidatePath("/counselor/cases");
  revalidatePath("/counselor/follow-ups");
  revalidatePath("/counselor/reports");
  revalidatePath("/counselor/demo");
  if (targetCaseId) {
    revalidatePath(`/counselor/cases/${targetCaseId}`);
  }

  return result;
}
