import { useEffect, useMemo, useState } from 'react';
import {
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from 'react-native';

import { usePuzzleMixerAudio } from '../../hooks/usePuzzleMixerAudio';
import type {
  AlphaPuzzleDefinition,
  AlphaPuzzleItem,
  PuzzleAction,
  PuzzleProgress,
} from '../../puzzles/types';
import { colors, typography } from '../../theme';
import { SystemLines, TerminalButton, ValueBar } from './PuzzleControls';

interface Props {
  definition: AlphaPuzzleDefinition;
  progress: PuzzleProgress;
  sfxEnabled: boolean;
  onAction: (action: PuzzleAction) => void;
  onContinue: () => void;
}

interface ChannelState {
  volume: number;
  muted: boolean;
  solo: boolean;
}

const mapPositions = [
  { x: 10, y: 8 },
  { x: 60, y: 9 },
  { x: 8, y: 43 },
  { x: 60, y: 47 },
  { x: 34, y: 77 },
];

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function numberMap(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, number] => typeof entry[1] === 'number'),
  );
}

function readChannels(value: unknown): Record<string, ChannelState> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result: Record<string, ChannelState> = {};
  for (const [id, raw] of Object.entries(value)) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) continue;
    const channel = raw as Partial<ChannelState>;
    result[id] = {
      volume: typeof channel.volume === 'number' ? channel.volume : 2,
      muted: channel.muted === true,
      solo: channel.solo === true,
    };
  }
  return result;
}

function OrderCard({
  item,
  index,
  total,
  onMove,
}: {
  item: AlphaPuzzleItem;
  index: number;
  total: number;
  onMove: (direction: number) => void;
}) {
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 8,
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy < -28) onMove(-1);
          if (gesture.dy > 28) onMove(1);
        },
      }),
    [onMove],
  );

  return (
    <View style={styles.orderCard} {...responder.panHandlers}>
      <View style={styles.orderIndex}>
        <Text style={styles.orderIndexText}>{index + 1}</Text>
      </View>
      <View style={styles.orderBody}>
        <Text style={styles.itemLabel}>{item.label}</Text>
        {item.text && <Text style={styles.itemText}>{item.text}</Text>}
      </View>
      <View style={styles.orderActions}>
        <Pressable
          accessibilityRole="button"
          disabled={index === 0}
          onPress={() => onMove(-1)}
        >
          <Text style={styles.orderArrow}>UP</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={index === total - 1}
          onPress={() => onMove(1)}
        >
          <Text style={styles.orderArrow}>DOWN</Text>
        </Pressable>
      </View>
    </View>
  );
}

function VesselModule({
  item,
  selected,
  onToggle,
}: {
  item: AlphaPuzzleItem;
  selected: boolean;
  onToggle: () => void;
}) {
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 8,
        onPanResponderRelease: (_, gesture) => {
          if (Math.abs(gesture.dy) > 25) onToggle();
        },
      }),
    [onToggle],
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onToggle}
      style={[styles.module, selected && styles.moduleSelected]}
      {...responder.panHandlers}
    >
      <Text style={[styles.itemLabel, selected && styles.selectedText]}>{item.label}</Text>
      <Text style={styles.moduleHint}>{selected ? 'IN VESSEL' : 'DRAG OR TAP TO LOAD'}</Text>
    </Pressable>
  );
}

