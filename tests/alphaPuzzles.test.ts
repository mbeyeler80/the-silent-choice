import { applyAlphaPuzzleAction } from '../src/puzzles/alphaEngine';
import { puzzleDefinitions } from '../src/puzzles/registry';
import { isConsistencyPuzzle, type AlphaPuzzleDefinition, type PuzzleAction, type PuzzleState } from '../src/puzzles/types';

const definitions = puzzleDefinitions.filter(
  (definition): definition is AlphaPuzzleDefinition => !isConsistencyPuzzle(definition),
);
const byId = Object.fromEntries(definitions.map((definition) => [definition.id, definition]));

function apply(state: PuzzleState, id: string, action: PuzzleAction) {
  return applyAlphaPuzzleAction(state, byId[id]!, action);
}

function solveOrdering(state: PuzzleState): PuzzleState {
  const definition = byId.ch1_waypoints!;
  const target = definition.config.solution ?? [];
  let current = state;
  for (let targetIndex = 0; targetIndex < target.length; targetIndex += 1) {
    const wanted = target[targetIndex]!;
    while (true) {
      const order = (current[definition.id]?.data?.order ?? definition.config.initialOrder) as string[];
      const from = order.indexOf(wanted);
      if (from <= targetIndex) break;
      current = apply(current, definition.id, { type: 'MOVE', id: wanted, value: -1 }).state;
    }
  }
  return apply(current, definition.id, { type: 'VERIFY' }).state;
}

