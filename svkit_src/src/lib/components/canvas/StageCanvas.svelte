<script lang="ts">
	import { onMount } from 'svelte';
	import { Assets, type Application, type Texture } from 'pixi.js';
	import { asset } from '$app/paths';
	import type { AssetPath } from '$app/types';
	import names from '#lib/data/names.json';
	import bios from '#lib/data/bios.json';
	import type { Bot, Step } from '#lib/remixer.svelte.ts';
	import { packCircles, type Circle, type Size } from '#lib/packing.ts';
	import { range, sample } from '#lib/sample.ts';
	import { glitch as runGlitch } from '#lib/pixi/glitch.ts';
	import * as C from '#lib/stage/config.ts';
	import PixiApp from '#lib/components/pixi/PixiApp.svelte';
	import Layer from '#lib/components/pixi/Layer.svelte';
	import Rings from '#lib/components/pixi/Rings.svelte';
	import Label from '#lib/components/pixi/Label.svelte';
	import Loader from '#lib/components/ui/Loader.svelte';
	import PhotoField, { type Photo } from './PhotoField.svelte';
	import WordField, { type Word } from './WordField.svelte';
	import BotCard from './BotCard.svelte';

	let {
		step,
		bot,
		preview,
		interactive,
		onhover,
		onpick
	}: {
		step: Step;
		bot: Bot;
		preview: string | null;
		/** Turn off all canvas pointer handling, e.g. while the info panel is dragged. */
		interactive: boolean;
		onhover: (value: string | null) => void;
		onpick: (value: string) => void;
	} = $props();

	const avatarUrls = sample(range(C.AVATAR_FILES), C.PHOTOS.count).map((i) =>
		asset(`img/avatar/${i}.png` as AssetPath)
	);
	const placeholderUrl = asset(C.PLACEHOLDER_AVATAR);
	const nameTexts = sample(names, C.NAMES.count);
	const bioTexts = sample(bios, C.BIOS.count);

	let app = $state.raw<Application | null>(null);
	let textures = $state.raw<Record<string, Texture> | null>(null);
	/** Current canvas size; follows the window. */
	let size = $state.raw<Size | null>(null);

	/** Item positions relative to the canvas centre, so they stay put when the window resizes. */
	interface Layout {
		photos: Photo[];
		names: Word[];
		bios: Word[];
	}

	function ready(a: Application) {
		app = a;
		size = { width: a.screen.width, height: a.screen.height };
	}

	onMount(() => {
		// Canvas text is rasterised once, so the font (incl. the Cyrillic subset) must be ready first.
		const glyphs = [...nameTexts, ...bioTexts, C.DEFAULT_NAME, C.DEFAULT_BIO].join('');
		Promise.all([
			Assets.load<Texture>([...avatarUrls, placeholderUrl]),
			document.fonts.load(`12px "${C.CANVAS_FONT}"`, glyphs)
		]).then(([loaded]) => {
			for (const texture of Object.values(loaded)) texture.source.scaleMode = 'nearest';
			textures = loaded;
		});
	});

	/**
	 * Packs once over a field the size of the whole monitor (or the canvas, if larger), so resizing
	 * the window reveals or crops the same field instead of reshuffling it.
	 */
	function computeLayout(canvas: Size, textures: Record<string, Texture>): Layout {
		const screen = {
			width: Math.max(window.screen.width, canvas.width),
			height: Math.max(window.screen.height, canvas.height)
		};
		const center = { x: screen.width / 2, y: screen.height / 2 };
		const toOffset = ({ x, y }: Circle) => ({ x: x - center.x, y: y - center.y });
		const avatarZone: Circle = { ...center, r: C.MAIN_AVATAR.diameter / 2 };
		const below = (dy: number): Circle => ({ x: center.x, y: center.y + dy, r: avatarZone.r });

		const photoSpots = packCircles(
			screen,
			[avatarZone],
			avatarUrls.length,
			C.PHOTOS.packingDiameter / 2,
			C.PHOTOS.attempts
		);
		const nameSpots = packCircles(
			screen,
			[avatarZone, below(C.NAMES.reservedOffsetY)],
			nameTexts.length,
			C.NAMES.packingDiameter / 2,
			C.NAMES.attempts
		);
		const bioSpots = packCircles(
			screen,
			[avatarZone, below(C.BIOS.reservedOffsetY)],
			bioTexts.length,
			C.BIOS.packingDiameter / 2,
			C.BIOS.attempts
		);

		return {
			photos: photoSpots.map((spot, i) => ({
				id: avatarUrls[i],
				texture: textures[avatarUrls[i]],
				...toOffset(spot)
			})),
			names: nameSpots.map((spot, i) => ({ text: nameTexts[i], ...toOffset(spot) })),
			bios: bioSpots.map((spot, i) => ({ text: bioTexts[i], ...toOffset(spot) }))
		};
	}

	// Only depends on `app` and `textures`, so it is computed once; resizes just move the centre.
	const layout = $derived(app && textures ? computeLayout(app.screen, textures) : null);

	/** Enough rings to reach the canvas corners. */
	const ringCount = $derived(
		size
			? Math.ceil(
					(Math.hypot(size.width, size.height) / 2 - C.MAIN_AVATAR.diameter / 2) / C.RINGS.spacing
				) + 1
			: 0
	);

	const shown = $derived({
		avatar: step !== 'botnet',
		name: step === 'name' || step === 'bio',
		bio: step === 'bio'
	});
	const avatarTexture = $derived.by(() => {
		if (!textures) return null;
		const url = (step === 'photo' && preview) || bot.avatar || placeholderUrl;
		return textures[url] ?? textures[placeholderUrl];
	});
	const nameText = $derived((step === 'name' && preview) || bot.name || C.DEFAULT_NAME);
	const bioText = $derived((step === 'bio' && preview) || bot.bio || C.DEFAULT_BIO);

	/** Plays the pick transition over the whole stage. */
	export function glitch(): Promise<void> {
		if (!app) return Promise.resolve();
		app.stage.filterArea = app.screen;
		// The avatar pick never re-seeded its glitch in the original, unlike names and bios.
		return runGlitch(app, app.stage, { animate: step !== 'photo' });
	}
