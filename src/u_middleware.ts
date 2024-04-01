import { Shader } from './shader';
import { Uniform } from './shader/uniform';

type TimeInfo = {
  start: number;
  elapsed: number;
  frame: number;
};

export class UMiddleware implements Shader.Middleware {
  time:TimeInfo;
  constructor(private canvas:HTMLCanvasElement) {
    this.resetTime();
  }
  resetTime() {
    this.time = {
      start: performance.now(),
      elapsed: 0,
      frame: 0,
    };
  }
  updateUniforms(uniforms:Uniform.Info[]) {
    this.time.elapsed = performance.now() - this.time.start;
    uniforms.map((uniform:Uniform.Info) => {
      switch(uniform.name) {
        case 'u_resolution':
          uniform.value = [this.canvas.clientWidth, this.canvas.clientHeight];
          break;
        case 'u_time':
          uniform.value = [this.time.elapsed * 0.001];
          break;
      }
    });
  }
}
