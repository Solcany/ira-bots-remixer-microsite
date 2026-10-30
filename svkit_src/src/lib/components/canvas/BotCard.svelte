<script lang="ts">
	import type { Texture } from 'pixi.js';
	import { DropShadowFilter } from 'pixi-filters';
	import Layer from '#lib/components/pixi/Layer.svelte';
	import Sprite from '#lib/components/pixi/Sprite.svelte';
	import Label from '#lib/components/pixi/Label.svelte';
	import {
		BOT_BIO_OFFSET_Y,
		BOT_BIO_STYLE,
		BOT_NAME_OFFSET_Y,
		BOT_NAME_STYLE,
		MAIN_AVATAR,
		SHADOW_COLOR
	} from '#lib/stage/config.ts';

	let {
		x,
		y,
		avatar,
		name,
		bio,
		show
	}: {
		/** Centre of the avatar. */
		x: number;
		y: number;
		avatar: Texture;
		name: string;
		bio: string;
		show: { avatar: boolean; name: boolean; bio: boolean };
	} = $props();

	const shadow = [new DropShadowFilter({ color: SHADOW_COLOR, alpha: 1 })];
	const top = { x: 0.5, y: 0 };
</script>

<Layer visible={show.avatar} interactive={false}>
	<Sprite texture={avatar} {x} {y} size={MAIN_AVATAR.diameter} circleMask />
</Layer>
<Layer visible={show.name} interactive={false}>
	<Label
		text={name}
		{x}
		y={y + BOT_NAME_OFFSET_Y}
		style={BOT_NAME_STYLE}
		anchor={top}
		filters={shadow}
	/>
</Layer>
<Layer visible={show.bio} interactive={false}>
	<Label
		text={bio}
		{x}
		y={y + BOT_BIO_OFFSET_Y}
		style={BOT_BIO_STYLE}
		anchor={top}
		filters={shadow}
	/>
</Layer>
