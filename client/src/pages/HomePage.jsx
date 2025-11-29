import api from "../services/api";

const listings = [
    { id: 1, title: "Cozy Cottage in Shimla", image: "https://source.unsplash.com/400x250/?cottage,shimla" },
    { id: 2, title: "Beachfront Villa in Goa", image: "https://source.unsplash.com/400x250/?villa,goa" },
    { id: 3, title: "Island Retreat in Maldives", image: "https://source.unsplash.com/400x250/?maldives,resort" },
    { id: 4, title: "Cozy Beachfront Cottage", image: "https://source.unsplash.com/400x250/?beach,cottage" },
];

function HomePage() {
    const [listings, setListings] = useState([]);

    useEffect(() => {
        api.get("/listings")
            .then(res => setListings(res.data.listings))
            .catch(err => console.log(err));
    }, []);

    return (
        <div style={{ padding: "20px" }}>
            <h1 style={{ marginBottom: "20px" }}>Wanderlust Listings</h1>
            <div style={styles.grid}>
                {listings.map((listing) => (
                    <Link to={`/listings/${listing.id}`} key={listing.id} style={styles.card}>
                        <img src={listing.image} alt={listing.title} style={styles.image} />
                        <h3 style={styles.title}>{listing.title}</h3>
                    </Link>
                ))}
            </div>
        </div>
    )
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
  },
  card: {
    display: "block",
    textDecoration: "none",
    color: "#333",
    border: "1px solid #ddd",
    borderRadius: "10px",
    overflow: "hidden",
    transition: "transform 0.3s",
  },
  image: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
  },
  title: {
    padding: "10px",
  },
};


export default HomePage; 