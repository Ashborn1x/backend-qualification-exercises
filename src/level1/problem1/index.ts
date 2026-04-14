export type Value = string | number | boolean | null | undefined |
  Date | Buffer | Map<unknown, unknown> | Set<unknown> |
  Array<Value> | { [key: string]: Value };

type SerializedValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | { __t: 'Date'; __v: number }
  | { __t: 'Buffer'; __v: number[] }
  | { __t: 'Map'; __v: [unknown, unknown][] }
  | { __t: 'Set'; __v: unknown[] }
  | Array<SerializedValue>
  | { [key: string]: SerializedValue };

type SerializedDate = { __t: 'Date'; __v: number };
type SerializedBuffer = { __t: 'Buffer'; __v: number[] };
type SerializedMap = { __t: 'Map'; __v: [unknown, unknown][] };
type SerializedSet = { __t: 'Set'; __v: unknown[] };
type SerializedTaggedValue =
  | SerializedDate
  | SerializedBuffer
  | SerializedMap
  | SerializedSet;

function isSerializedTaggedValue(value: unknown): value is SerializedTaggedValue {
  return typeof value === 'object' && value !== null && '__t' in value && '__v' in value;
}

/**
 * Transforms JavaScript scalars and objects into JSON
 * compatible objects.
 */
export function serialize(value: Value): unknown {
  if (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value;
  }

  if (value instanceof Date) {
    return { __t: 'Date', __v: value.getTime() };
  }

  if (Buffer.isBuffer(value)) {
    return { __t: 'Buffer', __v: [...value.values()] };
  }

  if (value instanceof Map) {
    return {
      __t: 'Map',
      __v: [...value.entries()].map(([key, entryValue]) => [
        serialize(key as Value),
        serialize(entryValue as Value),
      ]),
    };
  }

  if (value instanceof Set) {
    return {
      __t: 'Set',
      __v: [...value.values()].map((entryValue) => serialize(entryValue as Value)),
    };
  }

  if (Array.isArray(value)) {
    return value.map((entryValue) => serialize(entryValue));
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entryValue]) => [key, serialize(entryValue)])
  );
}

/**
 * Transforms JSON compatible scalars and objects into JavaScript
 * scalar and objects.
 */
export function deserialize<T = unknown>(value: unknown): T {
  if (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value as T;
  }

  if (Array.isArray(value)) {
    return value.map((entryValue) => deserialize(entryValue)) as T;
  }

  if (isSerializedTaggedValue(value)) {
    switch (value.__t) {
      case 'Date':
        return new Date(value.__v) as T;
      case 'Buffer':
        return Buffer.from(value.__v) as T;
      case 'Map':
        return new Map(
          value.__v.map(([key, entryValue]) => [
            deserialize(key),
            deserialize(entryValue),
          ])
        ) as T;
      case 'Set':
        return new Set(value.__v.map((entryValue) => deserialize(entryValue))) as T;
    }
  }

  return Object.fromEntries(
    Object.entries(value as { [key: string]: SerializedValue }).map(([key, entryValue]) => [
      key,
      deserialize(entryValue),
    ])
  ) as T;
}
