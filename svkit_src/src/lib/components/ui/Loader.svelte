<script lang="ts">
	import { asset } from '$app/paths';
</script>

<img class="loader" src={asset('img/loader.gif')} alt="Loading" />

<style>
	.loader {
		position: absolute;
		top: 50%;
		left: 50%;
		z-index: 4;
		width: 80px;
		transform: translate(-50%, -50%);
	}
</style>
