mapboxgl.accessToken = mapToken;

// Prevent crash if geometry missing
if (!listing.geometry || !listing.geometry.coordinates || listing.geometry.coordinates.length !== 2) {
    console.error("Geometry missing or invalid:", listing);
} else {

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: listing.geometry.coordinates,
        zoom: 9
    });

    new mapboxgl.Marker({ color: "red" })
        .setLngLat(listing.geometry.coordinates)
        .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
                `<h5>${listing.title}</h5><p>Exact location will be provided after booking</p>`
            )
        )
        .addTo(map);
}


 