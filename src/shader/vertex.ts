import {Shader, AttribLocalizer, ShaderClassInterface} from './index';

type VertexObjectInfo = {
  vertices: Float32Array;
  array: WebGLVertexArrayObject;
  buffer: WebGLBuffer;
};

export const SOURCE_2D = `#version 300 es
precision highp float;in vec4 position;void main(void){gl_Position = position;}`;
export const VERTICES_2D = [-1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1];

export class Vertex extends Shader implements VertexShaderInterface {

  private _info: VertexObjectInfo|null;

  constructor(gl: WebGL2RenderingContext) {
    super(gl, gl.VERTEX_SHADER);
  }

  setup2DScene() {
    this.source = SOURCE_2D;
    this.vertices = VERTICES_2D;
  }

  set vertices (vs: number[]) {
    const gl = this.gl;
    const vo = {
      vertices: new Float32Array(vs),
      array: gl.createVertexArray() as WebGLVertexArrayObject,
      buffer: gl.createBuffer() as WebGLBuffer
    };
    this._info = vo;
    gl.bindVertexArray(vo.array);
    gl.bindBuffer(gl.ARRAY_BUFFER, vo.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vo.vertices, gl.STATIC_DRAW);
    console.log("SETTING UP VERTICES");
  }

  linkPosition(localizer: AttribLocalizer) {
    const pal = localizer.getAttribLocation('position');
    const gl = this.gl;
    gl.enableVertexAttribArray(pal);
    gl.vertexAttribPointer(pal, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    console.log("SETTING UP 2D VERTEX SHADER");
  }

  draw() {
    if (!this._info) return;
    this.gl.bindVertexArray(this._info.array);
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    this.gl.bindVertexArray(null);
  }
}

export type VertexShaderInterface =
  ShaderClassInterface
  & {
    vertices: number[];
    setup2DScene: () => void;
    draw: () => void;
    linkPosition: (localizer: AttribLocalizer) => void;
  };
