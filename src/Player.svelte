<script>
  /**
   * SOCCAR_YSIZE=10280
   * SOCCAR_XSIZE=8240
   * SOCCAR_DEPTH=1960
   * STADIUM_CORNER=1e3
   * GOAL_WIDTH=1900
   * GOAL_HEIGHT=800
   * GOAL_DEPTH=900
   * cornerWidth=Math.sqrt(2*Math.pow(STADIUM_CORNER,2))
   */


  import Mesh from '../util/Mesh/index.svelte';
  import * as GL from '@sveltejs/gl';
  import * as models from './models'
	import { onMount } from 'svelte';
	import { writable, derived } from 'svelte/store'
	import _ from 'lodash'

	const replay = writable(null)
	const game_time = writable(6)

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
			
			return {
				player: player.player,
				platform: player.platform,
				color: player.team === 'orange' ? 0xff0000 : 0x0000ff,
        pos: [car.pos[pos_index], car.pos[pos_index + 1], car.pos[pos_index + 2]],
        quat: [car.quat[quat_index], car.quat[quat_index + 1], car.quat[quat_index + 2], car.quat[quat_index + 3]],
			}
		}).filter(Boolean)
  })
  
  $: console.log($cars)

    $: fps = frames.reduce((total, frame) => total + frame) / frames.length;

    let frames = Array(30).fill(0); // for smoothing out FPS counter
	let paused = true

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
  <GL.OrbitControls location={[0,0,12000]} minDistance={12000} let:location let:target>
    <GL.PerspectiveCamera far={50000} lookAt={target} {location}/>
  </GL.OrbitControls>
  <GL.AmbientLight intensity={1}/>
  <Mesh
    geometry={GL.plane()}
    location={[0, 0, 0]}
    scale={[4020, 5210, 1]}
    uniforms={{ color: 0xc0c0c0 }}
  />

  {#if $ball}
    <Mesh
      geometry={GL.sphere({turns:12, bands:12})}
      location={$ball.pos}
      uniforms={{ color: 0x00ff00 }}
      scale={80}
    />
  {/if}

  {#each $cars as car (car.player)}
    <Mesh
      geometry={models.car()}
      quaternion={car.quat}
      location={car.pos}
      uniforms={{ color: car.color }}
      scale={.5}
    />
  {/each}
</GL.Scene>
<div class="controls">
  <label>
    Pause
    <input type="checkbox" bind:checked={paused}>
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