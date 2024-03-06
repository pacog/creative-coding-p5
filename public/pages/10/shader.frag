precision mediump float;

varying vec2 vTexCoord;

void main() {
  // now because of the varying vTexCoord, we can access the current texture coordinate
  vec2 uv = vTexCoord;

  // and now these coordinates are assigned to the color output of the shader
  gl_FragColor = vec4(uv,1.0,1.0);
}