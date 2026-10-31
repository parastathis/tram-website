/**
 * Ported from 21st.dev "Morph Gallery" by kedhareswer
 * https://21st.dev/@kedhareswer/components/morph-gallery
 * Kept: the raw WebGL dissolve (fbm noise threshold biased by the incoming frame's luminance,
 * both frames drifting against each other), cover-fit UVs with mirrored edges, autoplay, swipe,
 * keyboard, cross-fade fallback. Changed: square-cornered arrows and thumbnails in the brand ink,
 * thumbnails hidden (the chapter title names the slide instead).
 */
import * as React from 'react'

export type MorphItem = { src: string; thumb?: string; alt?: string }
export type MorphGalleryProps = { items: MorphItem[]; height?: string; duration?: number; noiseScale?: number; edge?: number; drift?: number; loop?: boolean; autoplay?: number; arrows?: boolean; index?: number; defaultIndex?: number; onIndexChange?: (index: number) => void; className?: string }

const wrapIndex = (i: number, n: number, loop: boolean) => (n <= 0 ? 0 : loop ? ((i % n) + n) % n : Math.min(Math.max(i, 0), n - 1))
const easeInOutQuint = (t: number) => { const x = Math.min(Math.max(t, 0), 1); return x < 0.5 ? 16 * x ** 5 : 1 - (-2 * x + 2) ** 5 / 2 }

const VERT = `attribute vec2 a_position;varying vec2 v_uv;void main(){v_uv=a_position*0.5+0.5;gl_Position=vec4(a_position,0.0,1.0);}`
const FRAG = `precision highp float;uniform sampler2D u_from;uniform sampler2D u_to;uniform float u_progress;uniform vec2 u_resolution;uniform float u_fromAspect;uniform float u_toAspect;uniform float u_scale;uniform float u_direction;uniform float u_edge;uniform float u_drift;varying vec2 v_uv;
vec3 permute(vec3 x){return mod(((x*34.0)+1.0)*x,289.0);}
float snoise(vec2 v){const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod(i,289.0);vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);m=m*m;m=m*m;vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.0*dot(m,g);}
float fbm(vec2 v){float value=0.0;float amplitude=0.5;for(int i=0;i<5;i++){value+=amplitude*snoise(v);v*=2.0;amplitude*=0.5;}return value;}
vec2 mirror(vec2 uv){return 1.0-abs(1.0-mod(uv,2.0));}
vec2 coverUV(vec2 uv,float imgAspect){float canvasAspect=u_resolution.x/u_resolution.y;vec2 scale=(canvasAspect>imgAspect)?vec2(1.0,imgAspect/canvasAspect):vec2(canvasAspect/imgAspect,1.0);return mirror((uv-0.5)*scale+0.5);}
void main(){float adjusted=u_progress*(1.0+2.0*u_edge)-u_edge;float noise=fbm(v_uv*u_scale+vec2(0.0,u_progress*u_direction))*0.5+0.5;noise=smoothstep(0.0,2.0,length(texture2D(u_to,coverUV(v_uv,u_toAspect)).rgb)+noise);float mixFactor=1.0-smoothstep(adjusted-u_edge,adjusted+u_edge,noise);vec2 fromUV=coverUV(v_uv+vec2(0.0,noise*u_progress*u_drift*u_direction),u_fromAspect);vec2 toUV=coverUV(v_uv+vec2(0.0,noise*(1.0-u_progress)*-0.5*u_drift*u_direction),u_toAspect);gl_FragColor=mix(texture2D(u_from,fromUV),texture2D(u_to,toUV),mixFactor);}`

const compile = (gl: WebGLRenderingContext, type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { const l = gl.getShaderInfoLog(s); gl.deleteShader(s); throw new Error('shader: ' + l) } return s }
const link = (gl: WebGLRenderingContext) => { const v = compile(gl, gl.VERTEX_SHADER, VERT), f = compile(gl, gl.FRAGMENT_SHADER, FRAG); const p = gl.createProgram()!; gl.attachShader(p, v); gl.attachShader(p, f); gl.linkProgram(p); gl.deleteShader(v); gl.deleteShader(f); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { const l = gl.getProgramInfoLog(p); gl.deleteProgram(p); throw new Error('link: ' + l) } return p }
const loadImage = (src: string) => new Promise<HTMLImageElement>((res, rej) => { const img = new Image(); img.crossOrigin = 'anonymous'; img.decoding = 'async'; img.onload = () => res(img); img.onerror = () => rej(new Error('load ' + src)); img.src = src })