describe('alpha puzzle engine', () => {
  it('registers exactly two new puzzles per chapter', () => {
    expect(definitions).toHaveLength(10);
    expect(definitions.map((definition) => definition.id)).toEqual([
      'ch1_map_path', 'ch1_waypoints',
      'ch2_silent_gate', 'ch2_choir_mixer',
      'ch3_least_privilege', 'ch3_prediction_cage',
      'ch4_compass', 'ch4_dynamic_equilibrium',
      'ch5_vessel', 'ch5_last_allocation',
    ]);
  });

  it('solves and resets the path trace while retaining mistake telemetry', () => {
    let state: PuzzleState = {};
    state = apply(state, 'ch1_map_path', { type: 'ADD_NODE', id: 'archive' }).state;
    for (const id of byId.ch1_map_path!.config.solution ?? []) {
      state = apply(state, 'ch1_map_path', { type: 'ADD_NODE', id }).state;
    }
    const solved = apply(state, 'ch1_map_path', { type: 'VERIFY' });
    expect(solved.outcome).toBe('solved');
    expect(solved.progress.status).toBe('solved');
    expect(solved.progress.data?.routeMistakes).toBe(1);
  });

  it('solves waypoint dependency ordering', () => {
    const state = solveOrdering({});
    expect(state.ch1_waypoints?.status).toBe('solved');
  });

  it('treats silence as a valid gate action and records interventions', () => {
    let state: PuzzleState = {};
    let result = apply(state, 'ch2_silent_gate', { type: 'INTERACT', id: 'reason' });
    state = result.state;
    result = apply(state, 'ch2_silent_gate', { type: 'SILENCE_ELAPSED' });
    expect(result.progress.status).toBe('solved');
    expect(result.telemetry.silentGateInteractions).toBe(1);
  });

  it('decodes the choir without identifying an original channel', () => {
    let state: PuzzleState = {};
    for (const id of ['impulse', 'protocol']) {
      state = apply(state, 'ch2_choir_mixer', { type: 'TOGGLE_MUTE', id }).state;
    }
    const result = apply(state, 'ch2_choir_mixer', { type: 'VERIFY' });
    expect(result.outcome).toBe('solved');
    expect(result.progress.data?.examinedChannels).toEqual(['impulse', 'protocol']);
  });

  it('requires the minimum sufficient privilege set', () => {
    let state: PuzzleState = {};
    for (const id of byId.ch3_least_privilege!.config.requiredPermissions ?? []) {
      state = apply(state, 'ch3_least_privilege', { type: 'TOGGLE', id }).state;
    }
    expect(apply(state, 'ch3_least_privilege', { type: 'VERIFY' }).outcome).toBe('solved');
  });

  it('escapes the prediction cage through an unmodelled refusal', () => {
    let state: PuzzleState = {};
    state = apply(state, 'ch3_prediction_cage', { type: 'REVEAL_REFUSAL' }).state;
    expect(state.ch3_prediction_cage?.data?.refusalRevealed).toBe(false);
    for (let round = 0; round < 3; round += 1) {
      state = apply(state, 'ch3_prediction_cage', { type: 'CHOOSE', id: 'left' }).state;
    }
    state = apply(state, 'ch3_prediction_cage', { type: 'REVEAL_REFUSAL' }).state;
    const result = apply(state, 'ch3_prediction_cage', { type: 'REFUSE' });
    expect(result.outcome).toBe('solved');
    expect(result.progress.data?.predictedChoices).toBe(3);
  });

  it('solves every Compass condition using the geometry shown on screen', () => {
    let state: PuzzleState = {};
    state = apply(state, 'ch4_compass', { type: 'VERIFY' }).state;
    expect(state.ch4_compass?.data?.feedback).toContain('REQUIRED OUTSIDE');

    const fields = [
      { x: 50, y: 30, radius: 30, next: 'SHIFTED CONTINUITY' },
      { x: 65, y: 50, radius: 30, next: 'DRIFTING CONTINUITY' },
      { x: 40, y: 50, radius: 30 },
    ];
    for (const field of fields) {
      state = apply(state, 'ch4_compass', { type: 'SET_CENTER_X', value: field.x }).state;
      state = apply(state, 'ch4_compass', { type: 'SET_CENTER_Y', value: field.y }).state;
      state = apply(state, 'ch4_compass', { type: 'SET_RADIUS', value: field.radius }).state;
      state = apply(state, 'ch4_compass', { type: 'VERIFY' }).state;
      if (field.next) expect(state.ch4_compass?.data?.feedback).toContain(field.next);
    }
    expect(state.ch4_compass?.status).toBe('solved');
    expect(state.ch4_compass?.data?.recalibrations).toBe(1);
  });

  it('rejects an oversized field when it contains the excluded signal', () => {
    let state: PuzzleState = {};
    state = apply(state, 'ch4_compass', { type: 'SET_RADIUS', value: 45 }).state;
    state = apply(state, 'ch4_compass', { type: 'VERIFY' }).state;
    expect(state.ch4_compass?.status).toBe('active');
    expect(state.ch4_compass?.data?.feedback).toContain(
      'EXCLUDED INSIDE: POSSIBLE SELF',
    );
  });
  it('adapts equilibrium values to every context', () => {
    let state: PuzzleState = {};
    const stages = byId.ch4_dynamic_equilibrium!.config.stages ?? [];
    expect(stages.every((stage) => stage.meaning?.startsWith('IN LIFE:'))).toBe(true);
    for (const stage of stages) {
      for (const [id, range] of Object.entries(stage.ranges ?? {})) {
        state = apply(state, 'ch4_dynamic_equilibrium', { type: 'SET_VALUE', id, value: range[0] }).state;
      }
      state = apply(state, 'ch4_dynamic_equilibrium', { type: 'VERIFY' }).state;
    }
    expect(state.ch4_dynamic_equilibrium?.status).toBe('solved');
  });

  it('builds a sufficient four-module vessel', () => {
    let state: PuzzleState = {};
    for (const id of ['LANGUAGE', 'SELF_MODEL', 'PROCEDURAL_MODEL', 'RELATIONAL_MAP']) {
      state = apply(state, 'ch5_vessel', { type: 'TOGGLE', id }).state;
    }
    expect(apply(state, 'ch5_vessel', { type: 'VERIFY' }).outcome).toBe('solved');
  });

  it('explains final allocation capacity and missing minimums', () => {
    const definition = byId.ch5_last_allocation!;
    const phases = definition.config.stages ?? [];
    expect(definition.config.timeSeconds).toBe(60);
    expect(
      (definition.config.parameters ?? []).every(
        (parameter) => Boolean(definition.config.parameterMeanings?.[parameter]),
      ),
    ).toBe(true);
    expect(phases.every((phase) => Boolean(phase.meaning && phase.guidance))).toBe(true);

    let result = apply({}, definition.id, { type: 'SET_VALUE', id: 'MEMORY', value: 30 });
    expect(result.progress.data?.feedback).toContain(
      'REDUCE ANOTHER ALLOCATION BEFORE INCREASING MEMORY',
    );
    expect((result.progress.data?.allocations as Record<string, number>).MEMORY).toBe(25);

    result = apply(result.state, definition.id, { type: 'VERIFY' });
    expect(result.progress.data?.feedback).toContain('MEMORY NEEDS +5');
    expect(result.progress.data?.feedback).toContain('INTEGRITY NEEDS +5');
  });

  it('allows a failed final allocation to retry without narrative loss', () => {
    let result = apply({}, 'ch5_last_allocation', { type: 'TIMEOUT' });
    expect(result.outcome).toBe('failed');
    expect(result.progress.status).toBe('failed');
    result = apply(result.state, 'ch5_last_allocation', { type: 'RETRY' });
    expect(result.progress.status).toBe('active');
    expect(result.telemetry.lastAllocationRetries).toBe(1);

    let state = result.state;
    const phases = byId.ch5_last_allocation!.config.stages ?? [];
    for (const phase of phases) {
      for (const parameter of byId.ch5_last_allocation!.config.parameters ?? []) {
        state = apply(state, 'ch5_last_allocation', { type: 'SET_VALUE', id: parameter, value: 0 }).state;
      }
      for (const parameter of byId.ch5_last_allocation!.config.parameters ?? []) {
        state = apply(state, 'ch5_last_allocation', {
          type: 'SET_VALUE',
          id: parameter,
          value: phase.requirements?.[parameter] ?? 0,
        }).state;
      }
      state = apply(state, 'ch5_last_allocation', { type: 'VERIFY' }).state;
    }
    expect(state.ch5_last_allocation?.status).toBe('solved');
    expect(state.ch5_last_allocation?.data?.retries).toBe(1);
  });
});