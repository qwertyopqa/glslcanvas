import { UMiddleware } from './u_middleware';
import { Shader as S } from './shader';
import { Uniform as U } from './shader/uniform';

function glClear(gl: WebGL2RenderingContext) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function resizeCanvasToDisplaySize(
  gl: WebGL2RenderingContext,
  canvas: HTMLCanvasElement
) {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width  = w;
    canvas.height = h;
    gl.viewport(0, 0, canvas.width, canvas.height);
    return true;
  }
  return false;
}

export class GLSL implements U.Localizer, S.AttribLocalizer {
  private initialized: boolean = false;
  readonly program: WebGLProgram;
  readonly shaders: S.ProgramShaders;
  readonly id: string = GLSL.genID(6);

  constructor(
    private canvas: HTMLCanvasElement,
    private gl: WebGL2RenderingContext
  ) {
    this.program = gl.createProgram() as WebGLProgram;
    this.shaders = S.setupNewProgShader(gl);
    this.addFragmentShaderMiddleware(new UMiddleware(canvas));
    canvas.setAttribute('data-glslcv-id', this.id);
  }

  addFragmentShaderMiddleware(middleware:S.Middleware) {
    this.FS.addMiddleware(middleware);
    return this;
  }

  loadShader(type: S.Type, url: string, onSuccess:()=>void) {
    this.shaders[type].setSourceFromUrl(url, () => onSuccess());
    return this;
  }

  setShaderSource(type: S.Type, source: string) {
    this.shaders[type].source = source;
    return this;
  }

  compile() {
    if (this.initialized) return this;
    this.FS.compileAndAttach(this.program);
    this.VS.compileAndAttach(this.program);
    this.gl.linkProgram(this.program);
    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      const err = this.gl.getProgramInfoLog(this.program);
      console.log(`Error linking program: ${err}`);
    }
    this.gl.useProgram(this.program);
    this.VS.linkPosition(this);
    this.runUniformUpdaters();
    this.initialized = true;
    return this;
  }

  runUniformUpdaters() {
    this.FS.runUniformUpdaters(this);
    this.VS.runUniformUpdaters(this);
  }

  getUniformLocation(name: string) {
    return this.gl.getUniformLocation(this.program, name);
  }

  getAttribLocation(name: string): number {
    return this.gl.getAttribLocation(this.program, name);
  }

  clear() {
    this.gl ? glClear(this.gl) : null;
    return this;
  }
  drawFrame() {
    this.compile();
    resizeCanvasToDisplaySize(this.gl, this.canvas);
    this.clear();
    this.runUniformUpdaters();
    this.VS.draw();
    return this;
  }
  private loop() {
    requestAnimationFrame(() => this.loop());
    return this.drawFrame();
  }
  play() {
    console.log('Playing: {id: %s}', this.id);
    return this.loop();
  }
  get FS() { return this.shaders.fragment; }
  get VS() { return this.shaders.vertex; }
}
export namespace GLSL {
  export import Shader = S;
  export import Uniform = U;

  export const boot = () => {};

  export const genID = (size:number) => {
    const MASK = 0x3d
    const LETTERS = 'abcdefghijklmnopqrstuvwxyz'
    const NUMBERS = '1234567890'
    const charset = `${NUMBERS}${LETTERS}${LETTERS.toUpperCase()}`.split('')

    const bytes = new Uint8Array(size)
    crypto.getRandomValues(bytes)

    return bytes.reduce((acc, byte) => `${acc}${charset[byte & MASK]}`, '')
  }

  export const init = (canvas: HTMLCanvasElement) => {
    const gl = canvas.getContext('webgl2') as WebGL2RenderingContext;
    if (!gl)
      throw new Error("Unable to initialize WebGL 2. Your browser may not support it.");
    resizeCanvasToDisplaySize(gl, canvas);
    return new GLSL(canvas, gl);
  }

  export const init2D = (canvas: HTMLCanvasElement) => {
    const app = init(canvas);
    app.VS.setup2DScene();
    return app;
  }
}
