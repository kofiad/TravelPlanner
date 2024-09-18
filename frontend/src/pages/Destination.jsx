import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { Link, useParams } from 'react-router-dom'; // Import useParams and Link
import Navbar from '../components/Navbar';
import "../styles/destination.scss";

const Destination = () => {
    const { city } = useParams(); // Get the city parameter from the URL
    const [viewState, setViewState] = useState({
        latitude: 35.6764,  // Default latitude (Tokyo, Japan)
        longitude: 139.7300, // Default longitude (Tokyo, Japan)
        zoom: 10
    });

    console.log("Musa");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [destinationData, setDestinationData] = useState(" ");

    const mapStyles = {
        height: "300px",
        width: "100%"  // Adjust to make it responsive
    };

    const defaultCenter = {
        lat: viewState.latitude,
        lng: viewState.longitude
    };

    // Fetch destination data from backend
    useEffect(() => {
        fetch(`http://127.0.0.1:5000/api/v1/load_place?city=${city}`)
          .then(response => response.json())
          .then(data => {
            setViewState({
              latitude: data.latitude || 35.6764,
              longitude: data.longitude || 139.7300,
              zoom: 10,
            });
            setDestinationData({
              url_link: data.message.url_link,
              keywords: data.message.keywords,
              cityName: data.city_places.city || "Tokyo, Japan",
              description: data.message.description || "Tokyo, the capital of Japan, is a vibrant metropolis where traditional culture meets futuristic innovation. It boasts iconic landmarks like the Tokyo Tower and Skytree, bustling districts like Shibuya and Shinjuku, serene shrines and temples, and a diverse culinary scene.",
            });
            setLoading(false);
          })
          .catch(error => {
            console.error('Error fetching destination data:', error);
            setError('Failed to load destination data.');
            setLoading(false);
          });
      }, [city]);


    return (
        <div className='destination'>
            <Navbar />
            <div className="destination-container">
                {loading ? (
                    <div>Loading destination data...</div>
                ) : (
                    <div>
                        <div className="header">
                            <img src={destinationData.url_link} alt="" />
                            <div className="details">
                                <h1>{destinationData.cityName}</h1>
                                <p>{destinationData.description}</p>
                                <section>
                                    {destinationData.keywords}
                                </section>
                                <Link to={`/planTrip/${city}`} className="plan-trip-link">
                                    <button>Plan Trip to {destinationData.cityName}</button>
                                </Link>
                            </div>
                        </div>
                        <div className="location-map">
                            {error ? (
                                <div>Error: {error}</div>
                            ) : (
                                process.env.REACT_APP_GOOGLE_MAPS_API_KEY ? (
                                    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
                                        <GoogleMap
                                            mapContainerStyle={mapStyles}
                                            zoom={viewState.zoom}
                                            center={defaultCenter}
                                            onClick={(e) => {
                                                // Handle map click to change view or add markers
                                                setViewState({
                                                    latitude: e.latLng.lat(),
                                                    longitude: e.latLng.lng(),
                                                    zoom: viewState.zoom
                                                });
                                            }}
                                        >
                                            <Marker
                                                position={defaultCenter}
                                                draggable={true}
                                                onDragEnd={(e) => {
                                                    setViewState({
                                                        latitude: e.latLng.lat(),
                                                        longitude: e.latLng.lng(),
                                                        zoom: viewState.zoom
                                                    });
                                                }}
                                            />
                                        </GoogleMap>
                                    </LoadScript>
                                ) : (
                                    <div>Error: Google Maps API key is missing.</div>
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Destination;
