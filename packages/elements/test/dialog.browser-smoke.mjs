/**
 * Real Chromium smoke test. Run after building React and Angular:
 * node packages/elements/test/dialog.browser-smoke.mjs
 * Set CHROME_PATH when Chrome is not installed at the Windows default.
 */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'vite';

const source = `
import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import '@angular/compiler';
import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { Dialog } from '/packages/react/dist/components/dialog.js';
import { CosmDialogComponent } from '/packages/angular/dist/components/dialog.component.js';

export async function react() {
  const state = { open: false, cancel: false, events: [] };
  const root = createRoot(document.querySelector('#root'));
  const draw = () => flushSync(() => root.render(React.createElement(Dialog, {
    open: state.open, size: 'sm', fullWidth: true, responsiveFullscreen: true, movable: true,
    onOpenChange: e => {
      if (state.cancel && !e.detail.open) e.preventDefault();
      state.events.push({ open: e.detail.open, reason: e.detail.reason, cancelable: e.cancelable, canceled: e.defaultPrevented });
    }
  }, React.createElement('h2', { slot: 'title' }, 'React dialog title'),
     React.createElement('button', { id: 'first' }, 'Continue'))));
  draw();
  const el = document.querySelector('cosm-dialog');
  await el.updateComplete;
  window.probe = { el, state, first: document.querySelector('#first'),
    setOpen: v => { state.open = v; draw(); }, setCancel: v => { state.cancel = v; } };
}
export async function angular() {
  class Host {
    constructor() { this.open = signal(false); this.cancel = false; this.events = []; }
    onChange(e) {
      if (this.cancel && !e.detail.open) e.preventDefault();
      this.events.push({ open: e.detail.open, reason: e.detail.reason, cancelable: e.cancelable, canceled: e.defaultPrevented });
    }
  }
  Component({ selector: 'dialog-host', standalone: true, imports: [CosmDialogComponent],
    template: '<cosm-dialog [open]="open()" size="sm" [fullWidth]="true" [responsiveFullscreen]="true" [movable]="true" (openChange)="onChange($event)"><h2 slot="title">Angular dialog title</h2><button id="first">Continue</button></cosm-dialog>' })(Host);
  const app = await bootstrapApplication(Host, { providers: [provideZonelessChangeDetection()] });
  const state = app.components[0].instance, el = document.querySelector('cosm-dialog');
  await el.updateComplete;
  window.probe = { el, state, first: document.querySelector('#first'),
    setOpen: v => { state.open.set(v); app.tick(); }, setCancel: v => { state.cancel = v; } };
}
`;
const plugin = {
  name: 'dialog-browser-smoke',
  resolveId(id) {
    if (id === 'virtual:dialog-browser-smoke') return '\0virtual:dialog-browser-smoke';
  },
  load(id) {
    if (id === '\0virtual:dialog-browser-smoke') return source;
  },
};
const server = await createServer({
  configFile: false,
  plugins: [plugin],
  appType: 'custom',
  server: { host: '127.0.0.1', port: 0 },
  logLevel: 'error',
});
server.middlewares.use('/probe', (_request, response) => {
  response.setHeader('content-type', 'text/html');
  response.end(
    '<!doctype html><button id="invoker">Open</button><div id="root"></div><dialog-host></dialog-host>'
  );
});
await server.listen();
const port = server.httpServer.address().port;
const profile = await mkdtemp(join(tmpdir(), 'cosmos-dialog-smoke-'));
const executable =
  process.env.CHROME_PATH ?? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const chrome = spawn(
  executable,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    'about:blank',
  ],
  { stdio: ['ignore', 'ignore', 'pipe'] }
);
const url = await new Promise((resolve, reject) => {
  let output = '';
  const timer = setTimeout(() => reject(new Error('Chrome startup timed out')), 15000);
  chrome.stderr.on('data', chunk => {
    output += chunk.toString();
    const match = output.match(/DevTools listening on (ws:\/\/[^\s]+)/);
    if (match) {
      clearTimeout(timer);
      resolve(match[1]);
    }
  });
  chrome.once('error', reject);
  chrome.once('exit', code => reject(new Error(`Chrome exited ${code}`)));
});
const ws = new WebSocket(url);
await new Promise((resolve, reject) => {
  ws.addEventListener('open', resolve, { once: true });
  ws.addEventListener('error', reject, { once: true });
});
let nextId = 0;
const pending = new Map();
ws.addEventListener('message', event => {
  const message = JSON.parse(event.data);
  const request = pending.get(message.id);
  if (!request) return;
  pending.delete(message.id);
  if (message.error) request.reject(new Error(JSON.stringify(message.error)));
  else request.resolve(message.result);
});
const send = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });

