<GL.Group
  rotation={[270,0,0]}
>
  <!-- Ground -->
  <GL.Mesh
    geometry={GL.plane()}
    location={[0, 0, 0]}
    scale={[SOCCAR_XSIZE, SOCCAR_YSIZE, 1]}
    uniforms={{ color: 0xc0c0c0 }}
    transparent={true}
  />
  <!-- Left -->
  <GL.Mesh
    geometry={GL.plane()}
    location={[-SOCCAR_XSIZE, 0, SOCCAR_DEPTH]}
    rotation={[0, 90, 0]}
    scale={[SOCCAR_DEPTH, SOCCAR_YSIZE, 1]}
    uniforms={{ color: 0xffc0c0 }}
    transparent={true}
  />
  <!-- Right -->
  <GL.Mesh
    geometry={GL.plane()}
    location={[SOCCAR_XSIZE, 0, SOCCAR_DEPTH]}
    rotation={[0, 270, 0]}
    scale={[SOCCAR_DEPTH, SOCCAR_YSIZE, 1]}
    uniforms={{ color: 0xffc0c0 }}
    transparent={true}
  />
  <!-- Goal -->
  <!-- Back -->
  <GL.Mesh
    geometry={GL.plane()}
    location={[0, SOCCAR_YSIZE, SOCCAR_DEPTH + GOAL_HEIGHT]}
    rotation={[90, 90, 0]}
    scale={[SOCCAR_DEPTH - GOAL_HEIGHT, SOCCAR_XSIZE, 1]}
    uniforms={{ color: 0xffc0c0 }}
    transparent={true}
  />

  <GL.Mesh
    geometry={GL.plane()}
    location={[-SOCCAR_XSIZE + ((SOCCAR_XSIZE/2) - (GOAL_WIDTH/2)), SOCCAR_YSIZE, GOAL_HEIGHT]}
    rotation={[90, 90, 0]}
    scale={[GOAL_HEIGHT, (SOCCAR_XSIZE/2) - (GOAL_WIDTH/2), 1]}
    uniforms={{ color: 0xffc0c0 }}
    transparent={true}
  />
  <GL.Mesh
    geometry={GL.plane()}
    location={[SOCCAR_XSIZE - ((SOCCAR_XSIZE/2) - (GOAL_WIDTH/2)), SOCCAR_YSIZE, GOAL_HEIGHT]}
    rotation={[90, 90, 0]}
    scale={[GOAL_HEIGHT, (SOCCAR_XSIZE/2) - (GOAL_WIDTH/2), 1]}
    uniforms={{ color: 0xffc0c0 }}
    transparent={true}
  />
  <!-- Front -->
  <GL.Mesh
    geometry={GL.plane()}
    location={[0, -SOCCAR_YSIZE, SOCCAR_DEPTH + GOAL_HEIGHT]}
    rotation={[270, 270, 0]}
    scale={[SOCCAR_DEPTH - GOAL_HEIGHT, SOCCAR_XSIZE, 1]}
    uniforms={{ color: 0xffc0c0 }}
    transparent={true}
  />
  <GL.Mesh
    geometry={GL.plane()}
    location={[-SOCCAR_XSIZE + ((SOCCAR_XSIZE/2) - (GOAL_WIDTH/2)), -SOCCAR_YSIZE, GOAL_HEIGHT]}
    rotation={[270, 270, 0]}
    scale={[GOAL_HEIGHT, (SOCCAR_XSIZE/2) - (GOAL_WIDTH/2), 1]}
    uniforms={{ color: 0xffc0c0 }}
    transparent={true}
  />
  <GL.Mesh
    geometry={GL.plane()}
    location={[SOCCAR_XSIZE - ((SOCCAR_XSIZE/2) - (GOAL_WIDTH/2)), -SOCCAR_YSIZE, GOAL_HEIGHT]}
    rotation={[270, 270, 0]}
    scale={[GOAL_HEIGHT, (SOCCAR_XSIZE/2) - (GOAL_WIDTH/2), 1]}
    uniforms={{ color: 0xffc0c0 }}
    transparent={true}
  />
  <slot></slot>
</GL.Group>


<script>
  import * as GL from '@sveltejs/gl';

  const SOCCAR_YSIZE = 10280 / 2
  const SOCCAR_XSIZE = 8240 / 2
  const SOCCAR_DEPTH = 1960 /2
  const STADIUM_CORNER = 1e3
  const GOAL_WIDTH = 1900 / 2 
  const GOAL_HEIGHT = 800 / 2 
  const GOAL_DEPTH = 900 / 2
</script>