import { useParams } from "react-router-dom";

const listings = {
  1: { title: "Cozy Cottage in Shimla", image: "https://source.unsplash.com/800x400/?cottage,shimla", desc: "A peaceful cottage in the hills." },
  2: { title: "Beachfront Villa in Goa", image: "https://source.unsplash.com/800x400/?villa,goa", desc: "Luxury villa with sea view." },
  3: { title: "Island Retreat in Maldives", image: "https://source.unsplash.com/800x400/?maldives,resort", desc: "Private island experience." },
  4: { title: "Cozy Beachfront Cottage", image: "https://source.unsplash.com/800x400/?beach,cottage", desc: "Romantic stay near the beach." },
};

function ListingPage() {
  const { id } = useParams();
  const listing = listings[id];

  if (!listing) return <h2 style={{ padding: "20px" }}>Listing not found</h2>;

  return (
    <div style={{ padding: "20px" }}>
      <img
        src={listing.image}
        alt={listing.title}
        style={{ width: "100%", borderRadius: "10px", marginBottom: "20px" }}
      />
      <h1>{listing.title}</h1>
      <p>{listing.desc}</p>
    </div>
  );
}

export default ListingPage;
