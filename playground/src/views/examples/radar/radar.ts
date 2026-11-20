/**
 * 雷达扫描效果：同心圆 + 旋转扫描扇形，扫过目标点时高亮。
 * DOM 由类内部创建，挂载到外部传入的 container；样式依赖容器上的 `.radar` / `.dot` 等 class。
 */

/** 构造参数，均有默认值 */
export type RadarColorScheme = 'dark' | 'light';

export interface RadarOptions {
  /** 扫描扇形配色（与页面浅/深主题联动） */
  colorScheme?: RadarColorScheme;
  /** 初始随机点数量 */
  dotsNums?: number;
  /** 扫描完整转一圈的时长（毫秒） */
  duration?: number;
  /** 同心圆层数 */
  numCircles?: number;
  /** 雷达区域边长（像素） */
  size?: number;
  /** 扫描扇形张角（度） */
  sweepDeg?: number;
}

/** 单个目标点：DOM 节点 + 在极坐标下的方位角（0~360，与扫描旋转一致） */
interface RadarDotRecord {
  angle: number;
  el: HTMLDivElement;
}

export class Radar {
  /** 圆心 X（容器坐标） */
  readonly CX: number;
  /** 圆心 Y（容器坐标） */
  readonly CY: number;

  private aniFrame: null | number = null;
  private colorScheme: RadarColorScheme = 'light';
  private container: HTMLElement;
  /** 当前扫描线角度，stop 后保留，便于 start 时接续旋转 */
  private currentSweep = 0;
  private dots: RadarDotRecord[] = [];
  private dotsNums: number;
  private duration: number;
  private isRunning = false;
  private numCircles: number;
  private radarEl!: HTMLDivElement;
  /** 各层同心圆半径（用于随机落点） */
  private rings: number[] = [];
  private size: number;
  private sweepDeg: number;
  private sweepEl!: HTMLDivElement;

  constructor(container: HTMLElement, options: RadarOptions = {}) {
    this.container = container;
    this.colorScheme = options.colorScheme ?? 'light';
    this.size = options.size ?? 400;
    this.numCircles = options.numCircles ?? 4;
    this.sweepDeg = options.sweepDeg ?? 20;
    this.duration = options.duration ?? 4000;
    this.dotsNums = options.dotsNums ?? 4;

    this.CX = this.size / 2;
    this.CY = this.size / 2;

    this.initRadar();
    this.start();
  }

  /** 在随机一环上落点，并记录方位角供扫描命中判断 */
  addDot() {
    const ring =
      this.rings[Math.floor(Math.random() * this.rings.length)] ??
      this.rings[0];
    if (ring === undefined) return;

    const r = ring;
    const angle = Math.random() * 360;
    // CSS rotate 0° 指向 12 点钟；数学极角以 3 点钟为 0°，故减 90° 对齐
    const x = this.CX + r * Math.cos(((angle - 90) * Math.PI) / 180);
    const y = this.CY + r * Math.sin(((angle - 90) * Math.PI) / 180);

    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
    this.radarEl.append(dot);
    this.dots.push({ el: dot, angle });
  }

  /** 移除所有目标点（不销毁雷达本身） */
  clearDots() {
    this.dots.forEach((dot) => dot.el.remove());
    this.dots = [];
  }

  /** 停止动画并清空挂载容器，组件卸载时调用 */
  destroy() {
    this.stop();
    this.container.replaceChildren();
  }

  /** 切换扫描扇形渐变，与页面浅/深主题保持一致 */
  setColorScheme(scheme: RadarColorScheme) {
    this.colorScheme = scheme;
    this.applySweepGradient();
  }

  /** 启动扫描动画；重复调用无效 */
  start() {
    if (this.isRunning) return this;
    this.isRunning = true;

    // 按已保存角度反推起始时间，避免 stop 后再 start 从 0° 跳变
    const startTime =
      performance.now() - (this.currentSweep / 360) * this.duration;

    const tick = (now: number) => {
      const elapsed = (now - startTime) % this.duration;
      const sweepAngle = (elapsed / this.duration) * 360;
      this.currentSweep = sweepAngle;

      this.sweepEl.style.transform = `rotate(${sweepAngle}deg)`;

      this.dots.forEach((dot) => {
        dot.el.classList.toggle('active', this.isCover(sweepAngle, dot.angle));
      });

      if (this.isRunning) {
        this.aniFrame = requestAnimationFrame(tick);
      }
    };

    this.aniFrame = requestAnimationFrame(tick);
    return this;
  }

  /** 暂停扫描，保留 currentSweep */
  stop() {
    this.isRunning = false;
    if (this.aniFrame !== null) {
      cancelAnimationFrame(this.aniFrame);
      this.aniFrame = null;
    }
  }

  private applySweepGradient() {
    const { sweepDeg } = this;
    const background =
      this.colorScheme === 'dark'
        ? `conic-gradient(
      rgb(61 255 138 / 30%) 0deg,
      rgb(61 255 138 / 15%) ${sweepDeg / 2}deg,
      rgb(61 255 138 / 0%) ${sweepDeg}deg
    )`
        : `conic-gradient(
      rgb(24 160 88 / 28%) 0deg,
      rgb(24 160 88 / 12%) ${sweepDeg / 2}deg,
      rgb(24 160 88 / 0%) ${sweepDeg}deg
    )`;
    if (this.sweepEl) {
      this.sweepEl.style.background = background;
    }
  }

  /** 创建雷达根节点、同心圆、扇形渐变层与初始点 */
  private initRadar() {
    this.radarEl = document.createElement('div');
    this.radarEl.className = 'radar';
    this.radarEl.style.width = `${this.size}px`;
    this.radarEl.style.height = `${this.size}px`;
    this.container.append(this.radarEl);

    const step = this.size / (2 * this.numCircles);
    this.rings = [];
    for (let i = 1; i <= this.numCircles; i++) {
      const circle = document.createElement('div');
      circle.className = 'circle';
      const w = step * i * 2;
      circle.style.width = `${w}px`;
      circle.style.height = `${w}px`;
      this.radarEl.append(circle);
      this.rings.push(step * i);
    }

    this.sweepEl = document.createElement('div');
    this.sweepEl.className = 'sweep';
    this.sweepEl.style.width = `${this.size}px`;
    this.sweepEl.style.height = `${this.size}px`;
    this.applySweepGradient();
    this.radarEl.append(this.sweepEl);

    for (let i = 0; i < this.dotsNums; i++) {
      this.addDot();
    }
  }

  /**
   * 判断目标方位角是否落在当前扫描扇形内。
   * 扇形跨越 0° 时需拆成 [start, 360) ∪ [0, end] 两段判断。
   */
  private isCover(sweepAngle: number, dotAngle: number) {
    const start = sweepAngle % 360;
    const end = (start + this.sweepDeg) % 360;
    if (start < end) {
      return dotAngle >= start && dotAngle <= end;
    }
    return dotAngle >= start || dotAngle <= end;
  }
}
