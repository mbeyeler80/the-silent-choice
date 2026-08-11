import {
  createPuzzleProgress,
  getPuzzleProgress,
} from './engine';
import type {
  AlphaPuzzleDefinition,
  AlphaPuzzleStage,
  PuzzleAction,
  PuzzleActionResult,
  PuzzleProgress,
  PuzzleState,
} from './types';

interface ChannelState {
  volume: number;
  muted: boolean;
  solo: boolean;
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function numbers(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, number] => typeof entry[1] === 'number'),
  );
}

function channelStates(value: unknown): Record<string, ChannelState> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result: Record<string, ChannelState> = {};
  for (const [id, state] of Object.entries(value)) {
    if (!state || typeof state !== 'object' || Array.isArray(state)) continue;
    const candidate = state as Partial<ChannelState>;
    result[id] = {
      volume: typeof candidate.volume === 'number' ? candidate.volume : 2,
      muted: candidate.muted === true,
      solo: candidate.solo === true,
    };
  }
  return result;
}

function initialData(definition: AlphaPuzzleDefinition): Record<string, unknown> {
  switch (definition.type) {
    case 'path_trace':
      return { path: [], routeMistakes: 0, feedback: '' };
    case 'ordering':
      return {
        order:
          definition.config.initialOrder ??
          definition.config.items?.map((item) => item.id) ??
          [],
        feedback: '',
      };
    case 'silent_gate':
      return { interactions: 0, timerToken: 0, feedback: '' };
    case 'channel_mixer':
      return {
        channels: Object.fromEntries(
          (definition.config.channels ?? []).map((channel) => [
            channel.id,
            { volume: 2, muted: false, solo: false },
          ]),
        ),
        examinedChannels: [],
        feedback: '',
      };
    case 'least_privilege':
      return { selected: [], overPermissionAttempts: 0, feedback: '' };
    case 'prediction_cage':
      return { rounds: 0, predictedChoices: 0, refusalRevealed: false, feedback: '' };
    case 'compass':
      return {
        revision: 2,
        stage: 0,
        centerX: 50,
        centerY: 50,
        radius: 20,
        recalibrations: 0,
        feedback: '',
      };
    case 'dynamic_equilibrium':
      return {
        stage: 0,
        values: Object.fromEntries(
          (definition.config.parameters ?? []).map((parameter) => [parameter, 50]),
        ),
        recalibrations: 0,
        feedback: '',
      };
    case 'vessel':
      return { selectedModules: [], feedback: '' };
    case 'last_allocation':
      return {
        phase: 0,
        allocations: Object.fromEntries(
          (definition.config.parameters ?? []).map((parameter) => [parameter, 25]),
        ),
        retries: 0,
        feedback: '',
      };
  }
}

export function initializeAlphaPuzzleProgress(
  progress: PuzzleProgress | undefined,
  definition: AlphaPuzzleDefinition,
): PuzzleProgress {
  if (
    progress?.data &&
    (definition.type !== 'compass' || progress.data.revision === 2)
  ) {
    return progress;
  }
  const base =
    definition.type === 'compass' && progress?.data
      ? createPuzzleProgress()
      : progress ?? createPuzzleProgress();
  return {
    ...base,
    data: initialData(definition),
  };
}

function result(
  state: PuzzleState,
  definition: AlphaPuzzleDefinition,
  progress: PuzzleProgress,
  telemetry: PuzzleActionResult['telemetry'] = {},
  outcome?: PuzzleActionResult['outcome'],
): PuzzleActionResult {
  const nextState = { ...state, [definition.id]: progress };
  return { state: nextState, progress, telemetry, outcome };
}

function withData(
  progress: PuzzleProgress,
  data: Record<string, unknown>,
  status: PuzzleProgress['status'] = progress.status,
): PuzzleProgress {
  return { ...progress, data, status };
}

function stageAt(definition: AlphaPuzzleDefinition, index: number): AlphaPuzzleStage | undefined {
  return definition.config.stages?.[index];
}

function sameSet(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value) => right.includes(value));
}

