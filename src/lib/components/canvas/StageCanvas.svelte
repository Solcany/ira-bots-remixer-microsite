<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Assets, type Application, type Texture } from 'pixi.js';
	import { asset } from '$app/paths';
	import type { AssetPath } from '$app/types';
	import names from '#lib/data/names.json';
	import bios from '#lib/data/bios.json';
	import type { Bot, Step } from '#lib/remixer.svelte.ts';
	import { repackCircles, type Circle, type Size } from '#lib/packing.ts';
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

	// Each avatar has a small thumbnail for the field and a large version for the main avatar, which
	// is only loaded once it is shown there. A photo's id (and so `bot.avatar`) is its large URL.
	const avatars = sample(range(C.AVATAR_FILES), C.PHOTOS.count).map((i) => ({
		id: asset(`img/avatar/large/${i}.webp` as AssetPath),
		thumb: asset(`img/avatar/thumb/${i}.webp` as AssetPath)
	}));
	const thumbOf = new Map(avatars.map((a) => [a.id, a.thumb]));
	const placeholderUrl = asset(C.PLACEHOLDER_AVATAR);
	const nameTexts = sample(names, C.NAMES.count);
	const bioTexts = sample(bios, C.BIOS.count);

	let app = $state.raw<Application | null>(null);
	/** Thumbnails and the placeholder, preloaded. */
	let textures = $state.raw<Record<string, Texture> | null>(null);
	/** Large avatars, loaded on demand. */
	let large = $state.raw<Record<string, Texture>>({});
	const requested = new Set<string>();
	/** Current canvas size; follows the window. */
	let size = $state.raw<Size | null>(null);

	/**
	 * Item positions relative to the canvas centre, packed for `size`. Between a resize and the
	 * re-pack that follows it, the field stays anchored to the centre.
	 */
	interface Layout {
		size: Size;
		photos: Photo[];
		names: Word[];
		bios: Word[];
	}
	let layout = $state.raw<Layout | null>(null);

	function ready(a: Application) {
		app = a;
		size = { width: a.screen.width, height: a.screen.height };
	}

	$effect(() => {
		if (app && textures && size && !layout) layout = computeLayout(size, textures);
	});

	// Re-pack only once resizing has settled, and only for a noticeable change, behind the glitch.
	let repackTimer: ReturnType<typeof setTimeout> | undefined;
	onDestroy(() => clearTimeout(repackTimer));

	function resized(next: Size) {
		size = next;
		clearTimeout(repackTimer);
		repackTimer = setTimeout(repack, C.REPACK.debounceMs);
	}

	function repack() {
		if (!textures || !size || !layout) return;
		const dw = Math.abs(size.width - layout.size.width);
		const dh = Math.abs(size.height - layout.size.height);
		if (dw < C.REPACK.minChangePx && dh < C.REPACK.minChangePx) return;

		const transition = glitch();
		onhover(null); // whatever was under the pointer is about to move
		layout = computeLayout(size, textures, layout);
		return transition;
	}

	onMount(() => {
		// Canvas text is rasterised once, so the font (incl. the Cyrillic subset) must be ready first.
		const glyphs = [...nameTexts, ...bioTexts, C.DEFAULT_NAME, C.DEFAULT_BIO].join('');
		Promise.all([
			Assets.load<Texture>([...avatars.map((a) => a.thumb), placeholderUrl]),
			document.fonts.load(`12px "${C.CANVAS_FONT}"`, glyphs)
		]).then(([loaded]) => {
			for (const texture of Object.values(loaded)) texture.source.scaleMode = 'nearest';
			textures = loaded;
		});
	});

	/**
	 * Packs items into the canvas around the main avatar. Given the `previous` layout, items that
	 * still fit keep their place; only the ones that would be cut off move into free space (or hide
	 * when there is none), and hidden ones fill any new room.
	 */
	function computeLayout(
		screen: Size,
		textures: Record<string, Texture>,
		previous?: Layout
	): Layout {
		const center = { x: Math.round(screen.width / 2), y: Math.round(screen.height / 2) };
		// Every item gets an entry, placed or not, so a re-pack only moves and hides items and never
		// mounts or destroys them.
		const place = (spot: Circle | null) =>
			spot
				? { x: spot.x - center.x, y: spot.y - center.y, placed: true }
				: { x: 0, y: 0, placed: false };
		const spotsOf = (items: (Photo | Word)[] | undefined, count: number, r: number) =>
			items?.map((item) =>
				item.placed ? { x: item.x + center.x, y: item.y + center.y, r } : null
			) ?? Array<null>(count).fill(null);
		const avatarZone: Circle = { ...center, r: C.MAIN_AVATAR.diameter / 2 };
		const below = (dy: number): Circle => ({ x: center.x, y: center.y + dy, r: avatarZone.r });

		const pack = (
			exclusions: Circle[],
			items: (Photo | Word)[] | undefined,
			count: number,
			diameter: number,
			attempts: number
		) =>
			repackCircles(
				screen,
				exclusions,
				spotsOf(items, count, diameter / 2),
				diameter / 2,
				attempts
			);

		const photoSpots = pack(
			[avatarZone],
			previous?.photos,
			avatars.length,
			C.PHOTOS.packingDiameter,
			C.PHOTOS.attempts
		);
		const nameSpots = pack(
			[avatarZone, below(C.NAMES.reservedOffsetY)],
			previous?.names,
			nameTexts.length,
			C.NAMES.packingDiameter,
			C.NAMES.attempts
		);
		const bioSpots = pack(
			[avatarZone, below(C.BIOS.reservedOffsetY)],
			previous?.bios,
			bioTexts.length,
			C.BIOS.packingDiameter,
			C.BIOS.attempts
		);

		return {
			size: screen,
			photos: avatars.map(({ id, thumb }, i) => ({
				id,
				texture: textures[thumb],
				...place(photoSpots[i])
			})),
			names: nameTexts.map((text, i) => ({ text, ...place(nameSpots[i]) })),
			bios: bioTexts.map((text, i) => ({ text, ...place(bioSpots[i]) }))
		};
	}

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
	const mainAvatar = $derived((step === 'photo' && preview) || bot.avatar || placeholderUrl);
	$effect(() => {
		const url = mainAvatar;
		if (url === placeholderUrl || requested.has(url)) return;
		requested.add(url);
		Assets.load<Texture>(url).then(
			(texture) => {
				texture.source.scaleMode = 'nearest';
				large = { ...large, [url]: texture };
			},
			() => requested.delete(url)
		);
	});
	// The thumbnail stands in until the large version has loaded.
	const avatarTexture = $derived.by(() => {
		if (!textures) return null;
		const thumb = thumbOf.get(mainAvatar);
		return large[mainAvatar] ?? (thumb && textures[thumb]) ?? textures[placeholderUrl];
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

	<PixiApp background={C.BACKGROUND} onready={ready} onresize={resized}>
		{#if layout && size && avatarTexture}
			<!-- everything below is placed relative to the canvas centre -->
			<Layer x={Math.round(size.width / 2)} y={Math.round(size.height / 2)}>
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