export default function MorphGallery({ items, height = '100svh', duration = 1500, noiseScale = 3.5, edge = 0.15, drift = 0.5, loop = true, autoplay = 0, arrows = true, index, defaultIndex = 0, onIndexChange, className = '' }: MorphGalleryProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const [uncontrolled, setUncontrolled] = React.useState(() => wrapIndex(defaultIndex, items.length, loop))
  const active = index === undefined ? uncontrolled : wrapIndex(index, items.length, loop)
  const [failed, setFailed] = React.useState(false)
  const [ready, setReady] = React.useState(false)
  const [generation, setGeneration] = React.useState(0)
  const [reduced, setReduced] = React.useState(false)
  const [paused, setPaused] = React.useState(false)
  React.useEffect(() => { const mq = window.matchMedia('(prefers-reduced-motion: reduce)'); const s = () => setReduced(mq.matches); s(); mq.addEventListener('change', s); return () => mq.removeEventListener('change', s) }, [])
  const go = React.useCallback((n: number) => { const w = wrapIndex(n, items.length, loop); if (index === undefined) setUncontrolled(w); onIndexChange?.(w) }, [index, items.length, loop, onIndexChange])
  const tuning = React.useRef({ duration, noiseScale, edge, drift, reduced }); tuning.current = { duration, noiseScale, edge, drift, reduced }
  const request = React.useRef<{ from: number; to: number } | null>(null)
  const previous = React.useRef(active)
  React.useEffect(() => { if (previous.current === active) return; request.current = { from: previous.current, to: active }; previous.current = active }, [active])
  const sources = items.map((i) => i.src).join('\n')

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || items.length === 0) return
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false }) as WebGLRenderingContext | null
    if (!gl) { setFailed(true); return }
    let program: WebGLProgram | null = null, buffer: WebGLBuffer | null = null
    const textures: (WebGLTexture | null)[] = items.map(() => null), aspects: number[] = items.map(() => 1)
    let raf = 0, disposed = false, from = active, to = active, progress = 1, startedAt = 0, direction = 1
    const onLost = (e: Event) => { e.preventDefault(); cancelAnimationFrame(raf) }
    const onRestored = () => setGeneration((g) => g + 1)
    canvas.addEventListener('webglcontextlost', onLost); canvas.addEventListener('webglcontextrestored', onRestored)
    const resize = () => { const dpr = Math.min(window.devicePixelRatio || 1, 1.5); const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr); if (!w || !h || (canvas.width === w && canvas.height === h)) return; canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h) }
    const observer = new ResizeObserver(resize); observer.observe(canvas)
    const uniforms: Record<string, WebGLUniformLocation | null> = {}
    const pick = (i: number) => textures[i] ?? textures.find((t) => t) ?? null
    const draw = () => {
      if (disposed) return
      const t = tuning.current
      const pending = request.current
      if (pending) { request.current = null; if (pending.from !== pending.to) { from = pending.from; to = pending.to; progress = 0; startedAt = performance.now(); const n = items.length; const forward = loop ? ((pending.to - pending.from + n) % n) * 2 <= n : pending.to > pending.from; direction = forward ? 1 : -1 } }
      if (progress < 1) { const span = t.reduced ? 0 : Math.max(t.duration, 1); const el = performance.now() - startedAt; progress = span === 0 ? 1 : easeInOutQuint(Math.min(el / span, 1)) }
      const ft = pick(from), tt = pick(to)
      if (!ft || !tt) return
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, ft); gl.uniform1i(uniforms.from, 0)
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tt); gl.uniform1i(uniforms.to, 1)
      gl.uniform1f(uniforms.progress, progress); gl.uniform2f(uniforms.resolution, canvas.width, canvas.height)
      gl.uniform1f(uniforms.fromAspect, aspects[from] ?? 1); gl.uniform1f(uniforms.toAspect, aspects[to] ?? 1)
      gl.uniform1f(uniforms.scale, t.noiseScale); gl.uniform1f(uniforms.direction, direction); gl.uniform1f(uniforms.edge, Math.max(t.edge, 0.001)); gl.uniform1f(uniforms.drift, t.drift)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    const frame = () => { draw(); raf = requestAnimationFrame(frame) }
    const start = async () => {
      try {
        program = link(gl); gl.useProgram(program)
        buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
        const loc = gl.getAttribLocation(program, 'a_position'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
        for (const n of ['from', 'to', 'progress', 'resolution', 'fromAspect', 'toAspect', 'scale', 'direction', 'edge', 'drift']) uniforms[n] = gl.getUniformLocation(program, 'u_' + n)
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
        let running = false, refused = 0
        await Promise.all(items.map((item, i) => loadImage(item.src).then((img) => {
          if (disposed) return
          const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
          textures[i] = tex; aspects[i] = img.naturalWidth / Math.max(img.naturalHeight, 1)
          if (!running) { running = true; resize(); setReady(true); raf = requestAnimationFrame(frame) }
        }, () => { refused += 1; if (refused === items.length && !disposed) setFailed(true) })))
      } catch { if (!disposed) setFailed(true) }
    }
    void start()
    return () => { disposed = true; cancelAnimationFrame(raf); observer.disconnect(); canvas.removeEventListener('webglcontextlost', onLost); canvas.removeEventListener('webglcontextrestored', onRestored); for (const t of textures) if (t) gl.deleteTexture(t); if (buffer) gl.deleteBuffer(buffer); if (program) gl.deleteProgram(program); textures.fill(null) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sources, generation, items.length, loop])

  React.useEffect(() => { if (!autoplay || reduced || paused || items.length < 2) return; const id = window.setInterval(() => go(active + 1), Math.max(autoplay, 600)); return () => window.clearInterval(id) }, [autoplay, reduced, paused, active, go, items.length])
  React.useEffect(() => { const s = () => setPaused(document.hidden); document.addEventListener('visibilitychange', s); return () => document.removeEventListener('visibilitychange', s) }, [])
  const swipe = React.useRef<number | null>(null)
  const current = items[active]
  const arrow = 'absolute top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center bg-ivory text-ink transition-colors hover:bg-red hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-ivory'
  return (
    <section className={'relative w-full overflow-hidden bg-ink ' + className} style={{ height }} role="region" aria-roledescription="carousel" aria-label="Εικόνες" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1) } else if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1) } }}
      onPointerDown={(e) => { swipe.current = e.clientX }} onPointerUp={(e) => { const s = swipe.current; swipe.current = null; if (s === null) return; const dx = e.clientX - s; if (Math.abs(dx) > 48) go(active + (dx < 0 ? 1 : -1)) }}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {failed ? items.map((item, i) => <img key={item.src} src={item.src} alt={item.alt ?? ''} className="absolute inset-0 block h-full w-full object-cover transition-opacity duration-700" style={{ maxWidth: 'none', opacity: i === active ? 1 : 0 }} aria-hidden={i !== active} />)
        : <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" style={{ opacity: ready ? 1 : 0, transition: 'opacity 400ms ease' }} aria-hidden />}
      {arrows && items.length > 1 && (<>
        <button type="button" className={arrow + ' left-4 sm:left-8'} onClick={() => go(active - 1)} aria-label="Προηγούμενη"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="15 18 9 12 15 6" /></svg></button>
        <button type="button" className={arrow + ' right-4 sm:right-8'} onClick={() => go(active + 1)} aria-label="Επόμενη"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="9 18 15 12 9 6" /></svg></button>
      </>)}
      <span className="sr-only" aria-live="polite">{current?.alt ?? ''} {active + 1} / {items.length}</span>
    </section>
  )
}