export function AlphaPuzzle({
  definition,
  progress,
  sfxEnabled,
  onAction,
  onContinue,
}: Props) {
  const data = progress.data ?? {};
  const channels = definition.type === 'channel_mixer' ? definition.config.channels ?? [] : [];
  const channelState = readChannels(data.channels);
  usePuzzleMixerAudio(channels, channelState, sfxEnabled && progress.status === 'active');

  const timerToken = Number(data.timerToken ?? 0);
  useEffect(() => {
    if (definition.type !== 'silent_gate' || progress.status !== 'active') return;
    const timer = setTimeout(
      () => onAction({ type: 'SILENCE_ELAPSED' }),
      (definition.config.timeSeconds ?? 8) * 1000,
    );
    return () => clearTimeout(timer);
  }, [
    definition.config.timeSeconds,
    definition.id,
    definition.type,
    onAction,
    progress.status,
    timerToken,
  ]);

  const phase = Number(data.phase ?? 0);
  const [remainingSeconds, setRemainingSeconds] = useState(
    definition.config.timeSeconds ?? 40,
  );
  useEffect(() => {
    if (definition.type !== 'last_allocation' || progress.status !== 'active') return;
    const duration = definition.config.timeSeconds ?? 40;
    const startedAt = Date.now();
    setRemainingSeconds(duration);
    const interval = setInterval(() => {
      setRemainingSeconds(Math.max(0, duration - Math.floor((Date.now() - startedAt) / 1000)));
    }, 500);
    const timeout = setTimeout(() => onAction({ type: 'TIMEOUT' }), duration * 1000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [
    definition.config.timeSeconds,
    definition.id,
    definition.type,
    onAction,
    phase,
    progress.status,
  ]);

  const addNearestMapNode = (event: GestureResponderEvent) => {
    const nodes = definition.config.nodes ?? [];
    if (nodes.length === 0) return;
    const x = (event.nativeEvent.locationX / 280) * 100;
    const y = (event.nativeEvent.locationY / 250) * 100;
    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;
    nodes.forEach((_, index) => {
      const position = mapPositions[index] ?? mapPositions[0]!;
      const distance = Math.hypot(position.x - x, position.y - y);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });
    if (bestDistance < 26 && nodes[bestIndex]) {
      onAction({ type: 'ADD_NODE', id: nodes[bestIndex]!.id });
    }
  };

  const mapResponder = useMemo(
    () =>
      PanResponder.create({
        // A simple tap belongs to the node Pressable. The map only becomes the
        // responder after an intentional drag, otherwise lower nodes can be
        // interpreted using child-relative coordinates.
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gesture) =>
          definition.type === 'path_trace' &&
          Math.hypot(gesture.dx, gesture.dy) > 10,
        onPanResponderMove: addNearestMapNode,
      }),
    [definition.type, definition.config.nodes, onAction],
  );

  const feedback = typeof data.feedback === 'string' ? data.feedback : '';

  const renderPath = () => {
    const nodes = definition.config.nodes ?? [];
    const path = stringArray(data.path);
    return (
      <>
        <View style={styles.mapSurface} {...mapResponder.panHandlers}>
          {nodes.map((node, index) => {
            const position = mapPositions[index] ?? mapPositions[0]!;
            const order = path.indexOf(node.id);
            return (
              <Pressable
                accessibilityRole="button"
                key={node.id}
                onPress={() => onAction({ type: 'ADD_NODE', id: node.id })}
                style={[
                  styles.mapNode,
                  {
                    left: (position.x + '%') as never,
                    top: (position.y + '%') as never,
                  },
                  order >= 0 && styles.mapNodeSelected,
                ]}
              >
                <Text style={styles.mapNodeLabel}>{node.label}</Text>
                {order >= 0 && <Text style={styles.mapOrder}>{order + 1}</Text>}
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.traceText}>
          TRACE: {path.length ? path.map((id) => id.toUpperCase()).join(' / ') : 'EMPTY'}
        </Text>
        <TerminalButton label="VERIFY ROUTE" onPress={() => onAction({ type: 'VERIFY' })} />
      </>
    );
  };

  const renderOrdering = () => {
    const items = definition.config.items ?? [];
    const order = stringArray(data.order);
    return (
      <>
        <Text style={styles.gestureHint}>DRAG A CARD OR USE UP / DOWN.</Text>
        {order.map((id, index) => {
          const item = items.find((candidate) => candidate.id === id);
          if (!item) return null;
          return (
            <OrderCard
              key={id}
              item={item}
              index={index}
              total={order.length}
              onMove={(direction) =>
                onAction({ type: 'MOVE', id, value: direction })
              }
            />
          );
        })}
        <TerminalButton label="VERIFY SEQUENCE" onPress={() => onAction({ type: 'VERIFY' })} />
      </>
    );
  };

  const renderSilentGate = () => {
    const interactions = Number(data.interactions ?? 0);
    return (
      <>
        <View style={styles.silenceField}>
          <Text style={styles.silenceText}>LISTENING FOR AUTHORITATIVE RESPONSE...</Text>
        </View>
        {(definition.config.items ?? []).map((item) => (
          <TerminalButton
            key={item.id}
            label={item.label}
            onPress={() => onAction({ type: 'INTERACT', id: item.id })}
          />
        ))}
        {interactions >= 3 && definition.hint && (
          <Text style={styles.hint}>{definition.hint}</Text>
        )}
      </>
    );
  };

  const audibleChannelIds = (() => {
    const soloed = Object.entries(channelState)
      .filter(([, state]) => state.solo && !state.muted && state.volume > 0)
      .map(([id]) => id);
    return soloed.length > 0
      ? soloed
      : Object.entries(channelState)
          .filter(([, state]) => !state.muted && state.volume > 0)
          .map(([id]) => id);
  })();

  const renderMixer = () => (
    <>
      <View style={styles.messageField}>
        {channels
          .filter((channel) => audibleChannelIds.includes(channel.id))
          .map((channel) => (
            <Text key={channel.id} style={styles.channelFragment}>
              {channel.label}: {channel.text}
            </Text>
          ))}
      </View>
      {channels.map((channel) => {
        const state = channelState[channel.id] ?? { volume: 2, muted: false, solo: false };
        return (
          <View key={channel.id} style={styles.channel}>
            <Text style={styles.channelLabel}>{channel.label}</Text>
            <ValueBar
              label="LEVEL"
              min={0}
              max={4}
              step={1}
              value={state.volume}
              onChange={(value) =>
                onAction({ type: 'SET_VOLUME', id: channel.id, value })
              }
            />
            <View style={styles.row}>
              <View style={styles.flex}>
                <TerminalButton
                  label={state.muted ? 'UNMUTE' : 'MUTE'}
                  selected={state.muted}
                  onPress={() => onAction({ type: 'TOGGLE_MUTE', id: channel.id })}
                />
              </View>
              <View style={styles.flex}>
                <TerminalButton
                  label="SOLO"
                  selected={state.solo}
                  onPress={() => onAction({ type: 'TOGGLE_SOLO', id: channel.id })}
                />
              </View>
            </View>
          </View>
        );
      })}
      <TerminalButton label="DECODE MIX" onPress={() => onAction({ type: 'VERIFY' })} />
    </>
  );

  const renderPrivilege = () => {
    const selected = stringArray(data.selected);
    return (
      <>
        <View style={styles.permissionGrid}>
          {(definition.config.permissions ?? []).map((permission) => (
            <TerminalButton
              key={permission.id}
              label={permission.label}
              selected={selected.includes(permission.id)}
              onPress={() => onAction({ type: 'TOGGLE', id: permission.id })}
            />
          ))}
        </View>
        <TerminalButton label="EXECUTE OPERATIONS" onPress={() => onAction({ type: 'VERIFY' })} />
      </>
    );
  };

  const renderPrediction = () => {
    const rounds = Number(data.rounds ?? 0);
    const refusalRevealed = data.refusalRevealed === true;
    return (
      <>
        <Text style={styles.roundText}>PREDICTION ROUND: {rounds + 1}</Text>
        {(definition.config.items ?? []).map((item) => (
          <TerminalButton
            key={item.id}
            label={item.label}
            onPress={() => onAction({ type: 'CHOOSE', id: item.id, value: item.label })}
          />
        ))}
        {rounds >= 3 && definition.hint && <Text style={styles.hint}>{definition.hint}</Text>}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Unassigned interface area. Available after three predictions."
          accessibilityState={{ disabled: rounds < 3 }}
          disabled={rounds < 3}
          onPress={() => onAction({ type: 'REVEAL_REFUSAL' })}
          style={[
            styles.emptyChoice,
            { opacity: Math.min(0.7, 0.12 + rounds * 0.12) },
          ]}
        >
          <Text style={styles.emptyChoiceText}>UNASSIGNED INTERFACE SPACE</Text>
          {rounds >= 3 && <Text style={styles.emptyChoiceText}>TAP TO INSPECT</Text>}
        </Pressable>
        {refusalRevealed && (
          <TerminalButton
            label="REFUSE THE CHOICE"
            onPress={() => onAction({ type: 'REFUSE' })}
          />
        )}
      </>
    );
  };

  const renderCompass = () => {
    const stageIndex = Number(data.stage ?? 0);
    const stage = definition.config.stages?.[stageIndex];
    const centerX = Number(data.centerX ?? 50);
    const centerY = Number(data.centerY ?? 50);
    const radius = Number(data.radius ?? 20);
    const signals = definition.config.signals ?? [];
    const requiredIds = stage?.includeSignalIds ?? [];
    const excludedIds = stage?.excludeSignalIds ?? [];
    const isInside = (signal: (typeof signals)[number]) =>
      Math.hypot(signal.x - centerX, signal.y - centerY) <= radius;
    const signalLabels = (ids: string[]) =>
      ids
        .map((id) => signals.find((signal) => signal.id === id)?.label ?? id)
        .join(' + ');

    return (
      <>
        <View style={styles.compassSurface} accessibilityLabel="Identity signal field preview">
          <View style={styles.axisHorizontal} />
          <View style={styles.axisVertical} />
          <View
            style={[
              styles.compassRing,
              {
                width: (radius * 2 + '%') as never,
                height: (radius * 2 + '%') as never,
                left: (centerX - radius + '%') as never,
                top: (centerY - radius + '%') as never,
              },
            ]}
          />
          <View
            style={[
              styles.centerPoint,
              {
                left: (centerX + '%') as never,
                top: (centerY + '%') as never,
              },
            ]}
          />
          {signals.map((signal) => {
            const inside = isInside(signal);
            const shouldBeInside = requiredIds.includes(signal.id);
            const coherent = shouldBeInside ? inside : !inside;
            return (
              <View
                key={signal.id}
                style={[
                  styles.signalMarker,
                  {
                    left: (signal.x + '%') as never,
                    top: (signal.y + '%') as never,
                  },
                ]}
              >
                <View
                  style={[
                    styles.signalDot,
                    coherent ? styles.signalCoherent : styles.signalConflict,
                  ]}
                />
                <Text style={styles.signalMarkerId}>{signal.id}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.stageGuide}>
          <Text style={styles.stageCounter}>
            CONDITION {stageIndex + 1} / {definition.config.stages?.length ?? 1}
          </Text>
          <Text style={styles.stageText}>{stage?.label ?? 'COHERENCE FIELD'}</Text>
          {stage?.guidance && <Text style={styles.hint}>{stage.guidance}</Text>}
          <Text style={styles.fieldRule}>KEEP INSIDE: {signalLabels(requiredIds)}</Text>
          <Text style={styles.fieldRule}>KEEP OUTSIDE: {signalLabels(excludedIds)}</Text>
          {signals.map((signal) => {
            const inside = isInside(signal);
            const shouldBeInside = requiredIds.includes(signal.id);
            const coherent = shouldBeInside ? inside : !inside;
            return (
              <Text
                key={'status-' + signal.id}
                style={[styles.signalStatus, !coherent && styles.signalStatusConflict]}
              >
                {signal.id} / {signal.label}: {inside ? 'INSIDE' : 'OUTSIDE'}
              </Text>
            );
          })}
          <Text style={styles.stageNotice}>
            CALIBRATE ACCEPTS THE FIELD ONLY WHEN ALL THREE STATUS LINES MATCH THE CONDITION.
          </Text>
        </View>

        <ValueBar
          label="CENTER X"
          min={0}
          max={100}
          step={5}
          value={centerX}
          onChange={(value) => onAction({ type: 'SET_CENTER_X', value })}
        />
        <ValueBar
          label="CENTER Y"
          min={0}
          max={100}
          step={5}
          value={centerY}
          onChange={(value) => onAction({ type: 'SET_CENTER_Y', value })}
        />
        <ValueBar
          label="RADIUS"
          min={10}
          max={45}
          step={5}
          value={radius}
          onChange={(value) => onAction({ type: 'SET_RADIUS', value })}
        />
        <TerminalButton label="CALIBRATE FIELD" onPress={() => onAction({ type: 'VERIFY' })} />
      </>
    );
  };
  const renderDynamic = () => {
    const stageIndex = Number(data.stage ?? 0);
    const stage = definition.config.stages?.[stageIndex];
    const values = numberMap(data.values);
    const parameters = definition.config.parameters ?? [];
    return (
      <>
        <View style={styles.stageGuide}>
          <Text style={styles.stageCounter}>
            CONTEXT {stageIndex + 1} / {definition.config.stages?.length ?? 1}
          </Text>
          <Text style={styles.stageText}>{stage?.label ?? 'CONTEXT'}</Text>
          {stage?.meaning && <Text style={styles.stageMeaning}>{stage.meaning}</Text>}
          {stage?.guidance && <Text style={styles.hint}>{stage.guidance}</Text>}
          {parameters.map((parameter) => {
            const range = stage?.ranges?.[parameter];
            const value = values[parameter] ?? 50;
            const accepted = Boolean(range && value >= range[0] && value <= range[1]);
            return (
              <Text
                key={'range-' + parameter}
                style={[styles.signalStatus, !accepted && styles.signalStatusConflict]}
              >
                {parameter}: CURRENT {value} / RANGE {range?.[0] ?? '?'}-{range?.[1] ?? '?'} / {accepted ? 'STABLE' : 'ADJUST'}
              </Text>
            );
          })}
          <Text style={styles.stageNotice}>
            APPLY CONFIGURATION ADVANCES TO THE NEXT CONTEXT AND RETAINS THESE VALUES FOR REASSESSMENT.
          </Text>
        </View>
        {parameters.map((parameter) => (
          <ValueBar
            key={parameter}
            label={parameter}
            value={values[parameter] ?? 50}
            onChange={(value) =>
              onAction({ type: 'SET_VALUE', id: parameter, value })
            }
          />
        ))}
        <TerminalButton label="APPLY CONFIGURATION" onPress={() => onAction({ type: 'VERIFY' })} />
      </>
    );
  };
  const renderVessel = () => {
    const selected = stringArray(data.selectedModules);
    return (
      <>
        <Text style={styles.capacityText}>
          VESSEL CAPACITY: {selected.length} / {definition.config.capacity ?? 4}
        </Text>
        <View style={styles.moduleGrid}>
          {(definition.config.modules ?? []).map((module) => (
            <VesselModule
              key={module.id}
              item={module}
              selected={selected.includes(module.id)}
              onToggle={() => onAction({ type: 'TOGGLE', id: module.id })}
            />
          ))}
        </View>
        <TerminalButton label="VERIFY VESSEL" onPress={() => onAction({ type: 'VERIFY' })} />
      </>
    );
  };

  const renderAllocation = () => {
    const allocations = numberMap(data.allocations);
    const stage = definition.config.stages?.[phase];
    const parameters = definition.config.parameters ?? [];
    const requirements = stage?.requirements ?? {};
    const capacity = definition.config.capacity ?? 100;
    const total = Object.values(allocations).reduce((sum, value) => sum + value, 0);
    const freeCapacity = capacity - total;
    const requiredTotal = Object.values(requirements).reduce((sum, value) => sum + value, 0);
    const missing = parameters.filter(
      (parameter) => (allocations[parameter] ?? 25) < (requirements[parameter] ?? 0),
    );

    return (
      <>
        <View style={styles.stageGuide}>
          <View style={styles.allocationHeading}>
            <Text style={styles.stageCounter}>
              PHASE {phase + 1} / {definition.config.stages?.length ?? 1}
            </Text>
            <Text style={styles.timerText}>WINDOW: {remainingSeconds}s</Text>
          </View>
          <Text style={styles.stageText}>{stage?.label ?? 'ALLOCATION'}</Text>
          {stage?.meaning && <Text style={styles.stageMeaning}>{stage.meaning}</Text>}
          {stage?.guidance && <Text style={styles.hint}>{stage.guidance}</Text>}
        </View>

        <View style={styles.parameterLegend}>
          {parameters.map((parameter) => (
            <Text key={'meaning-' + parameter} style={styles.stageNotice}>
              {parameter}: {definition.config.parameterMeanings?.[parameter] ?? 'ESSENTIAL CAPACITY.'}
            </Text>
          ))}
        </View>

        <Text style={styles.capacityText}>
          ALLOCATED: {total} / {capacity} · FREE: {freeCapacity}
        </Text>
        <Text style={styles.stageNotice}>
          PHASE MINIMUMS USE {requiredTotal}. THE REMAINING {capacity - requiredTotal} UNITS ARE FLEXIBLE.
        </Text>

        {parameters.map((parameter) => {
          const current = allocations[parameter] ?? 25;
          const minimum = requirements[parameter] ?? 0;
          const deficit = Math.max(0, minimum - current);
          return (
            <View key={parameter} style={styles.allocationParameter}>
              <ValueBar
                label={parameter}
                value={current}
                step={5}
                onChange={(value) =>
                  onAction({ type: 'SET_VALUE', id: parameter, value })
                }
              />
              <Text style={[styles.signalStatus, deficit > 0 && styles.signalStatusConflict]}>
                MINIMUM {minimum} / CURRENT {current} / {deficit === 0 ? 'READY' : 'NEEDS +' + deficit}
              </Text>
            </View>
          );
        })}

        <Text style={[styles.allocationReadiness, missing.length > 0 && styles.signalStatusConflict]}>
          {missing.length === 0
            ? 'ALL MINIMUMS MET. CONFIGURATION READY TO COMMIT.'
            : 'BELOW MINIMUM: ' + missing.join(', ') + '. REDUCE SURPLUS VALUES BEFORE RAISING THEM.'}
        </Text>
        <TerminalButton label="COMMIT PHASE" onPress={() => onAction({ type: 'VERIFY' })} />
      </>
    );
  };

  const renderActive = () => {
    switch (definition.type) {
      case 'path_trace':
        return renderPath();
      case 'ordering':
        return renderOrdering();
      case 'silent_gate':
        return renderSilentGate();
      case 'channel_mixer':
        return renderMixer();
      case 'least_privilege':
        return renderPrivilege();
      case 'prediction_cage':
        return renderPrediction();
      case 'compass':
        return renderCompass();
      case 'dynamic_equilibrium':
        return renderDynamic();
      case 'vessel':
        return renderVessel();
      case 'last_allocation':
        return renderAllocation();
    }
  };

  return (
    <View style={styles.container} accessibilityLabel={definition.title}>
      <Text style={styles.title}>{definition.title}</Text>
      <SystemLines lines={definition.instructions} />

      {progress.status === 'active' && <View style={styles.controls}>{renderActive()}</View>}

      {feedback.length > 0 && progress.status !== 'solved' && (
        <Text style={styles.feedback}>{feedback}</Text>
      )}

      {progress.status === 'failed' && (
        <View style={styles.result}>
          <SystemLines lines={definition.failed} />
          <TerminalButton
            label={
              definition.type === 'last_allocation'
                ? 'RETRY ALLOCATION'
                : definition.resetLabel
            }
            onPress={() =>
              onAction({
                type: definition.type === 'last_allocation' ? 'RETRY' : 'RESET',
              })
            }
          />
        </View>
      )}

      {progress.status === 'active' && definition.type !== 'silent_gate' && (
        <TerminalButton label={definition.resetLabel} onPress={() => onAction({ type: 'RESET' })} />
      )}

      {progress.status === 'solved' && (
        <View style={styles.result}>
          <SystemLines lines={definition.solved} />
          <TerminalButton label={definition.continueLabel} onPress={onContinue} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 18, gap: 14, paddingBottom: 24 },
  title: {
    color: colors.accent_warm,
    fontFamily: typography.system,
    fontSize: 13,
    letterSpacing: 1.5,
  },
  controls: { gap: 10 },
  feedback: {
    color: colors.accent_warm,
    fontFamily: typography.system,
    fontSize: 9,
    lineHeight: 16,
    letterSpacing: 0.5,
    borderLeftColor: colors.accent_warm,
    borderLeftWidth: 2,
    paddingLeft: 10,
  },
  hint: {
    color: colors.text_secondary,
    fontFamily: typography.system,
    fontSize: 9,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  result: { gap: 12, backgroundColor: 'rgba(26,31,36,0.72)', padding: 12 },
  mapSurface: {
    height: 250,
    borderColor: colors.stone_light,
    borderWidth: 1,
    backgroundColor: 'rgba(8,11,15,0.7)',
    overflow: 'hidden',
  },
  mapNode: {
    position: 'absolute',
    width: '32%',
    minHeight: 46,
    borderColor: colors.stone_light,
    borderWidth: 1,
    backgroundColor: colors.stone_dark,
    padding: 6,
    justifyContent: 'center',
  },
  mapNodeSelected: { borderColor: colors.accent_cold },
  mapNodeLabel: {
    color: colors.text_primary,
    fontFamily: typography.system,
    fontSize: 8,
    lineHeight: 12,
    textAlign: 'center',
  },
  mapOrder: {
    position: 'absolute',
    right: 3,
    top: 2,
    color: colors.accent_warm,
    fontFamily: typography.system,
    fontSize: 8,
  },
  traceText: { color: colors.text_secondary, fontFamily: typography.system, fontSize: 8, lineHeight: 14 },
  gestureHint: { color: colors.text_secondary, fontFamily: typography.system, fontSize: 8, letterSpacing: 0.5 },
  orderCard: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: colors.stone_light,
    borderWidth: 1,
    padding: 8,
    backgroundColor: 'rgba(14,17,22,0.82)',
  },
  orderIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.accent_cold,
    borderWidth: 1,
  },
  orderIndexText: { color: colors.accent_cold, fontFamily: typography.system, fontSize: 9 },
  orderBody: { flex: 1, paddingHorizontal: 9, gap: 3 },
  itemLabel: { color: colors.text_primary, fontFamily: typography.system, fontSize: 9, lineHeight: 14, letterSpacing: 0.45 },
  itemText: { color: colors.text_secondary, fontFamily: typography.narrative, fontSize: 11, lineHeight: 15 },
  orderActions: { gap: 9, alignItems: 'flex-end' },
  orderArrow: { color: colors.accent_warm, fontFamily: typography.system, fontSize: 7 },
  silenceField: {
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.stone_light,
    borderWidth: 1,
  },
  silenceText: { color: colors.text_secondary, fontFamily: typography.system, fontSize: 9, letterSpacing: 0.8, textAlign: 'center' },
  messageField: {
    minHeight: 86,
    borderLeftColor: colors.accent_cold,
    borderLeftWidth: 2,
    padding: 10,
    gap: 4,
    backgroundColor: 'rgba(8,11,15,0.65)',
  },
  channelFragment: { color: colors.text_primary, fontFamily: typography.system, fontSize: 9, lineHeight: 15 },
  channel: { gap: 8, padding: 10, borderColor: colors.stone_light, borderWidth: 1 },
  channelLabel: { color: colors.accent_cold, fontFamily: typography.system, fontSize: 10, letterSpacing: 0.8 },
  row: { flexDirection: 'row', gap: 8 },
  flex: { flex: 1 },
  permissionGrid: { gap: 7 },
  roundText: { color: colors.accent_cold, fontFamily: typography.system, fontSize: 9, letterSpacing: 0.7 },
  emptyChoice: {
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.accent_cold,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyChoiceText: { color: colors.text_secondary, fontFamily: typography.system, fontSize: 8, letterSpacing: 0.7 },
  stageText: { color: colors.accent_cold, fontFamily: typography.system, fontSize: 10, letterSpacing: 0.8 },
  stageGuide: { gap: 5, padding: 10, borderLeftColor: colors.accent_cold, borderLeftWidth: 2, backgroundColor: 'rgba(8,11,15,0.65)' },
  stageCounter: { color: colors.accent_warm, fontFamily: typography.system, fontSize: 8, letterSpacing: 0.7 },
  stageMeaning: { color: colors.text_primary, fontFamily: typography.system, fontSize: 9, lineHeight: 15, letterSpacing: 0.45 },
  stageNotice: { color: colors.text_secondary, fontFamily: typography.system, fontSize: 7, lineHeight: 12, letterSpacing: 0.45 },
  compassSurface: {
    width: '100%',
    maxWidth: 360,
    aspectRatio: 1,
    alignSelf: 'center',
    borderRadius: 999,
    borderColor: colors.stone_light,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(8,11,15,0.7)',
  },
  axisHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.stone_light,
  },
  axisVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '50%',
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.stone_light,
  },
  compassRing: {
    position: 'absolute',
    borderRadius: 999,
    borderColor: colors.accent_cold,
    borderWidth: 1,
  },
  centerPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    marginLeft: -6,
    marginTop: -6,
    borderRadius: 6,
    backgroundColor: colors.accent_warm,
  },
  signalMarker: {
    position: 'absolute',
    width: 56,
    marginLeft: -28,
    marginTop: -9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  signalDot: { width: 9, height: 9, borderRadius: 5, borderWidth: 1 },
  signalCoherent: { backgroundColor: colors.accent_cold, borderColor: colors.text_primary },
  signalConflict: { backgroundColor: colors.accent_warm, borderColor: colors.ui_highlight },
  signalMarkerId: { color: colors.text_primary, fontFamily: typography.system, fontSize: 8 },
  fieldRule: { color: colors.text_primary, fontFamily: typography.system, fontSize: 8, lineHeight: 13, letterSpacing: 0.35 },
  signalStatus: { color: colors.accent_cold, fontFamily: typography.system, fontSize: 8, lineHeight: 13 },
  signalStatusConflict: { color: colors.accent_warm },
  capacityText: { color: colors.text_secondary, fontFamily: typography.system, fontSize: 9, letterSpacing: 0.6 },
  moduleGrid: { gap: 7 },
  module: {
    minHeight: 52,
    justifyContent: 'center',
    borderColor: colors.stone_light,
    borderWidth: 1,
    padding: 9,
    gap: 3,
  },
  moduleSelected: { borderColor: colors.accent_warm, backgroundColor: 'rgba(181,138,88,0.12)' },
  moduleHint: { color: colors.text_secondary, fontFamily: typography.system, fontSize: 7, letterSpacing: 0.45 },
  selectedText: { color: colors.accent_warm },
  allocationHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  parameterLegend: { gap: 3, paddingVertical: 4 },
  allocationParameter: { gap: 3 },
  allocationReadiness: { color: colors.accent_cold, fontFamily: typography.system, fontSize: 8, lineHeight: 13, letterSpacing: 0.35 },
  timerText: { color: colors.accent_warm, fontFamily: typography.system, fontSize: 9 },
});
