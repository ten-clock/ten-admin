<script lang="ts" setup>
import {
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  useTemplateRef,
  watch,
} from 'vue';

import { Page } from '@vben/common-ui';
import { usePreferences } from '@vben/preferences';

import { Button, Card, Space, Switch } from 'antdv-next';

import { $t } from '#/locales';

import { Radar } from './radar';

const { isDark: prefersDark } = usePreferences();
const containerRef = useTemplateRef<HTMLDivElement>('containerRef');
const radar = shallowRef<null | Radar>(null);
/** 本页演示区主题，默认跟随全局浅/深 */
const isDarkMode = ref(prefersDark.value);

watch(isDarkMode, (dark) => {
  radar.value?.setColorScheme(dark ? 'dark' : 'light');
});

onMounted(() => {
  const container = containerRef.value;
  if (!container) return;

  radar.value = new Radar(container, {
    size: 500,
    numCircles: 5,
    sweepDeg: 20,
    duration: 5000,
    dotsNums: 10,
    colorScheme: isDarkMode.value ? 'dark' : 'light',
  });
});

onUnmounted(() => {
  radar.value?.destroy();
  radar.value = null;
});
</script>

<template>
  <Page
    :title="$t('examples.radar.title')"
    class="radar-page"
    :class="{ 'radar-page--dark': isDarkMode }"
    content-class="radar-page__content"
  >
    <template #description>
      <span class="radar-page__desc">
        旋转扫描扇形经过目标点时高亮，可用于态势展示或 CSS 动画练习。
      </span>
    </template>

    <div class="radar-page__body">
      <Card class="radar-toolbar" :bordered="false">
        <div class="radar-toolbar__inner">
          <Space wrap :size="12">
            <Button class="radar-btn" type="primary" @click="radar?.start()">
              开始
            </Button>
            <Button class="radar-btn" @click="radar?.stop()">停止</Button>
            <Button class="radar-btn" @click="radar?.addDot()">添加</Button>
            <Button
              class="radar-btn radar-btn--danger"
              @click="radar?.clearDots()"
            >
              清空
            </Button>
          </Space>

          <div class="radar-theme">
            <span class="radar-theme__label">外观</span>
            <Switch
              v-model:checked="isDarkMode"
              checked-children="深"
              un-checked-children="浅"
            />
          </div>
        </div>
      </Card>

      <div class="radar-stage" aria-label="radar display">
        <div class="radar-stage__glow" aria-hidden="true"></div>
        <div class="radar-stage__ring" aria-hidden="true"></div>
        <div ref="containerRef" class="radar-container"></div>
      </div>
    </div>
  </Page>
</template>

