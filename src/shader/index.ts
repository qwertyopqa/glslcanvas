import { Uniform } from './uniform';

export const getURL = (url: string, cb: Function) => {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.onload = () => xhr.status === 200 ? cb(xhr.responseText) : null;
  xhr.send();
}

type MW_UpdateUniforms = (info: any) => void;
type MW_CodeProcessors = (source: string) => string;
export type Middleware = {
  preprocessCode?: MW_CodeProcessors;
  updateUniforms?: MW_UpdateUniforms;
  onLoaded?: () => void;
}

export interface AttribLocalizer {
  getAttribLocation(name:string):number;
}

export class Shader implements ShaderClassInterface {
  public readonly shader: WebGLShader;
  protected _version: 1|2 = 1;
  protected compiled: boolean = false;
  protected _source: string = '';
  protected middlewares: Middleware[] = [];
  protected uniforms: Uniform.Info[] | null;

  constructor(protected gl: WebGL2RenderingContext, protected _type: number) {
    this.shader = gl.createShader(_type) as WebGLShader;
  }

  public get type() {
    return this._type == this.gl.VERTEX_SHADER ? 'vertex' : 'fragment'
  }

  public set source(source: string) {
      this._source = this.processSource(source);
      this.gl.shaderSource(this.shader, this._source);
      this.compiled = false;
  }
  public get source() {
    return `${this._source}`;
  }

  public compile() {
      if (this.compiled) return;
      this.gl.compileShader(this.shader);
      if (!this.gl.getShaderParameter(this.shader, this.gl.COMPILE_STATUS)) {
        console.error(this.gl.getShaderInfoLog(this.shader));
        return false;
      }
      this.compiled = true;
  }

  public attach(program: WebGLProgram) {
    this.gl.attachShader(program, this.shader);
  }

  public compileAndAttach(program: WebGLProgram) {
    this.compile();
    this.attach(program);
  }

  public setSourceFromUrl(url: string, onLoaded: (code: string) => void) {
      getURL(url, (source: string) => {
        this.source = source;
        onLoaded(source);
      });
  }

  addMiddleware(middleware: Middleware) {
    this.middlewares.push(middleware);
  }

  protected processSource(code: string): string {
    this._version = code.indexOf('#version 300 es') >= 0 ? 2 : 1;
    this.middlewares.map((middleware:Middleware) => {
      if (middleware.preprocessCode) {
        const tmp = middleware.preprocessCode(code);
        if (tmp) code = tmp;
      }
    });
    return code;
  }

  runUniformUpdaters(localizer: Uniform.Localizer) {
    if (!this.uniforms)
      this.uniforms = Uniform.gatherFromSource(this.source, localizer);
    this.middlewares.map((middleware: Middleware) => {
      if (middleware.updateUniforms)
        middleware.updateUniforms(this.uniforms);
    });
    Uniform.update(this.gl, this.uniforms);
  }
}

export interface ShaderClassInterface {
  source: string;
  compileAndAttach(program: WebGLProgram): void;
  setSourceFromUrl(url: string, onLoaded:(code: string) => void): void;
  addMiddleware(middleware: Middleware): void;
  runUniformUpdaters(localizer: Uniform.Localizer): void;
}

