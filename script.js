mapboxgl.accessToken =
	'pk.eyJ1IjoibWljaGFlbHNhdHVtYmFtYXBzIiwiYSI6ImNrdm15Z204YjAzajIyb3F2YWRkcjFuaWQifQ.X0jvoZunwGoLmk00y6CNog';

navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
	enableHighAccuracy: true,
});

function successLocation(position) {
	setupMap([position.coords.longitude, position.coords.latitude]);
}

function errorLocation() {
	setupMap([-122.4194, 37.7749]);
}

function setupMap(center) {
	const map = new mapboxgl.Map({
		container: 'map',
		style: 'mapbox://styles/mapbox/streets-v9',
		center: center,
		zoom: 15,
	});

	const nav = new mapboxgl.NavigationControl();
	map.addControl(nav);

	let directions = new MapboxDirections({
		accessToken: mapboxgl.accessToken,
		unit: 'imperial',
		profile: 'mapbox/walking',
		alternatives: false,
		congestion: true,
		controls: {
			inputs: true,
			instructions: true,
			profileSwitcher: true,
		},
		styles: [
			{
				id: 'directions-route-line-alt',
				type: 'line',
				source: 'directions',
				layout: {
					'line-cap': 'round',
					'line-join': 'round',
				},
				paint: {
					'line-color': '#bbb',
					'line-width': 4,
				},
				filter: [
					'all',
					['in', '$type', 'LineString'],
					['in', 'route', 'alternate'],
				],
			},
			{
				id: 'directions-route-line-casing',
				type: 'line',
				source: 'directions',
				layout: {
					'line-cap': 'round',
					'line-join': 'round',
				},
				paint: {
					'line-color': '#E45826', // orange
					'line-width': 12,
				},
				filter: [
					'all',
					['in', '$type', 'LineString'],
					['in', 'route', 'selected'],
				],
			},
			{
				id: 'directions-route-line',
				type: 'line',
				source: 'directions',
				layout: {
					'line-cap': 'butt',
					'line-join': 'round',
				},
				paint: {
					'line-color': {
						property: 'congestion',
						type: 'categorical',
						default: '#4882c5',
						stops: [
							['unknown', '#4882c5'],
							['low', '#4882c5'],
							['moderate', '#f09a46'],
							['heavy', '#e34341'],
							['severe', '#8b2342'],
						],
					},
					'line-width': 7,
				},
				filter: [
					'all',
					['in', '$type', 'LineString'],
					['in', 'route', 'selected'],
				],
			},
			{
				id: 'directions-hover-point-casing',
				type: 'circle',
				source: 'directions',
				paint: {
					'circle-radius': 8,
					'circle-color': '#fff',
				},
				filter: ['all', ['in', '$type', 'Point'], ['in', 'id', 'hover']],
			},
			{
				id: 'directions-hover-point',
				type: 'circle',
				source: 'directions',
				paint: {
					'circle-radius': 6,
					'circle-color': '#3bb2d0',
				},
				filter: ['all', ['in', '$type', 'Point'], ['in', 'id', 'hover']],
			},
			{
				id: 'directions-waypoint-point-casing',
				type: 'circle',
				source: 'directions',
				paint: {
					'circle-radius': 8,
					'circle-color': '#fff',
				},
				filter: ['all', ['in', '$type', 'Point'], ['in', 'id', 'waypoint']],
			},
			{
				id: 'directions-waypoint-point',
				type: 'circle',
				source: 'directions',
				paint: {
					'circle-radius': 6,
					'circle-color': '#8a8bc9',
				},
				filter: ['all', ['in', '$type', 'Point'], ['in', 'id', 'waypoint']],
			},
			{
				id: 'directions-origin-point',
				type: 'circle',
				source: 'directions',
				paint: {
					'circle-radius': 18,
					'circle-color': '#3bb2d0',
				},
				filter: ['all', ['in', '$type', 'Point'], ['in', 'marker-symbol', 'A']],
			},
			{
				id: 'directions-origin-label',
				type: 'symbol',
				source: 'directions',
				layout: {
					'text-field': 'A',
					'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
					'text-size': 12,
				},
				paint: {
					'text-color': '#fff',
				},
				filter: ['all', ['in', '$type', 'Point'], ['in', 'marker-symbol', 'A']],
			},
			{
				id: 'directions-destination-point',
				type: 'circle',
				source: 'directions',
				paint: {
					'circle-radius': 18,
					'circle-color': '#8a8bc9',
				},
				filter: ['all', ['in', '$type', 'Point'], ['in', 'marker-symbol', 'B']],
			},
			{
				id: 'directions-destination-label',
				type: 'symbol',
				source: 'directions',
				layout: {
					'text-field': 'B',
					'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
					'text-size': 12,
				},
				paint: {
					'text-color': '#fff',
				},
				filter: ['all', ['in', '$type', 'Point'], ['in', 'marker-symbol', 'B']],
			},
		],
	});

	// map.on('load', function () {
	// 	directions.setOrigin('Purple Kow'); // On load, set the origin.
	// 	directions.setDestination('Alemany Farm'); // On load, set the destination.
	// });

	directions.on('route', function (e) {
		// console.log(e.route); // Logs the current route shown in the interface.
		// console.log(e.route[0].distance); // Logs the distance in meters
		// console.log(distanceMiles); // Logs the distance in miles.
		// console.log(e.route[0].duration); // Logs the duration in seconds.
		const seconds = e.route[0].duration;
		const minutes = seconds / 60;
		// console.log(minutes); // Logs the duration in minutes.
		if (e.route[0].weight_name == 'cyclability') {
			MET = 8;
		} else if (e.route[0].weight_name == 'pedestrian') {
			MET = 3.5;
		} else {
			MET = 1;
		}
		let result = ((MET * (weight.value * 0.45359237) * 3.5) / 200) * minutes;
		document.getElementById('caloriesExpended').innerHTML = Math.floor(result);
		weight.addEventListener('input', () => {
			let result = ((MET * (weight.value * 0.45359237) * 3.5) / 200) * minutes;
			document.getElementById('caloriesExpended').innerHTML =
				Math.floor(result);
		});
		document.getElementById('flexSwitchCheckChecked').checked = true;
		document.querySelector('.directions-control-directions').style.display =
			'inherit';
	});

	map.addControl(directions, 'top-left');

	// Calories burned per minute = (MET x body weight in Kg x 3.5) ÷ 200
	// Calories burned = ((MET x body weight in Kg x 3.5) ÷ 200) * minute
	// MET walking = 3
	// MET cycling = 8
	// MET driving = 1
	// lbs to kg = lbs * 0.45359237
	//EXAMPLE
	/*
		const weight = 160 
		const walkingMins = 60
        ((3 * (160 * 0.45359237) * 3.5 ) / 200) * 60
	*/
}

function directionsToggle() {
	if (document.getElementById('flexSwitchCheckChecked').checked == true) {
		document.querySelector('.directions-control-directions').style.display =
			'inherit';
	} else {
		document.querySelector('.directions-control-directions').style.display =
			'none';
	}
}

if ('serviceWorker' in navigator) {
	window.addEventListener('load', function() {
	  navigator.serviceWorker.register('service-worker.js').then(function(registration) {
		// Registration was successful
		console.log('ServiceWorker registration successful with scope: ', registration.scope);
	  }, function(err) {
		// registration failed :(
		console.log('ServiceWorker registration failed: ', err);
	  });
	});
  }