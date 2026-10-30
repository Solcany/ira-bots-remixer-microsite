import { createContext } from 'svelte';
import type { Container } from 'pixi.js';

/** The container that Pixi primitives attach their display object to. */
export const [getParent, setParent] = createContext<Container>();
