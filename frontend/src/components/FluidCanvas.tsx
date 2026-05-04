import { useEffect, useRef } from "react";

// ─── Config ──────────────────────────────────────────────────────────────────
const SIM_RESOLUTION      = 128;
const DYE_RESOLUTION      = 1440;
const DENSITY_DISSIPATION = 0.5;
const VELOCITY_DISSIPATION = 3;
const PRESSURE            = 0.1;
const PRESSURE_ITERATIONS = 20;
const CURL                = 3;
const SPLAT_RADIUS        = 0.2;
const SPLAT_FORCE         = 6000;

// ─── Shaders ─────────────────────────────────────────────────────────────────
const VS = `
precision highp float;
attribute vec2 aPosition;
varying vec2 vUv;
varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
uniform vec2 texelSize;
void main(){
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FS_DISPLAY = `
precision highp float; precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uTexture;
void main(){
  vec3 c = texture2D(uTexture, vUv).rgb;
  gl_FragColor = vec4(c, max(c.r, max(c.g, c.b)));
}`;

const FS_CLEAR = `
precision mediump float; precision mediump sampler2D;
varying vec2 vUv;
uniform sampler2D uTexture; uniform float value;
void main(){ gl_FragColor = value * texture2D(uTexture, vUv); }`;

const FS_SPLAT = `
precision highp float; precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uTarget; uniform float aspectRatio;
uniform vec3 color; uniform vec2 point; uniform float radius;
void main(){
  vec2 p = vUv - point;
  p.x *= aspectRatio;
  float str = exp(-dot(p,p)/radius);
  gl_FragColor = vec4(texture2D(uTarget, vUv).rgb + str * color, 1.0);
}`;

const FS_ADVECTION = `
precision highp float; precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uVelocity; uniform sampler2D uSource;
uniform vec2 texelSize; uniform vec2 dyeTexelSize;
uniform float dt; uniform float dissipation;
vec4 bilerp(sampler2D s, vec2 uv, vec2 ts){
  vec2 st = uv/ts - 0.5;
  vec2 f = fract(st); vec2 i = floor(st);
  vec4 a = texture2D(s,(i+vec2(0.5))*ts);
  vec4 b = texture2D(s,(i+vec2(1.5,0.5))*ts);
  vec4 c = texture2D(s,(i+vec2(0.5,1.5))*ts);
  vec4 d = texture2D(s,(i+vec2(1.5))*ts);
  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
}
void main(){
  vec2 coord = vUv - dt * bilerp(uVelocity,vUv,texelSize).xy * texelSize;
  gl_FragColor = bilerp(uSource,coord,dyeTexelSize) / (1.0 + dissipation*dt);
}`;

const FS_DIVERGENCE = `
precision mediump float; precision mediump sampler2D;
varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
uniform sampler2D uVelocity;
void main(){
  float L=texture2D(uVelocity,vL).x, R=texture2D(uVelocity,vR).x;
  float T=texture2D(uVelocity,vT).y, B=texture2D(uVelocity,vB).y;
  vec2 C=texture2D(uVelocity,vUv).xy;
  if(vL.x<0.0)L=-C.x; if(vR.x>1.0)R=-C.x;
  if(vT.y>1.0)T=-C.y; if(vB.y<0.0)B=-C.y;
  gl_FragColor=vec4(0.5*(R-L+T-B),0.0,0.0,1.0);
}`;

const FS_CURL = `
precision mediump float; precision mediump sampler2D;
varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
uniform sampler2D uVelocity;
void main(){
  float L=texture2D(uVelocity,vL).y, R=texture2D(uVelocity,vR).y;
  float T=texture2D(uVelocity,vT).x, B=texture2D(uVelocity,vB).x;
  gl_FragColor=vec4(0.5*(R-L-T+B),0.0,0.0,1.0);
}`;

const FS_VORTICITY = `
precision highp float; precision highp sampler2D;
varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
uniform sampler2D uVelocity; uniform sampler2D uCurl;
uniform float curl; uniform float dt;
void main(){
  float L=texture2D(uCurl,vL).x, R=texture2D(uCurl,vR).x;
  float T=texture2D(uCurl,vT).x, B=texture2D(uCurl,vB).x;
  float C=texture2D(uCurl,vUv).x;
  vec2 force=0.5*vec2(abs(T)-abs(B),abs(R)-abs(L));
  force/=length(force)+0.0001;
  force*=curl*C; force.y*=-1.0;
  gl_FragColor=vec4(texture2D(uVelocity,vUv).xy+force*dt,0.0,1.0);
}`;

const FS_PRESSURE = `
precision mediump float; precision mediump sampler2D;
varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
uniform sampler2D uPressure; uniform sampler2D uDivergence;
void main(){
  float L=texture2D(uPressure,vL).x, R=texture2D(uPressure,vR).x;
  float T=texture2D(uPressure,vT).x, B=texture2D(uPressure,vB).x;
  float C=texture2D(uDivergence,vUv).x;
  gl_FragColor=vec4((L+R+B+T-C)*0.25,0.0,0.0,1.0);
}`;

const FS_GRADIENT = `
precision mediump float; precision mediump sampler2D;
varying vec2 vUv; varying vec2 vL; varying vec2 vR; varying vec2 vT; varying vec2 vB;
uniform sampler2D uPressure; uniform sampler2D uVelocity;
void main(){
  float L=texture2D(uPressure,vL).x, R=texture2D(uPressure,vR).x;
  float T=texture2D(uPressure,vT).x, B=texture2D(uPressure,vB).x;
  vec2 vel=texture2D(uVelocity,vUv).xy;
  gl_FragColor=vec4(vel-vec2(R-L,T-B),0.0,1.0);
}`;

// ─── Types ───────────────────────────────────────────────────────────────────
interface FBO {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number; height: number;
  texelSizeX: number; texelSizeY: number;
  attach(id: number): number;
}
interface DFBO {
  width: number; height: number;
  texelSizeX: number; texelSizeY: number;
  read: FBO; write: FBO;
  swap(): void;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function FluidCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const _c = ref.current;
    if (!_c) return;
    const canvas: HTMLCanvasElement = _c;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();

    // WebGL context (prefer WebGL2)
    const ctxOpts = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
    let gl: WebGLRenderingContext | WebGL2RenderingContext;
    let isGL2 = false;
    {
      const g2 = canvas.getContext("webgl2", ctxOpts) as WebGL2RenderingContext | null;
      if (g2) { gl = g2; isGL2 = true; }
      else {
        const g1 = (canvas.getContext("webgl", ctxOpts) ?? canvas.getContext("experimental-webgl", ctxOpts)) as WebGLRenderingContext | null;
        if (!g1) return;
        gl = g1;
      }
    }

    // Extensions & half-float type
    let hfType: number;
    let linearF: number;
    if (isGL2) {
      const g = gl as WebGL2RenderingContext;
      g.getExtension("EXT_color_buffer_float");
      hfType = g.HALF_FLOAT;
      linearF = g.getExtension("OES_texture_float_linear") ? g.LINEAR : g.NEAREST;
    } else {
      const g = gl as WebGLRenderingContext;
      const hf = g.getExtension("OES_texture_half_float");
      if (!hf) return;
      hfType = hf.HALF_FLOAT_OES;
      linearF = g.getExtension("OES_texture_half_float_linear") ? g.LINEAR : g.NEAREST;
    }

    // Texture formats
    const fRGBA = isGL2 ? { i: (gl as WebGL2RenderingContext).RGBA16F, f: gl.RGBA } : { i: gl.RGBA, f: gl.RGBA };
    const fRG   = isGL2 ? { i: (gl as WebGL2RenderingContext).RG16F,   f: (gl as WebGL2RenderingContext).RG }  : { i: gl.RGBA, f: gl.RGBA };
    const fR    = isGL2 ? { i: (gl as WebGL2RenderingContext).R16F,    f: (gl as WebGL2RenderingContext).RED } : { i: gl.RGBA, f: gl.RGBA };

    gl.clearColor(0, 0, 0, 0);

    // Shader compilation
    const cmp = (t: number, src: string) => { const s = gl.createShader(t)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };

    type P = { prog: WebGLProgram; u: Record<string, WebGLUniformLocation> };
    function mkP(fs: string): P {
      const p = gl.createProgram()!;
      gl.attachShader(p, cmp(gl.VERTEX_SHADER, VS));
      gl.attachShader(p, cmp(gl.FRAGMENT_SHADER, fs));
      gl.bindAttribLocation(p, 0, "aPosition");
      gl.linkProgram(p);
      gl.useProgram(p);
      const u: Record<string, WebGLUniformLocation> = {};
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS) as number;
      for (let i = 0; i < n; i++) {
        const info = gl.getActiveUniform(p, i)!;
        const loc = gl.getUniformLocation(p, info.name);
        if (loc) u[info.name] = loc;
      }
      return { prog: p, u };
    }

    // Full-screen quad
    {
      const vb = gl.createBuffer()!; const ib = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, vb);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,-1,1,1,1,1,-1]), gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2,0,2,3]), gl.STATIC_DRAW);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(0);
    }

    const blit = (t: FBO | null) => {
      if (t) { gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo); gl.viewport(0, 0, t.width, t.height); }
      else   { gl.bindFramebuffer(gl.FRAMEBUFFER, null);  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight); }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    };

    // FBO helpers
    function mkFBO(w: number, h: number, iF: number, f: number, type: number, filter: number): FBO {
      gl.activeTexture(gl.TEXTURE0);
      const tex = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, iF, w, h, 0, f, type, null);
      const fbo = gl.createFramebuffer()!;
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      gl.viewport(0, 0, w, h); gl.clear(gl.COLOR_BUFFER_BIT);
      return {
        texture: tex, fbo, width: w, height: h,
        texelSizeX: 1/w, texelSizeY: 1/h,
        attach(id) { gl.activeTexture(gl.TEXTURE0+id); gl.bindTexture(gl.TEXTURE_2D, tex); return id; }
      };
    }
    function mkDFBO(w: number, h: number, iF: number, f: number, type: number, filter: number): DFBO {
      let r = mkFBO(w,h,iF,f,type,filter), w2 = mkFBO(w,h,iF,f,type,filter);
      return {
        get width(){ return r.width; }, get height(){ return r.height; },
        get texelSizeX(){ return r.texelSizeX; }, get texelSizeY(){ return r.texelSizeY; },
        get read(){ return r; }, get write(){ return w2; },
        swap(){ [r,w2]=[w2,r]; }
      };
    }
    const getRes = (res: number) => {
      const ar = gl.drawingBufferWidth / gl.drawingBufferHeight;
      return ar > 1 ? { w: Math.round(res*ar), h: Math.round(res) } : { w: Math.round(res), h: Math.round(res/ar) };
    };

    // Compile all programs
    const pClear   = mkP(FS_CLEAR);
    const pDisplay = mkP(FS_DISPLAY);
    const pSplat   = mkP(FS_SPLAT);
    const pAdv     = mkP(FS_ADVECTION);
    const pDiv     = mkP(FS_DIVERGENCE);
    const pCurl    = mkP(FS_CURL);
    const pVort    = mkP(FS_VORTICITY);
    const pPres    = mkP(FS_PRESSURE);
    const pGrad    = mkP(FS_GRADIENT);

    // FBO state
    let vel: DFBO, dye: DFBO, divFBO: FBO, curlFBO: FBO, prsFBO: DFBO;
    let ready = false;

    function initFBOs() {
      const s = getRes(SIM_RESOLUTION), d = getRes(DYE_RESOLUTION);
      vel    = mkDFBO(s.w, s.h, fRG.i,   fRG.f,   hfType, linearF);
      dye    = mkDFBO(d.w, d.h, fRGBA.i, fRGBA.f, hfType, linearF);
      divFBO = mkFBO (s.w, s.h, fR.i,    fR.f,    hfType, gl.NEAREST);
      curlFBO= mkFBO (s.w, s.h, fR.i,    fR.f,    hfType, gl.NEAREST);
      prsFBO = mkDFBO(s.w, s.h, fR.i,    fR.f,    hfType, gl.NEAREST);
      ready  = true;
    }

    // Color helpers
    function hsv2rgb(h: number) {
      const i = Math.floor(h*6), f = h*6-i, p = 0, q = 1-(f), t = f;
      const v = 1;
      const rows = [[v,t,p],[q,v,p],[p,v,t],[p,q,v],[t,p,v],[v,p,q]];
      const [r,g,b] = rows[i%6];
      return { r: r*0.15, g: g*0.15, b: b*0.15 };
    }
    const newColor = () => hsv2rgb(Math.random());

    // Splat
    function splat(x: number, y: number, dx: number, dy: number, col: {r:number;g:number;b:number}) {
      if (!ready) return;
      const { prog, u } = pSplat;
      gl.useProgram(prog);
      gl.uniform1f(u.aspectRatio, canvas.width/canvas.height);
      gl.uniform2f(u.point, x, y);
      gl.uniform1f(u.radius, SPLAT_RADIUS/100);
      gl.uniform1i(u.uTarget, vel.read.attach(0));
      gl.uniform3f(u.color, dx, dy, 0);
      blit(vel.write); vel.swap();
      gl.uniform1i(u.uTarget, dye.read.attach(0));
      gl.uniform3f(u.color, col.r, col.g, col.b);
      blit(dye.write); dye.swap();
    }

    // Simulation step
    function step(dt: number) {
      gl.disable(gl.BLEND);

      // Curl
      gl.useProgram(pCurl.prog);
      gl.uniform2f(pCurl.u.texelSize, vel.texelSizeX, vel.texelSizeY);
      gl.uniform1i(pCurl.u.uVelocity, vel.read.attach(0));
      blit(curlFBO);

      // Vorticity confinement
      gl.useProgram(pVort.prog);
      gl.uniform2f(pVort.u.texelSize, vel.texelSizeX, vel.texelSizeY);
      gl.uniform1i(pVort.u.uVelocity, vel.read.attach(0));
      gl.uniform1i(pVort.u.uCurl,     curlFBO.attach(1));
      gl.uniform1f(pVort.u.curl, CURL);
      gl.uniform1f(pVort.u.dt,   dt);
      blit(vel.write); vel.swap();

      // Divergence
      gl.useProgram(pDiv.prog);
      gl.uniform2f(pDiv.u.texelSize, vel.texelSizeX, vel.texelSizeY);
      gl.uniform1i(pDiv.u.uVelocity, vel.read.attach(0));
      blit(divFBO);

      // Clear pressure (with damping)
      gl.useProgram(pClear.prog);
      gl.uniform1i(pClear.u.uTexture, prsFBO.read.attach(0));
      gl.uniform1f(pClear.u.value, PRESSURE);
      blit(prsFBO.write); prsFBO.swap();

      // Pressure solve (Jacobi iterations)
      gl.useProgram(pPres.prog);
      gl.uniform2f(pPres.u.texelSize, vel.texelSizeX, vel.texelSizeY);
      gl.uniform1i(pPres.u.uDivergence, divFBO.attach(0));
      for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
        gl.uniform1i(pPres.u.uPressure, prsFBO.read.attach(1));
        blit(prsFBO.write); prsFBO.swap();
      }

      // Gradient subtract → divergence-free velocity
      gl.useProgram(pGrad.prog);
      gl.uniform2f(pGrad.u.texelSize, vel.texelSizeX, vel.texelSizeY);
      gl.uniform1i(pGrad.u.uPressure, prsFBO.read.attach(0));
      gl.uniform1i(pGrad.u.uVelocity, vel.read.attach(1));
      blit(vel.write); vel.swap();

      // Advect velocity
      gl.useProgram(pAdv.prog);
      gl.uniform2f(pAdv.u.texelSize,    vel.texelSizeX, vel.texelSizeY);
      gl.uniform2f(pAdv.u.dyeTexelSize, vel.texelSizeX, vel.texelSizeY);
      gl.uniform1i(pAdv.u.uVelocity, vel.read.attach(0));
      gl.uniform1i(pAdv.u.uSource,   vel.read.attach(0));
      gl.uniform1f(pAdv.u.dt,           dt);
      gl.uniform1f(pAdv.u.dissipation,  VELOCITY_DISSIPATION);
      blit(vel.write); vel.swap();

      // Advect dye
      gl.uniform2f(pAdv.u.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
      gl.uniform1i(pAdv.u.uVelocity, vel.read.attach(0));
      gl.uniform1i(pAdv.u.uSource,   dye.read.attach(1));
      gl.uniform1f(pAdv.u.dissipation, DENSITY_DISSIPATION);
      blit(dye.write); dye.swap();
    }

    // Render dye to screen
    function render() {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.BLEND);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (!ready) return;
      gl.useProgram(pDisplay.prog);
      gl.uniform1i(pDisplay.u.uTexture, dye.read.attach(0));
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }

    // RAF loop
    let rafId: number;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.016667);
      last = now;
      if (ready) step(dt);
      render();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    // Mouse events (listen on window so pointerEvents:none on canvas doesn't block)
    let mx = 0, my = 0;

    const onMove = (e: MouseEvent) => {
      if (!ready) initFBOs();
      const nx = e.clientX / canvas.width;
      const ny = 1 - e.clientY / canvas.height;
      const dx = (e.clientX - mx) / canvas.width  * SPLAT_FORCE;
      const dy = -(e.clientY - my) / canvas.height * SPLAT_FORCE;
      mx = e.clientX; my = e.clientY;
      splat(nx, ny, dx, dy, newColor());
    };

    const onDown = () => {
      if (!ready) initFBOs();
      splat(Math.random(), Math.random(),
        (Math.random() - 0.5) * SPLAT_FORCE * 2,
        (Math.random() - 0.5) * SPLAT_FORCE * 2,
        newColor());
    };

    // Touch events
    const tp = new Map<number, { x: number; y: number }>();

    const onTStart = (e: TouchEvent) => {
      if (!ready) initFBOs();
      for (const t of Array.from(e.changedTouches)) {
        tp.set(t.identifier, { x: t.clientX, y: t.clientY });
        splat(t.clientX/canvas.width, 1-t.clientY/canvas.height, 300, 300, newColor());
      }
    };
    const onTMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!ready) initFBOs();
      for (const t of Array.from(e.changedTouches)) {
        const p = tp.get(t.identifier);
        if (p) {
          splat(
            t.clientX/canvas.width, 1-t.clientY/canvas.height,
            (t.clientX-p.x)/canvas.width  * SPLAT_FORCE,
            -(t.clientY-p.y)/canvas.height * SPLAT_FORCE,
            newColor()
          );
          tp.set(t.identifier, { x: t.clientX, y: t.clientY });
        }
      }
    };
    const onTEnd = (e: TouchEvent) => { for (const t of Array.from(e.changedTouches)) tp.delete(t.identifier); };

    window.addEventListener("resize",     resize);
    window.addEventListener("mousemove",  onMove);
    window.addEventListener("mousedown",  onDown);
    window.addEventListener("touchstart", onTStart);
    window.addEventListener("touchmove",  onTMove, { passive: false });
    window.addEventListener("touchend",   onTEnd);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize",     resize);
      window.removeEventListener("mousemove",  onMove);
      window.removeEventListener("mousedown",  onDown);
      window.removeEventListener("touchstart", onTStart);
      window.removeEventListener("touchmove",  onTMove);
      window.removeEventListener("touchend",   onTEnd);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: "fixed",
        top: 0, left: 0,
        width: "100%", height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