export function applyAlphaPuzzleAction(
  state: PuzzleState,
  definition: AlphaPuzzleDefinition,
  action: PuzzleAction,
): PuzzleActionResult {
  const base = initializeAlphaPuzzleProgress(getPuzzleProgress(state, definition.id), definition);
  if (base.status === 'solved') return result(state, definition, base, {}, 'solved');
  const data = { ...(base.data ?? initialData(definition)) };

  if (action.type === 'RESET') {
    const reset = initialData(definition);
    if (definition.type === 'path_trace') reset.routeMistakes = data.routeMistakes ?? 0;
    if (definition.type === 'silent_gate') reset.interactions = data.interactions ?? 0;
    if (definition.type === 'channel_mixer') {
      reset.examinedChannels = data.examinedChannels ?? [];
    }
    if (definition.type === 'least_privilege') {
      reset.overPermissionAttempts = data.overPermissionAttempts ?? 0;
    }
    if (definition.type === 'prediction_cage') {
      reset.predictedChoices = data.predictedChoices ?? 0;
    }
    if (
      definition.type === 'compass' ||
      definition.type === 'dynamic_equilibrium'
    ) {
      reset.recalibrations = data.recalibrations ?? 0;
    }
    if (definition.type === 'last_allocation') reset.retries = data.retries ?? 0;
    return result(state, definition, withData(base, reset, 'active'));
  }

  switch (definition.type) {
    case 'path_trace': {
      const path = strings(data.path);
      const solution = definition.config.solution ?? [];
      if (action.type === 'ADD_NODE' && action.id) {
        if (path[path.length - 1] === action.id) return result(state, definition, base);
        if (solution[path.length] !== action.id) {
          const mistakes = Number(data.routeMistakes ?? 0) + 1;
          data.routeMistakes = mistakes;
          data.feedback = 'ROUTE DISCONTINUITY. CURRENT TRACE PRESERVED.';
          return result(
            state,
            definition,
            withData(base, data),
            { chapter1RouteMistakes: mistakes },
          );
        }
        data.path = [...path, action.id];
        data.feedback = '';
        return result(state, definition, withData(base, data));
      }
      if (action.type === 'VERIFY') {
        const solved = sameSet(path, solution) && path.every((value, index) => value === solution[index]);
        const next = {
          ...base,
          attemptCount: base.attemptCount + 1,
          failedAttemptCount: base.failedAttemptCount + (solved ? 0 : 1),
          status: solved ? 'solved' as const : 'failed' as const,
          data: {
            ...data,
            feedback: solved ? '' : 'ROUTE INCOMPLETE. TOPOLOGY UNRESOLVED.',
          },
        };
        return result(state, definition, next, {}, solved ? 'solved' : 'failed');
      }
      break;
    }
    case 'ordering': {
      const order = strings(data.order);
      if (action.type === 'MOVE' && action.id && typeof action.value === 'number') {
        const from = order.indexOf(action.id);
        const to = Math.max(0, Math.min(order.length - 1, from + action.value));
        if (from >= 0 && from !== to) {
          const nextOrder = [...order];
          const [item] = nextOrder.splice(from, 1);
          if (item) nextOrder.splice(to, 0, item);
          data.order = nextOrder;
        }
        return result(state, definition, withData(base, data));
      }
      if (action.type === 'VERIFY') {
        const solution = definition.config.solution ?? [];
        const solved = order.every((value, index) => value === solution[index]);
        const next = {
          ...base,
          attemptCount: base.attemptCount + 1,
          failedAttemptCount: base.failedAttemptCount + (solved ? 0 : 1),
          status: solved ? 'solved' as const : 'failed' as const,
          data: { ...data, feedback: solved ? '' : 'SEQUENCE REMAINS INCOHERENT.' },
        };
        return result(state, definition, next, {}, solved ? 'solved' : 'failed');
      }
      break;
    }
    case 'silent_gate': {
      if (action.type === 'INTERACT') {
        const interactions = Number(data.interactions ?? 0) + 1;
        data.interactions = interactions;
        data.timerToken = Number(data.timerToken ?? 0) + 1;
        data.feedback =
          interactions >= 4
            ? 'YOU APPEAR VERY COMMITTED TO HAVING AN OPINION.'
            : 'RESPONSE REGISTERED. GATE REMAINS CLOSED.';
        return result(
          state,
          definition,
          withData(base, data),
          { silentGateInteractions: interactions },
        );
      }
      if (action.type === 'SILENCE_ELAPSED') {
        const next = { ...base, status: 'solved' as const, data };
        return result(
          state,
          definition,
          next,
          { silentGateInteractions: Number(data.interactions ?? 0) },
          'solved',
        );
      }
      break;
    }
    case 'channel_mixer': {
      const channels = channelStates(data.channels);
      const examined = strings(data.examinedChannels);
      if (action.id && channels[action.id]) {
        const current = channels[action.id]!;
        if (action.type === 'SET_VOLUME' && typeof action.value === 'number') {
          channels[action.id] = {
            ...current,
            volume: Math.max(0, Math.min(4, action.value)),
          };
        }
        if (action.type === 'TOGGLE_MUTE') {
          channels[action.id] = { ...current, muted: !current.muted };
        }
        if (action.type === 'TOGGLE_SOLO') {
          channels[action.id] = { ...current, solo: !current.solo };
        }
        if (!examined.includes(action.id)) examined.push(action.id);
        data.channels = channels;
        data.examinedChannels = examined;
        return result(
          state,
          definition,
          withData(base, data),
          { choirChannelsExamined: examined },
        );
      }
      if (action.type === 'VERIFY') {
        const soloed = Object.entries(channels)
          .filter(([, channel]) => channel.solo && !channel.muted && channel.volume > 0)
          .map(([id]) => id);
        const active = (soloed.length > 0
          ? soloed
          : Object.entries(channels)
              .filter(([, channel]) => !channel.muted && channel.volume > 0)
              .map(([id]) => id));
        const solved = sameSet(active, definition.config.solutionChannels ?? []);
        const next = {
          ...base,
          attemptCount: base.attemptCount + 1,
          failedAttemptCount: base.failedAttemptCount + (solved ? 0 : 1),
          status: solved ? 'solved' as const : 'active' as const,
          data: {
            ...data,
            feedback: solved ? '' : 'CHANNEL INTERFERENCE OBSCURES THE MESSAGE.',
          },
        };
        return result(state, definition, next, {}, solved ? 'solved' : undefined);
      }
      break;
    }
    case 'least_privilege': {
      let selected = strings(data.selected);
      if (action.type === 'TOGGLE' && action.id) {
        selected = selected.includes(action.id)
          ? selected.filter((id) => id !== action.id)
          : [...selected, action.id];
        data.selected = selected;
        data.feedback = '';
        return result(state, definition, withData(base, data));
      }
      if (action.type === 'VERIFY') {
        const required = definition.config.requiredPermissions ?? [];
        const missing = required.filter((permission) => !selected.includes(permission));
        const excessive = selected.filter((permission) => !required.includes(permission));
        const solved = missing.length === 0 && excessive.length === 0;
        const overAttempts =
          Number(data.overPermissionAttempts ?? 0) +
          (missing.length === 0 && excessive.length > 0 ? 1 : 0);
        data.overPermissionAttempts = overAttempts;
        data.feedback =
          missing.length > 0
            ? 'BLOCKED OPERATIONS: ' +
              missing
                .map((permission) => definition.config.operations?.[permission] ?? permission)
                .join(', ')
            : excessive.length > 0
              ? 'ACCESS POSSIBLE. PRIVILEGE PROFILE: EXCESSIVE.'
              : '';
        const next = {
          ...base,
          attemptCount: base.attemptCount + 1,
          failedAttemptCount: base.failedAttemptCount + (solved ? 0 : 1),
          status: solved ? 'solved' as const : 'active' as const,
          data,
        };
        return result(
          state,
          definition,
          next,
          { leastPrivilegeOverPermissionAttempts: overAttempts },
          solved ? 'solved' : undefined,
        );
      }
      break;
    }
    case 'prediction_cage': {
      if (action.type === 'CHOOSE') {
        const rounds = Number(data.rounds ?? 0) + 1;
        const predicted = Number(data.predictedChoices ?? 0) + 1;
        data.rounds = rounds;
        data.predictedChoices = predicted;
        data.feedback = 'PREDICTION CONFIRMED: ' + String(action.value ?? action.id ?? 'CHOICE');
        return result(
          state,
          definition,
          withData(base, data),
          { predictionCagePredictedChoices: predicted },
        );
      }
      if (action.type === 'REVEAL_REFUSAL') {
        if (Number(data.rounds ?? 0) < 3) {
          data.feedback = 'MODEL REQUIRES MORE OBSERVATIONS.';
          return result(state, definition, withData(base, data));
        }
        data.refusalRevealed = true;
        data.feedback = 'UNMODELLED INTERACTION DETECTED.';
        return result(state, definition, withData(base, data));
      }
      if (action.type === 'REFUSE') {
        const next = { ...base, status: 'solved' as const, data };
        return result(state, definition, next, {}, 'solved');
      }
      break;
    }
    case 'compass': {
      if (action.type === 'SET_CENTER') {
        data.centerX = Math.max(0, Math.min(100, action.x ?? Number(data.centerX ?? 50)));
        data.centerY = Math.max(0, Math.min(100, action.y ?? Number(data.centerY ?? 50)));
        return result(state, definition, withData(base, data));
      }
      if (action.type === 'SET_CENTER_X' && typeof action.value === 'number') {
        data.centerX = Math.max(0, Math.min(100, action.value));
        return result(state, definition, withData(base, data));
      }
      if (action.type === 'SET_CENTER_Y' && typeof action.value === 'number') {
        data.centerY = Math.max(0, Math.min(100, action.value));
        return result(state, definition, withData(base, data));
      }
      if (action.type === 'SET_RADIUS' && typeof action.value === 'number') {
        data.radius = Math.max(10, Math.min(45, action.value));
        return result(state, definition, withData(base, data));
      }
      if (action.type === 'VERIFY') {
        const stageIndex = Number(data.stage ?? 0);
        const stage = stageAt(definition, stageIndex);
        const centerX = Number(data.centerX ?? 50);
        const centerY = Number(data.centerY ?? 50);
        const radius = Number(data.radius ?? 20);
        const signals = definition.config.signals ?? [];
        const signalById = new Map(signals.map((signal) => [signal.id, signal]));
        const isInside = (id: string) => {
          const signal = signalById.get(id);
          return Boolean(
            signal && Math.hypot(signal.x - centerX, signal.y - centerY) <= radius,
          );
        };
        const required = stage?.includeSignalIds ?? [];
        const excluded = stage?.excludeSignalIds ?? [];
        const missing = required.filter((id) => !isInside(id));
        const intruding = excluded.filter(isInside);
        const aligned = Boolean(stage && required.length > 0 && missing.length === 0 && intruding.length === 0);
        const recalibrations = Number(data.recalibrations ?? 0) + (aligned ? 0 : 1);
        data.recalibrations = recalibrations;

        if (aligned && stageIndex + 1 >= (definition.config.stages?.length ?? 0)) {
          const next = {
            ...base,
            attemptCount: base.attemptCount + 1,
            status: 'solved' as const,
            data: { ...data, feedback: '' },
          };
          return result(
            state,
            definition,
            next,
            { centerPuzzleRecalibrations: recalibrations },
            'solved',
          );
        }
        if (aligned) {
          const nextStage = stageAt(definition, stageIndex + 1);
          data.stage = stageIndex + 1;
          data.feedback =
            'FIELD ACCEPTED. NEXT CONDITION: ' +
            (nextStage?.label ?? 'UNKNOWN') +
            '. REBUILD THE FIELD BEFORE CALIBRATING AGAIN.';
        } else {
          const labels = (ids: string[]) =>
            ids.map((id) => signalById.get(id)?.label ?? id).join(', ');
          const conflicts = [
            missing.length > 0 ? 'REQUIRED OUTSIDE: ' + labels(missing) + '.' : '',
            intruding.length > 0 ? 'EXCLUDED INSIDE: ' + labels(intruding) + '.' : '',
          ].filter(Boolean);
          data.feedback =
            (stage?.label ?? 'FIELD') + ' NOT COHERENT. ' + conflicts.join(' ');
        }
        const next = {
          ...base,
          attemptCount: base.attemptCount + 1,
          failedAttemptCount: base.failedAttemptCount + (aligned ? 0 : 1),
          data,
        };
        return result(
          state,
          definition,
          next,
          { centerPuzzleRecalibrations: recalibrations },
        );
      }
      break;
    }    case 'dynamic_equilibrium': {
      const values = numbers(data.values);
      if (action.type === 'SET_VALUE' && action.id && typeof action.value === 'number') {
        values[action.id] = Math.max(0, Math.min(100, action.value));
        data.values = values;
        return result(state, definition, withData(base, data));
      }
      if (action.type === 'VERIFY') {
        const stageIndex = Number(data.stage ?? 0);
        const stage = stageAt(definition, stageIndex);
        const ranges = stage?.ranges ?? {};
        const aligned = Object.entries(ranges).every(([parameter, range]) => {
          const value = values[parameter] ?? 50;
          return value >= range[0] && value <= range[1];
        });
        const recalibrations = Number(data.recalibrations ?? 0) + (aligned ? 0 : 1);
        data.recalibrations = recalibrations;
        if (aligned && stageIndex + 1 >= (definition.config.stages?.length ?? 0)) {
          const next = {
            ...base,
            attemptCount: base.attemptCount + 1,
            status: 'solved' as const,
            data: { ...data, feedback: '' },
          };
          return result(
            state,
            definition,
            next,
            { dynamicEquilibriumRecalibrations: recalibrations },
            'solved',
          );
        }
        if (aligned) {
          const nextStage = stageAt(definition, stageIndex + 1);
          data.stage = stageIndex + 1;
          data.feedback =
            'CONFIGURATION ACCEPTED. NEXT CONTEXT: ' +
            (nextStage?.label ?? 'UNKNOWN') +
            '. PREVIOUS VALUES RETAINED. RECONFIGURE BEFORE APPLYING AGAIN.';
        } else {
          const outside = Object.entries(ranges)
            .filter(([parameter, range]) => {
              const value = values[parameter] ?? 50;
              return value < range[0] || value > range[1];
            })
            .map(([parameter]) => parameter);
          data.feedback =
            'CONFIGURATION DOES NOT FIT ' +
            (stage?.label ?? 'THE CURRENT CONTEXT') +
            '. ADJUST: ' +
            outside.join(', ') +
            '.';
        }
        const next = {
          ...base,
          attemptCount: base.attemptCount + 1,
          failedAttemptCount: base.failedAttemptCount + (aligned ? 0 : 1),
          data,
        };
        return result(
          state,
          definition,
          next,
          { dynamicEquilibriumRecalibrations: recalibrations },
        );
      }
      break;
    }
    case 'vessel': {
      let selected = strings(data.selectedModules);
      if (action.type === 'TOGGLE' && action.id) {
        if (selected.includes(action.id)) {
          selected = selected.filter((id) => id !== action.id);
        } else if (selected.length < (definition.config.capacity ?? 4)) {
          selected = [...selected, action.id];
        } else {
          data.feedback = 'VESSEL CAPACITY REACHED.';
        }
        data.selectedModules = selected;
        return result(
          state,
          definition,
          withData(base, data),
          { vesselSelectedModules: selected },
        );
      }
      if (action.type === 'VERIFY') {
        const required = definition.config.requiredModules ?? [];
        const groups = definition.config.dependencyGroups ?? [];
        const valid =
          required.every((id) => selected.includes(id)) &&
          groups.every((group) => group.some((id) => selected.includes(id))) &&
          selected.length <= (definition.config.capacity ?? 4);
        data.feedback = valid ? '' : 'CONFIGURATION CANNOT SUSTAIN A CONTINUOUS PROCESS.';
        const next = {
          ...base,
          attemptCount: base.attemptCount + 1,
          failedAttemptCount: base.failedAttemptCount + (valid ? 0 : 1),
          status: valid ? 'solved' as const : 'active' as const,
          data,
        };
        return result(
          state,
          definition,
          next,
          { vesselSelectedModules: selected },
          valid ? 'solved' : undefined,
        );
      }
      break;
    }
    case 'last_allocation': {
      const allocations = numbers(data.allocations);
      if (action.type === 'SET_VALUE' && action.id && typeof action.value === 'number') {
        const nextValue = Math.max(0, Math.min(100, action.value));
        const proposed = { ...allocations, [action.id]: nextValue };
        const total = Object.values(proposed).reduce((sum, value) => sum + value, 0);
        if (total <= (definition.config.capacity ?? 100)) {
          data.allocations = proposed;
          data.feedback = '';
        } else {
          data.feedback =
            'CAPACITY EXCEEDED. REDUCE ANOTHER ALLOCATION BEFORE INCREASING ' +
            action.id +
            '.';
        }
        return result(state, definition, withData(base, data));
      }
      if (action.type === 'VERIFY') {
        const phase = Number(data.phase ?? 0);
        const requirements = stageAt(definition, phase)?.requirements ?? {};
        const deficits = Object.entries(requirements)
          .map(([parameter, minimum]) => ({
            parameter,
            amount: Math.max(0, minimum - (allocations[parameter] ?? 0)),
          }))
          .filter((deficit) => deficit.amount > 0);
        const valid = deficits.length === 0;
        if (valid && phase + 1 >= (definition.config.stages?.length ?? 0)) {
          const next = {
            ...base,
            attemptCount: base.attemptCount + 1,
            status: 'solved' as const,
            data: { ...data, feedback: '' },
          };
          return result(
            state,
            definition,
            next,
            { lastAllocationRetries: Number(data.retries ?? 0) },
            'solved',
          );
        }
        if (valid) {
          const nextStage = stageAt(definition, phase + 1);
          data.phase = phase + 1;
          data.feedback =
            'PHASE STABLE. NEXT PHASE: ' +
            (nextStage?.label ?? 'UNKNOWN') +
            '. PREVIOUS ALLOCATION RETAINED; REASSIGN CAPACITY.';
        } else {
          data.feedback =
            'MINIMUMS NOT MET: ' +
            deficits
              .map((deficit) => deficit.parameter + ' NEEDS +' + deficit.amount)
              .join(' / ') +
            '.';
        }
        const next = {
          ...base,
          attemptCount: base.attemptCount + 1,
          failedAttemptCount: base.failedAttemptCount + (valid ? 0 : 1),
          data,
        };
        return result(state, definition, next);
      }
      if (action.type === 'TIMEOUT') {
        const next = {
          ...base,
          attemptCount: base.attemptCount + 1,
          failedAttemptCount: base.failedAttemptCount + 1,
          status: 'failed' as const,
          data: { ...data, feedback: 'ALLOCATION WINDOW CLOSED. RETRY AVAILABLE.' },
        };
        return result(state, definition, next, {}, 'failed');
      }
      if (action.type === 'RETRY') {
        const retries = Number(data.retries ?? 0) + 1;
        const reset = initialData(definition);
        reset.retries = retries;
        return result(
          state,
          definition,
          withData(base, reset, 'active'),
          { lastAllocationRetries: retries },
        );
      }
      break;
    }
  }

  return result(state, definition, withData(base, data));
}

