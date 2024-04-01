export namespace Uniform {
    export interface Localizer {
      getUniformLocation(name: string): WebGLUniformLocation | null;
    }
    export type Info = {
      name: string;
      location: WebGLUniformLocation | null;
      type: string;
      length: number;
      value: number[];
    };
    export const gatherFromSource = (code: string, localizer: Localizer): Info[]  => {
      const uniforms:Info[] = [];
      const re = /\buniform\b[\n|\s]*(\w*)[\n|\s]*(\[(\d+)\])?[\n|\s]*(\w+)/g;
      let m: RegExpExecArray | null;
      while((m = re.exec(code))) {
        uniforms.push({
          type: m[1],
          length: m[3] ? Number(m[3]) : 1,
          name: m[4],
          value: [],
          location:localizer.getUniformLocation(m[4])
        });
      };
      return uniforms;
    };

    export const update = (gl: WebGL2RenderingContext , uis: Info[] | Info) => {
      return Array.isArray(uis) ? uis.map((u:Info) => updateSingle(gl, u)) : updateSingle(gl, uis);
    };

    const updateSingle = (gl: WebGL2RenderingContext, u: Info) => {
      const v = u.value as [number, number, number];
      switch(u.type) {
        case 'int':
          gl.uniform1i(u.location, v[0]);
          break;
        case 'vec2':
          gl.uniform2f(u.location, v[0], v[1]);
          break;
        case 'vec3':
          gl.uniform3fv(u.location, new Float32Array(v));
          break;
        case 'float':
          if (u.length === 1) {
            gl.uniform1f(u.location, v[0]);
          } else {
            gl.uniform1fv(u.location, new Float32Array(v));
          }
          break;
        }
    }
}
