import "./ExampleDashboard.css";
import { useState, useEffect, useMemo } from "react";
//import pets from './examplepets.json'
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { getPets } from "./ExampleApi";
import Button from "@mui/material/Button";
import ExampleSubmitComponent from "./ExampleSubmitComponent";
import ExampleEditComponent from "./ExampleEditComponent";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";

type PetProps = {
  _id: string;
  name: string;
  breed: string;
  age: string;
  url?: string;
};
function ExampleDashboard() {
  const [data, setData] = useState<Array<PetProps>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [addOpen, setAddOpen] = useState<boolean>(false);
  const [editOpen, setEditOpen] = useState<boolean>(false);
  const [selectedPet, setSelectedPet] = useState<any>(null);

  const refreshPets = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getPets();
      if (data) {
        setData(data);
      } else {
        setError("Failed to load pets");
      }
    } catch (e: any) {
      setError("Error: " + e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshPets();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return data;
    return data.filter((pet: any) => {
      const name = String(pet.name || "");
      const breed = String(pet.breed || "");
      return name.includes(q) || breed.includes(q);
    });
  }, [data, query]);

  const petCards = filtered.map((pet: any) => {
    //for local json file: change "data" to "pets" and uncomment the json import line
    return (
      <div key={pet._id} className="pet-grid-item">
        <Card className="pet-card" sx={{ height: "100%", position: "relative" }}>
          {pet.url ? (
            <CardMedia sx={{ height: 220 }} image={pet.url} />
          ) : (
            <Box
              sx={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f3f4f6" }}
            >
              <Typography variant="subtitle1" color="text.secondary">
                No pet picture
              </Typography>
            </Box>
          )}
          <CardContent>
            <Typography gutterBottom variant="h6">
              {pet.name}
            </Typography>
            <Typography gutterBottom variant="body2" color="text.secondary">
              {pet.breed}
              {pet.age ? `, ${pet.age} yrs` : ""}
            </Typography>
            <IconButton
              sx={{ position: "absolute", top: 8, right: 8 }}
              onClick={() => {
                setSelectedPet(pet);
                setEditOpen(true);
              }}
              size="small"
            >
              <EditIcon />
            </IconButton>
          </CardContent>
        </Card>
      </div>
    );
  });

  return (
    <>
      <AppBar position="sticky" elevation={0} color="transparent">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Pet Dashboard
          </Typography>
          <TextField
            size="small"
            placeholder="Search by name or breed"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ minWidth: 260, margin: "10px" }}
          />
          <Button variant="outlined" color="primary" onClick={refreshPets} sx={{ mr: 1 }}>
            Refresh
          </Button>
          <Button variant="contained" color="primary" onClick={() => setAddOpen(true)}>
            Add Pet
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Box className="dashboard" sx={{ py: 4 }}>
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && error && <Alert severity="error">{error}</Alert>}

          {!loading && !error && <div className="pet-grid">{petCards}</div>}
        </Box>
      </Container>

      <ExampleSubmitComponent open={addOpen} onClose={() => setAddOpen(false)} onAdded={refreshPets} />

      <ExampleEditComponent open={editOpen} onClose={() => setEditOpen(false)} onUpdated={refreshPets} pet={selectedPet} />
    </>
  );
}

export default ExampleDashboard;