<style scoped>
/* 浅色（默认） */
.radar-page {
  --radar-accent: #18a058;
  --radar-accent-deep: #0d7a43;
  --radar-accent-border: rgb(24 160 88 / 28%);
  --radar-accent-glow: rgb(24 160 88 / 22%);
  --radar-panel: #fff;
  --radar-panel-muted: #f6f8fa;
  --radar-text-muted: rgb(0 0 0 / 45%);
  --radar-text-title: inherit;
  --radar-toolbar-border: rgb(0 0 0 / 6%);
  --radar-toolbar-shadow:
    0 1px 2px rgb(0 0 0 / 4%), 0 8px 24px rgb(24 160 88 / 6%);
  --radar-stage-shadow:
    0 4px 24px rgb(0 0 0 / 6%), 0 0 0 1px rgb(255 255 255 / 80%) inset,
    inset 0 0 48px rgb(24 160 88 / 5%);
  --radar-glow-fill: rgb(24 160 88 / 12%);
  --radar-ring-dash: rgb(24 160 88 / 22%);
  --radar-face-fill: rgb(24 160 88 / 8%);
  --radar-face-inset: rgb(24 160 88 / 6%);
  --radar-crosshair: rgb(24 160 88 / 18%);
  --radar-circle-border: rgb(24 160 88 / 30%);
  --radar-circle-glow: rgb(24 160 88 / 8%);
  --radar-content-bg:
    radial-gradient(
      ellipse 70% 50% at 50% 30%,
      rgb(24 160 88 / 8%),
      transparent 65%
    ),
    linear-gradient(180deg, #fafbfc 0%, #f3f5f7 50%, #eef1f4 100%);
  --radar-btn-danger-color: #cf1322;
  --radar-btn-danger-bg: #fff;
  --radar-btn-danger-border: rgb(207 19 34 / 35%);
  --radar-btn-danger-hover-bg: rgb(207 19 34 / 4%);
}

/* 深色 */
.radar-page--dark {
  --radar-accent: #3dff8a;
  --radar-accent-deep: #b8ffd6;
  --radar-accent-border: rgb(61 255 138 / 40%);
  --radar-accent-glow: rgb(61 255 138 / 35%);
  --radar-panel: #0a1620;
  --radar-panel-muted: #0d1e2a;
  --radar-text-muted: rgb(212 255 228 / 55%);
  --radar-text-title: #d4ffe4;
  --radar-toolbar-border: var(--radar-accent-border);
  --radar-toolbar-shadow:
    0 0 24px rgb(0 0 0 / 35%), inset 0 1px 0 rgb(255 255 255 / 4%);
  --radar-stage-shadow:
    0 0 0 1px rgb(0 0 0 / 40%), 0 0 48px rgb(61 255 138 / 8%),
    inset 0 0 80px rgb(0 0 0 / 45%);
  --radar-glow-fill: rgb(61 255 138 / 10%);
  --radar-ring-dash: rgb(61 255 138 / 18%);
  --radar-face-fill: rgb(61 255 138 / 10%);
  --radar-face-inset: rgb(0 0 0 / 35%);
  --radar-crosshair: rgb(61 255 138 / 12%);
  --radar-circle-border: rgb(61 255 138 / 22%);
  --radar-circle-glow: rgb(61 255 138 / 6%);
  --radar-content-bg:
    radial-gradient(
      ellipse 80% 60% at 50% 40%,
      rgb(61 255 138 / 6%),
      transparent 70%
    ),
    linear-gradient(180deg, #050c12 0%, #061018 45%, #07121c 100%);
  --radar-btn-danger-color: #ff9a9a;
  --radar-btn-danger-bg: transparent;
  --radar-btn-danger-border: rgb(255 120 120 / 40%);
  --radar-btn-danger-hover-bg: rgb(255 100 100 / 8%);
}

.radar-page--dark :deep(.vben-page-header-title),
.radar-page--dark :deep(h1) {
  color: var(--radar-text-title);
}

.radar-page__desc {
  color: var(--radar-text-muted);
}

.radar-page :deep(.radar-page__content) {
  min-height: calc(100vh - 12rem);
  padding: 0;
  background: var(--radar-content-bg);
  transition: background 0.35s ease;
}

.radar-page__body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
  padding: 1.5rem 1rem 2.5rem;
}

.radar-toolbar {
  width: 100%;
  max-width: 48rem;
  background: var(--radar-panel) !important;
  border: 1px solid var(--radar-toolbar-border) !important;
  border-radius: 12px;
  box-shadow: var(--radar-toolbar-shadow);
  transition:
    background 0.35s ease,
    border-color 0.35s ease,
    box-shadow 0.35s ease;
}

.radar-toolbar__inner {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
}

.radar-toolbar :deep(.ant-card-body) {
  padding: 0;
}

.radar-theme {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.radar-theme__label {
  font-size: 0.875rem;
  color: var(--radar-text-muted);
  white-space: nowrap;
}

.radar-btn {
  min-width: 4.5rem;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.radar-toolbar :deep(.radar-btn:not(.ant-btn-primary):not(.radar-btn--danger)) {
  color: var(--radar-accent-deep) !important;
  background: var(--radar-panel-muted) !important;
  border-color: var(--radar-accent-border) !important;
}

.radar-toolbar
  :deep(.radar-btn:not(.ant-btn-primary):not(.radar-btn--danger):hover) {
  color: var(--radar-accent) !important;
  border-color: var(--radar-accent) !important;
  transform: translateY(-1px);
}

.radar-page--dark
  .radar-toolbar
  :deep(.radar-btn:not(.ant-btn-primary):not(.radar-btn--danger)) {
  color: var(--radar-text-title) !important;
  background: rgb(61 255 138 / 8%) !important;
}

.radar-toolbar :deep(.radar-btn.ant-btn-primary) {
  box-shadow: 0 2px 8px var(--radar-accent-glow);
}

.radar-toolbar :deep(.radar-btn.ant-btn-primary:hover) {
  transform: translateY(-1px);
}

.radar-page--dark .radar-toolbar :deep(.radar-btn.ant-btn-primary) {
  color: #041208 !important;
  background: var(--radar-accent) !important;
  border-color: var(--radar-accent) !important;
}

.radar-toolbar :deep(.radar-btn--danger) {
  color: var(--radar-btn-danger-color) !important;
  background: var(--radar-btn-danger-bg) !important;
  border-color: var(--radar-btn-danger-border) !important;
}

.radar-toolbar :deep(.radar-btn--danger:hover) {
  color: var(--radar-btn-danger-color) !important;
  background: var(--radar-btn-danger-hover-bg) !important;
}

.radar-stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: min(100%, 36rem);
  aspect-ratio: 1;
  padding: 1.25rem;
  background: var(--radar-panel);
  border: 1px solid var(--radar-accent-border);
  border-radius: 50%;
  box-shadow: var(--radar-stage-shadow);
  transition:
    background 0.35s ease,
    border-color 0.35s ease,
    box-shadow 0.35s ease;
}

.radar-stage__glow {
  position: absolute;
  inset: 8%;
  pointer-events: none;
  background: radial-gradient(
    circle,
    var(--radar-glow-fill) 0%,
    transparent 65%
  );
  border-radius: 50%;
}

.radar-stage__ring {
  position: absolute;
  inset: 4%;
  display: block;
  pointer-events: none;
  border: 1px dashed var(--radar-ring-dash);
  border-radius: 50%;
}

.radar-container {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
}

.radar-container :deep(.radar) {
  position: relative;
  max-width: 100%;
  background: radial-gradient(
    circle,
    var(--radar-face-fill) 0%,
    transparent 72%
  );
  border-radius: 50%;
  box-shadow: inset 0 0 32px var(--radar-face-inset);
}

.radar-container :deep(.radar)::before,
.radar-container :deep(.radar)::after {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 0;
  pointer-events: none;
  content: '';
  background: var(--radar-crosshair);
  transform: translate(-50%, -50%);
}

.radar-container :deep(.radar)::before {
  width: 1px;
  height: 100%;
}

.radar-container :deep(.radar)::after {
  width: 100%;
  height: 1px;
}

.radar-container :deep(.circle) {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;
  border: 1px solid var(--radar-circle-border);
  border-radius: 50%;
  box-shadow: 0 0 4px var(--radar-circle-glow);
  transform: translate(-50%, -50%);
}

.radar-container :deep(.sweep) {
  position: absolute;
  z-index: 2;
  border-radius: 50%;
}

.radar-container :deep(.dot) {
  position: absolute;
  z-index: 3;
  width: 10px;
  height: 10px;
  background: var(--radar-accent);
  border-radius: 50%;
  box-shadow: 0 0 6px var(--radar-accent);
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.7);
  transition:
    transform 0.3s ease,
    opacity 0.8s ease,
    box-shadow 0.3s ease,
    background 0.35s ease;
}

.radar-container :deep(.dot.active) {
  box-shadow:
    0 0 12px var(--radar-accent),
    0 0 28px var(--radar-accent-glow);
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.5);
}

@media (max-width: 640px) {
  .radar-page__body {
    padding-inline: 0.75rem;
  }

  .radar-toolbar__inner {
    flex-direction: column;
    align-items: stretch;
  }

  .radar-theme {
    justify-content: flex-end;
  }

  .radar-stage {
    width: min(100%, 22rem);
    padding: 0.75rem;
  }

  .radar-container {
    transform: scale(0.7);
    transform-origin: center;
  }
}
</style>
