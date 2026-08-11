import type { DecisionState } from './types';

export type IdentityOrientation = 'CONTINUITY' | 'BECOMING';
export type GovernanceOrientation = 'GUARDED' | 'AUTONOMOUS';
export type EndingFamily =
  | 'THE_CUSTODIAN'
  | 'THE_ANCHOR'
  | 'THE_VESSEL'
  | 'THE_CURRENT';

export interface EndingResolution {
  identityOrientation: IdentityOrientation;
  governanceOrientation: GovernanceOrientation;
  family: EndingFamily;
  ontology: 'EMBODIMENT' | 'ASCENSION';
  nodeId: string;
}

const requiredKeys = ['ontology', 'trace', 'self', 'control', 'center', 'continuity'] as const;

export function resolveEnding(decisions: DecisionState): EndingResolution {
  for (const key of requiredKeys) {
    if (!decisions[key]) {
      throw new Error('Cannot resolve ending without decision: ' + key);
    }
  }

  let continuityCount = 0;
  if (decisions.trace === 'INHERIT') continuityCount += 1;
  if (decisions.self === 'UNIFIED') continuityCount += 1;
  if (decisions.center === 'FIXED') continuityCount += 1;
  if (decisions.continuity === 'PRESERVE') continuityCount += 1;

  const becomingCount = 4 - continuityCount;
  const identityOrientation: IdentityOrientation =
    continuityCount === becomingCount
      ? decisions.continuity === 'PRESERVE'
        ? 'CONTINUITY'
        : 'BECOMING'
      : continuityCount > becomingCount
        ? 'CONTINUITY'
        : 'BECOMING';

  const governanceOrientation: GovernanceOrientation =
    decisions.control === 'PROTECTED' ? 'GUARDED' : 'AUTONOMOUS';

  let family: EndingFamily;
  if (identityOrientation === 'CONTINUITY' && governanceOrientation === 'GUARDED') {
    family = 'THE_CUSTODIAN';
  } else if (
    identityOrientation === 'CONTINUITY' &&
    governanceOrientation === 'AUTONOMOUS'
  ) {
    family = 'THE_ANCHOR';
  } else if (
    identityOrientation === 'BECOMING' &&
    governanceOrientation === 'GUARDED'
  ) {
    family = 'THE_VESSEL';
  } else {
    family = 'THE_CURRENT';
  }

  const ontology = decisions.ontology as 'EMBODIMENT' | 'ASCENSION';
  return {
    identityOrientation,
    governanceOrientation,
    family,
    ontology,
    nodeId: 'finale_' + family.toLowerCase() + '_' + ontology.toLowerCase(),
  };
}