let failures = 0;
try {
  const version = await send('Browser.getVersion');
  console.log(`Browser: ${version.product}; ${version.userAgent}`);
  for (const framework of ['react', 'angular']) {
    const { targetId } = await send('Target.createTarget', {
      url: `http://127.0.0.1:${port}/probe`,
    });
    try {
      const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
      await send(
        'Emulation.setDeviceMetricsOverride',
        { width: 1200, height: 800, deviceScaleFactor: 1, mobile: false },
        sessionId
      );
      const evaluate = async expression => {
        const result = await send(
          'Runtime.evaluate',
          { expression, awaitPromise: true, returnByValue: true },
          sessionId
        );
        if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
        return result.result.value;
      };
      const check = (name, value, ok) => {
        console.log(`${framework} ${name}: ${JSON.stringify(value)}`);
        assert.ok(ok, `${framework}: ${name}`);
      };
      const key = async (value, code, keyCode) => {
        const text = value === 'Enter' ? '\r' : undefined;
        await send(
          'Input.dispatchKeyEvent',
          {
            type: 'keyDown',
            key: value,
            code,
            windowsVirtualKeyCode: keyCode,
            text,
            unmodifiedText: text,
          },
          sessionId
        );
        await send(
          'Input.dispatchKeyEvent',
          { type: 'keyUp', key: value, code, windowsVirtualKeyCode: keyCode },
          sessionId
        );
      };
      await evaluate(`(async () => {
        if (document.readyState !== 'complete') await new Promise(r => window.addEventListener('load', r, { once: true }));
        await (await import('/@id/virtual:dialog-browser-smoke')).${framework}();
      })()`);
      const initial = await evaluate(`(async () => {
        probe.el.requestOpen(); await probe.el.updateComplete;
        return { open: probe.el.open, controlled: probe.el.openControlled, last: probe.state.events.at(-1) };
      })()`);
      check(
        'controlled false',
        initial,
        !initial.open && initial.controlled && initial.last.reason === 'action'
      );
      const opened = await evaluate(`(async () => {
        document.querySelector('#invoker').focus(); probe.setOpen(true); await probe.el.updateComplete;
        return { open: probe.el.open, modal: probe.el.shadowRoot.querySelector('dialog').matches(':modal'),
          focus: document.activeElement === probe.first,
          width: probe.el.shadowRoot.querySelector('[part=base]').getBoundingClientRect().width };
      })()`);
      check(
        'opening',
        opened,
        opened.open && opened.modal && opened.focus && Math.abs(opened.width - 400) < 1
      );
      const sizes = await evaluate(`(async () => {
        probe.el.size = 'lg'; await probe.el.updateComplete;
        const large = probe.el.shadowRoot.querySelector('[part=base]').getBoundingClientRect().width;
        probe.el.maxWidth = 720; await probe.el.updateComplete;
        const explicit = probe.el.shadowRoot.querySelector('[part=base]').getBoundingClientRect().width;
        probe.el.maxWidth = undefined; probe.el.size = 'sm'; await probe.el.updateComplete;
        const restored = probe.el.shadowRoot.querySelector('[part=base]').getBoundingClientRect().width;
        return { large, explicit, restored };
      })()`);
      check(
        'width precedence',
        sizes,
        Math.abs(sizes.large - 960) < 1 &&
          Math.abs(sizes.explicit - 720) < 1 &&
          Math.abs(sizes.restored - 400) < 1
      );
      const ax = await send('Accessibility.getFullAXTree', {}, sessionId);
      const names = ax.nodes
        .filter(node => node.role?.value === 'dialog')
        .map(node => node.name?.value);
      const name = `${framework === 'react' ? 'React' : 'Angular'} dialog title`;
      check('accessible name', names, names.includes(name));
      const inert = await evaluate(
        `(document.querySelector('#invoker').focus(), document.activeElement === probe.first)`
      );
      check('background inert', inert, inert);
      await key('Tab', 'Tab', 9);
      const wrap = await evaluate(
        `probe.el.shadowRoot.activeElement?.getAttribute('part') === 'move-trigger'`
      );
      check('Tab wrap', wrap, wrap);
      await key('Enter', 'Enter', 13);
      const expanded = await evaluate(`(async () => {
        await probe.el.updateComplete;
        const trigger = probe.el.shadowRoot.querySelector('[part="move-trigger"]');
        await trigger.updateComplete;
        return trigger.shadowRoot.querySelector('button').getAttribute('aria-expanded');
      })()`);
      check('movement controls expanded', expanded, expanded === 'true');
      await evaluate(
        `probe.el.shadowRoot.querySelector('[part="move-right"]').shadowRoot.querySelector('button').focus()`
      );
      const before = await evaluate(
        `probe.el.shadowRoot.querySelector('[part=base]').getBoundingClientRect().left`
      );
      await key('Enter', 'Enter', 13);
      const moved = await evaluate(`({
        left: probe.el.shadowRoot.querySelector('[part=base]').getBoundingClientRect().left,
        focus: probe.el.shadowRoot.activeElement?.getAttribute('part')
      })`);
      check(
        'keyboard movement',
        moved.left - before,
        Math.abs(moved.left - before - 16) < 1 && moved.focus === 'move-right'
      );
      const header = await evaluate(`(() => {
        const r = probe.el.shadowRoot.querySelector('[part=header]').getBoundingClientRect();
        return { x: r.left + 12, y: r.top + 12 };
      })()`);
      await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...header }, sessionId);
      await send(
        'Input.dispatchMouseEvent',
        { type: 'mousePressed', ...header, button: 'left', buttons: 1, clickCount: 1 },
        sessionId
      );
      await send(
        'Input.dispatchMouseEvent',
        { type: 'mouseMoved', x: header.x + 70, y: header.y + 25, button: 'left', buttons: 1 },
        sessionId
      );
      const preview = await evaluate(
        `probe.el.shadowRoot.querySelector('[part=base]').getBoundingClientRect().left`
      );
      check('drag preview', preview - moved.left, Math.abs(preview - moved.left - 70) < 2);
      await send(
        'Input.dispatchMouseEvent',
        {
          type: 'mouseReleased',
          x: header.x + 70,
          y: header.y + 25,
          button: 'left',
          buttons: 0,
          clickCount: 1,
        },
        sessionId
      );
      const dragged = await evaluate(
        `probe.el.shadowRoot.querySelector('[part=base]').getBoundingClientRect().left`
      );
      check('drag snaps to grid', dragged - moved.left, Math.abs(dragged - moved.left - 64) < 2);
      await evaluate(
        `probe.el.shadowRoot.querySelector('[part="move-center"]').shadowRoot.querySelector('button').focus()`
      );
      await key('Enter', 'Enter', 13);
      await evaluate(
        `probe.el.shadowRoot.querySelector('[part="move-right"]').shadowRoot.querySelector('button').focus()`
      );
      for (let step = 0; step < 5; step++) await key('Enter', 'Enter', 13);
      const reproduced = await evaluate(
        `probe.el.shadowRoot.querySelector('[part=base]').getBoundingClientRect().left`
      );
      check('buttons reproduce drag', reproduced, Math.abs(reproduced - dragged) < 1);
      const touchStart = await evaluate(`(() => {
        const r = probe.el.shadowRoot.querySelector('[part=header]').getBoundingClientRect();
        return { x: r.left + 12, y: r.top + 12, id: 1 };
      })()`);
      await send(
        'Emulation.setTouchEmulationEnabled',
        { enabled: true, maxTouchPoints: 1 },
        sessionId
      );
      await send(
        'Input.dispatchTouchEvent',
        { type: 'touchStart', touchPoints: [touchStart] },
        sessionId
      );
      await send(
        'Input.dispatchTouchEvent',
        { type: 'touchMove', touchPoints: [{ x: touchStart.x + 35, y: touchStart.y + 20, id: 1 }] },
        sessionId
      );
      await send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }, sessionId);
      await send('Emulation.setTouchEmulationEnabled', { enabled: false }, sessionId);
      const touched = await evaluate(
        `probe.el.shadowRoot.querySelector('[part=base]').getBoundingClientRect().left`
      );
      check('touch drag snaps', touched - dragged, Math.abs(touched - dragged - 32) < 2);
      const edgeStart = await evaluate(`(() => {
        const r = probe.el.shadowRoot.querySelector('[part=header]').getBoundingClientRect();
        return { x: r.left + 12, y: r.top + 12 };
      })()`);
      await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...edgeStart }, sessionId);
      await send(
        'Input.dispatchMouseEvent',
        { type: 'mousePressed', ...edgeStart, button: 'left', buttons: 1, clickCount: 1 },
        sessionId
      );
      await send(
        'Input.dispatchMouseEvent',
        { type: 'mouseMoved', x: 1195, y: 795, button: 'left', buttons: 1 },
        sessionId
      );
      await send(
        'Input.dispatchMouseEvent',
        { type: 'mouseReleased', x: 1195, y: 795, button: 'left', buttons: 0, clickCount: 1 },
        sessionId
      );
      const bounded = await evaluate(`(() => {
        const r = probe.el.shadowRoot.querySelector('[part=base]').getBoundingClientRect();
        return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
      })()`);
      check(
        'viewport bounds',
        bounded,
        bounded.left >= 0 && bounded.top >= 0 && bounded.right <= 1200 && bounded.bottom <= 800
      );
      await evaluate(
        `probe.el.shadowRoot.querySelector('[part="move-center"]').shadowRoot.querySelector('button').focus()`
      );
      await key('Enter', 'Enter', 13);
      const centered = await evaluate(`(() => {
        const r = probe.el.shadowRoot.querySelector('[part=base]').getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      })()`);
      check(
        'keyboard center',
        centered,
        Math.abs(centered.x - 600) < 1 && Math.abs(centered.y - 400) < 1
      );
      const centerRect = await evaluate(`(() => {
        const r = probe.el.shadowRoot.querySelector('[part=base]').getBoundingClientRect();
        return { left: r.left, bottom: r.bottom };
      })()`);
      await evaluate(
        `probe.el.shadowRoot.querySelector('[part="move-right"]').shadowRoot.querySelector('button').focus()`
      );
      for (let step = 0; step < Math.ceil((bounded.left - centerRect.left) / 16); step++)
        await key('Enter', 'Enter', 13);
      await evaluate(
        `probe.el.shadowRoot.querySelector('[part="move-down"]').shadowRoot.querySelector('button').focus()`
      );
      for (let step = 0; step < Math.ceil((bounded.bottom - centerRect.bottom) / 16); step++)
        await key('Enter', 'Enter', 13);
      const buttonEdge = await evaluate(`(() => {
        const r = probe.el.shadowRoot.querySelector('[part=base]').getBoundingClientRect();
        return { left: r.left, bottom: r.bottom };
      })()`);
      check(
        'buttons reproduce dragged boundary',
        buttonEdge,
        Math.abs(buttonEdge.left - bounded.left) < 1 &&
          Math.abs(buttonEdge.bottom - bounded.bottom) < 1
      );
      await evaluate(
        `probe.el.shadowRoot.querySelector('[part="move-left"]').shadowRoot.querySelector('button').focus()`
      );
      await key('Enter', 'Enter', 13);
      await evaluate(
        `probe.el.shadowRoot.querySelector('[part="move-up"]').shadowRoot.querySelector('button').focus()`
      );
      await key('Enter', 'Enter', 13);
      const insideEdge = await evaluate(`(() => {
        const r = probe.el.shadowRoot.querySelector('[part=base]').getBoundingClientRect();
        return { left: r.left, bottom: r.bottom };
      })()`);
      check(
        'buttons move inward from boundary',
        insideEdge,
        insideEdge.left < buttonEdge.left && insideEdge.bottom < buttonEdge.bottom
      );
      await evaluate(
        `probe.el.shadowRoot.querySelector('[part="move-center"]').shadowRoot.querySelector('button').focus()`
      );
      await key('Enter', 'Enter', 13);
      const abortStart = await evaluate(`(() => {
        const r = probe.el.shadowRoot.querySelector('[part=header]').getBoundingClientRect();
        return { x: r.left + 12, y: r.top + 12 };
      })()`);
      const eventsBeforeAbort = await evaluate('probe.state.events.length');
      await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...abortStart }, sessionId);
      await send(
        'Input.dispatchMouseEvent',
        { type: 'mousePressed', ...abortStart, button: 'left', buttons: 1, clickCount: 1 },
        sessionId
      );
      await send(
        'Input.dispatchMouseEvent',
        {
          type: 'mouseMoved',
          x: abortStart.x + 30,
          y: abortStart.y + 20,
          button: 'left',
          buttons: 1,
        },
        sessionId
      );
      await key('Escape', 'Escape', 27);
      await send(
        'Input.dispatchMouseEvent',
        {
          type: 'mouseReleased',
          x: abortStart.x + 30,
          y: abortStart.y + 20,
          button: 'left',
          buttons: 0,
          clickCount: 1,
        },
        sessionId
      );
      const aborted = await evaluate(`({
        open: probe.el.open,
        transform: probe.el.shadowRoot.querySelector('[part=base]').style.transform,
        count: probe.state.events.length
      })`);
      check(
        'Escape aborts drag',
        aborted,
        aborted.open &&
          aborted.transform === 'translate(0px, 0px)' &&
          aborted.count === eventsBeforeAbort
      );
      await key('Escape', 'Escape', 27);
      const collapsed = await evaluate(`(async () => {
        await probe.el.updateComplete;
        const trigger = probe.el.shadowRoot.querySelector('[part="move-trigger"]');
        await trigger.updateComplete;
        return { open: probe.el.open, hidden: probe.el.shadowRoot.querySelector('[part="move-controls"]').hidden,
          expanded: trigger.shadowRoot.querySelector('button').getAttribute('aria-expanded') };
      })()`);
      check(
        'Escape collapses movement controls',
        collapsed,
        collapsed.open && collapsed.hidden && collapsed.expanded === 'false'
      );
      await evaluate(`(probe.first.focus(), probe.setCancel(true))`);
      await key('Escape', 'Escape', 27);
      const veto = await evaluate(`({
        open: probe.el.open, modal: probe.el.shadowRoot.querySelector('dialog').matches(':modal'),
        focus: document.activeElement === probe.first, last: probe.state.events.at(-1)
      })`);
      check(
        'canceled Escape',
        veto,
        veto.open && veto.modal && veto.focus && veto.last.canceled && veto.last.reason === 'escape'
      );
      await evaluate(`probe.setCancel(false)`);
      await key('Escape', 'Escape', 27);
      const proposal = await evaluate(`({ open: probe.el.open, last: probe.state.events.at(-1) })`);
      check(
        'controlled Escape',
        proposal,
        proposal.open && proposal.last.reason === 'escape' && !proposal.last.canceled
      );
      const closed = await evaluate(`(async () => {
        probe.setOpen(false); await probe.el.updateComplete;
        return { open: probe.el.open, restored: document.activeElement === document.querySelector('#invoker') };
      })()`);
      check('owner close', closed, !closed.open && closed.restored);
      await evaluate(`(async () => { probe.setOpen(true); await probe.el.updateComplete; })()`);
      await send(
        'Emulation.setDeviceMetricsOverride',
        { width: 639, height: 800, deviceScaleFactor: 1, mobile: false },
        sessionId
      );
      await evaluate('new Promise(r => setTimeout(r, 100))');
      const small = await evaluate(`({
        fullscreen: probe.el.shadowRoot.querySelector('dialog').hasAttribute('data-fullscreen'),
        controls: !!probe.el.shadowRoot.querySelector('[part=move-trigger]'),
        modal: probe.el.shadowRoot.querySelector('dialog').matches(':modal')
      })`);
      check('width 639', small, small.fullscreen && !small.controls && small.modal);
      await send(
        'Emulation.setDeviceMetricsOverride',
        { width: 640, height: 800, deviceScaleFactor: 1, mobile: false },
        sessionId
      );
      await evaluate('new Promise(r => setTimeout(r, 100))');
      const boundary = await evaluate(`({
        fullscreen: probe.el.shadowRoot.querySelector('dialog').hasAttribute('data-fullscreen'),
        controls: !!probe.el.shadowRoot.querySelector('[part=move-trigger]'),
        transform: probe.el.shadowRoot.querySelector('[part=base]').style.transform
      })`);
      check(
        'width 640',
        boundary,
        !boundary.fullscreen && boundary.controls && boundary.transform === 'translate(0px, 0px)'
      );
    } catch (error) {
      failures++;
      console.error(`${framework} failed:`, error);
    } finally {
      await send('Target.closeTarget', { targetId });
    }
  }
} finally {
  ws.send(JSON.stringify({ id: ++nextId, method: 'Browser.close' }));
  await new Promise(resolve => {
    if (chrome.exitCode !== null) resolve();
    else chrome.once('exit', resolve);
    setTimeout(resolve, 3000);
  });
  await server.close();
  try {
    await rm(profile, { recursive: true, force: true });
  } catch {
    // Chrome can hold its temporary profile briefly after exiting.
  }
}
if (failures) process.exitCode = 1;