</script>

<div class="stage">
	{#if !layout}
		<Loader />
	{/if}

	<PixiApp background={C.BACKGROUND} onready={ready} onresize={(s) => (size = s)}>
		{#if layout && size && avatarTexture}
			<!-- everything below is placed relative to the canvas centre -->
			<Layer x={size.width / 2} y={size.height / 2}>
				<Layer visible={step === 'botnet'} interactive={false}>
					<Label text={C.BOTNET_TEXT} x={0} y={0} style={C.BOT_NAME_STYLE} />
				</Layer>
				<BotCard x={0} y={0} avatar={avatarTexture} name={nameText} bio={bioText} show={shown} />
				<Layer visible={step !== 'botnet'} interactive={false}>
					<Rings
						x={0}
						y={0}
						radius={C.MAIN_AVATAR.diameter / 2}
						count={ringCount}
						spacing={C.RINGS.spacing}
						width={C.RINGS.width}
						color={C.RINGS.color}
					/>
				</Layer>
				<PhotoField
					photos={layout.photos}
					size={C.PHOTOS.diameter}
					hoverSize={C.PHOTOS.hoverDiameter}
					visible={step === 'photo'}
					interactive={interactive && step === 'photo'}
					hovered={step === 'photo' ? preview : null}
					{onhover}
					{onpick}
				/>
				<WordField
					words={layout.names}
					style={C.WORD_STYLE}
					hoverStyle={C.WORD_HOVER.style}
					hoverScale={C.WORD_HOVER.scale}
					visible={step === 'name'}
					interactive={interactive && step === 'name'}
					hovered={step === 'name' ? preview : null}
					{onhover}
					{onpick}
				/>
				<WordField
					words={layout.bios}
					style={C.BIO_WORD_STYLE}
					hoverStyle={C.WORD_HOVER.style}
					hoverScale={C.WORD_HOVER.scale}
					visible={step === 'bio'}
					interactive={interactive && step === 'bio'}
					hovered={step === 'bio' ? preview : null}
					{onhover}
					{onpick}
				/>
			</Layer>
		{/if}
	</PixiApp>
</div>

<style>
	.stage {
		position: absolute;
		inset: 0;
		background: #000;
	}
</style>
