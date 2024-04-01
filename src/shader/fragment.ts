import {Shader, ShaderClassInterface} from './index';

export class Fragment extends Shader implements FragmentShaderInterface {
  constructor(gl: WebGL2RenderingContext) {
    super(gl, gl.FRAGMENT_SHADER);
  }
  someFragMethod() {
    console.log("FRAGMENT METHOD");
  }
}
export type FragmentShaderInterface = ShaderClassInterface & {
  someFragMethod: () => void;
};
