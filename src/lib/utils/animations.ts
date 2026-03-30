import { cubicOut, cubicInOut } from 'svelte/easing';

export const fadeSmooth = {
	duration: 400,
	easing: cubicInOut
};

export const flyUp = {
	y: -20,
	duration: 600,
	easing: cubicOut
};

export const flyUpSmooth = {
	y: -20,
	duration: 600,
	easing: cubicOut
};

export const flyIn = {
	y: 30,
	duration: 500,
	easing: cubicOut
};

export const staggerDelay = (index: number, baseDelay: number = 60) => ({
	y: 30,
	delay: index * baseDelay,
	duration: 500,
	easing: cubicOut
});