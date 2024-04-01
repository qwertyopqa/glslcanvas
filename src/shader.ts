import {Middleware as MW, AttribLocalizer as AL} from './shader/index';
import {Vertex, VertexShaderInterface} from './shader/vertex';
import {Fragment, FragmentShaderInterface} from './shader/fragment';

export namespace Shader {
  export type Type = 'vertex' | 'fragment';
  const types: Type[] = ['vertex', 'fragment'];

  export type Middleware = MW;
  export type AttribLocalizer = AL;
  export type ProgramShaders = {
    fragment: FragmentShaderInterface;
    vertex: VertexShaderInterface;
  };
  export const setupNewProgShader = (gl: WebGL2RenderingContext) => {
    const shaders: ProgramShaders = {
      fragment: new Fragment(gl),
      vertex: new Vertex(gl)
    };
    return shaders;
  };
}
