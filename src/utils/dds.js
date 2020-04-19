import parseDDS from "parse-dds";
import Texture from "glo-texture/2d";
import Shader from "glo-shader";
import triangle from "a-big-triangle";

function canvasToBlob(canvas, type) {
  return new Promise(function(resolve) {
    canvas.toBlob(resolve, type);
  });
}

export async function createObjectURLFromDDS(content) {
  let dds = parseDDS(content);
  let image = dds.images[0];

  const canvas = document.createElement("canvas");
  canvas.width = image.shape[0]; // Set canvas width
  canvas.height = image.shape[1]; // Set canvas height

  // Initialize the GL context
  const gl = canvas.getContext("webgl", {
    alpha: true,
    preserveDrawingBuffer: true,
    width: image.shape[0],
    height: image.shape[1],
  });

  const ext = gl.getExtension("WEBGL_compressed_texture_s3tc");
  if (!ext) {
    console.error("DDS compressed texture rendering not supported on this GPU");
    return;
  }

  let format;

  switch (dds.format) {
    case "dxt1":
      format = ext.COMPRESSED_RGB_S3TC_DXT1_EXT;
      break;
    case "dxt3":
      format = ext.COMPRESSED_RGBA_S3TC_DXT3_EXT;
      break;
    case "dxt5":
      format = ext.COMPRESSED_RGBA_S3TC_DXT5_EXT;
      break;
  }

  if (!format) {
    console.error("Unsupported DDS format " + dds.format);
    return;
  }
  const shader = Shader(gl, {
    vertex: `
        attribute vec2 position;
        varying vec2 vUv;

        void main() {
          vUv = (position + 1.0) * 0.5;
          vUv.y = 1.0 - vUv.y;
          gl_Position = vec4(position, 1.0, 1.0);
        }
    `,
    fragment: `
        precision mediump float;

        varying vec2 vUv;
        uniform sampler2D iChannel0;

        void main() {
          gl_FragColor = texture2D(iChannel0, vUv);
        }
      `,
  });

  var texture = Texture(gl);
  texture.magFilter = gl.LINEAR;
  texture.compressed = true;
  texture.format = format;

  let imageData = new Uint8Array(content, image.offset, image.length);
  texture.update(imageData, image.shape, 0);

  shader.bind();
  shader.uniforms.iChannel0(0);
  texture.bind();
  triangle(gl);

  let blob = await canvasToBlob(gl.canvas, "image/png");

  texture.dispose();
  shader.dispose();

  return URL.createObjectURL(blob);
}