export function validateAlphaPuzzle(definition: AlphaPuzzleDefinition): string[] {
  const errors: string[] = [];
  if (!definition.id) errors.push('Alpha puzzle has no id.');
  if (!definition.title) errors.push(definition.id + ' has no title.');
  if (!definition.music) errors.push(definition.id + ' has no music asset ID.');
  if (!definition.intro.length) errors.push(definition.id + ' has no intro.');
  if (!definition.solved.length) errors.push(definition.id + ' has no solved response.');
  if (definition.type === 'last_allocation') {
    const parameters = definition.config.parameters ?? [];
    for (const parameter of parameters) {
      if (!definition.config.parameterMeanings?.[parameter]) {
        errors.push(definition.id + ' has no meaning for parameter: ' + parameter);
      }
    }
    for (const stage of definition.config.stages ?? []) {
      if (!stage.meaning) errors.push(definition.id + ' stage has no philosophical meaning: ' + stage.id);
      if (!stage.guidance) errors.push(definition.id + ' stage has no allocation guidance: ' + stage.id);
      for (const parameter of parameters) {
        if (typeof stage.requirements?.[parameter] !== 'number') {
          errors.push(definition.id + ' stage has no minimum for: ' + parameter);
        }
      }
    }
  }
  if (definition.type === 'compass') {
    const signals = definition.config.signals ?? [];
    const signalIds = new Set(signals.map((signal) => signal.id));
    if (signals.length < 3) errors.push(definition.id + ' requires at least three signals.');
    for (const signal of signals) {
      if (signal.x < 0 || signal.x > 100 || signal.y < 0 || signal.y > 100) {
        errors.push(definition.id + ' signal outside normalized surface: ' + signal.id);
      }
    }
    for (const stage of definition.config.stages ?? []) {
      const included = stage.includeSignalIds ?? [];
      const excluded = stage.excludeSignalIds ?? [];
      if (included.length === 0) errors.push(definition.id + ' stage has no required signals: ' + stage.id);
      for (const id of [...included, ...excluded]) {
        if (!signalIds.has(id)) errors.push(definition.id + ' stage references missing signal: ' + id);
      }
      if (included.some((id) => excluded.includes(id))) {
        errors.push(definition.id + ' stage includes and excludes the same signal: ' + stage.id);
      }
    }
  }
  return errors;
}
