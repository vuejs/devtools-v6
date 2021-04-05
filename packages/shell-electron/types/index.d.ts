import type Vue from "vue";

interface ConnectOptions {
  io?: Function;
  showToast?: Function;
  app?: Vue | Vue[];
}

export function connect(
  host?: string,
  port?: number | string,
  options: ConnectOptions
): void;

export function init(vue: Vue | Vue[]): void;
