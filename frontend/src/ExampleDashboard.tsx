import { useState } from "react";
import "./ExampleDashboard.css";
import pets from "./examplepets.json";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import AddPetModal from "./AddPetModal";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";

function Header({ searchQuery, setSearchQuery }: { searchQuery: string; setSearchQuery: (q: string) => void }) {
  return (
    <Box>
      <Typography variant="h3" align="center" fontWeight="bold" gutterBottom>
        Pawgrammers Admin Dashboard
      </Typography>
      <TextField
        fullWidth
        id="search-pet"
        label="Search for Pet"
        variant="outlined"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        inputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton>
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}

function ExampleDashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [isAddPetOpen, setIsAddPetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [petList, setPetList] = useState<any[]>(pets);
  const [explodingIds, setExplodingIds] = useState<Set<string>>(new Set());

  const handleAddPetClick = () => setIsAddPetOpen(true);
  const handleClose = () => setIsAddPetOpen(false);

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const saveEdits = () => {
    // Send PATCH request to backend to save edits
    handleCloseDialog();
  };

  const handleDelete = (petId: string) => {
    setExplodingIds((prev) => {
      const s = new Set(prev);
      s.add(petId);
      return s;
    });

    const ANIM_MS = 1100;
    setTimeout(() => {
      setPetList((prev) => prev.filter((p) => p._id !== petId));
      setExplodingIds((prev) => {
        const s = new Set(prev);
        s.delete(petId);
        return s;
      });
    }, ANIM_MS);
  };

  const filteredPets = petList.filter((pet: any) => pet.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const petCards = filteredPets.map((pet: any) => {
    const isExploding = explodingIds.has(pet._id);
    return (
      <div key={pet._id} className="pet-grid-item">
        <Card className={`pet-card ${isExploding ? "explode-card" : ""}`} sx={{ height: "100%", position: "relative" }}>
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
          </CardContent>
          <CardActions>
            <Button
              onClick={() => {
                setIsDialogOpen(true);
                setSelectedPet(pet);
              }}
              size="small"
            >
              Modify
            </Button>
            <Button size="small" color="error" onClick={() => handleDelete(pet._id)}>
              Delete
            </Button>
          </CardActions>
          {isExploding && (
            <div className="bomb-explosion" aria-hidden>
              <div className="flash" />
              <div className="boom" />
              <div className="shards">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} style={{ ["--i" as any]: i } as React.CSSProperties} className="shard" />
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  });

  return (
    <>
      <Container maxWidth="lg">
        <Box className="dashboard" sx={{ py: 4 }}>
          <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          <Button variant="contained" sx={{ mb: 2 }} onClick={handleAddPetClick}>
            Add Pet
          </Button>
          <div className="pet-grid">{petCards}</div>
          <AddPetModal open={isAddPetOpen} onClose={handleClose} />
        </Box>
        <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Edit Pet
              </Typography>
              <TextField margin="normal" fullWidth label="Pet Name" defaultValue={selectedPet?.name || ""} />
              <TextField margin="normal" fullWidth label="Breed" defaultValue={selectedPet?.breed || ""} />
              <TextField margin="normal" fullWidth label="Age" defaultValue={selectedPet?.age || ""} />
              <TextField margin="normal" fullWidth label="Picture URL" defaultValue={selectedPet?.url || ""} />
            </CardContent>
            <CardActions sx={{ justifyContent: "flex-end", p: 2 }}>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button variant="contained" color="primary" onClick={saveEdits}>
                Save
              </Button>
            </CardActions>
          </Card>
        </Dialog>
      </Container>
    </>
  );
}

export default ExampleDashboard;
