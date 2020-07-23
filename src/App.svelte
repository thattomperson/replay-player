<script>
	import * as GL from '@sveltejs/gl';
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
			const pos_index = (_.findIndex(car.times, t => t > game_time) - 1) * 3
			if (!pos_index) return

			
			return {
				player: player.player,
				platform: player.platform,
				color: player.team === 'orange' ? 0xff0000 : 0x0000ff,
				pos: [car.pos[pos_index], car.pos[pos_index + 1], car.pos[pos_index + 2]],
			}
		}).filter(Boolean)
	})

	$: fps = frames.reduce((total, frame) => total + frame) / frames.length;

	let frames = Array(30).fill(0); // for smoothing out FPS counter
	let paused = true

	onMount(async () => {
		$replay = (await import('./replay')).default
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

<main>
	<GL.Scene>
		<GL.Target id="center" location={[0, 0, 0]}/>
		<GL.PerspectiveCamera far={50000} lookAt="center" location={[0,0,12000]}/>
		<GL.AmbientLight intensity={1}/>

		{#if $ball}
		
			<GL.Mesh
				geometry={GL.sphere({turns:12, bands:12})}
				location={$ball.pos}
				uniforms={{ color: 0x00ff00 }}
				scale={80}
			/>
		{/if}

		{#each $cars as car (car.player)}
			<GL.Mesh
				geometry={GL.box()}
				location={car.pos}
				uniforms={{ color: car.color }}
				scale={100}
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
</main>

<style>
	main {
		width: 100%;
		height: 100%;
	}

	.controls {
		position: fixed;
		top: 1em;
		right: 1em;
	}

	.info {
		position: fixed;
		top: 1em;
		left: 1em;
	}
</style>