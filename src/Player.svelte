<script>
  // const cornerWidth=Math.sqrt(2*Math.pow(STADIUM_CORNER,2))

  import Mesh from '../util/Mesh/index.svelte';
  import * as GL from '@sveltejs/gl';
  import * as models from './models'
	import { onMount } from 'svelte';
	import { writable, derived } from 'svelte/store'
  import _ from 'lodash'
  import * as quat from 'gl-matrix/quat'
import Stadium from './Stadium.svelte';

	const replay = writable(null)
	const game_time = writable(0)

	const ball = derived([replay, game_time], ([replay, game_time]) => {
		const ball = (replay && replay.balls.filter(({ start, end }) => start < game_time && end > game_time)[0]) || null
		if (!ball) return 
		let index = 0
		for (; index < ball.times.length; index++) {
			if (ball.times[index] > game_time) {
				break;
			}
		}
		index--
		if (!index) return;

		const start = index * 3;
		return {
			pos: [ball.pos[start], ball.pos[start + 1], ball.pos[start + 2]]
		}
	})

	const cars = derived([replay, game_time], ([replay, game_time]) => {
		if (!replay) return []
		return replay.players.map(player => {
			const car = _.find(player.cars, car => car.start < game_time && car.end > game_time)
      if (!car) return
      const index = (_.findIndex(car.times, t => t > game_time) - 1)
      if (!index) return

			const pos_index = index * 3
      const quat_index = index * 4
      
      const a = quat.fromValues(car.quat[quat_index], car.quat[quat_index + 1], car.quat[quat_index + 2], car.quat[quat_index + 3]);
      let q = quat.create()
      quat.rotateZ(q, a, 1.5708)
			
			return {
				player: player.player,
				platform: player.platform,
				color: player.team === 'orange' ? 0xff0000 : 0x0000ff,
        pos: [car.pos[pos_index], car.pos[pos_index + 1], car.pos[pos_index + 2]],
        quat: q,
			}
		}).filter(Boolean)
  })
  

  $: fps = frames.reduce((total, frame) => total + frame) / frames.length;

  let frames = Array(30).fill(0); // for smoothing out FPS counter
  let paused = true
  let ballcam = false

	onMount(async () => {
    // $replay = (await import('./replay')).default
    $replay = await fetch('/api/replays/2ffa2591-4e84-46ce-ba47-bcbe4ea85809/replay')
      .then(r => r.json())

		paused = false

		let last = Date.now();

		let frame = requestAnimationFrame(function loop() {
			frame = requestAnimationFrame(loop);

			const now = Date.now();
			const elapsed = now - last;

			if (!paused) $game_time += elapsed / 1000;

			frames.shift();
      frames[frames.length] = 1000 / elapsed;

			last = now;
		});

		return () => {
			cancelAnimationFrame(frame);
		};
	});
</script>


<GL.Scene>
  <GL.Target id="center" location={[0, 0, 0]}/>
  <GL.OrbitControls location={[0,5000,10000]} minDistance={1000} let:location let:target>
    <GL.PerspectiveCamera far={50000} lookAt={ballcam && $ball ? 'ball' : target} {location}/>
  </GL.OrbitControls>
  <GL.AmbientLight intensity={.6}/>
  <GL.PointLight intensity={.6} location={[0,1000,0]}/>

  <Stadium>
    {#if $ball}
    <GL.Target id="ball" location={$ball.pos}/>
      <Mesh
        geometry={GL.sphere({turns:12, bands:12})}
        location={$ball.pos}
        uniforms={{ color: 0x00ff00 }}
        scale={80}
      />
    {/if}

    {#each $cars as car (car.player)}
      <GL.Overlay location={car.pos}>
        <small>{car.player}</small>
      </GL.Overlay>
      <Mesh
        geometry={models.car()}
        quaternion={car.quat}
        location={car.pos}
        uniforms={{ color: car.color }}
        scale={.5}
      />
    {/each}
  </Stadium>
</GL.Scene>
<div class="controls">
  <label>
    Pause
    <input type="checkbox" bind:checked={paused}>
  </label>
  <label>
    Ball Cam
    <input type="checkbox" bind:checked={ballcam}>
  </label>
</div>

<div class="info">
  FPS {Math.round(fps)}
  GameTime {Math.round($game_time * 100) / 100}
</div>

<style>
.controls {
  position: fixed;
  top: 4em;
  right: 1em;
}

.info {
  position: fixed;
  top: 4em;
  left: 1em;
}
</style>