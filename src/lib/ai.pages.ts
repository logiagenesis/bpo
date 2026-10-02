// Pages has no server runtime. Never bundle server credentials.
async function unavailable(_input: { data: unknown }): Promise<{ ok: false; error: string }> {
  return { ok: false, error: 'Live AI needs the server edition. This GitHub Pages workspace supports manual edits, demo drafts and local backups.' };
}
export const runAudit = unavailable;
export const runOutreach = unavailable;
export const runProposal = unavailable;
export const runJobDraft = unavailable;
export const runAssistant = unavailable;
export const runOfferCopy = unavailable;
