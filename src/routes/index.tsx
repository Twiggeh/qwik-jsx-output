import type { JSXOutput } from "@builder.io/qwik";
import {
	component$,
	useSignal,
	useTask$,
	useVisibleTask$,
} from "@builder.io/qwik";
import { server$, routeLoader$ } from "@builder.io/qwik-city";
import { isServer } from "@builder.io/qwik/build";

declare global {
	// eslint-disable-next-line
	var rooms: string[] | undefined;
}

const _getRooms = () => {
	if (!isServer) throw new Error("No access from client");
	if (!globalThis.rooms)
		globalThis.rooms = ["hello", "goodbye", "something else", "noooo"];
	return globalThis.rooms as string[];
};

const ExpComp = component$(({ rooms }: { rooms: string[] }) => {
	if (!rooms.length) return <div>No Rooms yet!</div>;

	return (
		<div>
			{rooms.map((g) => (
				<div key={g}>{g}</div>
			))}
		</div>
	);
});

const getRooms = server$(() => _getRooms());

const getMyExpensive = server$(() => {
	const rooms = _getRooms();
	return <ExpComp rooms={rooms}></ExpComp>;
});

export const useRoomsLoader = routeLoader$(() => {
	return getMyExpensive();
});

export default component$(() => {
	const rooms = useRoomsLoader();
	const mySigTask = useSignal<JSXOutput>();
	const mySigVisible = useSignal<JSXOutput>();
	const mySigVisible2 = useSignal<JSXOutput>();
	const load = useSignal(0);

	useTask$(async (ctx) => {
		ctx.track(() => load.value);
		mySigTask.value = await getMyExpensive();
	});

	// eslint-disable-next-line
	useVisibleTask$(async () => {
		mySigVisible.value = await getMyExpensive();
	});

	// eslint-disable-next-line
	useVisibleTask$(async () => {
		const rooms = await getRooms();

		if (!rooms.length) mySigVisible2.value = <div>No Rooms yet!</div>;

		mySigVisible2.value = (
			<div>
				{rooms.map((g) => (
					<div key={g}>{g}</div>
				))}
			</div>
		);
		return;
	});

	return (
		<>
			<div style={{ border: "solid 1px red" }}>
				server$ + useTask:
				{mySigTask.value}
			</div>
			<button onClick$={() => (load.value += 1)}>break! (check console)</button>
			<div style={{ border: "solid 1px hotpink" }}>
				server$ + useVisibleTask:
				{mySigVisible.value}
			</div>

			<div style={{ border: "solid 1px blue" }}>
				server$ + useVisibleTask + no component:
				{mySigVisible2.value}
			</div>

			<div style={{ border: "solid 1px green" }}>
				useRouteLoader:
				{rooms.value}
			</div>
		</>
	);
});
