/**
 * Oily Water Background Shader
 * Ported from GameJamTemplate GLSL shader
 * Uses Resurrect64 color palette
 */

(function() {
  'use strict';

  // Vertex shader - simple passthrough
  const vertexShaderSource = `#version 300 es
    in vec4 aPosition;
    in vec2 aTexCoord;
    out vec2 fragTexCoord;
    void main() {
      gl_Position = aPosition;
      fragTexCoord = aTexCoord;
    }
  `;

  // Fragment shader - the oily water effect
  const fragmentShaderSource = `#version 300 es
    precision highp float;

    in vec2 fragTexCoord;
    out vec4 finalColor;

    uniform float iTime;
    uniform vec2 resolution;

    // Resurrect64 colors
    const vec3 color1 = vec3(0.055, 0.686, 0.608);  // #0eaf9b teal
    const vec3 color2 = vec3(0.565, 0.369, 0.663);  // #905ea9 purple
    const vec3 color3 = vec3(0.180, 0.133, 0.184);  // #2e222f dark

    // Effect parameters (tuned for web background - chunky pixels like game)
    const float flow_speed = 0.25;
    const float curl_scale = 2.0;
    const float curl_intensity = 0.8;
    const float iridescence = 0.3;
    const float contrast = 1.1;
    const float brightness = -0.08;
    const float pixel_size = 14.0;  // 7px base * 2x scale = visible chunky pixels

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);

      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));

      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p, int octaves) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;

      for (int i = 0; i < 4; i++) {
        if (i >= octaves) break;
        value += amplitude * noise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    vec2 curlNoise(vec2 p, float t) {
      float eps = 0.01;
      float n1 = fbm(vec2(p.x, p.y + eps) + t * 0.1, 3);
      float n2 = fbm(vec2(p.x, p.y - eps) + t * 0.1, 3);
      float n3 = fbm(vec2(p.x + eps, p.y) + t * 0.1, 3);
      float n4 = fbm(vec2(p.x - eps, p.y) + t * 0.1, 3);
      return vec2(n1 - n2, n4 - n3) / (2.0 * eps);
    }

    vec3 thinFilmInterference(float thickness, float viewAngle) {
      float r = 0.5 + 0.5 * cos(thickness * 6.28318 + 0.0 + viewAngle);
      float g = 0.5 + 0.5 * cos(thickness * 6.28318 + 2.094 + viewAngle);
      float b = 0.5 + 0.5 * cos(thickness * 6.28318 + 4.188 + viewAngle);
      return vec3(r, g, b);
    }

    void main() {
      vec2 uv = fragTexCoord;

      // Pixelation
      vec2 screenUV = uv * resolution;
      screenUV = floor(screenUV / pixel_size) * pixel_size;
      uv = screenUV / resolution;

      float aspect = resolution.x / resolution.y;
      vec2 scaledUV = uv;
      scaledUV.y /= aspect;

      float t = iTime * flow_speed;

      // Flowing noise layers
      vec2 flowUV1 = scaledUV * curl_scale + vec2(t * 0.15, t * 0.08);
      vec2 flowUV2 = scaledUV * curl_scale * 1.7 - vec2(t * 0.12, t * 0.18);
      vec2 flowUV3 = scaledUV * curl_scale * 0.6 + vec2(sin(t * 0.1) * 0.3, cos(t * 0.08) * 0.3);

      float flow1 = fbm(flowUV1, 4);
      float flow2 = fbm(flowUV2, 4);
      float flow3 = fbm(flowUV3, 4);

      // Curl distortion
      vec2 curl = curlNoise(scaledUV * curl_scale * 0.5, t);
      vec2 distortedUV = scaledUV + curl * curl_intensity * 0.1;
      float distortedFlow = fbm(distortedUV * curl_scale * 2.0 + t * 0.1, 4);

      // Combine into thickness
      float thickness = flow1 * 0.35 + flow2 * 0.3 + flow3 * 0.2 + distortedFlow * 0.15;
      float flowVariation = (flow1 - flow2) * 2.0;

      // Thin-film iridescence
      vec3 oilRainbow = thinFilmInterference(thickness * 4.0, flowVariation + t * 0.5);

      // Mix colors
      float colorMix1 = smoothstep(0.3, 0.7, flow1);
      float colorMix2 = smoothstep(0.4, 0.6, flow2);

      vec3 baseColor = mix(color3, color1, colorMix1);
      baseColor = mix(baseColor, color2, colorMix2 * 0.6);

      // Add iridescence
      vec3 finalCol = mix(baseColor, oilRainbow, iridescence * 0.5);

      // Highlights
      float highlight = pow(abs(flow1 - flow2), 2.0) * 2.0;
      finalCol += highlight * vec3(0.1);

      // Contrast and brightness
      finalCol = (finalCol - 0.5) * contrast + 0.5 + brightness;

      // Vignette
      float vignette = 1.0 - length(uv - 0.5) * 0.4;
      finalCol *= vignette;

      finalColor = vec4(clamp(finalCol, 0.0, 1.0), 1.0);
    }
  `;

  // Fallback for WebGL1
  const vertexShaderSourceWebGL1 = `
    attribute vec4 aPosition;
    attribute vec2 aTexCoord;
    varying vec2 fragTexCoord;
    void main() {
      gl_Position = aPosition;
      fragTexCoord = aTexCoord;
    }
  `;

  const fragmentShaderSourceWebGL1 = `
    precision highp float;

    varying vec2 fragTexCoord;

    uniform float iTime;
    uniform vec2 resolution;

    // Resurrect64 colors
    vec3 color1 = vec3(0.055, 0.686, 0.608);
    vec3 color2 = vec3(0.565, 0.369, 0.663);
    vec3 color3 = vec3(0.180, 0.133, 0.184);

    float flow_speed = 0.25;
    float curl_scale = 2.0;
    float curl_intensity = 0.8;
    float iridescence = 0.3;
    float contrast = 1.1;
    float brightness = -0.08;
    float pixel_size = 14.0;  // 7px base * 2x scale = visible chunky pixels

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      float frequency = 1.0;
      for (int i = 0; i < 4; i++) {
        value += amplitude * noise(p * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    vec2 curlNoise(vec2 p, float t) {
      float eps = 0.01;
      float n1 = fbm(vec2(p.x, p.y + eps) + t * 0.1);
      float n2 = fbm(vec2(p.x, p.y - eps) + t * 0.1);
      float n3 = fbm(vec2(p.x + eps, p.y) + t * 0.1);
      float n4 = fbm(vec2(p.x - eps, p.y) + t * 0.1);
      return vec2(n1 - n2, n4 - n3) / (2.0 * eps);
    }

    vec3 thinFilmInterference(float thickness, float viewAngle) {
      float r = 0.5 + 0.5 * cos(thickness * 6.28318 + 0.0 + viewAngle);
      float g = 0.5 + 0.5 * cos(thickness * 6.28318 + 2.094 + viewAngle);
      float b = 0.5 + 0.5 * cos(thickness * 6.28318 + 4.188 + viewAngle);
      return vec3(r, g, b);
    }

    void main() {
      vec2 uv = fragTexCoord;

      vec2 screenUV = uv * resolution;
      screenUV = floor(screenUV / pixel_size) * pixel_size;
      uv = screenUV / resolution;

      float aspect = resolution.x / resolution.y;
      vec2 scaledUV = uv;
      scaledUV.y /= aspect;

      float t = iTime * flow_speed;

      vec2 flowUV1 = scaledUV * curl_scale + vec2(t * 0.15, t * 0.08);
      vec2 flowUV2 = scaledUV * curl_scale * 1.7 - vec2(t * 0.12, t * 0.18);
      vec2 flowUV3 = scaledUV * curl_scale * 0.6 + vec2(sin(t * 0.1) * 0.3, cos(t * 0.08) * 0.3);

      float flow1 = fbm(flowUV1);
      float flow2 = fbm(flowUV2);
      float flow3 = fbm(flowUV3);

      vec2 curl = curlNoise(scaledUV * curl_scale * 0.5, t);
      vec2 distortedUV = scaledUV + curl * curl_intensity * 0.1;
      float distortedFlow = fbm(distortedUV * curl_scale * 2.0 + t * 0.1);

      float thickness = flow1 * 0.35 + flow2 * 0.3 + flow3 * 0.2 + distortedFlow * 0.15;
      float flowVariation = (flow1 - flow2) * 2.0;

      vec3 oilRainbow = thinFilmInterference(thickness * 4.0, flowVariation + t * 0.5);

      float colorMix1 = smoothstep(0.3, 0.7, flow1);
      float colorMix2 = smoothstep(0.4, 0.6, flow2);

      vec3 baseColor = mix(color3, color1, colorMix1);
      baseColor = mix(baseColor, color2, colorMix2 * 0.6);

      vec3 finalCol = mix(baseColor, oilRainbow, iridescence * 0.5);

      float highlight = pow(abs(flow1 - flow2), 2.0) * 2.0;
      finalCol += highlight * vec3(0.1);

      finalCol = (finalCol - 0.5) * contrast + 0.5 + brightness;

      float vignette = 1.0 - length(uv - 0.5) * 0.4;
      finalCol *= vignette;

      gl_FragColor = vec4(clamp(finalCol, 0.0, 1.0), 1.0);
    }
  `;

  let canvas, gl, program, startTime;
  let animationId = null;
  let isWebGL2 = false;

  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return null;
    }
    return program;
  }

  function init() {
    canvas = document.getElementById('oily-background');
    if (!canvas) return;

    // Try WebGL2 first, fallback to WebGL1
    gl = canvas.getContext('webgl2');
    if (gl) {
      isWebGL2 = true;
    } else {
      gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      isWebGL2 = false;
    }

    if (!gl) {
      console.warn('WebGL not supported, falling back to CSS background');
      canvas.style.display = 'none';
      return;
    }

    const vertSrc = isWebGL2 ? vertexShaderSource : vertexShaderSourceWebGL1;
    const fragSrc = isWebGL2 ? fragmentShaderSource : fragmentShaderSourceWebGL1;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertSrc);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragSrc);

    if (!vertexShader || !fragmentShader) {
      console.warn('Shader compilation failed');
      canvas.style.display = 'none';
      return;
    }

    program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) {
      canvas.style.display = 'none';
      return;
    }

    // Full-screen quad
    const positions = new Float32Array([
      -1, -1, 0, 0,
       1, -1, 1, 0,
      -1,  1, 0, 1,
       1,  1, 1, 1,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, 'aPosition');
    const aTexCoord = gl.getAttribLocation(program, 'aTexCoord');

    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(aTexCoord);
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 16, 8);

    startTime = performance.now();
    resize();
    window.addEventListener('resize', resize);
    render();
  }

  function resize() {
    if (!canvas || !gl) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function render() {
    if (!gl || !program) return;

    gl.useProgram(program);

    const time = (performance.now() - startTime) / 1000;
    gl.uniform1f(gl.getUniformLocation(program, 'iTime'), time);
    gl.uniform2f(gl.getUniformLocation(program, 'resolution'), canvas.width, canvas.height);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    animationId = requestAnimationFrame(render);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', function() {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  });
})();
